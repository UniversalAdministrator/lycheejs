
lychee.define('game.app.entity.unit.Leucocyte').includes([
	'game.app.entity.Unit'
]).exports(function(lychee, global, attachments) {

	const _Unit = lychee.import('game.app.entity.Unit');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({
			team:   'neutral',
			damage: 100,
			health: 200,
			radius: 15,
			speed:  500
		}, data);


		_Unit.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Unit.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.unit.Leucocyte';

			return data;

		}

	};


	return Composite;

});

