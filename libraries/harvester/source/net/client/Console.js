
lychee.define('harvester.net.client.Console').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _CACHE   = {};



	/*
	 * HELPERS
	 */

	const _on_sync = function(data) {

		if (data instanceof Object) {

			for (let prop in data) {
				_CACHE[prop] = data[prop];
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(client) {

		_Service.call(this, 'console', client, _Service.TYPE.client);


		this.bind('sync', _on_sync, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.client.Console';


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

		}

	};


	return Composite;

});

