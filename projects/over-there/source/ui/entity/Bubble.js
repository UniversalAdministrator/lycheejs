
lychee.define('app.ui.entity.Bubble').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity  = lychee.import('lychee.ui.Entity');
	const _CONFIG  = attachments["json"].buffer;
	const _FONT    = attachments["fnt"];
	const _TEXTURE = attachments["png"];
	const _AVATAR  = {
		config:  attachments["avatar.json"].buffer,
		texture: attachments["avatar.png"]
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.key   = 'urine';
		this.value = '0%';


		this.setKey(settings.key);
		this.setValue(settings.value);


		delete settings.key;
		delete settings.value;


		settings.alpha  = 1.0;
		settings.radius = 48;
		settings.shape  = _Entity.SHAPE.circle;


		_Entity.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Bubble';


			let settings = data['arguments'][0] || {};


			if (this.key !== 'urine') settings.key   = this.key;
			if (this.value !== '0%')  settings.value = this.value;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let map      = null;
			let radius   = this.radius;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius - 1,
				'#00000',
				true
			);

			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius,
				'#0ba2ff',
				false,
				1
			);


			if (this.key === 'avatar') {

				map = _AVATAR.config.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 24,
						position.y + offsetY - 24,
						_AVATAR.texture,
						map[0]
					);

				}

			} else {

				map = _CONFIG.map[this.key] || _CONFIG.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 16,
						position.y + offsetY - 30,
						_TEXTURE,
						map[0]
					);

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 12,
						this.value,
						_FONT,
						true
					);

				} else {

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 2,
						this.value,
						_FONT,
						true
					);

				}

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setKey: function(key) {

			key = typeof key === 'string' ? key : null;


			if (key !== null) {

				this.key = key;


				return true;

			}

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

