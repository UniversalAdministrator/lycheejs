
lychee.define('studio.net.Client').requires([
	'lychee.net.client.Stash'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, global, attachments) {

	const _Client = lychee.import('lychee.net.Client');
	const _Stash  = lychee.import('lychee.net.client.Stash');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data, main) {

		let settings = Object.assign({
			reconnect: 10000
		}, data);


		_Client.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _Stash(this));

			if (lychee.debug === true) {
				console.log('studio.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('studio.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'studio.net.Client';


			return data;

		}

	};


	return Composite;

});

