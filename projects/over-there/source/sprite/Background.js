
lychee.define('app.sprite.Background').includes([
	'lychee.app.sprite.Background'
]).exports(function(lychee, global, attachments) {

	const _Background = lychee.import('lychee.app.sprite.Background');
	const _TEXTURE    = attachments["png"];
	const _CONFIG     = {
		repeat: true,
		states: { 'default': 0 },
		map:    { 'default': [{ x: 0, y: 0, w: 512, h: 512 }] }
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.map     = _CONFIG.map;
		settings.repeat  = _CONFIG.repeat;
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;


		_Background.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Background.prototype.serialize.call(this);
			data['constructor'] = 'app.sprite.Background';


			return data;

		}

	};


	return Composite;

});

