## Uppgift för utveklare på BNU
##### Eddy Ntambwe (<eddydarell@gmail.com>)

#### Användning

1. Clone repository
2.  
``` bash
npm install
npm run dev
```
Detta startar en web server på localhost:8081 (can configureras i package.json)

- Tryck på knappen *Local feeds* för att hämta RSS flöden från lokalt sparade filer
- Tryck på knappen *Internet feeds* för att hämta senaste RSS flöden från nättet
- Tryck på knappen *Toggle view* för att se 10 senaste artikel med mer detaljer

#### Lösningen

1. Uppfigtens lösning är en webb app skiven i vanilla JavaScript (ES6), vilket innebär att den borde fungera i dom flesta moderna weblässare.
2. Har lagt ca 3 timmar på uppgiftensutveckling men har spenderat extra tid med CORS policy hindret som ställde till RSS hämntning. Och lite extra på UI av personliga skäll (Tyckte att det var en rolig uppgift)
3. Applikationen är inte optimerad för att klara mycket hög last men i sådana fall lösningen jag har tänkt på är väl att använda en cahe för att spara redan nedladdade flöden.
4. Om jag hade mer tid då skulle jag utveckla vidare på sättet nedan: 
- Projektsstruktur, bättre fil hantering och kod separation
- Använda klasser
- Felhantering, bättre felhantering och data säkring
- Flera funktioner (gruppering, filtrering, sortering i olika fält ordning som A-Z, optimering för snabbhet och resurs snållhet, etc). I koden finns redan några "extra" funktioner implementerade.
- GUI, bättre design och fler information (Har redan gjort något sådant av personliga skäll)

#### Utmaningar

Under utvecklingsgång har kjag stött på några utmaningar. Nämligen:

- **CORS-policy**: Har haft probelm att komma åt RSS föden från min utveckling server (localhost). 
Min temporära lösning var att ladda ner XML föden i olika filer som sparades på min dator. Jag har sen utvecklat mot dessa filer. Dom finns kvar i mappen *assets/rss* som dom har varit nedladdade i Söndags 2:a Maj 2021.
Jag har sen använt en proxy för att kunna nå RSS backend efter tips om [rss-parser - npm](https://www.npmjs.com/package/rss-parser) .
- **Aggregering av RSS data från alla olika flöden som hämtades asynchroniskt**:
Lösningen för detta kom i form av en användning av 2 aggregering arrays som behåller data vid varje lyckad hämnting och en callback som bearbetar datat vidare efter vi har spara data för så många gånger som det finns RSS länkar.
Jag använder en counter för att hålla koll på det.

#### Avgränsningar

```js
aggregateRSS(xmlDoc, aggregateArray);
sortItems(channels, sortField = 'pubDate', limit = 10)
```

Sparar mer detaljer om kanalen som inte används för lösningen, detta pga av egen vidare utveckling.