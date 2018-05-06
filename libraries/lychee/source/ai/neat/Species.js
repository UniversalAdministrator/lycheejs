
lychee.define('lychee.ai.neat.Species').exports(function(lychee, global, attachments) {

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		settings = null;

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Species',
				'arguments':   []
			};

		}

	};


	return Composite;

});

