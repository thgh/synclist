const shops = [
  {
    shop: 'Colruyt Ledeberg',
    key: '1',
    name: 'wijn',
    entities: ''
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '2',
    name: 'chips',
    entities: 'galetten,witte broodjes'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '3',
    name: 'drank',
    entities: ''
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4',
    name: 'frigo',
    entities: ''
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '5',
    name: 'random',
    entities:
      'microfiber vod,pompoenpitten,zoete aardappel,vetbollen,vaatblokjes,vaatwasblokjes,balsamico'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '6',
    name: 'vriezer',
    entities: 'rode vruchten,sorbet,vis,vanille ijs,spinazie diepvries'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '7',
    name: 'cornflakes',
    entities: 'lasagne bladen,penne,spaghetti,spaghetti saus'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4.1',
    name: 'yoghurt',
    entities: 'volle plattekaas,verse kaas'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4.2',
    name: 'kaas',
    entities:
      'geitenkaas,heksenkaas,haloumi,griekse yoghurt,kaasblokjes,mozarella,mozzarella,mozarella bolletjes,parmezaan,raclette'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4.3',
    name: 'fruit',
    entities: 'granaatappel'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4.4',
    name: 'groenten',
    entities:
      'groenteburger,kastanje champignons,paprika,pompoen,raketsla,spinazie,wortel,zoete punt paprika,veggieburger,veggiegehakt,veggie'
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4.5',
    name: 'beleg',
    entities: ''
  },
  {
    shop: 'Colruyt Ledeberg',
    key: '4.6',
    name: 'ei',
    entities: 'eieren'
  }
]

const shopLookup = {}
shops.forEach(shop => {
  if (typeof shop.entities === 'string') {
    shop.entities = shop.entities
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
  shop.entities.forEach(ent => {
    shopLookup[ent] = shop
  })
})

export { shops, shopLookup }
