
lychee.define('app.sprite.Room').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Entity  = lychee.import('lychee.app.Entity');
	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments["json"].buffer;
	const _TEXTURE = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.properties = {};


		settings.width   = 0;
		settings.height  = 0;
		settings.map     = _CONFIG.map;
		settings.shape   = _Entity.SHAPE.rectangle;
		settings.state   = settings.state || 'default';
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;


		this.setProperties(settings.properties);

		delete settings.properties;


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
			data['constructor'] = 'app.sprite.Room';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProperties: function(properties) {

			properties = properties instanceof Object ? properties : null;


			if (properties !== null) {

				this.properties = properties;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

