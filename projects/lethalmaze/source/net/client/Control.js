
lychee.define('game.net.client.Control').includes([
	'lychee.net.client.Session'
]).exports(function(lychee, global, attachments) {

	const _Session = lychee.import('lychee.net.client.Session');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(client) {

		let states = {};


		states.autostart = false;
		states.autolock  = true;
		states.min       = 2;
		states.max       = 6;
		states.sid       = 'wait-for-init';


		_Session.call(this, 'control', client, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function(data) {

			this.setSid(data.sid);
			this.join();

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Session.prototype.serialize.call(this);
			data['constructor'] = 'game.net.client.Control';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		control: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let result = this.tunnel.send({
					tid:       data.tid,
					position:  data.position,
					action:    data.action,
					direction: data.direction
				}, {
					id:    this.id,
					event: 'control'
				});


				if (result === true) {
					return true;
				}

			}


			return false;

		},

		change: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let result = this.tunnel.send({
					tid:       data.tid,
					life:      data.life,
					action:    null,
					position:  data.position,
					direction: data.direction
				}, {
					id:    this.id,
					event: 'control'
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

