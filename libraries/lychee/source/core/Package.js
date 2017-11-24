
lychee.Package = typeof lychee.Package !== 'undefined' ? lychee.Package : (function(global) {

	const lychee = global.lychee;


	/*
	 * HELPERS
	 */

	const _resolve_root = function() {

		let root = this.root;
		let type = this.type;
		if (type === 'source') {
			root += '/source';
		} else if (type === 'export') {
			root += '/source';
		} else if (type === 'build') {
			root += '/build';
		}


		return root;

	};

	const _resolve_path = function(candidate) {

		let config = this.config;
		let path   = typeof candidate === 'string' ? candidate.split('/') : null;

		if (config !== null && path !== null) {

			let type = this.type;
			if (type === 'export') {
				type = 'source';
			}


			let pointer = config.buffer[type].files || null;
			if (pointer !== null) {

				for (let p = 0, pl = path.length; p < pl; p++) {

					let name = path[p];
					if (pointer[name] !== undefined) {
						pointer = pointer[name];
					} else {
						pointer = null;
						break;
					}

				}

			}


			return pointer !== null ? true : false;

		}


		return false;

	};

	const _resolve_attachments = function(candidate) {

		let config      = this.config;
		let attachments = {};
		let path        = candidate.split('/');

		if (config !== null && path.length > 0) {

			let pointer = config.buffer.source.files || null;
			if (pointer !== null) {

				for (let pa = 0, pal = path.length; pa < pal; pa++) {

					let name = path[pa];
					if (pointer[name] !== undefined) {
						pointer = pointer[name];
					} else {
						pointer = null;
						break;
					}

				}


				if (pointer !== null && pointer instanceof Array) {

					let definition_path = _resolve_root.call(this) + '/' + path.join('/');

					for (let po = 0, pol = pointer.length; po < pol; po++) {

						let type = pointer[po];
						if (type !== 'js') {
							attachments[type] = definition_path + '.' + type;
						}

					}

				}

			}

		}


		return attachments;

	};

	const _resolve_candidates = function(id, tags) {

		tags = tags instanceof Object ? tags : null;


		let that          = this;
		let candidatepath = id.split('.').join('/');
		let candidates    = [];
		let filter_values = function(tags, tag) {

			return tags[tag].map(function(value) {
				return _resolve_tag.call(that, tag, value) + '/' + candidatepath;
			}).filter(function(path) {
				return _resolve_path.call(that, path);
			});

		};


		if (tags !== null) {

			for (let tag in tags) {

				let values = filter_values(tags, tag);
				if (values.length > 0) {
					candidates.push.apply(candidates, values);
				}

			}

		}


		if (_resolve_path.call(this, candidatepath) === true) {
			candidates.push(candidatepath);
		}


		return candidates;

	};

	const _resolve_tag = function(tag, value) {

		tag   = typeof tag === 'string'   ? tag   : null;
		value = typeof value === 'string' ? value : null;


		let config = this.config;

		if (config !== null && tag !== null && value !== null) {

			let type = this.type;
			if (type === 'export') {
				type = 'source';
			}


			let pointer = config.buffer[type].tags || null;
			if (pointer !== null) {

				if (pointer[tag] instanceof Object) {

					let path = pointer[tag][value] || null;
					if (path !== null) {
						return path;
					}

				}

			}

		}


		return '';

	};

	const _load_candidate = function(id, candidates) {

		if (candidates.length > 0) {

			let map = {
				id:           id,
				candidate:    null,
				candidates:   [].concat(candidates),
				attachments:  [],
				dependencies: [],
				loading:      1
			};


			this.__requests[id] = map;


			let candidate = map.candidates.shift();

			while (candidate !== undefined) {

				if (this.__blacklist[candidate] === 1) {
					candidate = map.candidates.shift();
				} else {
					break;
				}

			}


			// Try to load the first suggested Candidate Implementation
			if (candidate !== undefined) {

				let url            = _resolve_root.call(this) + '/' + candidate + '.js';
				let implementation = new lychee.Asset(url, null, false);
				let attachments    = _resolve_attachments.call(this, candidate);

				if (implementation !== null) {
					_load_candidate_implementation.call(this, candidate, implementation, attachments, map);
				}

			}

		}

	};

	const _load_candidate_implementation = function(candidate, implementation, attachments, map) {

		let that       = this;
		let identifier = this.id + '.' + map.id;


		implementation.onload = function(result) {

			map.loading--;


			if (result === true) {

				let environment = that.environment;
				let definition  = environment.definitions[identifier] || null;
				if (definition !== null) {

					map.candidate = this;


					let attachmentIds = Object.keys(attachments);


					// Temporary delete definition from environment and re-define it after attachments are all loaded
					if (attachmentIds.length > 0) {

						delete environment.definitions[identifier];

						map.loading += attachmentIds.length;


						attachmentIds.forEach(function(assetId) {

							let url   = attachments[assetId];
							let asset = new lychee.Asset(url);
							if (asset !== null) {

								asset.onload = function(result) {

									map.loading--;

									let tmp = {};
									if (result === true) {
										tmp[assetId] = this;
									} else {
										tmp[assetId] = null;
									}

									definition.attaches(tmp);


									if (map.loading === 0) {
										environment.definitions[identifier] = definition;
									}

								};

								asset.load();

							} else {

								map.loading--;

							}

						});

					}


					for (let i = 0, il = definition._includes.length; i < il; i++) {
						environment.load(definition._includes[i]);
					}

					for (let r = 0, rl = definition._requires.length; r < rl; r++) {
						environment.load(definition._requires[r]);
					}


					return true;

				}

			}



			// If code runs through here, candidate was invalid
			delete that.environment.definitions[identifier];
			that.__blacklist[candidate] = 1;

			// Load next candidate, if any available
			if (map.candidates.length > 0) {
				_load_candidate.call(that, map.id, map.candidates);
			}

		};

		implementation.load();

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(id, url) {

		id  = typeof id === 'string'  ? id  : 'app';
		url = typeof url === 'string' ? url : null;


		this.id          = id;
		this.config      = null;
		this.environment = null;
		this.root        = null;
		this.url         = null;
		this.type        = 'source';


		this.__blacklist = {};
		this.__requests  = {};


		if (url !== null) {

			let that = this;
			let tmp  = url.split('/');

			let file = tmp.pop();
			if (file === 'lychee.pkg') {

				this.root = tmp.join('/');
				this.url  = url;


				let config = new Config(this.url);

				config.onload = function(result) {

					let buffer = this.buffer || null;
					if (
						buffer !== null
						&& buffer instanceof Object
						&& buffer.source instanceof Object
						&& buffer.build instanceof Object
					) {

						console.info('lychee.Package-' + that.id + ': Package at "' + this.url + '" ready.');

						that.config = this;

					} else {

						console.error('lychee.Package-' + that.id + ': Package at "' + this.url + '" corrupt.');

					}

				};

				config.load();

			}

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.Package',
				'arguments':   [ this.id, this.url ]
			};

		},



		/*
		 * CUSTOM API
		 */

		load: function(id, tags) {

			id   = typeof id === 'string' ? id   : null;
			tags = tags instanceof Object ? tags : null;


			let config = this.config;

			if (id !== null && config !== null) {

				let request = this.__requests[id] || null;
				if (request === null) {

					let candidates = _resolve_candidates.call(this, id, tags);
					if (candidates.length > 0) {

						_load_candidate.call(this, id, candidates);

						return true;

					} else {

						let info = Object.keys(tags).length > 0 ? ('(' + JSON.stringify(tags) + ')') : '';
						console.error('lychee.Package-' + this.id + ': Invalid Definition "' + id + '" ' + info);

						return false;

					}

				} else {

					return true;

				}

			}


			return false;

		},

		resolve: function(id, tags) {

			id   = typeof id === 'string' ? id   : null;
			tags = tags instanceof Object ? tags : null;


			let config   = this.config;
			let filtered = [];

			if (id !== null && config !== null) {

				let candidates = _resolve_candidates.call(this, id, tags);
				if (candidates.length > 0) {

					for (let c = 0, cl = candidates.length; c < cl; c++) {
						filtered.push(candidates[c]);
					}

				}

			}

			return filtered;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				if (type === 'source' || type === 'export' || type === 'build') {

					this.type = type;

					return true;

				}

			}


			return false;

		}

	};


	Composite.displayName           = 'lychee.Package';
	Composite.prototype.displayName = 'lychee.Package';


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

