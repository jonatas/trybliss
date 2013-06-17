saveLevel = ->
  if level = Session.get("currentLevel")
    level.content = window.editor.getValue()
  if (id = level._id and level.author is Meteor.userId())
    Levels.update(id, level)
  else
    level._id = Levels.insert(Session.get("currentLevel"))

  Session.set("currentLevel", level)

Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  if Meteor.user()
    CodeMirror.commands.save = (editor) -> saveLevel()
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
      
      editor.setSize($(window).width()/2,$(window).height()*0.9)
      $(".editor").hide()
      $(".show-editor").show()

Template.blissdown_content.rendered = ->
  $(".alternative").addClass("btn large-button")
  $(".alternative > img, .alternative > p > img").hide()
  $(".header").append(Template.blissdown_headers())
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


Template.edit_level.events({
  'click a.btn.save': ->
    saveLevel()
  'click a.preview': ->
    $(".editor").hide()
    $(".show-editor").show()
  'click a.show-editor': ->
    $(".show-editor").hide()
    $(".editor").show()
  'click .fileitem': ->
    level = Levels.findOne this.levelId
    Session.set "currentLevel", level
  'click a.new-file': ->
    t = (str) ->
      withString = lang: Session.get("currentLanguage"), base_str: str
      translate = Translations.findOne(withString)
      if translate
        translate.new_str
      else
        str

    input = prompt(t("Insert the title"), t("My first level"))

    if input isnt null and input isnt ""
      level = author: Meteor.userId(), title: input, language: Session.get("currentLanguage")
      if exists = Levels.findOne(level)
        id = Levels.insert(level)
        level._id = id
      else
        console.log("exits level", level)
        level = exists

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
  'click a.rename-file' : ->
    input = prompt("Insert the title", Session.get("currentLevel").title)
    if input isnt null and input isnt ""
      Levels.update Session.get("currentLevel")._id, $set: {title: input}


})
Template.edit_level.blissfiles = ->
  files = []
  for level in Levels.find().fetch()
    author = Meteor.users.findOne(level.author)
    files.push title: level.title, authorName: author.profile.name, levelId: level._id, flag: level.language
  files

Template.blissdown_headers.links = ->
  a = []
  for link in $("h1")
    link = $(link)
    header = title: link.text(), id: link.attr("id"), index: a.length+1
    if img = link.nextUntil("img").find("img:first").first()[0]
      header.symbol = img.src
    a.push header
  a
