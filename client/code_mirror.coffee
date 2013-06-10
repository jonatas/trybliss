Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  if not Session.get("editingLevel")
    $(".edit_level").hide()
  else
    CodeMirror.commands.save = (editor) ->
      if level = Session.get("editingLevel")
        console.log("updating level",level)
        level.content = editor.getValue()
        Level.update(level._id, level)

    @editor = CodeMirror.fromTextArea($("#code")[0], {
      lineNumbers: true,
      mode: "markdown",
      keyMap: "vim",
      showCursorWhenSelecting: true,
      extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
      onKeyEvent: (e , s) ->
        if s.type is "keyup"
          content = Template.markdown_content({content: e.doc.getValue()})
          console.log("updating.. ",content)
          $(".container").html(content)
    })
