
lychee.define('harvester.net.client.Profile').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _CACHE   = {};



	/*
	 * HELPERS
	 */

	const _on_sync = function(data) {

		if (data instanceof Array) {

			data.forEach(function(object) {
				_CACHE[object.identifier] = object;
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(client) {

		_Service.call(this, 'profile', client, _Service.TYPE.client);


		this.bind('sync', _on_sync, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.client.Profile';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function() {

			let tunnel = this.tunnel;
			if (tunnel !== null) {

				let result = tunnel.send({}, {
					id:     this.id,
					method: 'index'
				});

				if (result === true) {
					return true;
				}

			}


			return false;

		},

		save: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let profile = {
					identifier: typeof data.identifier === 'string' ? data.identifier : null,
					host:       typeof data.host === 'string'       ? data.host       : null,
					port:       typeof data.port === 'string'       ? data.port       : null,
					debug:      data.debug   === true,
					sandbox:    data.sandbox === true
				};

				let tunnel = this.tunnel;
				if (tunnel !== null && profile.identifier !== null && profile.host !== null && profile.port !== null) {

					let result = tunnel.send(profile, {
						id:    this.id,
						event: 'save'
					});

					if (result === true) {
						return true;
					}

				}

			}


			return false;

		}

	};


	return Composite;

});

