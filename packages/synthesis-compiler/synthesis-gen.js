export class _synthesizer {
  constructor(settings) {
    this.settings = settings;
  }
  generateJS(html, toHead) {
    const htmlStr = JSON.stringify(html);
    return `
    Synthesis.render(${htmlStr},${!!toHead});
    `;
  }

}
export const Synthesizer = new _synthesizer();
