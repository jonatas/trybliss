Symbols = new Meteor.Collection('symbols')
Symbols.find().forEach(function(e){Symbols.remove(e._id);});
