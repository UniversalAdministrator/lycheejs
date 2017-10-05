
lychee.define('app.net.remote.Ping').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	const _on_ping = function(data) {

		if (this.tunnel !== null) {

			this.tunnel.send({
				ping: data.ping,
				pong: Date.now()
			}, {
				id:    this.id,
				event: 'pong'
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(remote) {

		_Service.call(this, 'ping', remote, _Service.TYPE.remote);


		this.bind('ping', _on_ping, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'app.net.remote.Ping';
			data['arguments']   = [ null ];


			return data;

		}

	};


	return Composite;

});

