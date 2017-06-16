
lychee.define('game.Compositor').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		this.renderer = main.renderer || null;

		this.__width  = 0;
		this.__height = 0;
		this.__points = [];


		for (let i = 0; i < 10; i++) {

			this.__points.push({
				x: 0, y: 0, z: 0, w: 0
			});

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'game.Compositor',
				'arguments':   [ '#MAIN' ]
			};

		},



		/*
		 * CUSTOM API
		 */

		reshape: function() {

			let renderer = this.renderer;
			if (renderer !== null) {

				this.__width  = renderer.width;
				this.__height = renderer.height;

				return true;

			}


			return false;

		},

		getPoint: function(index) {

			index = typeof index === 'number' ? index : null;


			if (index !== null) {
				return this.__points[index] || null;
			}


			return null;

		},

		project: function(target, point, x, y, z, depth) {

			let cameraX = (point.x || 0) - x;
			let cameraY = (point.y || 0) - y;
			let cameraZ = (point.z || 0) - z;

			let hwidth  = this.__width  / 2;
			let hheight = this.__height / 2;
			let scale = depth / cameraZ;


			// x, y, depth, road width
			target.x = Math.round(hwidth + scale * cameraX *  hwidth);
			target.y = Math.round(hheight - scale * cameraY * hheight);
			target.z = cameraZ;
			//                           road width (!)
			//                            \/\/\/\/\/\/
			target.w = Math.round(scale * 1.5 * hwidth * hwidth);


			return true;

		}

	};


	return Composite;

});

