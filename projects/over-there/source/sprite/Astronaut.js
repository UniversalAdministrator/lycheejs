
lychee.define('app.sprite.Astronaut').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	let   _id       = 0;
	const _Entity   = lychee.import('lychee.app.Entity');
	const _Sprite   = lychee.import('lychee.app.Sprite');
	const _CONFIG   = attachments["json"].buffer;
	const _TEXTURES = [
		attachments["blue.png"],
		attachments["light.png"],
		attachments["green.png"],
		attachments["red.png"],
		attachments["orange.png"],
		attachments["pink.png"],
		attachments["purple.png"],
		attachments["yellow.png"]
	];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.properties = {};


		settings.width   = 32;
		settings.height  = 32;
		settings.map     = _CONFIG.map;
		settings.shape   = _Entity.SHAPE.rectangle;
		settings.states  = _CONFIG.states;
		settings.state   = settings.state || _CONFIG.state;
		settings.texture = _TEXTURES[_id++];


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
			data['constructor'] = 'app.sprite.Astronaut';


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

