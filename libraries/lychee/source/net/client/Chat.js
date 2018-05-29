
lychee.define('lychee.net.client.Chat').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(id, client, data) {

		id = typeof id === 'string' ? id : 'chat';


		let states = Object.assign({}, data);


		this.room = null;
		this.user = null;


		_Service.call(this, id, client, _Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.setRoom(states.room);
		this.setUser(states.user);

		delete states.room;
		delete states.user;


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.client.Chat';

			let states = {};


			if (this.room !== null) states.room = this.room;
			if (this.user !== null) states.user = this.user;


			data['arguments'][2] = states;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function() {

			let user = this.user;
			let room = this.room;
			if (user !== null && room !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						user: user,
						room: room
					}, {
						id:    this.id,
						event: 'sync'
					});

					return true;

				}

			}


			return false;

		},

		message: function(message) {

			message = typeof message === 'string' ? message : null;


			if (message !== null) {

				let user = this.user;
				let room = this.room;
				if (user !== null && room !== null) {

					if (this.tunnel !== null) {

						this.tunnel.send({
							message: message,
							user:    user,
							room:    room
						}, {
							id:    this.id,
							event: 'message'
						});

						return true;

					}

				}

			}


			return false;

		},

		setRoom: function(room) {

			room = typeof room === 'string' ? room : null;


			if (room !== null) {

				this.room = room;
				this.sync();

				return true;

			}


			return false;

		},

		setUser: function(user) {

			user = typeof user === 'string' ? user : null;


			if (user !== null) {

				this.user = user;
				this.sync();

				return true;

			}


			return false;

		}

	};


	return Composite;

});

