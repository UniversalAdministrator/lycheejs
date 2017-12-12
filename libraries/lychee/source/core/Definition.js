
lychee.Definition = typeof lychee.Definition !== 'undefined' ? lychee.Definition : (function(global) {

	const lychee = global.lychee;



	/*
	 * HELPERS
	 */

	const _create_detector = function(source) {

		if (source === null) {
			return source;
		}


		if (typeof Proxy !== 'undefined') {

			let clone = {};
			let proxy = new Proxy(clone, {

				get: function(target, name) {

					// XXX: Remove this and console will crash the program
					if (name === 'splice') return undefined;


					if (target[name] === undefined) {

						let type = typeof source[name];
						if (/boolean|number|string|function/g.test(type)) {
							target[name] = source[name];
						} else if (/object/g.test(type)) {
							target[name] = _create_detector(source[name]);
						} else if (/undefined/g.test(type)) {
							target[name] = undefined;
						}


						if (target[name] === undefined) {
							console.error('lychee.Definition: Unknown feature (data type) "' + name + '" in features.js');
						}

					}


					return target[name];

				}

			});


			proxy.toJSON = function() {

				let data = {};

				Object.keys(clone).forEach(function(key) {

					if (/toJSON/g.test(key) === false) {

						let type = typeof clone[key];
						if (/boolean|number|string|function/g.test(type)) {
							data[key] = type;
						} else if (/object/g.test(type)) {
							data[key] = clone[key];
						}

					}

				});

				return data;

			};


			return proxy;

		}


		return source;

	};

	const _fuzz_asset = function(type) {

		let asset = {
			url:       '/tmp/Dummy.' + type,
			_is_dummy: true,
			serialize: function() {
				return null;
			}
		};


		let file = this.__file;
		if (file !== null) {
			asset.url = file.split('.').slice(0, -1).join('.') + '.' + type;
		}


		Object.defineProperty(asset, 'buffer', {
			get: function() {
				return null;
			},
			set: function() {
				return false;
			},
			enumerable:   true,
			configurable: false
		});


		return asset;

	};

	const _fuzz_id = function() {

		let found = null;

		if (this.__file !== null) {

			let packages = lychee.environment.packages.filter(function(pkg) {
				return pkg.type === 'source';
			}).map(function(pkg) {

				return {
					id:  pkg.id,
					url: pkg.url.split('/').slice(0, -1).join('/')
				};

			});


			let file = this.__file;
			let ns   = file.split('/');
			let pkg  = packages.find(function(pkg) {
				return file.substr(0, pkg.url.length) === pkg.url;
			}) || null;


			if (pkg !== null) {

				let id    = '';
				let tmp_i = ns.indexOf('source');
				let tmp_s = ns[ns.length - 1];

				if (/\.js$/g.test(tmp_s)) {
					ns[ns.length - 1] = tmp_s.split('.').slice(0, -1).join('.');
				}

				if (tmp_i !== -1) {
					id = ns.slice(tmp_i + 1).join('.');
				}


				found = pkg.id + '.' + id;

			}

		}

		return found;

	};

	const _resolve = function(identifier) {

		let pointer   = this;
		let namespace = identifier.split('.');
		let id        = namespace.pop();

		for (let n = 0, nl = namespace.length; n < nl; n++) {

			let name = namespace[n];

			if (pointer[name] === undefined) {
				pointer[name] = {};
			}

			pointer = pointer[name];

		}


		let check = id.toLowerCase();
		if (check === id) {

			if (pointer[id] === undefined) {
				pointer[id] = {};
			}

			return pointer[id];

		} else {

			if (pointer[id] !== undefined) {
				return pointer[id];
			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.id     = '';
		this.__file = lychee.Environment.__FILENAME || null;

		this._attaches = {
			'json':  _fuzz_asset.call(this, 'json'),
			'fnt':   _fuzz_asset.call(this, 'fnt'),
			'msc':   _fuzz_asset.call(this, 'msc'),
			'pkg':   _fuzz_asset.call(this, 'pkg'),
			'png':   _fuzz_asset.call(this, 'png'),
			'snd':   _fuzz_asset.call(this, 'snd'),
			'store': _fuzz_asset.call(this, 'store')
		};
		this._tags     = {};
		this._requires = [];
		this._includes = [];
		this._exports  = null;
		this._supports = null;


		this.setId(settings.id);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.attaches instanceof Object) {

				let attachesmap = {};

				for (let aid in blob.attaches) {
					attachesmap[aid] = lychee.deserialize(blob.attaches[aid]);
				}

				this.attaches(attachesmap);

			}

			if (blob.tags instanceof Object) {
				this.tags(blob.tags);
			}

			if (blob.requires instanceof Array) {
				this.requires(blob.requires);
			}

			if (blob.includes instanceof Array) {
				this.includes(blob.includes);
			}


			let index1   = 0;
			let index2   = 0;
			let tmp      = null;
			let bindargs = null;

			if (typeof blob.supports === 'string') {

				// Function head
				tmp      = blob.supports.split('{')[0].trim().substr('function '.length);
				bindargs = tmp.substr(1, tmp.length - 2).split(',');

				// Function body
				index1 = blob.supports.indexOf('{') + 1;
				index2 = blob.supports.lastIndexOf('}') - 1;
				bindargs.push(blob.supports.substr(index1, index2 - index1));

				this.supports(Function.apply(Function, bindargs));

			}

			if (typeof blob.exports === 'string') {

				// Function head
				tmp      = blob.exports.split('{')[0].trim().substr('function '.length);
				bindargs = tmp.substr(1, tmp.length - 2).split(',');

				// Function body
				index1 = blob.exports.indexOf('{') + 1;
				index2 = blob.exports.lastIndexOf('}') - 1;
				bindargs.push(blob.exports.substr(index1, index2 - index1));

				this.exports(Function.apply(Function, bindargs));

			}

		},

		serialize: function() {

			let blob     = {};
			let settings = {};


			if (this.id !== '') settings.id = this.id;


			if (Object.keys(this._attaches).length > 0) {

				blob.attaches = {};

				for (let aid in this._attaches) {

					let asset = this._attaches[aid];
					if (asset.url.startsWith('/tmp/Dummy') === false) {

						let data = lychee.serialize(asset);
						if (data !== null) {
							blob.attaches[aid] = data;
						}

					}

				}

			}

			if (Object.keys(this._tags).length > 0) {

				blob.tags = {};

				for (let tid in this._tags) {
					blob.tags[tid] = this._tags[tid];
				}

			}

			if (this._requires.length > 0)          blob.requires = this._requires.slice(0);
			if (this._includes.length > 0)          blob.includes = this._includes.slice(0);
			if (this._supports instanceof Function) blob.supports = this._supports.toString();
			if (this._exports instanceof Function)  blob.exports  = this._exports.toString();


			return {
				'constructor': 'lychee.Definition',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				if (/\./.test(id)) {

					this.id = id;

				} else if (/^([A-Za-z0-9-]+)/g.test(id)) {

					this.id = 'lychee.' + id;

				} else {

					let fuzzed = _fuzz_id.call(this);
					if (fuzzed !== null) {

						this.id = fuzzed;

						console.warn('lychee.Definition: Injecting Identifier "' + fuzzed + '" (' + this.__file + ')');

					} else {

						console.error('lychee.Definition: Invalid Identifier "' + id + '" (' + this.__file + ')');

					}

				}


				return true;

			}


			return false;

		},

		attaches: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (let id in map) {

					let value = map[id];
					if (value !== undefined) {
						this._attaches[id] = map[id];
					}

				}

			}


			return this;

		},

		check: function(target) {

			target = target instanceof Object ? target : {};


			let features  = null;
			let supported = true;
			let tagged    = true;


			for (let key in this._tags) {

				let tag = this._tags[key];
				let val = target[key] || null;
				if (val instanceof Array) {

					if (val.includes(tag) === false) {
						tagged = false;
						break;
					}

				} else if (typeof val === 'string') {

					if (val !== tag) {
						tagged = false;
						break;
					}

				}

			}


			if (this._supports !== null) {

				supported = false;


				let platform = this._tags.platform || null;
				if (platform !== null) {

					if (platform.includes('-') === true) {

						let platform_major = platform.split('-')[0];
						let platform_minor = platform.split('-')[1];

						let detector = _create_detector(lychee.FEATURES[platform_major] || null);
						if (detector !== null) {
							supported = this._supports.call(detector, lychee, detector);
							features  = JSON.parse(JSON.stringify(detector));
							detector  = null;
						}

						if (supported === false) {

							detector = _create_detector(lychee.FEATURES[platform_minor] || null);

							if (detector !== null) {

								supported = this._supports.call(detector, lychee, detector);

								if (features instanceof Object) {
									features = Object.assign(features, JSON.parse(JSON.stringify(detector)));
								} else {
									features = JSON.parse(JSON.stringify(detector));
								}

								detector = null;

							} else {

								supported = this._supports.call(global, lychee, global);

							}

						}

					} else {

						let detector = _create_detector(lychee.FEATURES[platform] || null);
						if (detector !== null) {
							supported = this._supports.call(detector, lychee, detector);
							features  = JSON.parse(JSON.stringify(detector));
							detector  = null;
						} else {
							supported = this._supports.call(global, lychee, global);
						}

					}

				} else {

					supported = this._supports.call(global, lychee, global);

				}

			}


			return {
				features:  features,
				supported: supported,
				tagged:    tagged
			};

		},

		export: function(sandbox) {

			sandbox = sandbox !== undefined ? sandbox : global;


			let check = _resolve.call(sandbox, this.id);
			if (check === null) {

				let console   = sandbox.console || global.console;
				let id        = this.id;
				let namespace = _resolve.call(sandbox, id.split('.').slice(0, -1).join('.'));
				let name      = id.split('.').pop();

				if (this._exports !== null) {

					let includes = this._includes.map(function(id) {
						return _resolve.call(sandbox, id);
					});

					let requires = this._requires.map(function(id) {
						return _resolve.call(sandbox, id);
					});


					if (includes.includes(null) === false && requires.includes(null) === false) {

						let template = null;

						try {

							template = this._exports.call(
								this._exports,
								sandbox.lychee,
								sandbox,
								this._attaches
							) || null;

						} catch (err) {
							lychee.Debugger.report(null, err, this);
						}


						if (template !== null) {

							if (includes.length > 0) {

								let own_enums   = null;
								let own_methods = null;
								let own_keys    = Object.keys(template);
								let own_proto   = template.prototype;


								if (own_keys.length > 0) {

									own_enums = {};

									for (let ok = 0, okl = own_keys.length; ok < okl; ok++) {

										let own_key = own_keys[ok];
										if (own_key === own_key.toUpperCase()) {
											own_enums[own_key] = template[own_key];
										}

									}

									if (Object.keys(own_enums).length === 0) {
										own_enums = null;
									}

								}


								if (own_proto instanceof Object) {

									own_methods = {};

									for (let own_method in own_proto) {
										own_methods[own_method] = own_proto[own_method];
									}

									if (Object.keys(own_methods).length === 0) {
										own_methods = null;
									}

								}


								Object.defineProperty(namespace, name, {
									value:        template,
									writable:     false,
									enumerable:   true,
									configurable: false
								});

								namespace[name].displayName = id;
								namespace[name].prototype   = {};


								let tpl_enums   = {};
								let tpl_methods = [ namespace[name].prototype ];


								for (let i = 0, il = includes.length; i < il; i++) {

									let include  = includes[i];
									let inc_keys = Object.keys(include);
									if (inc_keys.length > 0) {

										for (let ik = 0, ikl = inc_keys.length; ik < ikl; ik++) {

											let inc_key = inc_keys[ik];
											if (inc_key === inc_key.toUpperCase()) {
												tpl_enums[inc_key] = include[inc_key];
											}

										}

									}

									tpl_methods.push(include.prototype);

								}


								if (own_enums !== null) {

									for (let e in own_enums) {
										tpl_enums[e] = own_enums[e];
									}

								}

								if (own_methods !== null) {
									tpl_methods.push(own_methods);
								}

								for (let e in tpl_enums) {
									namespace[name][e] = tpl_enums[e];
								}


								Object.assign.apply(lychee, tpl_methods);
								namespace[name].prototype.displayName = id;

								Object.freeze(namespace[name].prototype);


								return true;

							} else {

								namespace[name]             = template;
								namespace[name].displayName = id;


								if (template instanceof Object) {
									Object.freeze(namespace[name]);
								}

								if (namespace[name].prototype instanceof Object) {
									namespace[name].prototype.displayName = id;
									Object.freeze(namespace[name].prototype);
								}


								return true;

							}

						} else {

							namespace[name]                       = function() {};
							namespace[name].displayName           = id;
							namespace[name].prototype             = {};
							namespace[name].prototype.displayName = id;

							Object.freeze(namespace[name].prototype);

							console.error('lychee.Definition: Invalid Definition "' + id + '", it is replaced with a Dummy Composite');


							return true;

						}

					} else {

						let invalid_includes = this._includes.filter(function(id, i) {
							return includes[i] === null;
						});

						if (invalid_includes.length > 0) {

							for (let i = 0, il = invalid_includes.length; i < il; i++) {
								let tmp = invalid_includes[i];
								console.error('lychee.Definition: Invalid Inclusion of "' + tmp + '" in "' + id + '".');
							}

						}


						let invalid_requires = this._requires.filter(function(id, r) {
							return requires[r] === null;
						});

						if (invalid_requires.length > 0) {

							for (let i = 0, il = invalid_requires.length; i < il; i++) {
								let tmp = invalid_requires[i];
								console.error('lychee.Definition: Invalid Requirement of "' + tmp + '" in "' + id + '".');
							}

						}

					}

				}


				return false;

			}


			return true;

		},

		exports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._exports = callback;
			}


			return this;

		},

		includes: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (let d = 0, dl = definitions.length; d < dl; d++) {

					let definition = definitions[d];
					if (typeof definition === 'string') {

						if (definition.indexOf('.') !== -1 && this._includes.indexOf(definition) === -1) {
							this._includes.push(definition);
						}

					}

				}

			}


			return this;

		},

		requires: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (let d = 0, dl = definitions.length; d < dl; d++) {

					let definition = definitions[d];
					if (typeof definition === 'string') {

						if (definition.indexOf('.') !== -1 && this._requires.indexOf(definition) === -1) {
							this._requires.push(definition);
						}

					}

				}

			}


			return this;

		},

		supports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._supports = callback;
			}


			return this;

		},

		tags: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (let id in map) {

					let value = map[id];
					if (typeof value === 'string') {
						this._tags[id] = value;
					}

				}

			}


			return this;

		}

	};


	Composite.displayName           = 'lychee.Definition';
	Composite.prototype.displayName = 'lychee.Definition';


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

