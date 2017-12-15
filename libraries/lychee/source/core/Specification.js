
lychee.Specification = typeof lychee.Specification !== 'undefined' ? lychee.Specification : (function(global) {



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
				'constructor': 'lychee.Specification',
				'arguments': []
			};

		}

	};


	return Composite;

});

