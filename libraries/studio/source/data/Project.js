
lychee.define('studio.data.Project').exports(function(lychee, global, attachments) {

	const _DEFAULT_SETTINGS = {
		"build": "app.Main",
		"debug": false,
		"packages": [
			[
				"app",
				"./lychee.pkg"
			]
		],
		"sandbox": false,
		"tags": {
			"platform": []
		},
		"variant": "application",
		"profile": {}
	};



	/*
	 * HELPERS
	 */

	const _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			node.forEach(function(ext) {
				files.push(path + '.' + ext);
			});

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};

	const _package_files = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '');
			}

		}


		return files.map(function(value) {
			return value.substr(1);
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}).filter(function(value) {
			return value.indexOf('__') === -1;
		});

	};

	const _set_platform = function(platform, value) {

		let id           = /^\/libraries\//g.test(this.identifier) ? 'dist' : 'main';
		let environments = this.config.buffer.build.environments;


		if (value === true) {

			if (environments[platform + '/' + id] === undefined) {

				let settings  = lychee.assignunlink({}, _DEFAULT_SETTINGS);
				let build     = this.__build;
				let packages  = this.__packages;
				let platforms = [];

				let found = this.__packages.find(function(other) {
					return other[0] === build.split('.')[0];
				}) || null;

				if (found === null) {
					packages.push([ build.split('.')[0], './lychee.pkg' ]);
				}


				if (/-/.test(platform) === true) {

					platforms.push(platform);
					platforms.push(platform.split('-')[0]);

				} else {

					platforms.push(platform);

				}


				if (id === 'main') {

					settings.build         = build;
					settings.packages      = packages;
					settings.tags.platform = platforms;
					settings.variant       = 'application';
					settings.profile       = {
						client: platform !== 'node' ? '/api/server/connect?identifier=' + this.identifier : null
					};

				} else {

					settings.build         = build;
					settings.packages      = packages;
					settings.tags.platform = platforms;
					settings.variant       = 'library';
					settings.profile       = null;

				}


				environments[platform + '/' + id] = settings;
				this.platforms[platform] = true;

			}

		} else {

			if (environments[platform + '/' + id] instanceof Object) {

				delete environments[platform + '/' + id];
				this.platforms[platform] = false;

			}

		}

	};

	const _parse_package = function() {

		let environments = this.config.buffer.build.environments;
		let platforms    = Object.keys(this.platforms);
		let id           = /^\/libraries\//g.test(this.identifier) ? 'dist' : 'main';


		for (let p = 0, pl = platforms.length; p < pl; p++) {

			let platform = platforms[p];
			let settings = environments[platform + '/' + id];

			if (settings instanceof Object) {

				if (settings.packages instanceof Array) {

					settings.packages.forEach(function(pkg) {

						let pkg_id  = pkg[0];
						let pkg_url = pkg[1];

						let found = this.__packages.find(function(other) {
							return other[0] === pkg_id;
						}) || null;

						if (found === null) {
							this.__packages.push([ pkg_id, pkg_url ]);
						}

					}.bind(this));

				}


				this.platforms[platform] = true;
				this.__build             = settings.build || null;

			} else {

				this.platforms[platform] = false;

			}

		}

		if (this.__build === null) {
			this.__build = id === 'dist' ? 'app.DIST' : 'app.Main';
		}

		if (this.__packages.length === 0) {
			this.__packages.push([ 'app', './lychee.pkg' ]);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);

		this.identifier  = typeof settings.identifier === 'string' ? settings.identifier : '/projects/boilerplate';
		this.config      = new Config(this.identifier + '/lychee.pkg');
		this.icon        = new Texture(this.identifier + '/icon.png');
		this.harvester   = true;
		this.platforms   = {
			'html':         true,
			'html-nwjs':    true,
			'html-webview': true,
			'node':         true,
			'node-sdl':     true
		};

		this.__harvester = new Stuff(this.identifier + '/harvester.js', true);
		this.__build     = null;
		this.__packages  = [];


		settings = null;

	};

	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.config !== undefined) {
				this.config = lychee.deserialize(blob.config);
			}

			if (blob.icon !== undefined) {
				this.icon = lychee.deserialize(blob.icon);
			}

			if (blob.harvester !== undefined) {
				this.__harvester = lychee.deserialize(blob.harvester);
			}

			if (blob.settings instanceof Object) {

				if (blob.settings.harvester !== undefined) {
					this.harvester = blob.settings.harvester;
				}

				if (blob.settings.platforms instanceof Object) {

					for (let p in blob.settings.platforms) {
						this.platforms[p] = blob.settings.platforms[p];
					}

				}

			}

		},

		serialize: function() {

			let blob = {};

			if (this.harvester !== true) {

				if (blob.settings === undefined) {
					blob.settings = {};
				}

				blob.settings.harvester = this.harvester;

			}

			let platforms = Object.values(this.platforms);
			if (platforms.includes(false) === true) {
				blob.settings.platforms = lychee.serialize(this.platforms);
			}


			if (this.config.buffer !== null)      blob.config    = lychee.serialize(this.config);
			if (this.icon.buffer !== null)        blob.icon      = lychee.serialize(this.icon);
			if (this.__harvester.buffer !== null) blob.harvester = lychee.serialize(this.__harvester);


			return {
				'constructor': 'studio.data.Project',
				'arguments':   [ this.identifier ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		load: function() {

			let callback = this.onload instanceof Function ? this.onload : null;
			let that     = this;

			this.config.onload = function() {

				if (this.buffer instanceof Object) {
					_parse_package.call(that);
				}

			};

			this.__harvester.onload = function(result) {

				let line = (this.buffer || '').split('\n')[0];
				if (line.substr(0, 2) === '#!') {
					that.setHarvester(true);
				} else {
					that.setHarvester(false);
				}

			};


			this.__harvester.load();
			this.config.load();
			this.icon.load();


			if (callback !== null) {

				setTimeout(function() {
					callback(that);
				}, 500);

			}


			return true;

		},

		getAssets: function() {

			return _package_files(this.config.buffer).filter(function(val) {
				return val.substr(-3) !== '.js';
			});

		},

		getEntities: function() {

			return _package_files(this.config.buffer).filter(function(val) {
				return val.substr(-3) === '.js';
			});

		},

		setHarvester: function(harvester) {

			harvester = typeof harvester === 'boolean' ? harvester : null;


			if (harvester !== null) {

				this.harvester = harvester;

				return true;

			}


			return false;

		},

		setIcon: function(icon) {

			icon = icon instanceof Texture ? icon : null;


			if (icon !== null) {

				this.icon     = icon;
				this.icon.url = this.identifier + '/icon.png';

				return true;

			}


			return false;

		},

		setIdentifier: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				this.identifier = identifier;
				this.config.url = identifier + '/lychee.pkg';
				this.icon.url   = identifier + '/icon.png';

				return true;

			}


			return false;

		},

		setPlatforms: function(platforms) {

			platforms = platforms instanceof Object ? platforms : null;


			if (platforms !== null) {

				for (let key in platforms) {

					if (this.platforms[key] !== platforms[key]) {
						_set_platform.call(this, key, platforms[key]);
					}

				}

				return true;

			}


			return false;

		}

	};


	return Composite;

});

