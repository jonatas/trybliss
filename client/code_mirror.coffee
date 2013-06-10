Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  if not Session.get("editingLevel")
    $(".edit_level").hide()
  else
    CodeMirror.commands.save = (editor) ->
      console.log("Saving", this, editor)


    @editor = CodeMirror.fromTextArea($("#code")[0], {
      lineNumbers: true,
      mode: "text/x-csrc",
      keyMap: "vim",
      showCursorWhenSelecting: true
    })
