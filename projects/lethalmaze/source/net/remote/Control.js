
lychee.define('game.net.remote.Control').includes([
	'lychee.net.remote.Session'
]).exports(function(lychee, global, attachments) {

	let   _id       = 0;
	const _Session  = lychee.import('lychee.net.remote.Session');
	const _SESSIONS = {};



	/*
	 * HELPERS
	 */

	const _on_plug = function() {

		let found = null;

		Object.values(_SESSIONS).forEach(function(session) {

			if (session.active === false && session.tunnels.length < 6) {
				found = session;
			}

		});


		if (found !== null) {

			found.players.push(this.tunnel.host + ':' + this.tunnel.port);
			found.positions.push({ x: -1, y: -1 });
			found.tunnels.push(this.tunnel);

		} else {

			let id = 'lethalmaze-' + _id++;


			found = _SESSIONS[id] = {
				id:        id,
				active:    false,
				timeout:   10000,
				players:   [ this.tunnel.host + ':' + this.tunnel.port ],
				positions: [{ x: -1, y: -1 }],
				tunnels:   [ this.tunnel    ]
			};


			let handle = setInterval(function() {

				let timeout = this.timeout;
				if (timeout > 1000) {

					this.timeout -= 1000;


					for (let t = 0, tl = this.tunnels.length; t < tl; t++) {

						this.tunnels[t].send({
							sid:     this.id,
							tid:     t,
							players: this.players,
							timeout: this.timeout
						}, {
							id:    'control',
							event: 'update'
						});

					}

				} else {

					clearInterval(handle);

					this.active  = true;
					this.timeout = 0;


					for (let t = 0, tl = this.tunnels.length; t < tl; t++) {

						this.tunnels[t].send({
							sid:       this.id,
							tid:       t,
							players:   this.players,
							timeout:   this.timeout
						}, {
							id:    'control',
							event: 'start'
						});

					}

				}

			}.bind(found), 1000);

		}


		let tunnel = this.tunnel;
		if (tunnel !== null) {

			tunnel.send({
				sid:     found.id,
				tid:     found.tunnels.indexOf(tunnel),
				players: found.players,
				timeout: found.timeout
			}, {
				id:    'control',
				event: 'init'
			});

		}

	};

	const _on_control = function(data) {

		for (let id in _SESSIONS) {

			let session = _SESSIONS[id];
			let tid     = session.tunnels.indexOf(this.tunnel);
			if (tid !== -1) {

				if (data.position instanceof Object) {
					session.positions[tid].x = data.position.x || 0;
					session.positions[tid].y = data.position.y || 0;
				}


				for (let t = 0, tl = session.tunnels.length; t < tl; t++) {

					let tunnel = session.tunnels[t];
					if (tunnel !== this.tunnel) {

						tunnel.send({
							sid:       session.id,
							tid:       tid,
							players:   session.players,
							positions: session.positions,
							action:    data.action,
							direction: data.direction
						}, {
							id:    'control',
							event: 'control'
						});

					}

				}

			}

		}

	};

	const _on_unplug = function() {

		for (let id in _SESSIONS) {

			let session = _SESSIONS[id];
			let index   = session.tunnels.indexOf(this.tunnel);
			if (index !== -1) {

				session.players.splice(index, 1);
				session.positions.splice(index, 1);
				session.tunnels.splice(index, 1);


				for (let t = 0, tl = session.tunnels.length; t < tl; t++) {

					session.tunnels[t].send({
						sid:     session.id,
						tid:     t,
						players: session.players
					}, {
						id:    'control',
						event: 'update'
					});

				}

			}

		}


		for (let id in _SESSIONS) {

			let session = _SESSIONS[id];
			if (session.tunnels.length === 0) {
				delete _SESSIONS[id];
			}

		}


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(remote) {

		let settings = {};


		_Session.call(this, 'control', remote, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('plug',    _on_plug,    this);
		this.bind('unplug',  _on_unplug,  this);
		this.bind('control', _on_control, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Session.prototype.serialize.call(this);
			data['constructor'] = 'game.net.remote.Control';


			return data;

		}

	};


	return Composite;

});

