
lychee.define('lychee.app.sprite.Emblem').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _TEXTURE = attachments["png"];
	const _CONFIG  = {
		width:  256,
		height: 64
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
			data['constructor'] = 'lychee.app.sprite.Emblem';


			return data;

		}

	};


	return Composite;

});

