
lychee.Environment = typeof lychee.Environment !== 'undefined' ? lychee.Environment : (function(global) {

	let   _id     = 0;
	const lychee  = global.lychee;
	const console = global.console;



	/*
	 * EVENTS
	 */

	const _export_loop = function(cache) {

		let that  = this;
		let load  = cache.load;
		let ready = cache.ready;
		let track = cache.track;

		let identifier, definition;


		for (let l = 0, ll = load.length; l < ll; l++) {

			identifier = load[l];
			definition = this.definitions[identifier] || null;


			if (definition !== null) {

				if (ready.indexOf(identifier) === -1) {
					ready.push(identifier);
				}

				load.splice(l, 1);
				track.splice(l, 1);
				ll--;
				l--;

			}

		}


		for (let r = 0, rl = ready.length; r < rl; r++) {

			identifier = ready[r];
			definition = this.definitions[identifier] || null;

			if (definition !== null) {

				let dependencies = _resolve_dependencies.call(this, definition);
				if (dependencies.length > 0) {

					for (let d = 0, dl = dependencies.length; d < dl; d++) {

						let dependency = dependencies[d];
						if (load.indexOf(dependency) === -1 && ready.indexOf(dependency) === -1) {

							that.load(dependency);
							load.push(dependency);
							track.push(identifier);

						}

					}

				} else {

					definition.export(this.global);

					ready.splice(r, 1);
					rl--;
					r--;

				}

			}

		}


		if (load.length === 0 && ready.length === 0) {

			cache.active = false;

		} else {

			if (Date.now() > cache.timeout) {
				cache.active = false;
			}

		}

	};



	/*
	 * HELPERS
	 */

	const _inject_features = function(source, features) {

		let target = this;

		Object.keys(features).forEach(function(key) {

			let type = features[key];
			if (/boolean|number|string|function/g.test(type)) {

				target[key] = source[key];

			} else if (typeof type === 'object') {

				if (typeof source[key] === 'object') {

					target[key] = source[key];
					_inject_features.call(target[key], source[key], type);

				}

			}

		});

	};

	const _validate_definition = function(definition) {

		if (definition instanceof lychee.Definition) {

			let check = definition.check(this.tags);
			let type  = this.type;


			if (check.features !== null) {

				if (type === 'source' || type === 'export') {
					this.__features = lychee.assignunlink(this.__features, check.features);
				}

				let sandbox = this.sandbox;
				if (sandbox === true) {
					_inject_features.call(this.global, global, check.features);
				}

			}


			if (type === 'build') {

				return check.tagged;

			} else if (type === 'export') {

				return check.tagged;

			} else if (type === 'source') {

				return check.supported && check.tagged;

			}

		}


		return false;

	};

	const _resolve = function(identifier) {

		let pointer = this;
		let path    = identifier.split('.');

		for (let p = 0, pl = path.length; p < pl; p++) {

			let name = path[p];

			if (pointer[name] !== undefined) {

				pointer = pointer[name];

			} else if (pointer[name] === undefined) {

				pointer = null;
				break;

			}

		}


		return pointer;

	};

	const _resolve_dependencies = function(definition) {

		let dependencies = [];

		if (definition instanceof lychee.Definition) {

			for (let i = 0, il = definition._includes.length; i < il; i++) {

				let inc   = definition._includes[i];
				let check = _resolve.call(this.global, inc);
				if (check === null) {
					dependencies.push(inc);
				}

			}

			for (let r = 0, rl = definition._requires.length; r < rl; r++) {

				let req   = definition._requires[r];
				let check = _resolve.call(this.global, req);
				if (check === null) {
					dependencies.push(req);
				}

			}

		}

		return dependencies;

	};



	/*
	 * STRUCTS
	 */

	const _Sandbox = function(settings) {

		let that     = this;
		let _std_err = '';
		let _std_out = '';


		this.console = {};
		this.console.log = function() {

			let str = '\n';

			for (let a = 0, al = arguments.length; a < al; a++) {

				let arg = arguments[a];
				if (arg instanceof Object) {
					str += JSON.stringify(arg, null, '\t');
				} else if (typeof arg.toString === 'function') {
					str += arg.toString();
				} else {
					str += arg;
				}

				if (a < al - 1) {
					str += '\t';
				}

			}


			if (str.substr(0, 5) === '\n(E)\t') {
				_std_err += str;
			} else {
				_std_out += str;
			}

		};

		this.console.info = function() {

			let args = [ '(I)\t' ];

			for (let a = 0, al = arguments.length; a < al; a++) {
				args.push(arguments[a]);
			}

			this.log.apply(this, args);

		};

		this.console.warn = function() {

			let args = [ '(W)\t' ];

			for (let a = 0, al = arguments.length; a < al; a++) {
				args.push(arguments[a]);
			}

			this.log.apply(this, args);

		};

		this.console.error = function() {

			let args = [ '(E)\t' ];

			for (let a = 0, al = arguments.length; a < al; a++) {
				args.push(arguments[a]);
			}

			this.log.apply(this, args);

		};

		this.console.deserialize = function(blob) {

			if (typeof blob.stdout === 'string') {
				_std_out = blob.stdout;
			}

			if (typeof blob.stderr === 'string') {
				_std_err = blob.stderr;
			}

		};

		this.console.serialize = function() {

			let blob = {};


			if (_std_out.length > 0) blob.stdout = _std_out;
			if (_std_err.length > 0) blob.stderr = _std_err;


			return {
				'reference': 'console',
				'blob':      Object.keys(blob).length > 0 ? blob : null
			};

		};


		this.Buffer  = global.Buffer;
		this.Config  = global.Config;
		this.Font    = global.Font;
		this.Music   = global.Music;
		this.Sound   = global.Sound;
		this.Texture = global.Texture;


		this.lychee              = {};
		this.lychee.debug        = global.lychee.debug;
		this.lychee.environment  = null;
		this.lychee.simulation   = null;
		this.lychee.ENVIRONMENTS = global.lychee.ENVIRONMENTS;
		this.lychee.FEATURES     = global.lychee.FEATURES;
		this.lychee.FILENAME     = global.lychee.FILENAME;
		this.lychee.PLATFORMS    = global.lychee.PLATFORMS;
		this.lychee.ROOT         = {};
		this.lychee.ROOT.lychee  = global.lychee.ROOT.lychee;
		this.lychee.ROOT.project = global.lychee.ROOT.project;
		this.lychee.VERSION      = global.lychee.VERSION;

		[
			// core/lychee.js
			'assignsafe',
			'assignunlink',
			'blobof',
			'diff',
			'enumof',
			'interfaceof',
			'deserialize',
			'serialize',

			'assimilate',
			'define',
			'import',
			'envinit',
			'pkginit',
			'inject',
			'setEnvironment',
			'setSimulation',

			// core/<Identifier>.js
			'Asset',
			'Debugger',
			'Definition',
			'Environment',
			'Package',
			'Simulation',
			'Specification'

		].forEach(function(identifier) {

			that.lychee[identifier] = global.lychee[identifier];

		});


		this.require = function(path) {
			return global.require(path);
		};

		this.setTimeout = function(callback, timeout) {
			global.setTimeout(callback, timeout);
		};

		this.setInterval = function(callback, interval) {
			global.setInterval(callback, interval);
		};



		/*
		 * INITIALIZATION
		 */

		if (settings instanceof Object) {

			Object.keys(settings).forEach(function(key) {

				let instance = lychee.deserialize(settings[key]);
				if (instance !== null) {
					this[key] = instance;
				}

			}.bind(this));

		}

	};

	_Sandbox.prototype = {

		deserialize: function(blob) {

			if (blob.console instanceof Object) {
				this.console.deserialize(blob.console.blob);
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			Object.keys(this).filter(function(key) {
				return key.charAt(0) !== '_' && key === key.toUpperCase();
			}).forEach(function(key) {
				settings[key] = lychee.serialize(this[key]);
			}.bind(this));


			blob.lychee         = {};
			blob.lychee.debug   = this.lychee.debug;
			blob.lychee.VERSION = this.lychee.VERSION;
			blob.lychee.ROOT    = this.lychee.ROOT;


			let data = this.console.serialize();
			if (data.blob !== null) {
				blob.console = data;
			}


			return {
				'constructor': '_Sandbox',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.id          = 'lychee-Environment-' + _id++;
		this.build       = 'app.Main';
		this.debug       = true;
		this.definitions = {};
		this.global      = global !== undefined ? global : {};
		this.packages    = {};
		this.sandbox     = false;
		this.tags        = {};
		this.timeout     = 10000;
		this.type        = 'source';

		this.__cache    = {
			active:        false,
			assimilations: [],
			start:         0,
			end:           0,
			retries:       0,
			timeout:       0,
			load:          [],
			ready:         [],
			track:         []
		};
		this.__features = {};


		// Alternative API for lychee.pkg

		if (settings.packages instanceof Array) {

			this.global.console.error('lychee-Environment (' + this.id + '): Invalid Packages');
			delete settings.packages;

		} else if (settings.packages instanceof Object) {

			for (let pid in settings.packages) {

				let value = settings.packages[pid];
				if (typeof value === 'string') {

					settings.packages[pid] = new lychee.Package({
						id:          pid,
						url:         value,
						environment: this
					});

				}

			}

		}


		this.setSandbox(settings.sandbox);
		this.setDebug(settings.debug);

		this.setDefinitions(settings.definitions);
		this.setId(settings.id);
		this.setPackages(settings.packages);
		this.setTags(settings.tags);
		this.setTimeout(settings.timeout);

		// Needs this.packages to be ready
		this.setType(settings.type);
		this.setBuild(settings.build);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.definitions instanceof Object) {

				for (let did in blob.definitions) {
					this.definitions[did] = lychee.deserialize(blob.definitions[did]);
				}

			}

			let features = lychee.deserialize(blob.features);
			if (features !== null) {
				this.__features = features;
			}

			if (blob.packages instanceof Object) {

				let packages = {};

				for (let pid in blob.packages) {
					packages[pid] = lychee.deserialize(blob.packages[pid]);
				}

				this.setPackages(packages);

				// This is a dirty hack which is allowed here
				this.setType(blob.type);
				this.setBuild(blob.build);

			}

			if (blob.global instanceof Object) {

				this.global = new _Sandbox(blob.global.arguments[0]);

				if (blob.global.blob !== null) {
					this.global.deserialize(blob.global.blob);
				}

			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.id !== '')            settings.id      = this.id;
			if (this.build !== 'app.Main') settings.build   = this.build;
			if (this.debug !== true)       settings.debug   = this.debug;
			if (this.sandbox !== false)    settings.sandbox = this.sandbox;
			if (this.timeout !== 10000)    settings.timeout = this.timeout;
			if (this.type !== 'source')    settings.type    = this.type;


			if (Object.keys(this.tags).length > 0) {

				settings.tags = {};

				for (let tagid in this.tags) {
					settings.tags[tagid] = this.tags[tagid];
				}

			}

			if (Object.keys(this.definitions).length > 0) {

				blob.definitions = {};

				for (let did in this.definitions) {
					blob.definitions[did] = lychee.serialize(this.definitions[did]);
				}

			}


			if (Object.keys(this.__features).length > 0) blob.features = lychee.serialize(this.__features);

			if (Object.keys(this.packages).length > 0) {

				blob.packages = {};

				for (let pid in this.packages) {
					blob.packages[pid] = lychee.serialize(this.packages[pid]);
				}


				// This is a dirty hack which is allowed here
				blob.type  = this.type;
				blob.build = this.build;

			}

			if (this.sandbox === true) {
				blob.global = this.global.serialize();
			}


			return {
				'constructor': 'lychee.Environment',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		load: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				let tmp    = identifier.split('.');
				let pkg_id = tmp[0];
				let def_id = tmp.slice(1).join('.');


				let definition = this.definitions[identifier] || null;
				if (definition !== null) {

					return true;

				} else {

					let pkg = this.packages[pkg_id] || null;
					if (pkg !== null && pkg.config !== null) {

						let result = pkg.load(def_id, this.tags);
						if (result === true) {

							if (this.debug === true) {
								this.global.console.log('lychee-Environment (' + this.id + '): Loading "' + identifier + '" from Package "' + pkg.id + '"');
							}

						}


						return result;

					}

				}

			}


			return false;

		},

		define: function(definition, inject) {

			definition = definition instanceof lychee.Definition ? definition : null;
			inject     = inject === true;


			if (definition !== null) {

				let url = definition.url || null;
				if (url !== null && inject === false) {

					let assimilation = true;
					let new_pkg_id   = null;
					let old_pkg_id   = definition.id.split('.')[0];
					let packages     = this.packages;

					for (let pid in packages) {

						let pkg  = packages[pid];
						let root = pkg.root;

						if (url.substr(0, pkg.root.length) === pkg.root) {
							new_pkg_id = pkg.id;
						}

						if (pid === old_pkg_id || pid === new_pkg_id) {
							assimilation = false;
						}

					}


					if (assimilation === true) {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): Assimilating Definition "' + definition.id + '"');
						}


						this.__cache.assimilations.push(definition.id);

					} else if (new_pkg_id !== null && new_pkg_id !== old_pkg_id) {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): Injecting Definition "' + definition.id + '" into package "' + new_pkg_id + '"');
						}


						definition.id = new_pkg_id + '.' + definition.id.split('.').slice(1).join('.');

						for (let i = 0, il = definition._includes.length; i < il; i++) {

							let inc = definition._includes[i];
							if (inc.substr(0, old_pkg_id.length) === old_pkg_id) {
								definition._includes[i] = new_pkg_id + inc.substr(old_pkg_id.length);
							}

						}

						for (let r = 0, rl = definition._requires.length; r < rl; r++) {

							let req = definition._requires[r];
							if (req.substr(0, old_pkg_id.length) === old_pkg_id) {
								definition._requires[r] = new_pkg_id + req.substr(old_pkg_id.length);
							}

						}

					}

				} else {

					// XXX: Direct injection has no auto-mapping

				}


				if (_validate_definition.call(this, definition) === true) {

					if (this.debug === true) {
						let info = Object.keys(definition._tags).length > 0 ? ('(' + JSON.stringify(definition._tags) + ')') : '';
						this.global.console.log('lychee-Environment (' + this.id + '): Mapping Definition "' + definition.id + '" ' + info);
					}

					this.definitions[definition.id] = definition;


					return true;

				}

			}


			let info = Object.keys(definition._tags).length > 0 ? ('(' + JSON.stringify(definition._tags) + ')') : '';
			this.global.console.error('lychee-Environment (' + this.id + '): Invalid Definition "' + definition.id + '" ' + info);


			return false;

		},

		init: function(callback) {

			callback = callback instanceof Function ? callback : function() {};


			if (this.debug === true) {
				this.global.lychee.ENVIRONMENTS[this.id] = this;
			}


			let build = this.build;
			let cache = this.__cache;
			let that  = this;

			if (build !== null && cache.active === false) {

				let result = this.load(build);
				if (result === true) {

					if (this.debug === true) {
						this.global.console.log('lychee-Environment (' + this.id + '): BUILD START ("' + this.build + '")');
					}


					cache.start   = Date.now();
					cache.timeout = Date.now() + this.timeout;
					cache.load    = [ build ];
					cache.ready   = [];
					cache.active  = true;


					let onbuildtimeout = function() {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): BUILD TIMEOUT (' + (cache.end - cache.start) + 'ms)');
						}


						// XXX: Always show Dependency Errors
						if (cache.load.length > 0) {

							this.global.console.error('lychee-Environment (' + this.id + '): Invalid Dependencies\n' + cache.load.map(function(value, index) {
								return '\t - ' + value + ' (required by ' + cache.track[index] + ')';
							}).join('\n'));

						}


						try {
							callback.call(this.global, null);
						} catch (err) {
							lychee.Debugger.report(this, err, null);
						}

					};

					let onbuildsuccess = function() {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): BUILD END (' + (cache.end - cache.start) + 'ms)');
						}


						try {
							callback.call(this.global, this.global);
						} catch (err) {
							lychee.Debugger.report(this, err, null);
						}

					};


					let intervalId = setInterval(function() {

						let cache = that.__cache;
						if (cache.active === true) {

							_export_loop.call(that, cache);

						} else if (cache.active === false) {

							if (intervalId !== null) {
								clearInterval(intervalId);
								intervalId = null;
							}


							let assimilations = cache.assimilations;
							if (assimilations.length > 0) {

								for (let a = 0, al = assimilations.length; a < al; a++) {

									let identifier = assimilations[a];
									let definition = that.definitions[identifier] || null;
									if (definition !== null) {
										definition.export(that.global);
									}

								}

							}


							cache.end = Date.now();


							if (cache.end > cache.timeout) {
								onbuildtimeout.call(that);
							} else {
								onbuildsuccess.call(that);
							}

						}

					}, (1000 / 60) | 0);

				} else {

					cache.retries++;


					if (cache.retries < 3) {

						if (this.debug === true) {
							this.global.console.warn('lychee-Environment (' + this.id + '): Package not ready, retrying in 100ms ...');
						}

						setTimeout(function() {
							that.init(callback);
						}, 100);

					} else {

						this.global.console.error('lychee-Environment (' + this.id + '): Invalid Dependencies\n\t - ' + build + ' (build target)');


						try {
							callback.call(this.global, null);
						} catch (err) {
							lychee.Debugger.report(this, err, null);
						}

					}

				}


				return true;

			}


			try {
				callback.call(this.global, null);
			} catch (err) {
				lychee.Debugger.report(this, err, null);
			}


			return false;

		},

		resolve: function(path) {

			path = typeof path === 'string' ? path : '';


			let proto = path.split(':')[0] || '';
			if (/^http|https/g.test(proto) === false) {
				path = (path.charAt(0) === '/' ? (lychee.ROOT.lychee + path) : (lychee.ROOT.project + '/' + path));
			}


			let tmp = path.split('/');

			for (let t = 0, tl = tmp.length; t < tl; t++) {

				if (tmp[t] === '.') {
					tmp.splice(t, 1);
					tl--;
					t--;
				} else if (tmp[t] === '..') {
					tmp.splice(t - 1, 2);
					tl -= 2;
					t  -= 2;
				}

			}

			return tmp.join('/');

		},

		setBuild: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				let type = this.type;
				if (type === 'build') {

					this.build = identifier;

					return true;

				} else {

					let pid = identifier.split('.')[0];
					let pkg = this.packages[pid] || null;
					if (pkg !== null) {

						this.build = identifier;

						return true;

					}

				}

			}


			return false;

		},

		setDebug: function(debug) {

			debug = typeof debug === 'boolean' ? debug : null;


			if (debug !== null) {

				this.debug = debug;

				if (this.sandbox === true) {
					this.global.lychee.debug = debug;
				}

				return true;

			}


			return false;

		},

		setDefinitions: function(definitions) {

			definitions = definitions instanceof Object ? definitions : null;


			if (definitions !== null) {

				for (let identifier in definitions) {

					let definition = definitions[identifier];
					if (definition instanceof lychee.Definition) {
						this.definitions[identifier] = definition;
					}

				}


				return true;

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;

				return true;

			}


			return false;

		},

		setPackages: function(packages) {

			packages = packages instanceof Object ? packages : null;


			if (packages !== null) {

				for (let pid in this.packages) {

					if (pid !== 'lychee') {
						this.packages[pid].setEnvironment(null);
						delete this.packages[pid];
					}

				}


				for (let pid in packages) {

					let pkg = packages[pid];
					if (pkg instanceof lychee.Package) {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): Adding Package "' + pkg.id + '"');
						}

						pkg.setEnvironment(this);
						this.packages[pid] = pkg;

					}

				}


				let type = this.type;
				if (/^(export|source)$/g.test(type)) {

					let lychee_pkg = this.packages['lychee'] || null;
					if (lychee_pkg === null) {

						lychee_pkg = new lychee.Package({
							id:          'lychee',
							url:         '/libraries/lychee/lychee.pkg',
							environment: this
						});

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): Injecting Package "lychee"');
						}

						this.packages['lychee'] = lychee_pkg;

					}

				}

				return true;

			}


			return false;

		},

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'boolean' ? sandbox : null;


			if (sandbox !== null) {

				if (sandbox !== this.sandbox) {

					this.sandbox = sandbox;


					if (sandbox === true) {

						this.global = new _Sandbox();
						this.global.lychee.setEnvironment(this);

					} else {

						this.global = global;

					}

				}


				return true;

			}


			return false;

		},

		setTags: function(tags) {

			tags = tags instanceof Object ? tags : null;


			if (tags !== null) {

				this.tags = {};

				for (let type in tags) {

					let values = tags[type];
					if (values instanceof Array) {

						this.tags[type] = values.filter(function(value) {
							return typeof value === 'string';
						});

					}

				}

				return true;

			}


			return false;

		},

		setTimeout: function(timeout) {

			timeout = typeof timeout === 'number' ? (timeout | 0) : null;


			if (timeout !== null) {

				this.timeout = timeout;

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				if (/^(build|export|source)$/g.test(type)) {

					this.type = type;


					if (type === 'export') {
						type = 'source';
					}


					for (let pid in this.packages) {
						this.packages[pid].setType(type);
					}


					return true;

				}

			}


			return false;

		}

	};


	Composite.displayName           = 'lychee.Environment';
	Composite.prototype.displayName = 'lychee.Environment';


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

