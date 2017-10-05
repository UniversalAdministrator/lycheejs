
lychee.define('app.sprite.Airlock').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments["json"].buffer;
	const _TEXTURE = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.width   = 0;
		settings.height  = 0;
		settings.map     = _CONFIG.map;
		settings.state   = settings.state || 'horizontal-big';
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;


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
			data['constructor'] = 'app.sprite.Airlock';


			return data;

		}

	};


	return Composite;

});

