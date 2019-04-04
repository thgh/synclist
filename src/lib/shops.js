export const shops = [{
  name: 'Colruyt',
  sections: [{
    key: '1',
    name: 'wijn',
    entities: ''
  }, {
    key: '2',
    name: 'chips',
    entities: 'galetten,witte broodjes'
  }, {
    key: '3',
    name: 'drank',
    entities: ''
  },{
    key: '4',
    name: 'frigo',
    entities: ''
  }, {
    key: '5',
    name: 'random',
    entities: 'microfiber vod,pompoenpitten,zoete aardappel,vetbollen,vaatblokjes,vaatwasblokjes'
  }, {
    key: '6',
    name: 'vriezer',
    entities: 'rode vruchten,sorbet,vis,vanille ijs,spinazie diepvries'
  }, {
    key: '7',
    name: 'cornflakes',
    entities: 'lasagne bladen,penne,spaghetti,spaghetti saus'
  }, {
    key: '4.1',
    name: 'yoghurt',
    entities: 'volle plattekaas,verse kaas'
  }, {
    key: '4.2',
    name: 'kaas',
    entities: 'geitenkaas,heksenkaas,haloumi,griekse yoghurt,kaasblokjes,mozarella,mozarella bolletjes,parmezaan,raclette'
  }, {
    key: '4.3',
    name: 'fruit',
    entities: 'granaatappel'
  }, {
    key: '4.4',
    name: 'groenten',
    entities: 'groenteburger,kastanje champignons,paprika,pompoen,raketsla,spinazie,wortel,zoete punt paprika,veggieburger,veggiegehakt,veggie'
  }, {
    key: '4.5',
    name: 'beleg',
    entities: ''
  }, {
    key: '4.6',
    name: 'ei',
    entities: 'eieren'
  }]
}]
shops.forEach(shop => {
  shop.sections.forEach(s =>  {
    if (typeof s.entities === 'string') {
      s.entities = s.entities.split(',').map(s => s.trim()).filter(Boolean)
    }
  })
})