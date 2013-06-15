Levels = new Meteor.Collection('levels')
var levels = [
   {
     content: "# Content Header"+
       "\n* using [markdown syntax](http://daringfireball.net/projects/markdown/syntax)"+
       "\n* vim keybidings (press i to start inserting)"+
       "\n* when you change the code the preview will be changed"+
       "\n* start typing and use ctrl-space to see the suggestions"+
       "\n"+
       "\n![archery][]"+
       "\n"+
       "\nArquery"+
       "\n"+
       "## Dont forget to use reference there."+
       "\n"+
       "\nI'm fixing these, but for a while,"+
       "\nyou need to reference each image here in the bottom."+
       "\n"+
       "\n[archery]: /images/symbols/archery.png"+
       "\n"+
       "\n---"
   }
];

Meteor.startup(function(){
   //Levels.find().forEach(function(e){Levels.remove(e._id)});
  if (Levels.find().count() == 0) {
   Levels.find().forEach(function(e){Levels.remove(e._id)});
   _.each(levels, function(level){
     Levels.insert(level);
   });
  }
  Meteor.publish("levels", function(){ return Levels.find() });
});
