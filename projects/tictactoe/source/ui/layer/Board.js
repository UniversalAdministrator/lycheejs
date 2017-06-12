
lychee.define('game.ui.layer.Board').requires([
	'game.ui.sprite.Tile'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	const _Layer   = lychee.import('lychee.ui.Layer');
	const _Tile    = lychee.import('game.ui.sprite.Tile');
	const _TEXTURE = attachments["png"];
	const _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.__statemap = _CONFIG.map['default'][0];


		settings.width  = _CONFIG.width;
		settings.height = _CONFIG.height;



		/*
		 * INITIALIZATION
		 */

		settings.entities = [];

		for (let e = 0; e < 9; e++) {

			let x = (e % 3) + 1;
			let y = Math.floor(e / 3) + 1;

			let posx = -96 + (x * 64 + 16 * x - 64);
			let posy = -96 + (y * 64 + 16 * y - 64);

			settings.entities.push(new _Tile({
				x:        x,
				y:        y,
				position: {
					x: posx,
					y: posy
				}
			}));

		}


		_Layer.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.layer.Board';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha = this.alpha;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			let texture = _TEXTURE || null;
			if (texture !== null) {

				let map = this.__statemap || null;
				if (map !== null) {

					let position = this.position;

					let x1 = position.x + offsetX - this.width  / 2;
					let y1 = position.y + offsetY - this.height / 2;


					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);

				}

			}


			_Layer.prototype.render.call(this, renderer, offsetX, offsetY);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		}

	};


	return Composite;

});

