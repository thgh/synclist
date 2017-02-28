function peering(state, hooks) {
  heartBeat()

  if (!hooks.receive) {
    throw new Error('Must have receive hook')
  }

  function heartBeat() {
    if (!state.peer.open) {
      console.log('create next')
      createNextPeer()
    }
    setTimeout(heartBeat, 2000)
  }

  function sync() {
    if (state.peer.connections) {
      Object.values(state.peer.connections).forEach(conns => conns.forEach(conn => {
        if (conn.open) {
          console.log('sending to', conn.peer)
          conn.send({ list: state.list })
        }
      }))
    }
  }

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
      sync()
    });
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
    console.log('My peer ID is: ', state.peerID, ' and I connected with', id, conn);

    state.connections.push(conn)

    hooks.connect()

    // Receive messages
    console.log('ready to receive')
    conn.on('data', hooks.receive)
    conn.on('close', function(data) {
      // Remove closed connections
      console.log('Connections', state.connections.length, state.connections.filter(c => c.open).length)
      state.connections = state.connections.filter(c => c.open)
    })
  }

  function errorHandler(err) {
    console.debug('error ', err);
  }

  return {
    sync
  }
}
