#!/usr/bin/env node



(function(global) {

	const _fs        = require('fs');
	const _path      = require('path');
	const _process   = global.process;
	const _CORE      = [];
	const _ASSETS    = {};
	const _BOOTSTRAP = {};
	let   _PACKAGE   = null;
	const _PLATFORM  = _process.argv[2] || null;
	const _ROOT      = _path.resolve(_process.cwd(), '.');



	/*
	 * CONSOLE POLYFILL
	 */

	const _INDENT       = '    ';
	const _INDENT_PLAIN = '           ';
	const _WHITESPACE   = new Array(512).fill(' ').join('');

	const _console_log = function(value) {

		let line = ('(L) ' + value).replace(/\t/g, _INDENT).trimRight();
		let maxl = process.stdout.columns - 2;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		process.stdout.write('\u001b[49m\u001b[97m ' + line + ' \u001b[39m\u001b[49m\u001b[0m\n');

	};

	const _console_error = function(value) {

		let line = ('(E) ' + value).replace(/\t/g, _INDENT).trimRight();
		let maxl = process.stdout.columns - 2;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		process.stderr.write('\u001b[41m\u001b[97m ' + line + ' \u001b[39m\u001b[49m\u001b[0m\n');

	};



	/*
	 * SOURCE MAP
	 */

	const _BASE64     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	const _base64_vlq = function(raw) {

		let val = '';
		let vlq = raw < 0 ? ((-raw) << 1) + 1 : (raw << 1) + 0;

		do {

			let digit = vlq & ((1 << 5) - 1);

			vlq >>>= 5;

			if (vlq > 0) {
				digit |= (1 << 5);
			}

			val += _BASE64[digit];

		} while (vlq > 0);

		return val;

	};

	const _get_sourcemaps = function(file, entries) {

		let last_id   = 0;
		let last_line = 0;
		let remaining = 0;

		let sources  = entries.map(function(entry) {
			return entry.file;
		});

		let mappings = entries.map(function(entry) {

			let id    = sources.indexOf(entry.file);
			let code  = entry.code;
			let diff  = entry.diff || 0;
			let lines = code.split('\n').length - 1;
			let chunk = '';

			chunk += remaining === 0 ? "A" : "," + _base64_vlq(remaining); // build column 0
			chunk += _base64_vlq(id - last_id);                            // file index
			chunk += _base64_vlq(1  - last_line - diff);                   // line index
			chunk += _base64_vlq(0);                                       // source column 0
			chunk += Array(lines).join(';AACA');

			last_id   = id;
			last_line = lines;


			let check = code.lastIndexOf('\n');
			if (check !== -1) {
				remaining = code.length - check - 1;
			} else {
				remaining = code.length;
			}

			chunk += remaining === 0 ? ';' : (lines !== 0 ? ';AACA' : '');

			if (remaining !== 0) {
				last_line++;
			}

			return chunk;

		}).join('');


		return {
			version:  3,
			file:     file,
			sources:  sources,
			mappings: mappings
		};

		return null;

	};



	/*
	 * ECMA POLYFILL
	 */

	(function() {

		if (typeof Object.values !== 'function') {

			Object.values = function(object) {

				if (object !== Object(object)) {
					throw new TypeError('Object.values called on a non-object');
				}


				let values = [];

				for (let prop in object) {

					if (Object.prototype.hasOwnProperty.call(object, prop)) {
						values.push(object[prop]);
					}

				}

				return values;

			};

		}

	})();



	/*
	 * HELPERS
	 */

	const _is_directory = function(path) {

		try {
			let stat = _fs.lstatSync(path);
			return stat.isDirectory();
		} catch (err) {
			return false;
		}

	};

	const _is_file = function(path) {

		try {
			let stat = _fs.lstatSync(path);
			return stat.isFile();
		} catch (err) {
			return false;
		}

	};

	const _create_directory = function(path, mode) {

		if (mode === undefined) {
			mode = 0o777 & (~_process.umask());
		}


		let is_directory = false;

		try {

			is_directory = _fs.lstatSync(path).isDirectory();

		} catch (err) {

			if (err.code === 'ENOENT') {

				if (_create_directory(_path.dirname(path), mode) === true) {
					_fs.mkdirSync(path, mode);
				}

				try {
					is_directory = _fs.lstatSync(path).isDirectory();
				} catch (err) {
				}

			}

		}


		return is_directory;

	};

	const _remove_directory = function(path) {

		path = _path.resolve(path);


		if (_is_directory(path) === true) {

			_fs.readdirSync(path).forEach(function(file) {

				if (_is_directory(path + '/' + file) === true) {
					_remove_directory(path + '/' + file);
				} else {
					_fs.unlinkSync(path + '/' + file);
				}

			});

			_fs.rmdirSync(path);

		}

	};

	const _get_projects = function(path) {

		let projects      = [];
		let projects_root = _path.resolve(_ROOT, path);

		if (_is_directory(projects_root) === true) {

			projects = _fs.readdirSync(projects_root).filter(function(file) {
				return _is_directory(projects_root + '/' + file) === true;
			}).map(function(file) {
				return path + '/' + file;
			});

		}

		return projects;

	};

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

	const _package_assets = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', true);
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

	const _package_definitions = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', false);
			}

		}


		return files.map(function(value) {
			return value.substr(1);
		}).filter(function(value) {
			return value.startsWith('core') === false;
		}).filter(function(value) {
			return value.startsWith('platform') === false;
		}).map(function(value) {
			return 'lychee.' + value.split('.')[0].split('/').join('.');
		}).filter(function(value) {
			return value.includes('__') === false;
		});

	};

	const _package_files = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', false);
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



	/*
	 * 0: ENVIRONMENT CHECK (SYNC)
	 */

	(function(libraries, projects) {

		let errors = 0;

		_console_log('Checking Environment');


		if (libraries.indexOf('./libraries/lychee') !== -1) {
			_console_log('\tprocess cwd: OKAY');
		} else {
			_console_log('\tprocess cwd: FAIL (' + _ROOT + ' is not the lychee.js directory)');
			errors++;
		}


		let data = null;

		if (_is_file(_path.resolve(_ROOT, './libraries/lychee/lychee.pkg')) === true) {

			try {
				data = JSON.parse(_fs.readFileSync(_path.resolve(_ROOT, './libraries/lychee/lychee.pkg')));
			} catch (err) {
				data = null;
			}

		}


		if (data !== null) {
			_PACKAGE = data;
			_console_log('\t./libraries/lychee/lychee.pkg: OKAY');
		} else {
			_console_log('\t./libraries/lychee/lychee.pkg: FAIL (Invalid JSON)');
			errors++;
		}


		if (_is_file(_path.resolve(_ROOT, './libraries/lychee/source/platform/node/bootstrap.js')) === true) {

			global = {};

			try {

				require(_path.resolve(_ROOT, './libraries/lychee/source/core/lychee.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Asset.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Package.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Definition.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Environment.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Specification.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Simulation.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/platform/node/features.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/platform/node/bootstrap.js'));

				lychee.init(null);

			} catch (err) {

				_console_error('+---------------------------------+');
				_console_error('| Syntax Error in lychee.js Core  |');
				_console_error('+---------------------------------+');
				_console_error('\n');

				('' || err.stack).split('\n').forEach(function(line) {
					_console_error(line);
				});

				errors++;

			}

		}


		if (errors === 0) {
			console.info('SUCCESS');
		} else {
			_console_error('FAILURE');
			_process.exit(1);
		}


		console.log('Cleaning lychee.js Projects and Libraries');

		libraries.forEach(function(path) {

			let real = _path.resolve(_ROOT, path);

			if (_is_directory(real + '/api')) {
				_remove_directory(real + '/api');
			}

			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
			}

		});

		projects.forEach(function(path) {

			let real = _path.resolve(_ROOT, path);

			if (_is_directory(real + '/api')) {
				_remove_directory(real + '/api');
			}

			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
			}

		});

		console.info('SUCCESS');

	})(_get_projects('./libraries'), _get_projects('./projects'));



	/*
	 * 1: LIBRARY DISTRIBUTION (SYNC)
	 */

	(function() {

		console.log('Distributing lychee.js Library');


		let dist = _package_definitions(_PACKAGE).filter(function(value) {
			return value !== 'lychee.DIST';
		});

		let code = (function () {/*
			lychee.define('lychee.DIST').requires([{{requires}}]).exports(function(lychee, global, attachments) {

				const Module = {

					// deserialize: function(blob) {},

					serialize: function() {

						return {
							'reference': 'lychee.DIST',
							'arguments': []
						};

					}

				};

				return Module;

			});

		*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].split('\n').map(function(val) {
			return val.substr(3);
		}).join('\n').replace('{{requires}}', '\n\t' + dist.map(function(val) {
			return '\'' + val + '\'';
		}).join(',\n\t') + '\n');


		let result = true;
		let path   = _path.resolve(_ROOT, './libraries/lychee/source/DIST.js');
		let dir    = _path.dirname(path);

		if (_is_directory(dir) === false) {
			_create_directory(dir);
		}


		if (_is_directory(dir) === true) {

			try {
				_fs.writeFileSync(path, code, 'utf8');
			} catch (err) {
				result = false;
			}

		} else {
			result = false;
		}


		if (result === true) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	})();



	/*
	 * 2: CORE GENERATION (SYNC)
	 */

	(function() {

		let errors = 0;
		let files  = _package_files(_PACKAGE).filter(function(value) {
			return value.startsWith('core/');
		});

		if (files.indexOf('core/lychee.js') !== 0) {

			files.reverse();
			files.push(files.splice(files.indexOf('core/lychee.js'), 1)[0]);
			files.reverse();

		}


		console.log('Generating lychee.js Core');


		files.forEach(function(file) {

			let path = _path.resolve(_ROOT, './libraries/lychee/source/' + file);
			if (_is_file(path) === true) {

				_CORE.push({
					code: _fs.readFileSync(path, 'utf8'),
					file: file
				});

			} else {
				errors++;
			}

		});


		if (errors === 0) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	})();



	/*
	 * 3. PLATFORM DETECTION (SYNC)
	 */

	(function() {

		let errors = 0;

		console.log('Injecting lychee.js Fertilizer Platforms');


		let platforms = Object.keys(_PACKAGE.source.tags.platform);
		if (platforms.length > 0) {

			let code = '';

			code += '\n';
			code += JSON.stringify(platforms) + '.forEach(function(platform) {\n';
			code += '\tif (lychee.PLATFORMS.includes(platform) === false) {\n';
			code += '\t\tlychee.PLATFORMS.push(platform);\n';
			code += '\t}\n';
			code += '});\n';
			code += '\n';

			_CORE.push({
				code: code,
				file: '@platforms.js'
			});

		}

		if (errors === 0) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	})();



	/*
	 * 3: FEATURE DETECTION (SYNC)
	 */

	(function() {

		let errors = 0;


		console.log('Injecting lychee.js Fertilizer Features');


		let platforms = Object.keys(_PACKAGE.source.tags.platform);
		if (platforms.length > 0) {

			platforms.forEach(function(platform) {

				let code = null;
				let path = _path.resolve(_ROOT, './libraries/lychee/source/platform/' + platform + '/features.js');

				try {
					code = _fs.readFileSync(path, 'utf8');
				} catch (err) {
					code = null;
					errors++;
				}

				if (code !== null) {

					_CORE.push({
						code: code,
						file: 'platform/' + platform + '/features.js'
					});

				}

			});

		}


		if (errors === 0) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	})();



	/*
	 * 4: PLATFORM GENERATION (ASYNC)
	 */

	(function() {

		let errors    = 0;
		let assets    = _package_assets(_PACKAGE).filter(function(value) {
			return value.startsWith('platform/') && value.endsWith('.js') === false;
		});

		// XXX: This makes sure bootstrap.js comes first, always
		let files = _package_files(_PACKAGE).filter(function(value) {
			return value.startsWith('platform/') && value.endsWith('/bootstrap.js');
		}).concat(_package_files(_PACKAGE).filter(function(value) {
			return value.startsWith('platform/') && value.endsWith('/bootstrap.js') === false;
		}).filter(function(value) {
			return value.startsWith('platform/') && value.endsWith('/features.js') === false;
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}));

		let platforms = Object.keys(_PACKAGE.source.tags.platform).filter(function(platform) {
			return _PLATFORM !== null ? platform === _PLATFORM : true;
		});


		console.log('Generating lychee.js Fertilizer Adapters');


		assets.forEach(function(path) {

			let asset = new lychee.Asset('/libraries/lychee/source/' + path);
			if (asset !== null) {

				asset.onload = function(result) {

					if (result === true) {

						let id  = path.split('.')[0];
						let ext = path.split('/').pop().split('.').slice(1).join('.');

						if (_ASSETS[id] === undefined) {
							_ASSETS[id] = {};
						}

						_ASSETS[id][ext] = lychee.serialize(this);

					}

				};

				asset.load();

			}

		});


		setTimeout(function() {

			platforms.forEach(function(platform) {

				let base = (platform.indexOf('-') ? _BOOTSTRAP[platform.split('-')[0]] : null) || null;
				if (base !== null) {
					_BOOTSTRAP[platform] = Array.from(base);
				} else {
					_BOOTSTRAP[platform] = [];
				}


				let prefix = 'platform/' + platform + '/';

				files.filter(function(value) {
					return value.startsWith(prefix) === true;
				}).map(function(value) {
					return value.substr(prefix.length);
				}).forEach(function(adapter) {

					let file = prefix + adapter;
					let id   = file.split('.').slice(0, -1).join('.');
					let path = _path.resolve(_ROOT, './libraries/lychee/source/' + file);

					if (_is_file(path) === true) {

						let code = _fs.readFileSync(path, 'utf8');

						if (adapter === 'bootstrap.js') {

							_BOOTSTRAP[platform].push({
								code: code,
								file: file
							});

						} else if (_ASSETS[id] !== undefined) {

							let i1 = code.indexOf('.exports(');
							if (i1 !== -1) {

								let diff = 0;
								let tmp  = [];
								for (let ext in _ASSETS[id]) {
									tmp.push('\n\t"' + ext + '": lychee.deserialize(' + JSON.stringify(_ASSETS[id][ext]) + ')');
								}

								let inject = '.attaches({' + (tmp.length > 0 ? tmp.join(',') : '') + '\n})';

								code = code.substr(0, i1) + inject + code.substr(i1, code.length - i1);
								diff = inject.split('\n').length - 1;

								_BOOTSTRAP[platform].push({
									code: code,
									diff: diff,
									file: file
								});

							} else {

								_BOOTSTRAP[platform].push({
									code: code,
									file: file
								});

							}

						} else {

							_BOOTSTRAP[platform].push({
								code: code,
								file: file
							});

						}

					}

				});

			});


			platforms.forEach(function(platform) {

				if (_BOOTSTRAP[platform].length === 0) {
					delete _BOOTSTRAP[platform];
				}

			});


			for (let platform in _BOOTSTRAP) {

				let sources = Array.from(_CORE).concat(_BOOTSTRAP[platform]).map(function(src) {

					return {
						code: src.code,
						diff: src.diff || 0,
						file: src.file.startsWith('@') ? src.file : '/libraries/lychee/source/' + src.file
					};

				});


				let file   = '/libraries/lychee/build/' + platform + '/core.js';
				let maps   = _get_sourcemaps(file, sources);
				let path   = _path.resolve(_ROOT, './' + file);
				let result = true;


				let folder = _path.dirname(path);
				if (_is_directory(folder) === false) {
					_create_directory(folder);
				}

				if (_is_directory(folder) === true) {

					let code = sources.map(function(src) {
						return src.code;
					}).join('');

					try {
						_fs.writeFileSync(path, code, 'utf8');
					} catch (err) {
						result = false;
					}


					let json = JSON.stringify(maps, null, '\t');

					try {
						_fs.writeFileSync(path + '.map', json, 'utf8');
					} catch (err) {
					}

				} else {
					result = false;
				}


				if (result === false) {
					console.log('\t' + platform + ': FAILURE (Could not write to "' + path + '")');
					errors++;
				} else {
					console.log('\t' + platform + ': SUCCESS');
				}

			}


			if (errors === 0) {
				console.info('SUCCESS');
			} else {
				console.error('FAILURE');
				_process.exit(1);
			}

		}, 1000);

	})();

})(typeof global !== 'undefined' ? global : this);

