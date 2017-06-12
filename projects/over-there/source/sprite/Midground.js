
lychee.define('app.sprite.Midground').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _TEXTURE = attachments["png"];
	const _CONFIG  = {
		states: { 'default': 0 },
		map:    { 'default': [{ x: 0, y: 0, w: 2048, h: 2048 }] }
	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.repeat  = false;
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.position = { x: 0, y: 0 };


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
			data['constructor'] = 'app.sprite.Midground';


			return data;

		}

	};


	return Composite;

});

