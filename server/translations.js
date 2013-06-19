Translations = new Meteor.Collection('translations');
var translations = [
   {lang: 'br', base_str: 'Learn', new_str: 'Aprender'},
   {lang: 'br', base_str: 'Symbols', new_str: 'Símbolos'},
   {lang: 'br', base_str: 'Combine', new_str: 'Combinar'},
   {lang: 'br', base_str: 'Save', new_str: 'Salvar'},
   {lang: 'br', base_str: 'Preview', new_str: 'Visualizar'},
   {lang: 'br', base_str: 'Combine %s', new_str: 'Combinar %s'}, // Combine title level
   {lang: 'br', base_str: 'Level %s', new_str: 'Nível %s'},
   {lang: 'br', base_str: 'Content editor', new_str: 'Editor de conteúdo'},
   {lang: 'br', base_str: 'New file', new_str: 'Novo arquivo'},
   {lang: 'br', base_str: 'Answer', new_str: 'Responda'},
   {lang: 'br', base_str: 'Next level', new_str: 'Próximo nível'},
   {lang: 'br', base_str: 'Previous level', new_str: 'Nível anterior'},
   {lang: 'br', base_str: 'Insert the title', new_str: 'Qual o título?'},
   {lang: 'br', base_str: 'My first level', new_str: 'Meu primeiro nível'},
   {lang: 'br', base_str: 'Files', new_str: 'Arquivos'},
   {lang: 'br', base_str: 'New File', new_str: 'Novo arquivo'},
   {lang: 'se', base_str: 'Learn', new_str: 'Lära'},
   {lang: 'se', base_str: 'Symbols', new_str: 'Symboler'},
   {lang: 'se', base_str: 'Combine', new_str: 'Kombinera'},
   {lang: 'se', base_str: 'Combine %s', new_str: 'Kombinera %s'},
   {lang: 'se', base_str: 'Level %s', new_str: 'Nivå %s'},
   {lang: 'se', base_str: 'Answer', new_str: 'Svara'},
   {lang: 'se', base_str: 'New file', new_str: 'ny fil'},
   {lang: 'se', base_str: 'Rename', new_str: 'byta namn'},
   {lang: 'de', base_str: 'Learn', new_str: 'Lernen'},
   {lang: 'de', base_str: 'Symbols', new_str: 'Symbole'},
   {lang: 'de', base_str: 'Combine', new_str: 'Kombinieren'},
   {lang: 'de', base_str: 'Combine %s', new_str: 'Kombinieren %s'},
   {lang: 'de', base_str: 'Level %s', new_str: 'Ebene %s'},
   {lang: 'de', base_str: 'New file', new_str: 'neue Datei'},
   {lang: 'de', base_str: 'Rename', new_str: 'umbenennen'},
   {lang: 'de', base_str: 'Answer', new_str: 'Beantworten'}
];

Meteor.startup(function(){
/*  _.each(Translations.find().fetch(), function(translation) {
     Translations.remove(translation._id)
  }); */
  if (Translations.find().count() < translations.length) {
    _.each(translations, function(translation) {
      if (translated=Translations.findOne(translation)){
        Translations.update(translated._id, translation);
      } else {
        Translations.insert(translation);
      }
    });
  }
  Meteor.publish("translations", function(){return Translations.find();});
});
