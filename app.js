if (Meteor.isClient) {
  Template.game.levels = function() {
    return [
      {
        title: "Places",
        help: [
         { example: 'house', plus: 'money', equal:'bank'},
         { example: 'house', plus: 'god', equal:'church'}
        ],
        question: { example: 'house',  plus: 'medical', equal: 'hospital'},
        wrong_alternatives: ['home', 'church']
      }
   ];
  };
  Template.learn.symbols = function() {
    if (!Session.get('currentLevel'))
      Session.set('currentLevel',0);

    level = Template.game.levels()[Session.get("currentLevel")];
    symbols = [];
    
    for(i=0;i< level.wrong_alternatives.length;i+=1)
      symbols.push(level.wrong_alternatives[0]);
    for(i=0;i< level.help.length;i+=1){
      help = level.help[0];
      symbols.push(help.example);
      symbols.push(help.plus);
      symbols.push(help.equal);
    }
    return _.map(_.uniq(symbols), function(symbol){ return {symbol: symbol}; });
  }
  Template.do_question.alternatives = function() {
    level = Template.game.levels()[Session.get("currentLevel")];
    array = [{alternative: level.question.equal}];
    for(i=0;i< level.wrong_alternatives.length;i+=1)
      array.push({alternative: level.wrong_alternatives[i]});

    return array;
  }
  Template.game.events({
    'click .alternative' : function () {
    level = Template.game.levels()[Session.get('currentLevel')];
     $(".answer.wrong").removeClass("wrong");
      if (this.alternative == level.question.equal)
        cssclass = 'right';
      else
        cssclass = 'wrong';

     $(".answer").addClass(cssclass);
     $(".answer").text(cssclass);
    }
  });

}

if (Meteor.isServer) {
}
