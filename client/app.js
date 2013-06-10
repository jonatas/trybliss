
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
  console.log("setLevelNumber",to);
  if (Template.game.levels().length == 0) { 
    console.log("no levels yet..");
    return;
  }
  Session.set("levelNumber", to);
  Session.set("currentLevel",Levels.find().fetch()[to-1]);
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
Template.levels.levels =
  Template.game.levels = function() {
    return Levels.find();
};
window.symbolPath = function(symbol){
  return "/images/symbols/"+symbol+".png";
}
Template.show_symbol.helpers({
  src: function () { return symbolPath(this.symbol) }
});
Template.show_symbol.events({
  "click .icon-remove" : function(e){
    id = $(e.target).closest(".tab-pane").attr("id");
    level = Session.get("editingLevel");
    console.log("editing ",level);
    if (id == "learn"){
      level.learn.symbols.remove( this.symbol)
    }else if (id == "combine"){
      for (var i=0;i<level.learn.combinations.length;i++){
        level.learn.combinations[i] = level.learn.combinations[i].split(" ").remove( this.symbol).join(" ");
      }
    }
    console.log("saving!",level);
    Session.set("editingLevel",level);
  }
});
Template.game.level = function() {
  if ( level=(Session.get("editingLevel") || Session.get("currentLevel"))){
    console.log("game level:" ,level);
    return level;
  } else {
    return setLevelNumber(1);
  }
}
Template.combine.combinations = function() {
  if (level = Template.game.level()){
    return _.map(level.learn.combinations, 
        function(combination){
          return {
            combination: _.map(combination.split(" "),
                           function(symbol){
                             return {symbol:symbol};
                           })
          };
        }
   );
  }
}
Template.game.symbols = function(){
  return Template.game.level().learn.symbols;
}
Template.game.levelNumber = function(){
  return Session.get("levelNumber");
}
Template.learn.symbols = function() {
  if (level = Template.game.level())
    return _.map(level.learn.symbols, function(symbol){ return {symbol: symbol} });
}
Template.answer.question_fragments = function() {
  if (level=Template.game.level())
    return _.map(level.answer.question.split(" "),function(symbol){return {symbol:symbol}});
}
Template.game.events({
  'click .alternative' : function (e) {
  level = Template.game.level();
   $("#answer").removeClass("alert-success");
   $("#answer").removeClass("alert-error");
   right = (this.alternative == level.answer.answer);

   $(e.target.parentElement).find("img").attr("src", symbolPath(this.alternative));
   $(e.target).removeClass("btn btn-action").addClass(right ? "btn-success" : "btn-danger");

   if (right){
     $("#answer").addClass("alert-success");
   }else $("#answer").addClass("alert-error");
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
Template.show_symbol.editingLevel =
Template.levels.editingLevel = function(){
  return Session.get("editingLevel") != null;
}
Template.levels.showingLevels =
  Template.game.showingLevels = function(){
  return !Template.levels.editingLevel() && Session.get("showLevels");
}
Template.levels.events({
  'click a.btn.add' : function(){
    Session.set("editingLevel", {
      title: "Change title",
      learn: {
        symbols: [ 'house', 'feeling'],
        combinations: ['house and feeling equal home,fire and mind is desire']
      },
      answer: {
        question: 'what is the question',
        answer: 'right',
        alternatives: ['left','thing','right']
      }
    });
  },
  'click a.btn.edit' : function(){
    Session.set("currentLevel", this);
    Session.set("editingLevel", this);
  },
  'click a.btn.play' : function(){
    Session.set("currentLevel", this);
  },
  'click a.btn.hide-levels' : function(){
    Session.set("showLevels",null);
  },
});
Array.prototype.remove= function(item){
  var L= this.length, indexed;
  while(L){
    indexed= this[--L];
    if(indexed=== item) this.splice(L, 1);
  }
  return this;
}
