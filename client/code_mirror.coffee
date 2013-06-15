Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  CodeMirror.commands.save = (editor) ->
    if level = Session.get("editingLevel")
      Levels.update(level._id, $set: {content: editor.getValue()})
  CodeMirror.commands.autocomplete = (cm) ->
    CodeMirror.showHint(cm, window.showBlissSymbolsHint)


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
})
