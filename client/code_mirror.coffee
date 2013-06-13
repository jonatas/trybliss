Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  CodeMirror.commands.save = (editor) ->
    if level = Session.get("editingLevel")
      Levels.update(level._id, $set: {content: editor.getValue()})
  CodeMirror.commands.autocomplete = (cm) ->
    console.log("show autocomplete",cm)
    CodeMirror.showHint(cm, window.showBlissSymbolsHint)

  window.editor = CodeMirror.fromTextArea($("#code")[0], {
    lineNumbers: true,
    mode: "markdown",
    keyMap: "vim",
    showCursorWhenSelecting: true,
    theme: "night",
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList", "Ctrl-Space":"autocomplete"},
    onKeyEvent: (editor, s) ->
      if s.type is "keyup"
        content = Template.markdown_content content: editor.doc.getValue()
        $(".container").html content
  })

Template.edit_level.events({
  'click a.btn.save' : ->
    if level = Session.get("editingLevel")
      level.content = window.editor.getValue()
    if(id = level._id)
      Levels.update(id, level)
    else
      level._id = Levels.insert(Session.get("editingLevel"))

    Session.set("editingLevel", level)
    layout.toggle("east")
  'click a.hide-editor' : ->
    layout.toggle("east")
  'click a.btn.cancel-edition' : ->
    layout.toggle("east")
})
