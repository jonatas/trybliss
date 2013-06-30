marked.setOptions gfm: true, smartypants: true, tables: true
#, inline: (down) 
#  down /(^|[ \t]+)@([a-zA-Z0-9]+)/,
#    ((cap, src) -> src.substring(cap[0].length)),
#    ((cap, escape) -> "<a href='https://twitter.com/#{cap[2]}'>@#{cap[2]}'</a>")
