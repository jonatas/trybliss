if (Meteor.isClient) {
  Meteor.startup(function(){
    if (!Session.get('currentLevel')) Session.set('currentLevel',0);
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
  });

  function notify(type,message){
   return $("body").append("<div class=\"alert alert-"+type+"\">"+message+"</div>");
  }
  Template.game.levels = function() {
    return [
      /*
      {
        title: "Places",
        learn: { symbols: [ 'house', 'money', 'god', 'feeling','medical'] },
        help: [
         { example: 'house', plus: 'money', equal:'bank'},
         { example: 'house', plus: 'god', equal:'church'},
         { example: 'house', plus: 'feeling', equal:'home'}
        ],
        question: { example: 'house',  plus: 'medical', equal: 'hospital'},
        wrong_alternatives: ['home', 'church', 'restaurant']
      },
      {
        title: "More about places",
        learn: { symbols: [ 'place', 'food', 'medical'] },
        help: [
         { example: 'house', plus: 'medical', equal:'hospital'},
         { example: 'house', plus: 'money', equal:'bank'},
         { example: 'house', plus: 'god', equal:'church'}
        ],
        question: { example: 'place',  plus: 'food', equal: 'restaurant'},
        wrong_alternatives: ['home', 'church', 'hotel']
      },
      {
        title: "More places and things",
        learn: { symbols: [ 'house', 'machine', 'car', 'person'] },
        help: [
         { example: 'house', plus: 'medical', equal:'hospital'},
         { example: 'house', plus: 'god', equal:'church'}
        ],
        question: { example: 'house',  plus: 'car', equal: 'garage'},
        wrong_alternatives: ['bank', 'god', 'restaurant']
      },*/
      {
        title: "Knowledge",
        learn: {
          symbols: [ 'knowledge', 'mind', "up"],
          combinations: [ 'knowledge and learn-(to) equal teach']
        },
        answer: {
          question: 'house and learn-(to) equal question',
          answer: 'school',
          alternatives: ['hospital', 'home', 'school','airport']
        }
      },
      {
        title: "Animals",
        learn: {
          symbols: [ 'animal', 'sea', 'container'],
          combinations: ['animal and water and container equal pelican',
                         'animal and water equal duck_']
        },
        answer: {
          question: 'animal and water equal question',
          answer: 'duck',
          alternatives: ['pig','duck','melon','snake']
        }
      }
   ];
  };

  window.symbolPath = function(symbol){
        if (window.linkSymbols!=null)
          return "/images/"+(window.linkSymbols[symbol] || symbol)+".png";
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
    level = Template.game.level()
    return _.map(level.learn.combinations, function(combination){return {combination: _.map(combination.split(" "),function(symbol){return {symbol:symbol};})};});
  }
  Template.game.symbols = function(){
    return Template.game.level().learn.symbols;
  }
  Template.game.currentLevel = function(){
    return Session.get("currentLevel")+1;
  }
  Template.learn.symbols = function() {
    level = Template.game.level();
    return _.map(level.learn.symbols, function(symbol){ return {symbol: symbol} });
  }
  Template.answer.question_fragments = function() {
    return _.map(Template.game.level().answer.question.split(" "),function(symbol){return {symbol:symbol}});
  }
  Template.answer.alternatives = function() {
    alternatives = Template.game.level().answer.alternatives;
    return _.map(alternatives,function(alternative){return {alternative: alternative};});
  }
  Template.game.events({
    'click .alternative' : function (e) {
    level = Template.game.levels()[Session.get('currentLevel')];
     $(".answer").removeClass("btn-success");
     $(".answer").removeClass("btn-danger");
     right = (this.alternative == level.answer.answer);
     if (!right)
       $(".answer").text(":(" );

     $(e.target.parentElement).find("img").attr("src", symbolPath(this.alternative));
     $(e.target).removeClass("btn btn-action").addClass(right ? "btn-success" : "btn-danger");
     $(".alert").remove();

     if (right){
       if (Session.get("currentLevel") < Template.game.levels().length-1) {
         notify("success","You got it");
         Session.set("currentLevel", Session.get("currentLevel")+1);
       } else
         notify("success", "congrats! you finished up!");
     }else notify("danger", "Try again!")
    }
  });

}

if (Meteor.isServer) {
}
