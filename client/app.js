Levels = new Meteor.Collection('levels');
Translations = new Meteor.Collection('translations');
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

Meteor.autorun(function(){
  Meteor.subscribe("levels");
  Meteor.subscribe("translations");
});
Template.game.rendered = function() {
  $('a.edit').click(function (e) {
     $(".edit-level").show();
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
Template.language.events({
  'click img': function (e) { Session.set("currentLanguage", this.flag);}
});
  Template.game.levels = function() {
    return Levels.find();
};
window.symbolPath = function(symbol){
  return "/images/symbols/"+symbol+".png";
}
Template.game.level = function() {
  return Session.get("currentLevel");
}
Template.edit_level.level = function(){
  return Session.get("currentLevel");
};
