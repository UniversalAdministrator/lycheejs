
lychee.define('game.ui.sprite.Tile').requires([
	'lychee.ui.Entity'
]).includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Entity  = lychee.import('lychee.ui.Entity');
	const _Sprite  = lychee.import('lychee.ui.Sprite');
	const _TEXTURE = attachments["png"];
	const _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.x = typeof settings.x === 'number' ? settings.x : 0;
		this.y = typeof settings.y === 'number' ? settings.y : 0;


		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;
		settings.shape   = _Entity.SHAPE.rectangle;
		settings.states  = _CONFIG.states;
		settings.state   = 'default';


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Tile';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setState: function(state) {

			state = typeof state === 'string' ? state : null;


			if (state !== null) {

				if (this.state === 'default' && state !== 'default') {

					let result = _Sprite.prototype.setState.call(this, state);
					if (result === true) {
						return true;
					}

				} else if (state === 'default') {

					let result = _Sprite.prototype.setState.call(this, state);
					if (result === true) {
						return true;
					}

				}

			}


			return false;

		}

	};


	return Composite;

});

