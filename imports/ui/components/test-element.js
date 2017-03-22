Polymer({
  is:"test-element",
  properties:{
    name:{
      type:String,
      value:"Arun Kumar"
    },
    nickname:{
      type:String,
      value:"tkay"
    },
    show:{
      type:String,
      value:"show"
    },
    nndHidden:{
      type:Boolean,
      value:true
    }
  },
  // TODO Mixin does not work
  // behaviors:[mwcMixin],
  showNickName:function(){
    this.nndHidden = !this.nndHidden;
    this.show = this.nndHidden ? "show" : "hide";
  }

})


