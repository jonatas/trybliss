delay = (ms, func) -> setTimeout func, ms
Template.body.rendered = ->
  window.layout = $('body').layout(applyDemoStyles: true)
  $(window).scroll()
  delay 3000, -> layout.toggle("east")

