
lychee.Specification = typeof lychee.Specification !== 'undefined' ? lychee.Specification : (function(global) {

	const lychee = global.lychee;



	/*
	 * HELPERS
	 */

	const _fuzz_id = function() {

		let found = null;

		if (this.url !== null) {

			let packages = lychee.environment.packages.filter(function(pkg) {
				return pkg.type === 'source';
			}).map(function(pkg) {

				return {
					id:  pkg.id,
					url: pkg.url.split('/').slice(0, -1).join('/')
				};

			});


			let url = this.url;
			let ns  = url.split('/');
			let pkg = packages.find(function(pkg) {
				return url.substr(0, pkg.url.length) === pkg.url;
			}) || null;


			if (pkg !== null) {

				let id    = '';
				let tmp_i = ns.indexOf('review');
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


		this.id  = '';
		this.url = lychee.FILENAME || null;

		this._requires = [];
		this._exports  = null;


		this.setId(settings.id);
		this.setUrl(settings.url);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.requires instanceof Array) {
				this.requires(blob.requires);
			}


			let index1   = 0;
			let index2   = 0;
			let tmp      = null;
			let bindargs = null;

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


			if (this.id !== '')  settings.id  = this.id;
			if (this.url !== '') settings.url = this.url;

			if (this._requires.length > 0)         blob.requires = this._requires.slice(0);
			if (this._exports instanceof Function) blob.exports  = this._exports.toString();


			return {
				'constructor': 'lychee.Specification',
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

				if (id.includes('.') && /^([A-Za-z0-9-.]+)$/g.test(id)) {

					this.id = id;

					return true;

				} else {

					let fuzzed = _fuzz_id.call(this);
					if (fuzzed !== null) {

						this.id = fuzzed;

						console.warn('lychee.Definition: Injecting Identifier "' + fuzzed + '" (' + this.url + ')');

						return true;

					} else {

						console.error('lychee.Definition: Invalid Identifier "' + id + '" (' + this.url + ')');

					}

				}

			}


			return false;

		},

		setUrl: function(url) {

			url = typeof url === 'string' ? url : null;


			if (url !== null) {

				this.url = url;

				return true;

			}


			return false;

		},

		export: function(sandbox) {

			sandbox = sandbox !== undefined ? sandbox : global;


			let console = sandbox.console || global.console;
			let id      = this.id;

			if (this._exports !== null) {

				let requires = this._requires.map(function(id) {
					return _resolve.call(sandbox, id);
				});


				if (requires.includes(null) === false) {

					let template = null;

					try {
						template = this._exports.call(
							this._exports,
							sandbox.lychee,
							sandbox
						) || null;
					} catch (err) {
						lychee.Debugger.report(null, err, this);
					}

				} else {

					let invalid_requires = this._requires.filter(function(id, r) {
						return requires[r] === null;
					});

					if (invalid_requires.length > 0) {

						for (let i = 0, il = invalid_requires.length; i < il; i++) {
							let tmp = invalid_requires[i];
							console.error('lychee.Specification: Invalid Requirement of "' + tmp + '" in "' + id + '".');
						}

					}

				}

			}


			return false;

		},

		exports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._exports = callback;
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

		}

	};


	Composite.displayName           = 'lychee.Specification';
	Composite.prototype.displayName = 'lychee.Specification';


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

