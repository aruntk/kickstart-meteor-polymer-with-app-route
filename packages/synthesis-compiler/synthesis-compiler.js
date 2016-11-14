import parse5 from 'parse5';
import polyclean from 'polyclean';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { Babel } from 'meteor/babel-compiler';
import { Synthesizer } from './synthesis-gen.js';

export const parseHtml = (arg) => {
  const contents = arg.contents;
  const parsed = parse5.parse(contents);
  // parsed is a json object
  const tag = {
    tagName: 'template',
    attribs: {
      id: arg.sourceName,
    },
    contents: parsed,
    fileContents: arg.contents,
    sourceName: arg.sourceName,
  };
  return tag;
};
class DissectHtml {
  constructor() {
    this.dissected = {
      head: '',
      body: '',
      js: '//*synthesis*//\n',
      tailJs: '', // tailJs is appened last
      bodyAttrs: {},
    };
  }
  dissect(tag) {
    this.document = tag.contents;
    this.sourceName = tag.sourceName;
    const self = this;
    const children = this.document.childNodes || [];
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      switch (child.nodeName) {
        case '#documentType':
          break;
        case '#comment':
          break;
        case 'html': {
          const _children = child.childNodes || [];
          for (let _i = 0; _i < _children.length; _i += 1) {
            const _child = _children[_i];
            switch (_child.nodeName) {
              case 'head': {
                _child.childNodes = self.processChildNodes(_child.childNodes);
                const headContents = parse5.serialize(_child);
                // for files inside client folder html contents can be
                // directly added to dissected.html
                if (self.sourceName.match(/^client\//)) {
                  self.dissected.head += headContents;
                } else {
                  self.dissected.js += `\n${Synthesizer.generateJS(headContents, true)}\n`;
                }
              }
                break;
              case 'body': {
                const body = _child;
                body.attrs.forEach((attr) => {
                  const bodyAttrs = self.dissected.bodyAttrs;
                  const hasNameAttr = {}.hasOwnProperty.call(bodyAttrs, attr.name);
                  if (!hasNameAttr) {
                    self.dissected.bodyAttrs[attr.name] = attr.value;
                  }
                });
                delete body.attrs;
                body.childNodes = self.processChildNodes(body.childNodes);
                const bodyContents = parse5.serialize(body);
                if (self.sourceName.match(/^client\//)) {
                  self.dissected.body += bodyContents;
                } else {
                  self.dissected.js += `\n${Synthesizer.generateJS(bodyContents)}\n`;
                }
              }
                break;
              default:
                break;
            }
          }
        }
          break;
        default:
          break;
      }
    }
    this.dissected.js += `\n${this.dissected.tailJs}\n`;
  }
  processChildNodes(childNodes) {
    const self = this;
    let pushNodes = [];
    const processedNodes = _.compact(_.map(childNodes, (child) => {
      switch (child.nodeName) {
        case 'template': {
          const template = child;
          const tmContent = template.content;
          const isWalkable = tmContent && tmContent.nodeName === '#document-fragment' && tmContent.childNodes;
          if (isWalkable) {
            tmContent.childNodes = self.processChildNodes(tmContent.childNodes);
          }
          template.content = tmContent;
          return template;
        }
        case 'link': {
          const processedLinkChild = self.processLinks(child);
          if (processedLinkChild) {
            return processedLinkChild;
          }
        }
          break;
        case 'script': {
          const result = self.processScripts(child);
          if (result) {
            return result;
          }
        }
          break;
        case 'style': {
          if (child.childNodes && child.childNodes.length) {
            const childNode = child.childNodes[0];
            const css = childNode.value;
            const result = self.processStyle(css);
            if (result) {
              childNode.value = result;
            }
          }
          return child;
        }
        case 'dom-module': {
          const domModule = child;
          if (domModule.childNodes) {
            domModule.childNodes = self.processChildNodes(domModule.childNodes);
          }
          return domModule;
        }
        case 'div': {
          const attrs = _.filter(child.attrs, o => (o.name === 'hidden' || o.name === 'by-vulcanize'));
          if (attrs.length >= 2) {
            const _childNodes = self.processChildNodes(child.childNodes);
            pushNodes = pushNodes.concat(_childNodes);
          } else {
            return child;
          }
        }
          break;
        case '#comment':
          break;
        default:
          return child;
      }
      return null;
    }));
    return processedNodes.concat(pushNodes);
  }
  processStyle(css) {
    return polyclean.stripCss(css);
  }
  processScripts(child) {
    const self = this;
    const importSource = _.find(child.attrs, v => (v.name === 'src'));
    if (importSource && importSource.value) {
      const importableUrl = self.importableUrl(importSource.value);
      if (!importableUrl) {
        return child;
      }
      self.dissected.tailJs += `\nrequire('${importableUrl}');\n`;
    } else {
      self.dissected.tailJs += `\n${self.babelJs(parse5.serialize(child))}\n`;
    }
    return null;
  }
  babelJs(js) {
    const babelOptions = Babel.getDefaultOptions();
    // const prod = process.env.NODE_ENV ==='production';
    const external = this.sourceName.match(/(bower_components|node_modules)\//);
    const buildFile = this.sourceName === 'imports/ui/build.html';
    return (!external && !buildFile) ? Babel.compile(js, babelOptions).code : js;
  }

  importableUrl(url) {
    if (url.match(/^(\/|https?:\/)/)) {
      return false;
    }
    return url.match(/^(\.\/|\.\.\/)/) ? url : `./${url}`;
  }
  processLinks(child) {
    const self = this;
    // <link rel='import'...> and <link rel='stylesheet'...>
    const supportedRels = ['import', 'stylesheet'];
    const ifImport = _.find(child.attrs, v => (v.name === 'rel' && supportedRels.indexOf(v.value) > -1));
    if (ifImport) {
      const hrefAttr = _.find(child.attrs, v => v.name === 'href');
      if (hrefAttr) {
        if (hrefAttr.value) {
          switch (ifImport.value) {
            case 'import': {
              // file is imported using require
              const url = self.importableUrl(hrefAttr.value);
              if (!url) {
                return child;
              }
              const typeAttr = _.find(child.attrs, v => (v.name === 'type'));
              if (typeAttr) {
                switch (typeAttr.value) {
                  case 'css':
                    return self.processCssImport(hrefAttr, child);
                  default:
                    break;
                }
              }
              const link = `require('${url}');`;
              self.dissected.tailJs += `\n${link}\n`;
            }
              break;
              // Processing <link rel='stylesheet' href='filename.css'>
            case 'stylesheet':
              // absolute file path
              return self.processCssImport(hrefAttr, child);
            default:
              break;
          }
        }
      } else {
        return child;
      }
    } else {
      return child;
    }
    return null;
  }
  processCssImport(hrefAttr, child) {
    const url = path.resolve(this.sourceName, '../', hrefAttr.value);
    // checks if file exists
    if (fs.existsSync(url)) {
      const contents = fs.readFileSync(url, 'utf8');
      // css is inlined
      const minified = this.processStyle(contents);
      if (minified) {
        // link tag is replaced with style tag
        return _.extend(child, {
          nodeName: 'style',
          tagName: 'style',
          attrs: [],
          childNodes: [
            {
              nodeName: '#text',
              value: minified,
            },
          ],
        });
      }
    }
    return child;
  }
}

export const handleTags = (tags) => {
  const handler = new DissectHtml();
  handler.dissect(tags);
  return handler.dissected;
};

export const name = 'synthesis-compiler';
