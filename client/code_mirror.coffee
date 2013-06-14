Template.edit_level.rendered = ->
  $("a[data-toggle='tooltip']").tooltip animation: "fade", container: "body"
  CodeMirror.commands.save = (editor) ->
    if level = Session.get("editingLevel")
      Levels.update(level._id, $set: {content: editor.getValue()})
  CodeMirror.commands.autocomplete = (cm) ->
    console.log("show autocomplete",cm)
    CodeMirror.showHint(cm, window.showBlissSymbolsHint)

  showEditorAndScrollContent = ->
    window.theLayout = $('body').layout(applyDemoStyles: true, east:{size: $(window).size() / 2, resizable: true} )
    $(window).scroll()
    window.editor = CodeMirror.fromTextArea($("textarea")[0], {
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
    editor.setSize($(window).width(),$(window).height()*0.8)

  Meteor.setTimeout showEditorAndScrollContent,1000

Template.edit_level.events({
  'click a.btn.save' : ->
    if level = Session.get("editingLevel")
      level.content = window.editor.getValue()
    if(id = level._id)
      Levels.update(id, level)
    else
      level._id = Levels.insert(Session.get("editingLevel"))

    Session.set("editingLevel", level)
    theLayout.toggle("east")
  'click a.hide-editor' : ->
    theLayout.toggle("east")
  'click a.btn.cancel-edition' : ->
    theLayout.toggle("east")
})
