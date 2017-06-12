
lychee.define('strainer.Template').requires([
	'lychee.Stash',
	'strainer.plugin.API',
	'strainer.plugin.ESLINT'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, global, attachments) {

	const _plugin = {
		API:    lychee.import('strainer.plugin.API'),
		ESLINT: lychee.import('strainer.plugin.ESLINT')
	};
	const _Flow   = lychee.import('lychee.event.Flow');
	const _Stash  = lychee.import('lychee.Stash');
	const _STASH  = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	const _walk_directory = function(files, node, path, attachments) {

		if (node instanceof Array) {

			if (node.indexOf('js') !== -1) {
				files.push(path + '.js');
			}

			if (attachments === true) {

				node.filter(function(ext) {
					return ext !== 'js';
				}).forEach(function(ext) {
					files.push(path + '.' + ext);
				});

			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child, attachments);
			});

		}

	};

	const _package_files = function(json) {

		let files = [];


		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', false);
			}


			files = files.map(function(value) {
				return value.substr(1);
			}).filter(function(value) {
				return value.substr(0, 4) !== 'core' && value.substr(-12) !== 'bootstrap.js';
			}).filter(function(value) {
				return value.indexOf('__') === -1;
			}).sort();

		}


		return files;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.checks   = [];
		this.codes    = [];
		this.configs  = [];
		this.sandbox  = '';
		this.settings = {};
		this.stash    = new _Stash({
			type: _Stash.TYPE.persistent
		});


		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		_Flow.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read', function(oncomplete) {

			let project = this.settings.project;
			let sandbox = this.sandbox;
			let stash   = this.stash;

			if (sandbox !== '' && stash !== null) {

				console.log('strainer: READ ' + project);


				let that = this;
				let pkg  = new Config(sandbox + '/lychee.pkg');


				pkg.onload = function(result) {

					if (result === true) {

						let files = _package_files(this.buffer);
						if (files.length > 0) {

							stash.bind('batch', function(type, assets) {

								this.codes = assets.filter(function(asset) {
									return asset !== null;
								});

								oncomplete(true);

							}, that, true);

							stash.batch('read', files.map(function(value) {
								return sandbox + '/source/' + value;
							}));

						} else {

							oncomplete(false);

						}

					} else {

						oncomplete(false);

					}

				};

				pkg.load();

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('check-eslint', function(oncomplete) {

			let eslint  = _plugin.ESLINT || null;
			let project = this.settings.project;

			if (eslint !== null) {

				console.log('strainer: CHECK-ESLINT ' + project);


				this.checks = this.codes.map(function(asset) {

					let report = _plugin.ESLINT.check(asset);
					if (report.length > 0) {

						let result = _plugin.ESLINT.fix(asset, report);
						if (result.length > 0) {
							return result;
						} else {
							return [];
						}

					}


					return null;

				});


				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('write-eslint', function(oncomplete) {

			let project = this.settings.project;
			let stash   = this.stash;


			if (project !== null && stash !== null) {

				console.log('strainer: WRITE-ESLINT ' + project);


				// let sandbox = this.sandbox;
				let checks  = this.checks;
				let codes   = this.codes.filter(function(code, c) {
					return checks[c] !== null && checks[c].length === 0;
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

		this.bind('stage-eslint', function(oncomplete) {
			// TODO: git add (stage) codes
			oncomplete(true);
		}, this);

		this.bind('check-api', function(oncomplete) {

			let api     = _plugin.API || null;
			let project = this.settings.project;

			if (api !== null) {

				console.log('strainer: CHECK-API ' + project);


				this.configs = this.codes.map(function(asset) {

					let url    = asset.url.replace(/source/, 'api').replace(/\.js$/, '.json');
					let report = _plugin.API.check(asset);

					if (report !== null) {

						if (report.errors.length > 0) {
							_plugin.API.fix(asset, report);
						}

						let config = new lychee.Asset(url, 'json', true);

						config.buffer = report;

						return config;

					}


					return null;

				});


				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('write-api', function(oncomplete) {

			let project = this.settings.project;
			let stash   = this.stash;


			if (project !== null && stash !== null) {

				console.log('strainer: WRITE-API ' + project);


				// let sandbox = this.sandbox;
				let configs = this.configs.filter(function(config, c) {
					return config !== null;
				});


				if (configs.length > 0) {

					stash.bind('batch', function(type, assets) {

						if (assets.length === configs.length) {
							oncomplete(true);
						} else {
							oncomplete(false);
						}

					}, this, true);

					stash.batch('write', configs.map(function(config) {
						return config.url;
					}), configs);

				} else {

					oncomplete(true);

				}

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('write-pkg', function(oncomplete) {

			let project = this.settings.project;
			let stash   = this.stash;


			if (project !== null && stash !== null) {

				console.log('strainer: WRITE-PKG ' + project);


				let configs = this.configs.filter(function(config) {
					return config !== null;
				});


				if (configs.length > 0) {

					let index = stash.read(project + '/api/strainer.pkg');

					index.onload = function(result) {

						if (result === false) {
							this.buffer = {};
						}


						let buffer = this.buffer;
						if (buffer !== null) {

							configs.forEach(function(config) {
								buffer[config.url] = Date.now();
							});

						}

						stash.write(index.url, index);
						stash.sync();

						oncomplete(true);

					};

					index.load();

				} else {

					oncomplete(true);

				}

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('stage-api', function(oncomplete) {
			// TODO: git add (stage) configs
			oncomplete(true);
		}, this);

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
			data['constructor'] = 'strainer.Template';


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

