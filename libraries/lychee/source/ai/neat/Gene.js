
lychee.define('lychee.ai.neat.Gene').exports(function(lychee, global, attachments) {

	const Composite = function(data) {

		let settings = Object.assign({}, data);

		this.into = 0;
		this.out = 0;
		this.weight = 0.0;
		this.enabled = true;
		this.innovation = 0;


		this.setInto(settings.into);
		this.setOut(settings.out);
		this.setWeight(settings.weight);
		this.setEnabled(settings.enabled);
		this.setInnovation(settings.innovation);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Gene',
				'arguments':   []
			};

		}

	};


	return Composite;

});

