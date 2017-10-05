
lychee.define('game.Main').requires([
//	'game.state.Campaign',
//	'game.state.Editor',
	'game.state.Menu'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _game = lychee.import('game');
	const _Main = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				scroll:      false,
				swipe:       true,
				touch:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:         'immune',
				width:      null,
				height:     null,
				background: '#444444'
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		_Main.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			// this.setState('campaign', new _game.state.Campaign(this));
			// this.setState('editor',   new _game.state.Editor(this));
			this.setState('menu',     new _game.state.Menu(this));


			this.changeState('menu');

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


			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});

