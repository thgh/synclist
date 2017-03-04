function peering(state, hooks) {

  if (!hooks.receive) {
    throw new Error('Must have receive hook')
  }

  createNextPeer()

  function createNextPeer() {
    if (state.peer.open) {
      return
    }
    state.peerID = Math.floor(Math.random() * state.peerMax) + 1

    console.log('creating new Peer', state.peerID)
    state.peer = new Peer(state.peerID.toString(), { key: state.peerKey });
    // Receive connection
    state.peer.on('connection', function(conn) {
      openHandler(conn, conn.peer)
    });
    state.peer.on('error', function(err) {
      switch (err.type) {
        case 'peer-unavailable':
          return
        case 'unavailable-id':
          setTimeout(createNextPeer, 500)
      }
      console.error('Peer error', err.type)
    })
    state.peer.on('open', peerCreated)
  }

  function peerCreated() {
    ls('peerID', state.peerID.toString())
    for (var i = 1; i <= state.peerMax; i++) {
      connectWith(i)
    }
  }
  // Peer connection handler
  function connectWith(id) {
    if (id == state.peerID) {
      return
    }
    var conn = state.peer.connect(id.toString());
    conn.on('open', () => openHandler(conn, id));
    conn.on('error', errorHandler);
  }

  function openHandler(conn, id) {
    state.connections.push(conn)
    conn.on('data', hooks.receive)
    hooks.connect()
  }

  function errorHandler(err) {
    console.debug('error ', err);
  }
}
