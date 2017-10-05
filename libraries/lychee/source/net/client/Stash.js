
lychee.define('lychee.net.client.Stash').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(client) {

		_Service.call(this, 'stash', client, _Service.TYPE.client);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.client.Stash';
			data['arguments']   = [ data['arguments'][1] ];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function(assets) {

			assets = assets instanceof Object ? assets : null;


			if (assets !== null && this.tunnel !== null) {

				let data = {};

				for (let id in assets) {
					data[id] = lychee.serialize(assets[id]);
				}


				this.tunnel.send({
					timestamp: Date.now(),
					assets:    data
				}, {
					id:    'stash',
					event: 'sync'
				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

