delay = (ms, func) -> setTimeout func, ms
Template.body.rendered = ->
  window.theLayout = $('body').layout(applyDemoStyles: true)
  delay 3000, -> theLayout.toggle("east")
  $(window).scroll()

