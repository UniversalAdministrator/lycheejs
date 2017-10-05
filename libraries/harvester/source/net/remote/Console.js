
lychee.define('harvester.net.remote.Console').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(remote) {

		_Service.call(this, 'console', remote, _Service.TYPE.remote);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Console';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			let tunnel = this.tunnel;
			if (tunnel !== null) {

				let result = tunnel.send(lychee.serialize(console), {
					id:    this.id,
					event: 'sync'
				});

				if (result === true) {
					return true;
				}

			}


			return false;

		},

		sync: function() {
			return this.index();
		}

	};


	return Composite;

});

