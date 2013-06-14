Template.body.rendered = ->
  window.theLayout = $('body').layout(applyDemoStyles: true, east:{size: $(window).size() / 2})
  $(window).scroll()
