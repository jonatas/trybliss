Meteor.startup(function(){
});
Levels = new Meteor.Collection('levels');
Translations = new Meteor.Collection('translations');

if (Meteor.isClient) {
  Meteor.startup(function(){
    if (!Session.get('currentLevel')) setLevel(0);
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
    if (Session.get("currentLevel") < Template.game.levels().length-1)
      setLevel(Session.get("currentLevel")+1);
  }
  function previousLevel(){
   if (Session.get("currentLevel") > 0)
     setLevel(Session.get("currentLevel")-1);
  }
  function setLevel(to){
    Session.set("currentLevel",to);
    if (to > 0){
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
      e.preventDefault();
      $(this).tab('show');
    });

    $('a.edit').click(function (e) {
       $(".edit-level").show();
    });
  };
  Template.edit_level.events({
    "keyup input, change input" : function (evt) {
       value = $(evt.target).val();
       update = {};
       update[evt.target.id] = value;
       console.log("change on ",evt,update);
    }
  });
  Template.edit_level.rendered = function() {
    $("a[data-toggle='tooltip']").tooltip({animation: "fade", container: "body"});
    if (!Session.get("editingLevel"))
      $(".edit_level").hide();
  }
  Template.flags_panel.flags = function() {
    return _.map(window.flags, function(flag){ return {flag: flag} });
  }
  Template.flag.events({
    'click img' : function (e) { Session.set("currentLanguage", this.flag);}
  });
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
    return Session.get("editingLevel") || Template.game.levels()[Session.get("currentLevel")];
  }
  Template.combine.combinations = function() {
    if (level = Template.game.level())
      return _.map(level.learn.combinations, function(combination){return {combination: _.map(combination.split(" "),function(symbol){return {symbol:symbol};})};});
  }
  Template.game.symbols = function(){
    return Template.game.level().learn.symbols;
  }
  Template.game.currentLevel = function(){
    return Session.get("currentLevel")+1;
  }
  Template.learn.symbols = function() {
    if (level = Template.game.level())
      return _.map(level.learn.symbols, function(symbol){ return {symbol: symbol} });
  }
  Template.answer.question_fragments = function() {
    if (level=Template.game.level())
      return _.map(level.answer.question.split(" "),function(symbol){return {symbol:symbol}});
  }
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
       if (Session.get("currentLevel") < Template.game.levels().length-1) {
         $("#answer").addClass("alert-info");
       } else {
         $("#answer").addClass("alert-success");
       }
     }else $("#answer").addClass("alert-error");
    },
    'click .next' : function (e) {
      nextLevel();
    },
    'click .previous' : function (e) {
      previousLevel();
    },
    'click a.edit-level' : function(e) {
      console.log("Editing level", this, e)
      Session.set("editingLevel", this);
      $("div.edit-level").show();
    }
  });
  Template.edit_level.level = function(){
    return Session.get("editingLevel");
  };
  Template.edit_level.events({
    'click a.btn.save' : function(){
      Levels.update(Session.get("editingLevel")._id, Session.get("editingLevel"));
      Session.set("editingLevel", null);
      $("div.editlevel").hide();
     },
    'focus input[focus-tab]' : function(e){
      tab = $("a[href='"+$(e.target).attr("focus-tab")+"']");
      if (! tab.hasClass("active"))
        tab.tab('show');
      $(e).focus();
    },
    "keyup input, change input" : function (evt) {
      value = $(evt.target).val();
      level = Session.get("editingLevel");

      console.log(evt.target.id, "level before",level);
      if (evt.target.id == "learn")
        level.learn.symbols = value.split(/,|\s/);
      else if (evt.target.id == "answer")
        level.answer.answer = value;
      else if (evt.target.id == "question")
        level.answer.question = value.split(" ");
      else if (evt.target.id == "alternatives")
        level.answer.alternatives = value.split(",");
      else if (evt.target.id == "title")
        level.title = value;

      console.log("editing level",level);
      Session.set("editingLevel",level);
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
          symbols: [ 'place', 'food', 'medical'],
          combinations: [
            'house and medical equal hospital',
            'house and money equal bank',
            'house and God equal church'
          ]
        },
        answer: {
            question: 'place and food equal question',
            answer: 'restaurant',
            alternatives: ['restaurant','home', 'church', 'hotel']
        }
      },
      {
        title: "More places and things",
        learn: {
          symbols: [ 'house', 'machine', 'car', 'person'],
          combinations: [
           'house and medical equal hospital',
           'house and God equal church'
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
          symbols: [ 'knowledge', 'mind', "gift"],
          combinations: [ 'knowledge and learn-(to) equal teach']
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
                         'wing(s) and bird equal duck']
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
      {lang: 'ch', base_str: 'Learn', new_str: 'Lära'},
      {lang: 'ch', base_str: 'Symbols', new_str: 'Symboler'},
      {lang: 'ch', base_str: 'Combine', new_str: 'Kombinera'},
      {lang: 'ch', base_str: 'Combine %s', new_str: 'Kombinera %s'},
      {lang: 'ch', base_str: 'Level %s', new_str: 'Nivå %s'},
      {lang: 'ch', base_str: 'Answer', new_str: 'Svara'},
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
