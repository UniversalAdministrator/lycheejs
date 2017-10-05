
lychee.define('game.ui.sprite.Welcome').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite  = lychee.import('lychee.ui.Sprite');
	const _TEXTURE = attachments["png"];
	const _CONFIG  = {
		width:  512,
		height: 256
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.texture = _TEXTURE;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;


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
			data['constructor'] = 'game.ui.sprite.Welcome';


			return data;

		}

	};


	return Composite;

});

