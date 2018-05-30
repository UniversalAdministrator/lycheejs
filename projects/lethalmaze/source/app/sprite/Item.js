
lychee.define('game.app.sprite.Item').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Entity  = lychee.import('lychee.app.Entity');
	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _TEXTURE = attachments["png"];
	const _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data, main) {

		let states = Object.assign({}, data);


		states.collision = _Entity.COLLISION.A;
		states.texture   = _TEXTURE;
		states.map       = _CONFIG.map;
		states.width     = _CONFIG.width  - 4;
		states.height    = _CONFIG.height - 4;
		states.shape     = _Entity.SHAPE.rectangle;
		states.states    = _CONFIG.states;
		states.state     = 'default';


		_Sprite.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Item';


			return data;

		}

	};


	return Composite;

});

