
lychee.define('game.Main').requires([
	'lychee.Viewport',
	'game.Camera',
	'game.Compositor',
	'game.Renderer',
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _game      = lychee.import('game');
	const _Main      = lychee.import('lychee.app.Main');
	const _Viewport  = lychee.import('lychee.Viewport');
	const _INSTANCES = [];



	/*
	 * FEATURE DETECTION
	 */

	(function(viewport) {

		viewport.bind('reshape', function(orientation, rotation, width, height) {

			if (_INSTANCES.length > 1) {

				let vp_width  = width / _INSTANCES.length;
				let vp_height = height;


				for (let i = 0, il = _INSTANCES.length; i < il; i++) {

					let main = _INSTANCES[i];
					if (main.viewport !== null) {

						main.renderer.setWidth(vp_width);
						main.renderer.setHeight(vp_height);

					}

				}

			}

		}, this);

	})(new _Viewport());



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({

			client: null,
			server: null,

			input:  {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       false,
				swipe:       false
			},

			jukebox: {
				music: false,
				sound: false
			},

			renderer: {
				id:         'mode7-' + _INSTANCES.length,
				background: '#436026',
				width:      null,
				height:     null
			},

			viewport: {
				fullscreen: true
			}

		}, data);


		_Main.call(this, settings);

		_INSTANCES.push(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.gamerenderer = this.settings.renderer;
			this.settings.renderer     = null;

			oncomplete(true);

		}, this);

		this.bind('init', function() {

			let gamerenderer = this.settings.gamerenderer || null;
			if (gamerenderer !== null) {
				this.renderer = new _game.Renderer(gamerenderer);
			}

			this.camera     = new _game.Camera(this);
			this.compositor = new _game.Compositor(this);
			this.viewport.unbind('reshape');

			this.renderer.setCamera(this.camera);
			this.renderer.setCompositor(this.compositor);

			this.setState('game', new _game.state.Game(this));


			this.viewport.bind('reshape', function() {

				this.camera.reshape();
				this.compositor.reshape();

			}, this);


			this.changeState('game', {
				track: this.settings.track || null
			});

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'game.Main';


			return data;

		}

	};


	return Composite;

});
