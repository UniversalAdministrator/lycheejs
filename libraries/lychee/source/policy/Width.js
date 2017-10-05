
lychee.define('lychee.policy.Width').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(settings) {

		this.entity = settings.entity instanceof Object ? settings.entity : null;
		this.limit  = typeof settings.limit === 'number' ? (settings.limit | 0) : Infinity;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {
				entity: null,
				limit:  this.limit
			};


			return {
				'constructor': 'lychee.policy.Width',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5 ];


			if (entity !== null) {

				let hl = limit / 2;

				values[0] = (hl + entity.width) / (hl * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hl = limit / 2;

				entity.width = (values[0] * (hl * 2)) - hl;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

