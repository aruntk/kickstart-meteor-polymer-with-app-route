# Synthesis is meteor + polymer

![synthesis1](https://cloud.githubusercontent.com/assets/6007432/14216652/9da7131a-f867-11e5-9f84-6dd75d60dd45.gif)

## Usage

### Running

vulcanize the public/imports.html file to build.html before starting meteor

```sh
vulcanize --inline-css --inline-scripts --strip-comments public/imports.html > imports/ui/build.html && meteor

```
 or run the run shell file kept in root folder

```sh
./run.sh
```



### Polymer Settings

Create client/lib/settings.js

Why lib directory ? Settings code should run before anything else. 

```js
/* client/lib/settings.js */
window.Polymer = {
  //dom: 'shadow',
  lazyRegister: true
};
```

###Directory structure

![synth](https://cloud.githubusercontent.com/assets/6007432/17208165/f52a1aa0-54d4-11e6-85fe-f41fc1e2e5c9.png)

you can add js in separate file or you can add it inside the element html file using script tag.

client/your-element.html



```js
//client/main.js

import '../imports/startup/client/router.js';

```

```html
<!-- client/main.html -->
<head>
  <title>Synthesis</title>
  <style>
body{
  padding:0px;
  margin:0px;
}
  </style>
</head>
<body class="fullbleed">
    <test-layout></test-layout>
  </body>
```
####Routing . 

```html
    <app-location route="{{route}}"></app-location>

    <app-route route="{{route}}" pattern="/:page" data="{{routeData}}"></app-route>

```
Refer (app-route)[https://github.com/PolymerElements/app-route] for more info.

```js
//imports/ui/layouts/test-layout.js

import './test-layout.html';

Polymer({
  is:"test-layout",
  behaviors:[mwcMixin],
  tracker:function(){
    this.changeStatus();
  },
  changeStatus(){
    this.set("appState",`Page : ${this.routeData.page} , Status : ${Meteor.status().status}`);
    if(!Meteor.isCordova){
      this.notCordova = true;
    }
  },
  properties:{
    route:Object,
    routeData:{
      type: Object,
      value: function() {
        return {
          page: 'home'
        };
      }
    },
    appState:{
      type:String
    },
    notCordova:Boolean

  },
  observers:["changeStatus(routeData.page)"],
  second:function(){
    this.set("routeData.page", "second"); 
  },
  home:function(){

    this.set("routeData.page", "home"); 
  }
});


```

```html
<!-- imports/ui/layout/test-layout.html -->
<link rel="import" href="../components/test-element.html">
<dom-module id="test-layout">
  <style>
  /*style goes here */
    ... 
    
  </style>
  <template>
    <paper-header-panel class="fit layout">
    
     ...
     
    </paper-header-panel>
  </template>
</dom-module>

```



bower_components are kept inside public/bower_components folder.

bower.json

```json
{
  "dependencies": {
    "paper-elements": "PolymerElements/paper-elements#^1.0.5",
    "iron-flex-layout": "PolymerElements/iron-flex-layout#^1.0.0",
    "iron-pages": "PolymerElements/iron-pages#^1.0.0",
    "polymer": "Polymer/polymer#^1.0.0",
    "app-route": "PolymerElements/app-route#^0.9.2"
  },
  "name": "synthesis-demo",
  "version": "0.0.1"
}
```



### Docs

Use meteor data reactively inside polymer components - https://github.com/meteorwebcomponents/mixin/blob/master/README.md

Reactively route polymer projects with flowrouter - https://github.com/meteorwebcomponents/router/blob/master/README.md

How to render polymer elements with mwc:layout - https://github.com/meteorwebcomponents/layout/blob/master/README.md





### Forum 

https://forums.meteor.com/t/polymer-meteor-with-meteor-webcomponents-packages/20536




### MWC packages included.

[mwc:synthesis](https://github.com/meteorwebcomponents/synthesis) -  Synthesis is meteor + polymer.

[mwc:mixin](https://github.com/meteorwebcomponents/mixin) -  Polymer data package

[mwc:router](https://github.com/meteorwebcomponents/router) - Flowrouter with polymer


[MWC Layout](https://github.com/meteorwebcomponents/layout) - polymer layout renderer . Added using bower.




