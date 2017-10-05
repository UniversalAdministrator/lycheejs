
lychee.define('studio.ui.entity.input.Font').includes([
	'lychee.ui.entity.Input'
]).exports(function(lychee, global, attachments) {

	const _Input = lychee.import('lychee.ui.entity.Input');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		_Input.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Input.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.entity.input.Font';


			return data;

		}

	};


	return Composite;

});

