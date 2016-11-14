Polymer({
  is:"test-layout",
  behaviors:[window.mwcMixin],
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
  trackers:["changeStatus(routeData.page)"],
  changeStatus:function(page){
    this.set("appState",`Page : ${page || 'home'} , Status : ${Meteor.status().status}`);
    if(!Meteor.isCordova){
      this.notCordova = true;
    }
  },

  second:function(){
    this.set("routeData.page", "second"); 
  },
  home:function(){

    this.set("routeData.page", ""); 
  }
});


