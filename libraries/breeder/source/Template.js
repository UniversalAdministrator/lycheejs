
lychee.define('breeder.Template').requires([
	'lychee.Stash'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, global, attachments) {

	const _Flow   = lychee.import('lychee.event.Flow');
	const _Stash  = lychee.import('lychee.Stash');
	const _ASSET  = '/libraries/breeder/asset';
	const _CONFIG = attachments["json"];
	const _STASH  = new _Stash({
		type: _Stash.TYPE.persistent
	});
	const _TEMPLATE = {
		dist:      attachments["dist.tpl"],
		harvester: attachments["harvester.tpl"],
		index:     attachments["index.tpl"],
		main:      attachments["main.tpl"]
	};



	/*
	 * HELPERS
	 */

	const _inject = function(buffer, injections) {

		let chunk = '';
		let code  = buffer.split('\n');
		let c     = 0;
		let cl    = code.length;
		let found = { include: false, inject: false };
		let index = { include: -1,    inject: -1    };
		let tmp   = '';
		let tmp_s = '';
		let tmp_c = '';
		let tmp_i = '';
		let tpl_s = '';
		let tpl_c = '';
		let tpl_i = '';


		for (c = 0; c < cl; c++) {

			chunk = code[c].trim();

			if (chunk.substr(0, 7) === '<script') {

				tpl_s = '\t<script src="/libraries/';
				tpl_c = '\t<script src="${injection}"></script>';
				tpl_i = '\t\tlychee.inject(lychee.ENVIRONMENTS[\'${identifier}\']);';

				injections = injections.filter(function(injection) {
					return injection.split('/')[4] === 'html';
				});

				break;

			} else if (chunk.substr(0, 8) === 'require(') {

				tpl_s = 'require(\'/opt/lycheejs/libraries/';
				tpl_c = 'require(\'/opt/lycheejs/${injection}\');';
				tpl_i = '\tlychee.inject(lychee.ENVIRONMENTS[\'${identifier}\']);';

				injections = injections.filter(function(injection) {
					return injection.split('/')[4] === 'node';
				});

				break;

			}

		}


		for (let i = 0, il = injections.length; i < il; i++) {

			let injection  = injections[i];
			let identifier = injection.split('/').slice(0, 3).join('/') + '/' + injection.split('/')[5];


			tmp_c = tpl_c.replaceObject({
				injection: injection
			});

			tmp_i = tpl_i.replaceObject({
				identifier: identifier
			});

			tmp_s = tpl_s;


			for (c = 0; c < cl; c++) {

				chunk = code[c].trim();
				tmp   = tmp_s.trim();


				if (chunk.substr(0, tmp.length) === tmp) {
					index.include = c;
				}

				if (chunk === tmp_c.trim()) {
					found.include = true;
				}

			}

			if (found.include === false && index.include >= 0) {
				code.splice(index.include + 1, 0, tmp_c);
				cl++;
			}


			for (c = 0; c < cl; c++) {

				chunk = code[c].trim();


				if (chunk.substr(0, 14) === 'lychee.inject(') {
					index.inject = c;
				} else if (chunk.substr(0, 15) === 'lychee.envinit(' && index.inject === -1) {
					index.inject = c - 1;
				} else if (chunk.substr(0, 15) === 'lychee.pkginit(' && index.inject === -1) {
					index.inject = c - 1;
				}

				if (chunk === tmp_i.trim()) {
					found.inject = true;
				}

			}


			if (found.inject === false && index.inject >= 0) {
				code.splice(index.inject + 1, 0, tmp_i);
				cl++;
			}

		}


		return code.join('\n');

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.sandbox  = '';
		this.settings = {};
		this.stash    = new _Stash({
			type: _Stash.TYPE.persistent
		});


		this.__identifiers = [];
		this.__injections  = [];
		this.__main        = [];


		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		_Flow.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function(oncomplete) {

			let sandbox = this.sandbox;
			let stash   = this.stash;

			if (sandbox !== '' && stash !== null) {

				console.log('breeder: INIT');


				_STASH.bind('batch', function(type, assets) {

					let pkg  = assets.find(function(asset) {
						return asset.url === _ASSET + '/lychee.pkg';
					}) || null;
					let urls = assets.map(function(asset) {
						return sandbox + asset.url.substr(_ASSET.length);
					});


					if (pkg !== null) {

						let tmp = JSON.stringify(pkg.buffer, null, '\t');

						tmp = tmp.replaceObject({
							id: sandbox
						});

						pkg.buffer = JSON.parse(tmp);

					}


					stash.bind('batch', function(action, woop) {

						if (action === 'write') {
							oncomplete(true);
						}

					}, this, true);

					stash.batch('write', urls, assets);

				}, this, true);

				_STASH.batch('read', [

					_ASSET + '/harvester.js',
					_ASSET + '/icon.png',
					_ASSET + '/icon.svg',
					_ASSET + '/index.html',
					_ASSET + '/lychee.pkg',

					_ASSET + '/source/Main.js',
					_ASSET + '/source/net/Client.js',
					_ASSET + '/source/net/Server.js',
					_ASSET + '/source/net/client/Ping.js',
					_ASSET + '/source/net/remote/Ping.js',
					_ASSET + '/source/state/Welcome.js',
					_ASSET + '/source/state/Welcome.json'

				]);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('fork', function(oncomplete) {

			let library = this.settings.library;
			let project = this.settings.project;
			let sandbox = this.sandbox;
			let stash   = this.stash;
			let urls    = [];
			let assets  = [];
			let pkg     = new Config(library + '/lychee.pkg');
			let folder  = project.split('/')[1];


			console.log('breeder: FORK');


			pkg.onload = function() {

				if (this.buffer instanceof Object && this.buffer.build instanceof Object) {

					let environments = this.buffer.build.environments || {};

					if (folder === 'projects') {

						Object.keys(environments).forEach(function(identifier) {

							if (/main$/g.test(identifier) === false) {
								delete environments[identifier];
							} else {

								let tmp = environments[identifier];
								if (tmp.profile instanceof Object) {

									if (typeof tmp.profile.client === 'string') {
										tmp.profile.client = tmp.profile.client.replace(library, project);
									}

									if (typeof tmp.profile.server === 'string') {
										tmp.profile.server = tmp.profile.server.replace(library, project);
									}

								}

								tmp.variant  = 'application';
								tmp.packages = {
									'fork': './lychee.pkg',
									'app':  library + '/lychee.pkg'
								};

							}

						});

						_CONFIG.buffer.build.environments = environments;


						if (typeof environments['node/main'] !== 'undefined') {
							urls.push(project + '/harvester.js');
							assets.push(_TEMPLATE.harvester);
						}


						urls.push(sandbox + '/lychee.pkg');
						urls.push(sandbox + '/index.html');
						urls.push(sandbox + '/source/Main.js');

						assets.push(_CONFIG);
						assets.push(_TEMPLATE.index);
						assets.push(_TEMPLATE.main);

					} else if (folder === 'libraries') {

						Object.keys(environments).forEach(function(identifier) {

							if (/dist$/g.test(identifier) === false) {
								delete environments[identifier];
							} else {

								let tmp = environments[identifier];

								tmp.variant  = 'library';
								tmp.packages = {
									'fork': './lychee.pkg',
									'app':  library + '/lychee.pkg'
								};

							}

						});

						_CONFIG.buffer.build.environments = environments;


						urls.push(sandbox + '/lychee.pkg');
						urls.push(sandbox + '/source/DIST.js');
						urls.push(sandbox + '/source/Main.js');

						assets.push(_CONFIG);
						assets.push(_TEMPLATE.dist);
						assets.push(_TEMPLATE.main);

					}


					stash.bind('batch', function(action, map) {

						if (action === 'write') {
							oncomplete(true);
						}

					}, this, true);

					stash.batch('write', urls, assets);

				} else {

					oncomplete(false);

				}

			};

			pkg.load();

		}, this);

		this.bind('pull', function(oncomplete) {

			let library = this.settings.library;
			let stash   = this.stash;


			if (library !== null && stash !== null) {

				console.log('breeder: PULL ' + library);


				let sandbox = this.sandbox;


				_STASH.bind('batch', function(type, assets) {

					let main = assets.filter(function(asset) {
						return /index\.html|harvester\.js/g.test(asset.url);
					});
					let pkg  = assets.find(function(asset) {
						return /lychee\.pkg/g.test(asset.url);
					}) || null;


					if (main.length > 0 && pkg !== null) {

						let platforms = [];

						Object.values(pkg.buffer.build.environments).forEach(function(environment) {

							let tags = environment.tags || null;
							if (tags instanceof Object) {

								if (tags.platform instanceof Array) {

									tags.platform.forEach(function(val) {

										if (platforms.indexOf(val) === -1) {
											platforms.push(val);
										}

									});

								}

							}

						});


						if (platforms.length > 0) {

							let injections = platforms.sort().map(function(platform) {
								return library + '/build/' + platform + '/dist/index.js';
							});
							let tmp_stash  = new _Stash({
								type: _Stash.TYPE.temporary
							});


							tmp_stash.bind('batch', function(type, assets) {

								for (let a = 0, al = assets.length; a < al; a++) {

									let asset = assets[a];
									if (asset.buffer !== null && asset.buffer !== '') {
										stash.write('.' + asset.url, asset);
									}

								}

							});

							tmp_stash.batch('read', injections);

							this.__injections = injections;

						}


						this.__main = main;

						setTimeout(function() {

							this.trigger('pull-inject', [ function(result) {
								oncomplete(result);
							} ]);

						}.bind(this), 500);

					} else {

						oncomplete(false);

					}

				}, this, true);


				_STASH.batch('read', [
					sandbox + '/harvester.js',
					sandbox + '/index.html',
					sandbox + '/lychee.pkg'
				]);

			} else {

				oncomplete(false);

			}

		});


		this.bind('pull-inject', function(oncomplete) {

			let injections = this.__injections;
			let main       = this.__main;
			let stash      = this.stash;


			if (injections.length > 0 && main.length > 0 && stash !== null) {

				for (let m = 0, ml = main.length; m < ml; m++) {

					let tmp = main[m];
					if (tmp.buffer !== null) {

						console.log('breeder: PULL-INJECT ' + tmp.url);


						tmp.buffer = _inject(tmp.buffer, injections);

						stash.write(tmp.url, tmp);

					}

				}


				setTimeout(function() {
					oncomplete(true);
				}, 500);

			} else {

				oncomplete(true);

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'breeder.Template';


			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			if (this.sandbox !== '') settings.sandbox = this.sandbox;


			if (this.stash !== null) blob.stash = lychee.serialize(this.stash);


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

