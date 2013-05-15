if (Meteor.isClient) {
  Meteor.startup(function(){
  if (!Session.get('currentLevel'))
    Session.set('currentLevel',0);
  });
  Template.game.levels = function() {
    return [
      {
        title: "Places",
        learn: { symbols: [ 'house', 'money', 'god', 'feeling'] },
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
      },
      {
        title: "Knowledge",
        learn: { symbols: [ 'knowledge', 'mind', "exchange-v", "up"] },
        help: [
         { example: 'knowledge', plus: 'learn', equal:'explain-v'}
        ],
        question: { example: 'house',  plus: 'learn', equal: 'school'},
        wrong_alternatives: ['bank', 'god', 'restaurant']
      }
   ];
  };
  Template.game.level = function() {
    return Template.game.levels()[Session.get("currentLevel")];
  }

  Template.learn.symbols = function() {
    level = Template.game.level();
    return _.map(level.learn.symbols, function(symbol){ return {symbol: symbol}; });
  }
  Template.do_question.alternatives = function() {
    level = Template.game.level();
    array = [{alternative: level.question.equal}];
    for(i=0;i< level.wrong_alternatives.length;i++)
      array.push({alternative: level.wrong_alternatives[i]});

    return array;
  }
  Template.game.events({
    'click .alternative' : function (e) {
    level = Template.game.levels()[Session.get('currentLevel')];
     $(".answer").removeClass("btn-success");
     $(".answer").removeClass("btn-danger");
     right = (this.alternative == level.question.equal);
     
     $(".answer").text(right ? ":)" : ":(" );
     $(e.target.parentElement).find("img").attr("src", "/images/"+this.alternative+".jpg");
     $(e.target).removeClass("btn btn-action").addClass(right ? "label-success" : "label-important");

     if (right){
       alert("you win!")
       if (Session.get("currentLevel") < Template.game.levels().length-1)
         Session.set("currentLevel", Session.get("currentLevel")+1);
       else
         alert("congrats! you finished up!");
     }
     
    }
  });

}

if (Meteor.isServer) {
}
