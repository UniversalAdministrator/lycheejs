
lychee.define('lychee.net.client.Storage').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(client) {

		_Service.call(this, 'storage', client, _Service.TYPE.client);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.client.Storage';
			data['arguments']   = [ data['arguments'][1] ];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function(objects) {

			objects = objects instanceof Array ? objects : null;


			if (objects !== null && this.tunnel !== null) {

				this.tunnel.send({
					timestamp: Date.now(),
					objects:   objects
				}, {
					id:    'storage',
					event: 'sync'
				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

