Meteor.startup ->
  htmlIt = (text) -> (new Showdown.converter()).makeHtml(text)
  preMarkdownIt = (string) ->
    strFull = ""
    for line in string.split "\n"
      newString = line.replace /^\? (.*)/, (string,question) ->
        console.log("question",string,">>>",question,"htmlIt::",htmlIt(question))
        "<div class='question'>"+htmlIt(question)+"</div>"
      newString = newString.replace /^\*- (.*)/, (string,alternative) ->
        regex = /(<|&lt;)[-=]$/
        if alternative.match regex
          "<li class='alternative right'>#{htmlIt(alternative.replace regex, "")}</li>"
         else
          "<li class='alternative'>#{htmlIt(alternative)}</li>"
      strFull = strFull + "\n" + newString
    strFull

  Handlebars.registerHelper 'blissdown', (options) ->
    htmlIt(preMarkdownIt(options.fn(this)))
