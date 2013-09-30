Levels = new Meteor.Collection('levels')
Translations = new Meteor.Collection('translations')
Handlebars.registerHelper 't', (object) ->
    args = Array.prototype.slice.call(arguments, 0, arguments.length - 1)
    row = Translations.findOne( lang:Session.get("currentLanguage"), base_str: args[0] )
    if row and row.new_str
      args[0] =row.new_str
    if (args.length > 1)
       return args[0].replace("%s",args[1])
    else
       return args[0]

Meteor.autorun ->
  Meteor.subscribe("levels")
  Meteor.subscribe("translations")
  Meteor.subscribe("directory")

Template.game.rendered = ->
  $('a.edit').click (e) ->
     $(".edit-level").show()
  $(".alternative > img").hide()
  $("img.symbol").mouseover (e) ->
    console.log(" over " , e.target)

Template.language.events
  'click img': -> Session.set("currentLanguage", @language)

window.symbolPath = (symbol) -> "/images/symbols/"+symbol+".png"

Template.game.level =
Template.edit_level.level = -> Session.get("currentLevel")
