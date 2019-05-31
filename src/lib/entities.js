import Fuse from 'fuse.js'

const dump = `4 kazen pizza,aardappel,aardappelen,aardbei,advocado,allesreiniger multi usages,amandelen,amandelpoeder,ananas,aperitief,aperitief stokjes,appel,appelcake ml6,appelmoes,appels,aubergine,balsamico,banaan,bananen,bananencrème (liqueur),basilicum,batterij,beleg,ben en jerrys,benodigdheden koekjes bakken 🍪 🍰,bevroren aardbei,bier,bladerdeeg,blauwe kaas,blikken rijstpap,bloem,bloemkool,blok kaas,boontjes,boontjes 2,boter,boudoir,boudoirs,bouillon,brico: bloempot,broccoli,brocolli,brood,broodjes,bruine suiker,buggles,bugles,cadeaupapier,calippo,cannelloni,canneloni,cashewnoten,cassis,cava,champignons,cheddar (geraspt?),cheesecake,chips,choco,chocolade,chocoladepellets,cider,citroen,citroen sorbet,citroenlimonade,clemantientjes,confituursuiker,cornflakes,courgette,couscous,crunchy paars,deo,desserten voor verjaardag thomas,diepvries aardbei,dipsaus,doorschijnend papier,doritos,drank christof,druiven,dweil,een paar wortels?,eieren,emmer poetsvrouw,erwten,erwtjes,fajita saus,falafel,feta,fishsticks,fondue,fonduekaas,frambozen cake,frambozen koekjes,frambozencoulis,frambozenkoekjes,frietjes,frisdrank,fristi,fruit ml6,fruitmix smoothie: mango,fruitsap,fruitsla,galetten,gauda,gegrilde groenten,gehakt,geitenkaas,geitenkaas buggles,geitenkaas rol?,gelatine,geraspte kaas,gist,glutinous rice,goedkope rode wijn gluhwein,granaatappel,granola,gratis kookboek,griekse yoghurt,groene pesto,groenteburger,grote tomaat,grote tomaten,haloumi,hamburger,hamburger broodje,hamburger broodjes,hamburger vlees,hamburgers,handzeep,havermout,heksenkaas,hesp,hummus,ijs,italiaanse kruiden,javel,kaas,kaasblokjes,karton(voor kaartjes),kastanje champignons,kazen,kerstomaat,kerstomaatjes,ketchup,keukenpapier,kikkererwten,kip,kippeneten,kiwi,klein blik ananas,kleine ananasstukjes,koekjes,koekjes meter,komkommer,kriek bellevue,lasagne bladen,lasange,lijm,limoen,lintjes,linzen,look,m&ms,macaroni,mais,makreel,makreel rode 6,mandarijntjes,maredsous,marshmallows,mascarpone,mascarpone saus,melk,microfiber vod,microvezel dwijl en vod,microvezeldoekjes,mosterd,mozarella,mozarella bolletjes,mozzarella,muesli/granola ml6,nachos,nachos dip,naspoelmiddel,natrium bicarbonaat,nietjes,nootjes,olijfolie,olijven,ontstopper,orange juice,orzo,paneermiddel,paprika,parasolhoes,parmesan cheese,parmezaan,pasta saus mascarpone, basilicum,pastasaus,patisserie bloem,penne,pers appelsienen,philadelphia,pijnboompitten,pintjes,pizza,pizza deeg,pizzabloem,pizzadeeg,plakband,platte kaas,pompoen,pompoenpitten,prei,quiche,quiche?,quichebodem,raclette,raketsla,ravioli blik,ricotta,rietsuiker,rijstpap,risotto rijst,rode en groene pesto,rode pesto,rode vruchten,rode vruchten diepvries,room,rozijnen,rucola,safari,salami/bier peter,salsa saus,scampi,scampi diabolique voor 9 man?,schelletjes kaas,shampoo,sinaasappels,sla,slaatje,slagroom,smoothie,sneetjes kaas,snoep,snoepjes,soep,sojascheuten,sorbet,spaghetti,spaghetti saus,speculoos,spekjes,spinazie,spinazie diepvries,spirelli,sponsjes,sprite,spuitwater klein,spuitwater lidl,sticky rice,suiker,sushi rijst,sushivel,swiffer (met stok),swiffer duster,tafelpapier,tagliatelle,tandpasta,tartaar,thee,thee ml6,toilet blokjes,toilet paper,tomaat,tomaat uit de serre,tomaatjes,tomaten,tomaten salsa,tomatenconcentraat,tomatensaus,tonic,tortellini,touw,unsweetened coconut milk,vaatblokjes,vaatwasblokjes,vanille ijs,vanille suiker,veel tomaat,veenbessen,veggie,veggie burger,veggie burgers,veggie gehakt,veggie schnitzel,veggieburger,veggiegehakt,verdeelstekker,verse kaas,vetbollen,vis,volle plattekaas alles maal twee,walnoten,wasabi,wc blokjes,wc gel,wijn,witte broodjes,witte chocolade,witte rum,witte wijn,woccoli,wortel,wortelcake,wortelen,wortels (voor puree),wraps,yoghurt,yoghurt ijs,zalf,zalm,zoete aardappel,zoete punt paprika,zongedroogde tomaat,zonneblielolie,zure room`

export const entityKeys = dump.split(',')

export const entities = entityKeys.map(key => ({
  key,
  alt: [key]
}))

const options = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['key']
}

export const fuzzy = new Fuse(entities, options)

export function suggest(focused) {
  const results = fuzzy.search(focused.content).slice(0, 5)

  return results.map(r => {
    let key = r.item.key
    for (var m = r.matches.length - 1; m >= 0; m--) {
      const match = r.matches[m]
      for (var i = match.indices.length - 1; i >= 0; i--) {
        const [start, end] = match.indices[i]
        key =
          key.slice(0, start) +
          '<b>' +
          key.slice(start, end + 1) +
          '</b>' +
          key.slice(end + 1)
      }
    }
    r.disp = key
    return r
  })
}
