
lychee.define('studio.Main').requires([
	'lychee.app.Flow',
	'studio.codec.FONT',
	'studio.data.Project',
	'studio.net.Client',
	'studio.net.Server',
	'studio.state.Asset',
	'studio.state.Project',
	'studio.state.Scene',
	'harvester.net.Client'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _studio  = lychee.import('studio');
	const _lychee  = lychee.import('lychee');
	const _Client  = lychee.import('harvester.net.Client');
	const _Main    = lychee.import('lychee.app.Main');
	const _Project = lychee.import('studio.data.Project');
	const _ARGS    = [];



	(function(process) {

		let node_argv = process.argv || [];
		let nwjs_argv = [];

		try {
			nwjs_argv = global.require('nw.gui').App.argv;
		} catch (err) {
			nwjs_argv = [];
		}

		if (nwjs_argv.length > 0) {

			for (let a = 0, al = nwjs_argv.length; a < al; a++) {
				_ARGS.push(nwjs_argv[a]);
			}

		} else if (node_argv.length > 1) {

			for (let a = 1, al = node_argv.length; a < al; a++) {
				_ARGS.push(node_argv[a]);
			}

		}

	})(typeof process === 'object' ? process : {});



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({

			input: {
				delay:       0,
				key:         true,
				keymodifier: true,
				touch:       true,
				scroll:      true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'studio',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		this.api     = null;
		this.project = null;


		_Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.appclient = this.settings.client;
			this.settings.client    = null;

			this.settings.appserver = this.settings.server;
			this.settings.server    = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			let appclient = this.settings.appclient || null;
			if (appclient !== null) {
				this.client = new _studio.net.Client(appclient, this);
				this.api    = new _Client({}, this);
			}

			let appserver = this.settings.appserver || null;
			if (appserver !== null) {
				this.server = new _studio.net.Server(appserver, this);
			}


			this.setState('project', new _studio.state.Project(this));
			this.setState('asset',   new _studio.state.Asset(this));
			this.setState('scene',   new _studio.state.Scene(this));


			this.changeState('project', 'Project');


			let api     = this.api;
			let project = _ARGS.find(function(val) {
				return /^\/(libraries|projects)\/([A-Za-z0-9-_/]+)$/g.test(val);
			}) || null;

			if (api !== null && project !== null) {

				let service = this.api.getService('project');
				if (service !== null) {

					service.bind('sync', function() {

						let entity = this.state.query('ui > project > select > search');
						let result = entity.setValue(project);
						if (result === true) {
							entity.trigger('change', [ entity.value ]);
						}

					}, this, true);

				}

			}

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'studio.Main';


			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			if (this.settings.appclient !== null) settings.client = this.defaults.client;
			if (this.settings.appserver !== null) settings.server = this.defaults.server;


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProject: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		}

	};


	return Composite;

});
