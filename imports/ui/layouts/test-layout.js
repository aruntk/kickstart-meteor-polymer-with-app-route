import './test-layout.html';

Polymer({
  is:"test-layout",
  behaviors:[mwcMixin],
  tracker:function(){
    this.changeStatus();
  },
  changeStatus(){
    this.set("appState",`Page : ${this.routeData.page || 'home'} , Status : ${Meteor.status().status}`);
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
          page: ''
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

    this.set("routeData.page", ""); 
  }
});


