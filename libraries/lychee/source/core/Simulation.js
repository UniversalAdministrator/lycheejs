
lychee.Simulation = typeof lychee.Simulation !== 'undefined' ? lychee.Simulation : (function(global) {



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		settings = null;

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.Simulation',
				'arguments': []
			};

		}

	};


	return Composite;

});

