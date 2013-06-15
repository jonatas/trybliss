Levels = new Meteor.Collection('levels');
Translations = new Meteor.Collection('translations');
Symbols = new Meteor.Collection('symbols');
Meteor.startup(function(){
  if (!Session.get('levelNumber')||!Session.get("currentLevel")) setLevelNumber(1);
  if (!Session.get('currentLanguage')) Session.set('currentLanguage','br');
});
Handlebars.registerHelper('t', function(object){
    var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    var row = Translations.findOne({lang:Session.get("currentLanguage"), base_str: args[0]});
    if (row && row.new_str)
      args[0] =row.new_str;
    if (args.length > 1) {
       return args[0].replace("%s",args[1]);
    } else {
       return args[0];
    }
});

function nextLevel(){
  if (Session.get("levelNumber") < Template.game.levels().length-1)
    setLevelNumber(Session.get("levelNumber")+1);
}
function previousLevel(){
 if (Session.get("levelNumber") > 1)
   setLevelNumber(Session.get("levelNumber")-1);
}
function setLevelNumber(to){
  if (Template.game.levels().length == 0) { 
    console.log("no levels yet..");
    return;
  }
  Session.set("levelNumber", to);
  Session.set("currentLevel",Levels.find().fetch()[to-1]);
  Session.set("editingLevel",Levels.find().fetch()[to-1]);
  if (to > 1){
    $(".previous").show();
  } else{
    $(".previous").hide();
  }
  if (to < Template.game.levels().length-2){
    $(".next").show();
  } else {
    $(".next").hide();
  }
}
Meteor.autorun(function(){
  Meteor.subscribe("levels");
  Meteor.subscribe("translations");
  Meteor.subscribe("symbols");
});
Template.game.rendered = function() {
  $('#learning-steps a').click(function (e) {
    if (! Session.get("editingLevel")){
      $(this).tab('show');
    }
  });
  if (! Session.get("editingLevel")){
    $(this).tab('show');
  }

  $('a.edit').click(function (e) {
     $(".edit-level").show();
  });
  $('a.levels').click(function (e) {
     $(".levels").show();
  });
  $(".alternative > img").hide();
};
Template.flags_panel.flags = function() {
  flags = [];
  Translations.find().forEach(function(translation){
    if (!_.include(flags,translation.lang))
    flags.push(translation.lang);
  });
  flags.push('us');
  return _.map(flags, function(flag){return {flag: flag}});;
}
Template.flag.events({
  'click img': function (e) { Session.set("currentLanguage", this.flag);}
});
  Template.game.levels = function() {
    return Levels.find();
};
window.symbolPath = function(symbol){
  return "/images/symbols/"+symbol+".png";
}
Template.game.level = function() {
  if ( level=(Session.get("editingLevel") || Session.get("currentLevel"))){
    return level;
  } else {
    return setLevelNumber(1);
  }
}
Template.game.levelNumber = function(){
  return Session.get("levelNumber");
}
Template.game.events({
  'click .alternative' : function (e) {
  level = Template.game.level();
   $(".question").removeClass("alert-success");
   $(".question").removeClass("alert-error");
   $(e.target).find("img").show();
   $(e.target).addClass( $(e.target).parent(".alternative").hasClass("right") ?  "btn-success" : "btn-danger");
  },
  'click .next' : function (e) {
    nextLevel();
  },
  'click .levels' : function (e) {
    Session.set("showLevels", true);
  },
  'click .hidelevels' : function (e) {
    Session.set("showLevels", null);
  },
  'click .previous' : function (e) {
    previousLevel();
  },
  'click a.edit-level' : function(e) {
    if (! Session.get("editingLevel") || Session.get("editingLevel")._id != this._id){
      Session.set("editingLevel", this);
      Session.set("showLevels",null);
    }
    $("div.edit-level").show();
  }
});
Template.edit_level.level = function(){
  return Session.get("editingLevel");
};
Template.game.showingLevels = function(){
  return !Template.levels.editingLevel() && Session.get("showLevels");
}
