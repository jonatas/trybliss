
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

Meteor.startup(function(){
  if (Translations.find().count() < translations.length) {
    Translations.find().forEach(function(e){Translations.remove(e._id)});
    _.each(translations, function(translation) {
      if (!Translations.findOne(translation)) {
        Translations.insert(translation);
      }
    });
  }
  Meteor.publish("translations", function(language){ return Translations.find({lang: language})});
});
