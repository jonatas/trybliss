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

Meteor.startup(function(){
  if (Levels.find().count() == 0) {
   Levels.find().forEach(function(e){Levels.remove(e._id)});
   _.each(levels, function(level){
     Levels.insert(level);
   });
  }
  Meteor.publish("levels", function(){ return Levels.find() });
});
