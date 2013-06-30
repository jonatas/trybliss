# Hur man använder editorn:


![write-(to)][]



* Försök börja skriva i editorn med s.k. [markdown-syntax][1]. Editorn öppnas med ett klick på knappen med en hand i fönstrets övre högra hörn.

* Editorn använder tangent-kommandon från [Vim-editorn][2], t.ex.:

 - Tryck på 'i'-tangenten för att börja lägga in kodtext, och <esc> för att gå tillbaka till kommandoläge.

 - Använd ctrl-blanksteg för att få förslag på symboler: Skriv alltså ett ord i blissymbolens engelska glosa och tryck Ctrl+blanksteg för att se hittade symboler.

 - När en symbol väljs läggs denna automatiskt in enligt markdown-syntaxen.

* Språket sätts automatiskt efter det språk som används

## Använd interaktiva frågor och svar

Lägg t.ex. in en blissymbol och fråga vad den betyder enligt följande:

* Ställ frågan, t.ex.: '#### Vad betyder följande symbol?'
* #-tecknen avgör rubriknivå. Gör sedan två radbrytningar.
* Skriv 'ask' och tryck Ctrl+blanksteg.
* Som andra förslag i symbollistan som visas finns 'ask,inquire,question-(to)'. Välj denna symbol!
* Symbolen läggs in med en referens till bildfilen, samt med filnamnet i text under symbolen
* Ta bort eller redigera filnamnstexten under symbolen
* Lägg sedan in tre svarsalternativ enligt följande (utom de enkla citattecknen):
 - '* -> alternativ 1'
 - '* -> alternativ 2'
 - '* -> att fråga (rätt) <-' ... där den extra vänsterpilen <- markerar rätt svar!

Resultatet blir följande:

#### Vad betyder följande symbol:

![ask,inquire,question-(to)][] 


* -> alternativ 1
* -> alternativ 2
* -> att fråga (rätt) <-

Klicka på svarsalternativen och se att alternativ 1 och 2 markeras röda, medan det korrekta 'att fråga' blir grön som korrekt svar.



# Information

![information][] 


I markdown-sntaxen skapar man en punktlista med '*' och '-' enligt följande:

    * item a
     - item a1
     - item a2
    * item b
    * item c
    
Resultatet blir:

* item a
 - item a1
 - item a2
* item b
* item c

Läs mer om [markdown här][1]

[1]: http://daringfireball.net/projects/markdown/syntax
[2]: http://www.vim.org/about.php
[blissymbol]: http://bliss.ideia.me/images/symbols/blissymbol.png
[ask,inquire,question-(to)]: http://bliss.ideia.me/images/symbols/ask,inquire,question-(to).png
[information]: http://bliss.ideia.me/images/symbols/information.png
[write-(to)]: http://bliss.ideia.me/images/symbols/write-(to).png
[ask,inquire,question-(to)]: http://bliss.ideia.me/images/symbols/ask,inquire,question-(to).png

