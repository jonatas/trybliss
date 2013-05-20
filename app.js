Meteor.startup(function(){
});
Levels = new Meteor.Collection('levels');
Translations = new Meteor.Collection('translations');

if (Meteor.isClient) {
  Meteor.startup(function(){
    if (!Session.get('currentLevel')) Session.set('currentLevel',0);
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
  };
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
    return Template.game.levels()[Session.get("currentLevel")];
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
    console.log(e,this);
     $("#answer").removeClass("alert-success");
     $("#answer").removeClass("alert-error");
     right = (this.alternative == level.answer.answer);

     $(e.target.parentElement).find("img").attr("src", symbolPath(this.alternative));
     $(e.target).removeClass("btn btn-action").addClass(right ? "btn-success" : "btn-danger");

     if (right){
       if (Session.get("currentLevel") < Template.game.levels().length-1) {
         $("#answer").addClass("alert-info");
         _.delay(function(level) { Session.set("currentLevel",level); }, 3000, Session.get("currentLevel")+1);
       } else {
         $("#answer").addClass("alert-success");
       }
     }else $("#answer").addClass("alert-error");
    }
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
      {lang: 'br', base_str: 'Answer', new_str: 'Responda'},
      {lang: 'ch', base_str: 'Learn', new_str: 'Lära'},
      {lang: 'ch', base_str: 'Symbols', new_str: 'Symboler'},
      {lang: 'ch', base_str: 'Combine', new_str: 'Kombinera'},
      {lang: 'ch', base_str: 'Combine %s', new_str: 'Kombinera %s'},
      {lang: 'ch', base_str: 'Answer', new_str: 'Svara'},
      {lang: 'de', base_str: 'Learn', new_str: 'Lernen'},
      {lang: 'de', base_str: 'Symbols', new_str: 'Symbole'},
      {lang: 'de', base_str: 'Combine', new_str: 'Kombinieren'},
      {lang: 'de', base_str: 'Combine %s', new_str: 'Kombinieren %s'},
      {lang: 'de', base_str: 'Answer', new_str: 'Beantworten'}
   ];

//Translations.find().forEach(function(e){Translations.remove(e._id)});
  if (Translations.find().count() < translations.length) {
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
