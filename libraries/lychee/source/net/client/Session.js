
lychee.define('lychee.net.client.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	let   _id      = 0;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(id, client, data) {

		id = typeof id === 'string' ? id : 'session';


		let states = Object.assign({}, data);


		this.admin     = false;
		this.autoadmin = true;
		this.autolock  = true;
		this.autostart = true;
		this.min       = 2;
		this.max       = 4;
		this.sid       = 'session-' + _id++;


		this.setAutoadmin(states.autoadmin);
		this.setAutolock(states.autolock);
		this.setAutostart(states.autostart);
		this.setMax(states.max);
		this.setMin(states.min);
		this.setSid(states.sid);

		delete states.autoadmin;
		delete states.autolock;
		delete states.autostart;
		delete states.max;
		delete states.min;
		delete states.sid;


		_Service.call(this, id, client, _Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			let type = data.type;
			if (type === 'update') {

				this.setAdmin(data.admin);
				this.setSid(data.sid);
				this.setMin(data.min);
				this.setMax(data.max);

			}


			if (type === 'update' || type === 'start' || type === 'stop') {

				delete data.type;

				this.trigger(type, [ data ]);

			}

		}, this);


		if (lychee.debug === true) {

			this.bind('error', function(error) {
				console.error('lychee.net.client.Session: ' + error.message);
			}, this);

		}


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.admin === true) {
				this.setAdmin(true);
			}

		},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.client.Session';

			let states = {};
			let blob   = (data['blob'] || {});


			if (this.autoadmin !== true)                   states.autoadmin = this.autoadmin;
			if (this.autolock !== true)                    states.autolock  = this.autolock;
			if (this.autostart !== true)                   states.autostart = this.autostart;
			if (this.max !== 4)                            states.max       = this.max;
			if (this.min !== 2)                            states.min       = this.min;
			if (this.sid.startsWith('session-') === false) states.sid       = this.sid;


			if (this.admin !== false) blob.admin = this.admin;


			data['arguments'][2] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		join: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					if (lychee.debug === true) {
						console.log('lychee.net.client.Session: Joining session "' + this.sid + '"');
					}

					this.tunnel.send({
						autoadmin: this.autoadmin,
						autolock:  this.autolock,
						autostart: this.autostart,
						sid:       this.sid,
						min:       this.min,
						max:       this.max
					}, {
						id:    this.id,
						event: 'join'
					});

					return true;

				}

			}

		},

		start: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid: this.sid
					}, {
						id:    this.id,
						event: 'start'
					});

					return true;

				}

			}


			return false;

		},

		stop: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid: this.sid
					}, {
						id:    this.id,
						event: 'stop'
					});

					return true;

				}

			}


			return false;

		},

		leave: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					if (lychee.debug === true) {
						console.log('lychee.net.client.Session: Leaving session "' + this.sid + '"');
					}

					this.tunnel.send({
						sid:   this.sid
					}, {
						id:    this.id,
						event: 'leave'
					});

					return true;

				}

			}


			return false;

		},

		setAdmin: function(admin) {

			admin = typeof admin === 'boolean' ? admin : null;


			if (admin !== null) {

				this.admin = admin;

				return true;

			}


			return false;

		},

		setAutoadmin: function(autoadmin) {

			autoadmin = typeof autoadmin === 'boolean' ? autoadmin : null;


			if (autoadmin !== null) {

				this.autoadmin = autoadmin;

				return true;

			}


			return false;

		},

		setAutolock: function(autolock) {

			autolock = typeof autolock === 'boolean' ? autolock : null;


			if (autolock !== null) {

				this.autolock = autolock;

				return true;

			}


			return false;

		},

		setAutostart: function(autostart) {

			autostart = typeof autostart === 'boolean' ? autostart : null;


			if (autostart !== null) {

				this.autostart = autostart;

				return true;

			}


			return false;

		},

		setMax: function(max) {

			max = typeof max === 'number' ? max : null;


			if (max !== null) {

				this.max = max;

				return true;

			}


			return false;

		},

		setMin: function(min) {

			min = typeof min === 'number' ? min : null;


			if (min !== null) {

				this.min = min;

				return true;

			}


			return false;

		},

		setSid: function(sid) {

			sid = typeof sid === 'string' ? sid : null;


			if (sid !== null) {

				this.sid = sid;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

