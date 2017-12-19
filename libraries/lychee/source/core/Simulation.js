
lychee.Simulation = typeof lychee.Simulation !== 'undefined' ? lychee.Simulation : (function(global) {

	const _console = global.console;
	let   _id      = 0;
	const _lychee  = global.lychee;



	/*
	 * HELPERS
	 */

	const _debug_log = function(str) {

		let console     = _console;
		let debug       = _lychee.debug;
		let environment = this.environment;
		if (environment !== null) {
			debug   = environment.debug;
			console = environment.global.console;
		}

		if (debug === true) {
			console.log(str);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.id             = 'lychee-Simulation-' + _id++;
		this.environment    = null;
		this.sandbox        = false;
		this.specifications = {};
		this.timeout        = 10000;

		this.__cache    = {
			assimilations: {}
		};
		this.__packages = {};


		this.setEnvironment(settings.environment);
		this.setSandbox(settings.sandbox);

		this.setSpecifications(settings.specifications);
		this.setTimeout(settings.timeout);


		settings = null;

	};


	Composite.prototype = {

		deserialize: function(blob) {

			if (blob.specifications instanceof Object) {

				for (let id in blob.specifications) {
					this.specifications[id] = lychee.deserialize(blob.specifications[id]);
				}

			}

			if (blob.environment instanceof Object) {
				this.setEnvironment(lychee.deserialize(blob.environment));
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.id !== '')         settings.id      = this.id;
			if (this.sandbox !== false) settings.sandbox = this.sandbox;
			if (this.timeout !== 10000) settings.timeout = this.timeout;


			if (Object.keys(this.specifications).length > 0) {

				blob.specifications = {};

				for (let sid in this.specifications) {
					blob.specifications[sid] = lychee.serialize(this.specifications[sid]);
				}

			}


			return {
				'constructor': 'lychee.Simulation',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				let tmp    = identifier.split('.');
				let pkg_id = tmp[0];
				let def_id = tmp.slice(1).join('.');


				let specification = this.specifications[identifier] || null;
				if (specification !== null) {

					return true;

				} else {

					let pkg = this.__packages[pkg_id] || null;
					if (pkg !== null && pkg.config !== null) {

						let result = pkg.load(def_id, this.tags);
						if (result === true) {
							_debug_log.call(this, 'lychee-Simulation (' + this.id + '): Loading "' + identifier + '" from Package "' + pkg.id + '"');
						}

						return result;

					}

				}

			}


			return false;

		},

		specify: function(specification, inject) {

			specification = specification instanceof lychee.Specification ? specification : null;
			inject        = inject === true;


			if (specification !== null) {

				let url = specification.url || null;
				if (url !== null && inject === false) {

					let old_pkg_id   = specification.id.split('.')[0];
					let new_pkg_id   = null;
					let assimilation = true;


					let packages = this.__packages;

					for (let pid in packages) {

						let pkg  = packages[pid];
						let root = pkg.root;

						if (url.startsWith(pkg.root)) {
							new_pkg_id = pkg.id;
						}

						if (pid === old_pkg_id || pid === new_pkg_id) {
							assimilation = false;
						}

					}


					if (assimilation === true) {

						_debug_log.call(this, 'lychee-Simulation (' + this.id + '): Assimilating Specification "' + specification.id + '"');

						this.__cache.assimilations.push(specification.id);

					} else if (new_pkg_id !== null && new_pkg_id !== old_pkg_id) {

						_debug_log.call(this, 'lychee-Simulation (' + this.id + '): Injecting Specification "' + specification.id + '" into package "' + new_pkg_id + '"');


						specification.id = new_pkg_id + '.' + specification.id.split('.').slice(1).join('.');

						for (let r = 0, rl = specification._requires.length; r < rl; r++) {

							let req = specification._requires[r];
							if (req.startsWith(old_pkg_id)) {
								specification._requires[r] = new_pkg_id + req.substr(old_pkg_id.length);
							}

						}

					}

				} else {

					// XXX: Direct injection has no auto-mapping

				}


				_debug_log.call(this, 'lychee-Simulation (' + this.id + '): Mapping Specification "' + specification.id + '"');

				this.specifications[specification.id] = specification;


				return true;

			}


			console.error('lychee-Simulation (' + this.id + '): Invalid Specification "' + specification.id + '"');


			return false;

		},

		init: function(callback) {

			callback = callback instanceof Function ? callback : null;

			// TODO: Initialization
			// TODO: Export Loop
			// TODO: Trace of Dependencies

			return true;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;
				this.__packages  = {};

				for (let pid in environment.packages) {

					let pkg = environment.packages[pid];

					this.__packages[pid] = new lychee.Package({
						id:   pkg.id,
						url:  pkg.url,
						type: 'review'
					});

				}

				return true;

			} else {

				this.environment = null;
				this.__packages  = {};

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

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'boolean' ? sandbox : null;


			if (sandbox !== null) {

				this.sandbox = sandbox;

				return true;

			}


			return false;

		},

		setSpecifications: function(specifications) {

			specifications = specifications instanceof Object ? specifications : null;


			if (specifications !== null) {

				for (let identifier in specifications) {

					let specification = specifications[identifier];
					if (specification instanceof lychee.Specification) {
						this.specifications[identifier] = specification;
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

		}

	};


	return Composite;

});

