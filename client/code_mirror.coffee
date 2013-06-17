Template.edit_level.rendered = ->
  console.log("Rendered edit_level...",this)
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  if Meteor.user()
    CodeMirror.commands.save = (editor) ->
      if level = Session.get("editingLevel")
        Levels.update(level._id, $set: {content: editor.getValue()})
    CodeMirror.commands.autocomplete = (cm) ->
      CodeMirror.showHint(cm, window.showBlissSymbolsHint)

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
  'click a.btn.save' : ->
    if level = Session.get("editingLevel")
      level.content = window.editor.getValue()
    if(id = level._id)
      Levels.update(id, level)
    else
      level._id = Levels.insert(Session.get("editingLevel"))

    Session.set("editingLevel", level)
  'click a.preview' : ->
    $(".editor").hide()
    $(".show-editor").show()
  'click a.show-editor' : ->
    $(".show-editor").hide()
    $(".editor").show()
  'click a.new-file' : ->
    t = (str) ->
      if translate = Translations.findOne({lang:Session.get("currentLanguage"), base_str: str})
        translate.new_str
      else
        str
    input = prompt(t("Insert the title"), t("My first level"))
    if input isnt null and input isnt ""
      level = author: Meteor.userId(),title: input, language: Session.get("currentLanguage")
      if (!level=Levels.find(level))
        level._id = Levels.insert(level)
      # else start editing 
      # FIXME: include a nice introductory bliss content here
      Session.set "currentLevel",level
      Session.set "editingLevel",level
  'click a.rename-file' : ->
    input = prompt("Insert the title", Session.get("currentLevel").title)
    if input isnt null and input isnt ""
      Levels.update Session.get("currentLevel")._id, $set: {title: input}

})
Template.edit_level.blissfiles = ->
  files = []
  for level in Levels.find().fetch()
    author = Meteor.users.findOne(level.author)
    files.push title: level.title, authorName: author.profile.name, flag: level.language
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
