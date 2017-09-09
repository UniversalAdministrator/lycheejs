
lychee.define('strainer.flow.Check').requires([
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

	const _get_knowledge_url = function(id, knowledge) {

		let found = null;

		for (let url in knowledge) {

			let data = knowledge[url];
			if (data.identifier === id) {
				found = url;
				break;
			}

		}

		return found;

	};

	const _trace_memory = function(memory, chunk) {

		let values = [];


		if (chunk.startsWith('_')) {

			let tmp      = chunk.split('.');
			let variable = memory[tmp.shift()];
			if (variable !== undefined) {

				if (variable.value !== undefined) {

					let identifier = variable.value.reference;
					let config     = this.configs.find(function(other) {

						let buffer = other.buffer;
						if (buffer !== null) {
							return identifier === buffer.header.identifier;
						} else {
							return false;
						}

					}) || null;

					if (config !== null) {

						let memory = config.buffer.memory;
						let result = config.buffer.result;
						let check  = tmp.shift();
						if (check === 'prototype') {

							let method = result.methods[tmp.shift()] || null;
							if (method !== null) {

								if (method.values.length === 1) {

									let value = method.values[0];
									if (value.type === 'undefined' && value.chunk !== undefined) {
										return _trace_memory.call(this, memory, value.chunk);
									} else {
										values.push(value);
									}

								} else {

									for (let v = 0, vl = method.values.length; v < vl; v++) {
										values.push(method.values[v]);
									}

								}

							}

						} else if (check === check.toUpperCase()) {

							let enam = result.enums[check] || null;
							if (enam !== null) {

								let name  = tmp.shift();
								let value = enam.values.find(function(val) {
									return val.name === name;
								}) || null;

								if (value !== null) {

									values.push({
										chunk: chunk,
										type:  value.value.type,
										value: value.value.value
									});

								}

							}

						}

					}

				} else if (variable.values !== undefined) {

					let check = tmp.shift();
					if (check.startsWith('call(') || check.startsWith('(')) {

						for (let v = 0, vl = variable.values.length; v < vl; v++) {
							values.push(variable.values[v]);
						}

					}

				}

			}

		}


		return values;

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
				return value.substr(-12) !== 'bootstrap.js';
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
		this.errors   = [];
		this.sandbox  = '';
		this.settings = {};
		this.stash    = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this.__dependencies = [];
		this.__namespaces   = {};
		this.__pkg          = null;


		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		_Flow.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read', function(oncomplete) {

			let that    = this;
			let project = this.settings.project;
			let sandbox = this.sandbox;
			let stash   = this.stash;

			if (sandbox !== '' && stash !== null) {

				console.log('strainer: READ ' + project);

				this.__pkg        = new Config(sandbox + '/lychee.pkg');
				this.__pkg.onload = function(result) {

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

				this.__pkg.load();

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('check-eslint', function(oncomplete) {

			let eslint  = _plugin.ESLINT || null;
			let errors  = this.errors;
			let project = this.settings.project;

			if (eslint !== null) {

				console.log('strainer: CHECK-ESLINT ' + project);

				this.checks = this.codes.map(function(asset) {

					let result         = [];
					let eslint_report  = _plugin.ESLINT.check(asset);
					let eslint_unfixed = _plugin.ESLINT.fix(asset, eslint_report);

					if (eslint_unfixed.length > 0) {

						eslint_unfixed.map(function(err) {

							return {
								url:     asset.url,
								rule:    err.ruleId  || 'parser-error',
								line:    err.line    || 0,
								column:  err.column  || 0,
								message: err.message || ''
							};

						}).forEach(function(err) {

							result.push(err);
							errors.push(err);

						});


						return result;

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

		this.bind('check-api', function(oncomplete) {

			let api     = _plugin.API || null;
			let errors  = this.errors;
			let project = this.settings.project;

			if (api !== null) {

				console.log('strainer: CHECK-API ' + project);


				this.configs = this.codes.map(function(asset) {

					let result      = [];
					let api_report  = _plugin.API.check(asset);
					let api_unfixed = _plugin.API.fix(asset, api_report);


					if (api_report !== null) {

						if (api_unfixed.length > 0) {

							api_unfixed.map(function(err) {

								return {
									url:     asset.url,
									rule:    err.rule    || 'api-error',
									line:    err.line    || 0,
									column:  err.column  || 0,
									message: err.message || ''
								};

							}).forEach(function(err) {

								result.push(err);
								errors.push(err);

							});

							api_report.errors = result;

						}


						let url    = asset.url.replace(/source/, 'api').replace(/\.js$/, '.json');
						let config = new lychee.Asset(url, 'json', true);
						if (config !== null) {
							config.buffer = api_report;
						}

						return config;

					}


					return null;

				});


				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('read-deps', function(oncomplete) {

			let dependencies = this.__dependencies;
			let errors       = this.errors;
			let pkg          = this.__pkg;
			let project      = this.settings.project;
			let sandbox      = this.sandbox;
			let stash        = this.stash;

			if (pkg !== null && stash !== null) {

				console.log('strainer: READ-DEPS ' + project);


				let namespaces = this.__namespaces;
				let knowledges = {};

				if (sandbox === '/libraries/lychee') {
					namespaces['lychee'] = '.';
				} else {
					namespaces['lychee'] = '/libraries/lychee';
				}


				let environments = pkg.buffer.build.environments || null;
				if (environments !== null) {

					for (let id in environments) {

						let packages = environments[id].packages || null;
						if (packages !== null) {

							packages.forEach(function(raw) {

								let ns  = raw[0];
								let url = raw[1].substr(0, raw[1].length - 11);

								if (namespaces[ns] === undefined) {

									namespaces[ns] = url;

								} else if (namespaces[ns] !== url) {

									errors.push({
										url:     pkg.url,
										rule:    'pkg-error',
										line:    0,
										column:  0,
										message: 'Package "' + ns + '" in environment "' + id + '" has wrong url "' + url + '".'
									});

								}

							});

						}

					}

				}


				this.configs.forEach(function(config) {

					let header = config.buffer.header;

					if (header.requires.length > 0) {

						header.requires.forEach(function(id) {

							let ns = id.split('.').shift();

							if (
								dependencies.indexOf(id) === -1
								&& namespaces[ns] !== '.'
							) {
								dependencies.push(id);
							}

						});

					}

					if (header.includes.length > 0) {

						header.includes.forEach(function(id) {

							let ns = id.split('.').shift();

							if (
								dependencies.indexOf(id) === -1
								&& namespaces[ns] !== '.'
							) {
								dependencies.push(id);
							}

						});

					}

				});


				if (dependencies.length > 0) {

					stash.bind('batch', function(type, assets) {

						for (let ns in namespaces) {

							let prefix = namespaces[ns];
							let asset  = assets.find(function(asset) {
								return asset.url.startsWith(prefix);
							}) || null;

							if (asset !== null) {
								knowledges[ns] = asset;
							}

						}


						setTimeout(function() {

							stash.bind('batch', function(type, assets) {

								for (let a = 0, al = assets.length; a < al; a++) {
									this.configs.push(assets[a]);
								}

								oncomplete(true);

							}, this, true);

							stash.batch('read', dependencies.map(function(id) {

								let ns        = id.split('.')[0];
								let knowledge = knowledges[ns] || null;
								if (knowledge !== null && knowledge.buffer !== null) {
									return _get_knowledge_url(id, knowledge.buffer);
								}

								return null;

							}).filter(function(url) {
								return url !== null;
							}));

						}.bind(this), 500);

					}, this, true);


					stash.batch('read', Object.values(namespaces).filter(function(val) {
						return val !== '.';
					}).map(function(val) {
						return val + '/api/strainer.pkg';
					}));

				} else {

					oncomplete(true);

				}

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('trace-api', function(oncomplete) {

			let that    = this;
			let configs = this.configs;
			let project = this.settings.project;

			if (configs.length > 0) {

				console.log('strainer: TRACE-API ' + project);


				configs.forEach(function(config) {

					let header     = config.buffer.header;
					let result     = config.buffer.result;
					let memory     = config.buffer.memory;

					let methods    = result.methods    || {};
					let properties = result.properties || {};

					for (let pid in properties) {

						let value = properties[pid].value;
						if (value.type === 'undefined' && value.chunk !== undefined) {

							let references = _trace_memory.call(that, memory, value.chunk);
							if (references.length === 1) {
								properties[pid].value = references[0];
							}

						}

					}


					for (let mid in methods) {

						let values = methods[mid].values;
						if (values.length > 0) {

							for (let v = 0, vl = values.length; v < vl; v++) {

								let value = values[v];
								if (value.type === 'undefined' && value.chunk !== undefined) {

									let references = _trace_memory.call(that, memory, value.chunk);
									if (references.length > 0) {

										values.splice(v, 1);
										vl--;
										v--;

										for (let r = 0, rl = references.length; r < rl; r++) {

											let reference = references[r];
											if (values.indexOf(reference) === -1) {
												values.push(reference);
											}

										}

									}

								}

							}

						}

					}

				});

			}


			oncomplete(true);

		}, this);

		this.bind('clean-deps', function(oncomplete) {

			let configs      = this.configs;
			let dependencies = this.__dependencies;
			let namespaces   = this.__namespaces;

			if (dependencies.length > 0) {

				for (let c = 0, cl = configs.length; c < cl; c++) {

					let config     = configs[c];
					let identifier = config.buffer.header.identifier;
					if (identifier !== null) {

						let ns = identifier.split('.')[0];
						if (
							namespaces[ns] !== undefined
							&& namespaces[ns] !== '.'
							&& dependencies.indexOf(identifier) !== -1
						) {

							configs.splice(c, 1);
							cl--;
							c--;

						}

					}

				}

			}


			oncomplete(true);

		}, this);

		this.bind('write-api', function(oncomplete) {

			let project = this.settings.project;
			let stash   = this.stash;

			if (project !== null && stash !== null) {

				console.log('strainer: WRITE-API ' + project);


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

						for (let c = 0, cl = configs.length; c < cl; c++) {

							let config     = configs[c];
							let identifier = config.buffer.header.identifier;
							let knowledge  = {};
							let result     = config.buffer.result;


							knowledge.settings   = Object.keys(result.settings);
							knowledge.properties = Object.keys(result.properties);
							knowledge.enums      = Object.keys(result.enums);
							knowledge.events     = Object.keys(result.events);
							knowledge.methods    = Object.keys(result.methods).map(function(mid) {
								return [ mid, result.methods[mid].hash ];
							});


							buffer[config.url] = {
								identifier: identifier,
								timestamp:  Date.now(),
								knowledge:  knowledge
							};

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



		/*
		 * FLOW
		 */

		this.then('read');

		this.then('check-eslint');
		this.then('check-api');

		this.then('read-deps');
		this.then('trace-api');
		this.then('clean-deps');

		this.then('write-eslint');
		this.then('write-api');
		this.then('write-pkg');

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
			data['constructor'] = 'strainer.flow.Check';


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

