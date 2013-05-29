
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
  if (Template.game.levels().length == 0)
    return;
  Session.set("levelNumber", to);
  Session.set("currentLevel",Template.game.levels()[to-1]);
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
Template.edit_level.rendered = function() {
  $("a[data-toggle='tooltip']").tooltip({animation: "fade", container: "body"});
  if (!Session.get("editingLevel"))
    $(".edit_level").hide();
  else{
    $(Session.get("focus-tab")).tab('show')
    $(Session.get("focus-input")).focus()
  }
  function extractLast( term ) {
    return term.split(" ").pop();
  }

  $( "input#learn[autocomplete], input#question[autocomplete]").autocomplete( {
     minLength: 2,
     source: function(request,response){
       response( $.ui.autocomplete.filter( Symbols.find().fetch(), extractLast(request.term)));
     },
     focus: function( event, ui ) {
       $( event.target).val(ui.item.label);
       return false;
     },
     select: function( event, ui ) {
       value = ui.item.label;
       level = Session.get("editingLevel");
       if (! _.contains(level.learn.symbols,value)){
         level.learn.symbols.push(value);
       }
       Session.set("editingLevel",level);
       $( event.target ).val("");
       $( event.target ).focus();
       return true;
    }
  });
  $( "input#learn[autocomplete]").autocomplete().data( "ui-autocomplete" )._renderItem = function( ul, item ) {
     return $( "<li class='ui-menu-item'><a><img src='/images/small_symbols/"+ item.label+ ".png' />" + item.label+ "</a></li>" ).appendTo( ul );
   };
  $( "input#question[autocomplete]").autocomplete().data( "ui-autocomplete" )._renderItem = function( ul, item ) {
     return $( "<li class='ui-menu-item'><a><img src='/images/svg_symbols/"+ item.label+ ".svg' width='15%' height='15%' />" + item.label+ "</a></li>" ).appendTo( ul );
   };
  $( "input#learn[autocomplete]").autocomplete( {
     minLength: 2,
     source: function(request,response){
       response( $.ui.autocomplete.filter( Symbols.find().fetch(), extractLast(request.term)));
     },
     focus: function( event, ui ) {
       $( event.target).val(ui.item.label);
       return false;
     },
     select: function( event, ui ) {
       value = ui.item.label;
       level = Session.get("editingLevel");
       if (! _.contains(level.learn.symbols,value)){
         level.learn.symbols.push(value);
       }
       Session.set("editingLevel",level);
       $( event.target ).val("");
       $( event.target ).focus();
       return true;
    }
  }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
     return $( "<li class='ui-menu-item'><a><img src='/images/small_symbols/"+ item.label+ ".png' />" + item.label+ "</a></li>" ).appendTo( ul );
   };
}
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
  'click img' : function (e) { Session.set("currentLanguage", this.flag);}
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
  if ( a=(Session.get("editingLevel") || Session.get("currentLevel")))
    return a;
  else
    return setLevelNumber(1);
}
Template.combine.combinations = function() {
  if (level = Template.game.level())
    return _.map(level.learn.combinations, function(combination){return {combination: _.map(combination.split(" "),function(symbol){return {symbol:symbol};})};});
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
Template.edit_level.possible_alternatives =
  Template.answer.alternatives = function() {
  if (level=Template.game.level())
    return _.map(level.answer.alternatives,function(alternative){return {alternative: alternative};});
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
Template.edit_level.levelTitle = function(){
  return Session.get("editingLevel").title;
}
Template.edit_level.events({
  'click a.btn.save' : function(){
    if(id = Session.get("editingLevel")._id)
      Levels.update(id, Session.get("editingLevel"));
    else
      Levels.insert(Session.get("editingLevel"));

    Session.set("editingLevel", null);
    $("div.edit-level").hide();
   },
  'click a.hide-editor' : function(){
    $("div.edit-level").hide();
   },
  'click a.btn.cancel-edition' : function(){
    Session.set("editingLevel", null);
    $("div.edit-level").hide();
   },
  'focus *[focus-tab]' : function(e){
    tabSelector = "a[href='"+$(e.target).attr("focus-tab")+"']";
    Session.set("focus-tab", tabSelector);
    Session.set("focus-input", "#"+ e.target.id);
    tab = $(tabSelector);
    if (! tab.hasClass("active"))
      tab.tab('show');
    $(e.target).focus();
    $(e.target).val($(e.target).val());
  },
  "change textarea, change input" : function (evt) {
    value = $(evt.target).val();
    level = Session.get("editingLevel");
    console.log("change",evt.target.id,value);
    if (evt.target.id == "learn")
      level.learn.symbols = value.length > 0 ? value.split(" ") : [];
    if (evt.target.id == "combine")
      level.learn.combinations = value.split(",");
    else if (evt.target.id == "answer")
      level.answer.answer = value;
    else if (evt.target.id == "question")
      level.answer.question = value;
    else if (evt.target.id == "alternatives")
      level.answer.alternatives = value.split(",");
    else if (evt.target.id == "title")
      level.title = value;

    Session.set("editingLevel",level);
  },
});
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
