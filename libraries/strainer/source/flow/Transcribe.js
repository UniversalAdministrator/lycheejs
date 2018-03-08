
lychee.define('strainer.flow.Transcribe').requires([
	'lychee.Stash',
	'strainer.api.PARSER',
	'strainer.plugin.API'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, global, attachments) {

	const _plugin = {
		API: lychee.import('strainer.plugin.API')
	};
	const _Flow   = lychee.import('lychee.event.Flow');
	const _Stash  = lychee.import('lychee.Stash');
	const _PARSER = lychee.import('strainer.api.PARSER');
	const _STASH  = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	const _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			if (node.indexOf('json') !== -1) {
				files.push(path + '.json');
			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};

	const _package_files = function(json) {

		let files = [];


		if (json !== null) {

			let root = json.api.files || null;
			if (root !== null) {
				_walk_directory(files, root, '');
			}


			files = files.map(function(value) {
				return value.substr(1);
			}).filter(function(value) {
				return value.startsWith('core') === false;
			}).filter(function(value) {
				return value.startsWith('platform') === false;
			}).filter(function(value) {
				return value.indexOf('__') === -1;
			}).sort();

		}


		return files;

	};



	/*
	 * IMPLEMENTATIONS
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.codes    = [];
		this.configs  = [];
		this.errors   = [];
		this.sandbox  = '';
		this.settings = {};
		this.stash    = new _Stash({
			type: _Stash.TYPE.persistent
		});


		this.__pkg = null;


		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		_Flow.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read', function(oncomplete) {

			let that    = this;
			let library = this.settings.library;
			let stash   = this.stash;

			if (library !== null && stash !== null) {

				console.log('strainer: READ ' + library);


				this.__pkg        = new Config(library + '/lychee.pkg');
				this.__pkg.onload = function(result) {

					if (result === true) {

						let files = _package_files(this.buffer);
						if (files.length > 0) {

							stash.bind('batch', function(type, assets) {

								this.configs = assets.filter(function(asset) {
									return asset !== null;
								});

								oncomplete(true);

							}, that, true);

							stash.batch('read', files.map(function(value) {
								return library + '/api/' + value;
							}));

						} else {

							oncomplete(false);

						}

					} else {

						oncomplete(false);

					}

				};

				this.__pkg.load();

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('transcribe-api', function(oncomplete) {

			let api     = _plugin.API;
			let configs = this.configs;

			if (configs.length > 0) {

				this.codes = this.configs.map(function(asset) {
					return api.transcribe(asset);
				});


				oncomplete(true);

			} else {

				oncomplete(false);

			}


		}, this);

		this.bind('write-codes', function(oncomplete) {

			let project = this.settings.project;
			let stash   = this.stash;

			if (project !== null && stash !== null) {

				console.log('strainer: WRITE-CODES ' + project);


				let codes = this.codes.filter(function(code) {
					return code !== null;
				});

				if (codes.length > 0) {

					stash.bind('batch', function(type, assets) {

						if (assets.length === codes.length) {
							oncomplete(true);
						} else {
							oncomplete(false);
						}

					}, this, true);

					stash.batch('write', codes.map(function(code) {
						return code.url;
					}), codes);

				} else {

					oncomplete(true);

				}

			} else {

				oncomplete(false);

			}

		}, this);



		/*
		 * FLOW
		 */

		this.then('read');

		this.then('transcribe-api');

		this.then('write-codes');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.codes instanceof Array) {

				let codes = [];

				for (let bc1 = 0, bc1l = blob.codes.length; bc1 < bc1l; bc1++) {
					codes.push(lychee.deserialize(blob.codes[bc1]));
				}

				if (codes.length > 0) {

					this.codes = codes.filter(function(asset) {
						return asset !== null;
					});

				}

			}


			if (blob.configs instanceof Array) {

				let configs = [];

				for (let bc2 = 0, bc2l = blob.configs.length; bc2 < bc2l; bc2++) {
					configs.push(lychee.deserialize(blob.codes[bc2]));
				}

				if (configs.length > 0) {

					this.configs = configs.filter(function(asset) {
						return asset !== null;
					});

				}

			}


			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'strainer.flow.Transcribe';


			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			if (this.sandbox !== '')                   settings.sandbox  = this.sandbox;
			if (Object.keys(this.settings).length > 0) settings.settings = this.settings;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.codes.length > 0)   blob.codes   = this.codes.map(lychee.serialize);
			if (this.configs.length > 0) blob.configs = this.configs.map(lychee.serialize);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'string' ? sandbox : null;


			if (sandbox !== null) {

				this.sandbox = sandbox;


				return true;

			}


			return false;

		},

		setSettings: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				this.settings = settings;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

