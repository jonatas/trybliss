saveLevel = ->
  level = Session.get("currentLevel")
  if (level._id isnt null) and (level.author is Meteor.userId())
    Levels.update(level._id, $set: {content:  window.editor.getValue()})
  else
    id = Levels.insert(Session.get("currentLevel"))
    level = Level.findOne(id)

  Session.set("currentLevel", level)

Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  if Meteor.user()
    CodeMirror.commands.save = (editor) -> 
      saveLevel()
      $(".headers").html(Template.blissdown_headers())
    CodeMirror.commands.autocomplete = (cm) -> CodeMirror.showHint(cm, window.showBlissSymbolsHint)

    if $("textarea")[0]
      window.editor = CodeMirror.fromTextArea $("textarea")[0],
        lineNumbers: true,
        mode: "markdown",
        keyMap: "vim",
        showCursorWhenSelecting: true,
        theme: "night",
        extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList", "Ctrl-Space":"autocomplete"},
        onKeyEvent: (editor, s) ->
          if s.type is "keyup"
            content = Template.blissdown_content( content:  editor.doc.getValue() )
            $(".container").html content
      
      editor.setSize($(window).width()/2,$(window).height()-32)
      $(".editor").hide()
      $(".show-editor").show()

Template.game.rendered = ->
  $(".alternative").addClass("btn large-button")
  $(".alternative > img, .alternative > p > img").hide()
  $(".headers").append(Template.blissdown_headers())
  $(".ul li").click (e) ->
    $(".ul li").removeClass("active")
    $(this).addClass("active")
    e.preventDefault()
  $('a[href="' + document.hash + '"]').parent().addClass('active')
  $(".headers > a").button().css "background-color": "rgb(155, 221, 94)"
  $(window).resize ->
    percent = Math.round($(window).height() / ($(".headers img").length * 100) * 100)
    if percent < 100
      $(".headers img").css({"width": "#{percent}%"})

  $(window).trigger "resize"


hideEditor = ->
 $(".editor").hide()
 $(".show-editor").show()
showEditor = ->
 $(".show-editor").hide()
 $(".editor").show()

Template.edit_level.events({
  'click .save': ->
    saveLevel()
    hideEditor()
  'click a.preview': hideEditor
  'click a.show-editor': showEditor
})

t = (str) ->
  withString = lang: Session.get("currentLanguage"), base_str: str
  translate = Translations.findOne(withString)
  if translate
    translate.new_str
  else
    str
Template.body.events({
  'click .new-file': ->
    console.log("new file")
    input = prompt(t("Insert the title"), t("My first level"))
    if input isnt null and input isnt ""
      level = author: Meteor.userId(), title: input, language: Session.get("currentLanguage")
      if exists = Levels.findOne(level)
        console.log("exits level", level)
        level = exists
      else
        id = Levels.insert(level)
        level._id = id

      if not level.content or level.content is ""
        level.content = t("# Welcome to bliss")+"\n\n"+
          t("* Try to start using the editor with markdow.")+"\n\n"+
          t("* There's a vim keybinds here")+"\n\n"+
          t(" - Use i to start inserting code and <esc> to escape to command mode.")+"\n\n"+
          t(" - Use ctrl-space to get suggestions around the symbols")+"\n\n"+
          t(" - Selecting the symbol will automatically reproduce the symbol introduction into the markdown sintax.")+"\n\n"+
          t("* The language is auto selected by the language you use")+"\n\n"+
          t("## Use interative questions")+"\n\n"+
          t("Write answers using '* ->' (a bullet with an arrow) to introduce new symbols")+"\n\n"+
          t("The right answer should have an arrow on the right side showing the right question")+"\n\n"
          t("If you use images into the question, the images will be hidden while asking and show the image when click in the answer.")
        Levels.update(level._id, level)
      Session.set "currentLevel",level
      showEditor()
  'click a.rename-file' : ->
    input = prompt(t("Insert the new title"), Session.get("currentLevel").title)
    if input isnt ""
      Levels.update( Session.get("currentLevel")._id, {$set: {title: input}})
  'click .fileitem': ->
    level = Levels.findOne this._id
    console.log level
    Session.set "currentLevel", level
})
Template.game.events({
  'click .alternative': (e) ->
    $(".question").removeClass("alert-success")
    $(".question").removeClass("alert-error")
    $(e.target).find("img").show()
    alt = $(e.target).parent ".alternative"
    if alt.hasClass "right"
      alt.addClass "btn-success"
    else
      alt.addClass "btn-danger"
})

Template.body.level = -> Session.get("currentLevel")
Template.body.currentLanguage= -> language: Session.get("currentLanguage")

flagLanguages = ->
  flags = []
  currentLang = Session.get("currentLanguage")
  Translations.find().forEach (translation) ->
    if translation.lang isnt currentLang and not _.include(flags,translation.lang)
      flags.push translation.lang
  flags.push('us') if 'us' isnt currentLang
  _.map(flags, (flag) -> language: flag)
Template.flags_panel.flags = flagLanguages
Template.body.flags = flagLanguages
Template.body.blissfiles = -> Levels.find()
Template.body.authorName = -> author.profile.name if author = Meteor.users.findOne(this.author)

Template.blissdown_headers.links = ->
  a = []
  for link in $("h1")
    link = $(link)
    header = {title: link.text(), id: link.attr("id"), index: a.length+1}
    img = link.nextUntil("img").find("img:first").first()[0]
    header.symbol = img.src if img
    a.push header
  a
