
lychee.define('lychee.net.remote.Storage').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(remote) {

		_Service.call(this, 'storage', remote, _Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			this.broadcast(data, {
				id:    this.id,
				event: 'sync'
			});

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.remote.Storage';
			data['arguments']   = [];


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

