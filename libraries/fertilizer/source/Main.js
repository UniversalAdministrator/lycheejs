
lychee.define('fertilizer.Main').requires([
	'fertilizer.Template',
	'lychee.codec.JSON',
	'fertilizer.data.Shell',
	'fertilizer.template.html.Application',
	'fertilizer.template.html.Library',
	'fertilizer.template.html-nwjs.Application',
	'fertilizer.template.html-nwjs.Library',
	'fertilizer.template.html-webview.Application',
	'fertilizer.template.html-webview.Library',
	'fertilizer.template.node.Application',
	'fertilizer.template.node.Library'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _lychee   = lychee.import('lychee');
	const _template = lychee.import('fertilizer.template');
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Template = lychee.import('fertilizer.Template');
	const _JSON     = lychee.import('lychee.codec.JSON');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(settings) {

		this.settings = _lychee.assignunlink({
			project:    null,
			identifier: null,
			settings:   null
		}, settings);

		this.defaults = _lychee.assignunlink({
			project:    null,
			identifier: null,
			settings:   null
		}, this.settings);


		_Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let identifier = this.settings.identifier || null;
			let project    = this.settings.project    || null;
			let data       = this.settings.settings   || null;

			if (identifier !== null && project !== null && data !== null) {

				let platform = data.tags.platform[0] || null;
				let variant  = data.variant || null;
				let settings = _JSON.decode(_JSON.encode(Object.assign({}, data, {
					debug:   false,
					sandbox: true,
					timeout: 5000,
					type:    'export'
				})));


				let profile = {};
				if (settings.profile instanceof Object) {
					profile = settings.profile;
				}


				if (platform !== null && /application|library/g.test(variant)) {

					if (settings.packages instanceof Object) {

						for (let pid in settings.packages) {

							let url = settings.packages[pid];
							if (typeof url === 'string' && url.startsWith('./')) {
								settings.packages[pid] = project + '/' + url.substr(2);
							}

						}

					}


					let that           = this;
					let environment    = new _lychee.Environment(settings);
					let fertilizer_pkg = environment.packages['fertilizer'] || null;
					if (fertilizer_pkg !== null) {

						for (let id in _lychee.environment.definitions) {
							environment.define(_lychee.environment.definitions[id]);
						}

					}


					_lychee.debug = false;
					_lychee.setEnvironment(environment);


					environment.init(function(sandbox) {

						if (sandbox !== null) {

							// XXX: Don't use Environment's imperative API here!
							// XXX: /libraries/lychee/main instead of /libraries/lychee/html/main

							environment.id       = project + '/' + identifier.split('/').pop();
							environment.type     = 'build';
							environment.debug    = that.defaults.settings.debug;
							environment.sandbox  = that.defaults.settings.sandbox;
							environment.packages = {};


							_lychee.setEnvironment(null);


							that.trigger('init', [ project, identifier, platform, variant, environment, profile ]);

						} else {

							console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "load" event');

							if (typeof environment.global.console.serialize === 'function') {

								let debug = environment.global.console.serialize();
								if (debug.blob !== null) {

									(debug.blob.stderr || '').trim().split('\n').map(function(line) {
										return (line.indexOf(':') !== -1 ? line.split(':')[1].trim() : line.trim());
									}).forEach(function(line) {
										console.error('fertilizer: ' + line);
									});

								}

							}


							that.destroy(1);

						}

					});


					return true;

				}

			} else if (project !== null) {

				this.trigger('init', [ project, identifier, null, null ]);

				return true;

			} else {

				console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "load" event');
				console.error('fertilizer: Invalid settings via CLI');

				this.destroy(1);


				return false;

			}

		}, this, true);

		this.bind('init', function(project, identifier, platform, variant, environment, profile) {

			let construct = null;
			if (platform !== null && variant !== null && typeof _template[platform] === 'object') {
				construct = _template[platform][variant.charAt(0).toUpperCase() + variant.substr(1).toLowerCase()] || null;
			} else {
				construct = _Template;
			}


			if (construct !== null) {

				lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
				lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;


				let template = new construct({});
				if (template instanceof _Template) {

					// XXX: Third-party project

					template.setSandbox(project + '/build');

					template.then('configure-project');
					template.then('build-project');
					template.then('package-project');

				} else {

					// XXX: lychee.js project

					template.setEnvironment(environment);
					template.setProfile(profile);
					template.setSandbox(project + '/build/' + identifier);

					template.then('configure');
					template.then('configure-project');
					template.then('build');
					template.then('build-project');
					template.then('package');
					template.then('package-project');

				}


				template.bind('configure-project', function(oncomplete) {

					this.shell.exec(project + '/bin/configure.sh ' + identifier, function(result) {

						if (result === true) {
							console.info('fertilizer: CONFIGURE-PROJECT SUCCESS');
						} else {
							console.warn('fertilizer: CONFIGURE-PROJECT FAILURE');
						}

						oncomplete(true);

					});

				}, template);

				template.bind('build-project', function(oncomplete) {

					this.shell.exec(project + '/bin/build.sh ' + identifier, function(result) {

						if (result === true) {
							console.info('fertilizer: BUILD-PROJECT SUCCESS');
						} else {
							console.warn('fertilizer: BUILD-PROJECT FAILURE');
						}

						oncomplete(true);

					});

				}, template);

				template.bind('package-project', function(oncomplete) {

					this.shell.exec(project + '/bin/package.sh ' + identifier, function(result) {

						if (result === true) {

							console.info('fertilizer: PACKAGE-PROJECT SUCCESS');
							oncomplete(true);

						} else {

							console.warn('fertilizer: PACKAGE-PROJECT FAILURE');
							oncomplete(true);

						}

					});

				}, template);


				template.bind('complete', function() {

					console.info('fertilizer: SUCCESS ("' + project + ' | ' + identifier + '")');
					this.destroy(0);

				}, this);

				template.bind('error', function(event) {

					console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "' + event + '" event');
					this.destroy(1);

				}, this);


				template.init();


				return true;

			}


			console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "init" event');
			this.destroy(1);


			return false;

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.Main';


			let settings = _lychee.assignunlink({}, this.settings);
			let blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');

			return true;

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

			return true;

		}

	};


	return Composite;

});

