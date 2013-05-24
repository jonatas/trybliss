Levels = new Meteor.Collection('levels');
Translations = new Meteor.Collection('translations');

if (Meteor.isClient) {
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
    console.log("levelnumber,",to,Template.game.levels())
    Session.set("currentLevel",Template.game.levels()[to-1]);
    console.log("currentLevel",Session.get("currentLevel"));
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
    if (! window.linkSymbols) {
      data = $.ajax({ url: "/images/link_symbols.txt", async: false, }).responseText;
      window.linkSymbols = {};
      _.each(data.split("\n"),function(line){
         parts = line.split(" ");
         window.linkSymbols[parts[0]] = parts[1];
       });
    }
    if (! window.flags) {
      data = $.ajax({ url: "/images/active_flags.txt", async: false }).responseText;
      window.flags = _.select(data.split("\n"), function(str){return str != "";});
    }
    Meteor.subscribe("levels");
    Meteor.subscribe("translations", Session.get("currentLanguage"));
  });
  Template.game.rendered = function() {
    $('#learning-steps a').click(function (e) {
      if (! Session.get("editingLevel")){
        console.log("show tab", this);
        $(this).tab('show');
      }
    });
    if (! Session.get("editingLevel")){
      console.log("show tab", this);
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
    console.log("edit level rendered");
    $("a[data-toggle='tooltip']").tooltip({animation: "fade", container: "body"});
    if (!Session.get("editingLevel"))
      $(".edit_level").hide();
     else{
      $(Session.get("focus-tab")).tab('show')
      $(Session.get("focus-input")).focus()

    
    }
  }
  Template.flags_panel.flags = function() {
    return _.map(window.flags, function(flag){ return {flag: flag} });
  }
  Template.flag.events({
    'click img' : function (e) { Session.set("currentLanguage", this.flag);}
  });
  Template.levels.levels =
    Template.game.levels = function() {
      return Levels.find().fetch();
  };
  window.symbolPath = function(symbol){
        if (window.linkSymbols!=null)
          return "/images/symbols/"+(window.linkSymbols[symbol] || symbol)+".png";
        else
          return "/images/"+symbol+".png";
  }
  Template.show_symbol.helpers({
    src: function () { return symbolPath(this.symbol) }
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
      console.log(evt.target.id, level, value);
      if (evt.target.id == "learn")
        level.learn.symbols = value.split(",");
      else if (evt.target.id == "combine")
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
}
if (Meteor.isServer) {
Meteor.startup(function(){
  if (Levels.find().count() == 0) {
    var levels = [
      {
        title: "Places",
        learn: {
          symbols: [ 'house', 'money', 'God', 'feeling','medical'],
          combinations : [
           'house and money equal bank',
           'house and God equal church',
           'house and feeling equal home'
          ]
        },
        answer: {
          question: 'house and medical equal question',
          answer: 'hospital',
          alternatives: ['home', 'church', 'hospital', 'restaurant']
        }
      },
      {
        title: "More about places",
        learn: {
          symbols: [ 'public_room', 'food', 'medical'],
          combinations: [
            'house and medical equal hospital',
            'container and money equal business',
            'public_room and business equal store'
          ]
        },
        answer: {
            question: 'public_room and food equal question',
            answer: 'restaurant',
            alternatives: ['restaurant','home', 'church', 'hotel']
        }
      },
      {
        title: "More places and things",
        learn: {
          symbols: [ 'house', 'boat', 'car', 'person'],
          combinations: [
           'person and car equal driver',
           'house and boat equal boathouse',
           'boat and house equal houseboat'
          ]
        },
        answer: {
          question: 'house and car equal question',
          answer: 'garage',
          alternatives: ['bank', 'garage', 'restaurant']
        }
      },
      {
        title: "Knowledge",
        learn: {
          symbols: [ 'knowledge', 'give', 'get'],
          combinations: [ 
            'knowledge and give equal teach',
            'knowledge and get equal learn-(to)'
            ]
        },
        answer: {
          question: 'house and learn-(to) equal question',
          answer: 'school',
          alternatives: ['hospital', 'home', 'school','airport']
        }
      },
      {
        title: "Fly",
        learn: {
          symbols: [ 'wing(s)', 'man', 'bird', 'wheel'],
          combinations: ['wing(s) and man equal angel_(1)',
                         'bird and water equal duck']
        },
        answer: {
          question: 'wing(s) and wheel',
          answer: 'airplane',
          alternatives: ['duck','airplane','airport']
        }
      },
      {
        title: "Time",
        learn: {
          symbols: [ 'past', 'today', 'yesterday'],
          combinations: ['day and indicator_(past_action) equal yesterday',
                         'day and indicator_(future_action) equal tomorrow']
        },
        answer: {
          question: 'indicator_(past_action) and indicator_(future_action) equal question',
          answer: 'indicator_(present_action)',
          alternatives: ['none','indicator_(present_action)','future']
        }
      }
   ];
   Levels.find().forEach(function(e){Levels.remove(e._id)});
   _.each(levels, function(level){
     Levels.insert(level);
   });
  }
    var translations = [
      {lang: 'br', base_str: 'Learn', new_str: 'Aprender'},
      {lang: 'br', base_str: 'Symbols', new_str: 'Símbolos'},
      {lang: 'br', base_str: 'Combine', new_str: 'Combinar'},
      {lang: 'br', base_str: 'Combine %s', new_str: 'Combinar %s'}, // Combine title level
      {lang: 'br', base_str: 'Level %s', new_str: 'Nível %s'},
      {lang: 'br', base_str: 'Answer', new_str: 'Responda'},
      {lang: 'br', base_str: 'Next level', new_str: 'Próximo nível'},
      {lang: 'br', base_str: 'Previous level', new_str: 'Nível anterior'},
      {lang: 'se', base_str: 'Learn', new_str: 'Lära'},
      {lang: 'se', base_str: 'Symbols', new_str: 'Symboler'},
      {lang: 'se', base_str: 'Combine', new_str: 'Kombinera'},
      {lang: 'se', base_str: 'Combine %s', new_str: 'Kombinera %s'},
      {lang: 'se', base_str: 'Level %s', new_str: 'Nivå %s'},
      {lang: 'se', base_str: 'Answer', new_str: 'Svara'},
      {lang: 'de', base_str: 'Learn', new_str: 'Lernen'},
      {lang: 'de', base_str: 'Symbols', new_str: 'Symbole'},
      {lang: 'de', base_str: 'Combine', new_str: 'Kombinieren'},
      {lang: 'de', base_str: 'Combine %s', new_str: 'Kombinieren %s'},
      {lang: 'de', base_str: 'Level %s', new_str: 'Ebene %s'},
      {lang: 'de', base_str: 'Answer', new_str: 'Beantworten'}
   ];

  if (Translations.find().count() < translations.length) {
    Translations.find().forEach(function(e){Translations.remove(e._id)});
    _.each(translations, function(translation) {
      if (!Translations.findOne(translation)) {
        Translations.insert(translation);
      }
    });
  }
  Meteor.publish("levels", function(){ return Levels.find() });
  Meteor.publish("translations", function(language){ return Translations.find({lang: language})});
});
}
