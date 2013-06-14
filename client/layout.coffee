Template.body.rendered = ->
  window.theLayout = $('body').layout(applyDemoStyles: true, east:{size: $(window).size() / 2, resizable: true} )
  scrollContent = -> $(window).scroll()
  setTimeout scrollContent,1000
