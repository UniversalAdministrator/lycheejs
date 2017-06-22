
lychee.define('strainer.plugin.ESLINT').tags({
	platform: 'node'
}).supports(function(lychee, global) {

	try {

		global.require('eslint');

		return true;

	} catch (err) {

		// XXX: We warn the user later, which
		// is better than generic failure

		return true;

	}


	// XXX: See above
	// return false;

}).exports(function(lychee, global, attachments) {

	const _CONFIG   = new Config('/.eslintrc.json');
	let   _eslint   = null;
	let   _escli    = null;
	const _auto_fix = function(line, err) {

		if (err.fix) {
			return line.substr(0, err.fix.range[0]) + err.fix.text + line.substr(err.fix.range[1]);
		}

		return line;

	};



	const _TAB_STR = new Array(128).fill('\t').join('');
	const _FIXES   = {

		/*
		 * AUTO FIXES
		 */

		'array-bracket-spacing': _auto_fix,
		'comma-dangle':          _auto_fix,
		'comma-spacing':         _auto_fix,
		'keyword-spacing':       _auto_fix,
		'no-trailing-spaces':    _auto_fix,
		'no-var':                _auto_fix,
		'object-curly-spacing':  _auto_fix,
		'semi-spacing':          _auto_fix,
		'space-before-blocks':   _auto_fix,
		'space-in-parens':       _auto_fix,
		'space-infix-ops':       _auto_fix,
		'space-unary-ops':       _auto_fix,


		/*
		 * MANUAL FIXES
		 */

		'brace-style': function(line, err) {

			if (err.fix) {

				let prefix = line.substr(0, err.fix.range[0]);
				let suffix = line.substr(err.fix.range[1]);


				let tmp = prefix.split('\n').pop().split('');
				let tl  = tmp.indexOf(tmp.find(function(val) {
					return val !== '\t';
				}));


				if (err.message.startsWith('Statement inside of curly braces')) {

					tl += 1;

				} else if (err.message.startsWith('Closing curly brace')) {

					tl -= 1;

				}


				let tabs = _TAB_STR.substr(0, tl);
				if (tabs.length > 0) {
					return prefix.trimRight() + err.fix.text + tabs + suffix.trimLeft();
				}


				return prefix + err.fix.text + suffix;

			}


			return line;

		},

		'indent': function(line, err, code, c) {

			if (err.fix) {

				// XXX: The indent plugin in eslint is broken
				// and gives false err.fix when mixed tabs
				// and whitespaces are in place.

				let prev = null;

				for (let p = c - 1; p >= 0; p--) {

					let tmp = code[p];
					if (tmp.trim() !== '') {
						prev = tmp;
						break;
					}

				}


				let text = err.fix.text;

				if (prev !== null && prev.startsWith('\t')) {

					let tmp = prev.split('\n').pop().split('');
					let tl  = tmp.indexOf(tmp.find(function(val) {
						return val !== '\t';
					}));

					if (prev.endsWith('{')) {
						tl += 1;
					} else if (line.endsWith('}') || line.endsWith('});')) {
						tl -= 1;
					}

					text = _TAB_STR.substr(0, tl);

				}


				return line.substr(0, err.fix.range[0]) + text + line.substr(err.fix.range[1]);

			}


			return line;

		},

		'no-mixed-spaces-and-tabs': function(line, err, code, c) {

			let prev = null;

			for (let p = c - 1; p >= 0; p--) {

				let tmp = code[p];
				if (tmp.trim() !== '') {
					prev = tmp;
					break;
				}

			}


			let suffix = line.trimLeft();
			let t      = line.indexOf(suffix);
			let text   = line.substr(0, t).split(' ').join('\t');


			if (prev !== null && prev.startsWith('\t')) {

				let tmp = prev.split('\n').pop().split('');
				let tl  = tmp.indexOf(tmp.find(function(val) {
					return val !== '\t';
				}));

				if (prev.endsWith('{')) {
					tl += 1;
				} else if (line.endsWith('}') || line.endsWith('});')) {
					tl -= 1;
				}

				text = _TAB_STR.substr(0, tl);

			}


			return text + suffix;

		},

		'no-unused-vars': function(line, err) {

			let i1 = line.indexOf('let');
			let i2 = line.indexOf('const');
			let i3 = line.indexOf('=');
			let i4 = line.indexOf(';');


			if (i3 !== -1 && i4 !== -1) {

				if (i1 !== -1) {
					return line.substr(0, i1) + '// ' + line.substr(i1);
				} else if (i2 !== -1) {
					return line.substr(0, i2) + '// ' + line.substr(i2);
				}

			} else if (i3 !== -1) {

				if (i1 !== -1) {
					return line.substr(0, i1) + line.substr(i3 + 1).trim();
				} else if (i2 !== -1) {
					return line.substr(0, i2) + line.substr(i3 + 1).trim();
				}

			}


			return line;

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		try {

			_eslint = global.require('eslint');


		} catch (err) {

			console.log('\n');
			console.error('strainer.plugin.ESLINT: Please install ESLint globally.   ');
			console.error('                        sudo npm install -g eslint;       ');
			console.error('                        cd /opt/lycheejs; npm link eslint;');
			console.log('\n');

		}


		_CONFIG.onload = function() {

			let config = null;

			if (this.buffer instanceof Object) {

				config         = {};
				config.envs    = Object.values(this.buffer.env);
				config.globals = Object.values(this.buffer.globals).map(function(value) {
					return value + ':true';
				});

			}

			if (_eslint !== null && config !== null) {
				_escli = new _eslint.CLIEngine(config);
			}

		};

		_CONFIG.load();

	})();



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.plugin.ESLINT',
				'arguments': []
			};

		},

		check: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				if (_escli !== null && _eslint !== null) {

					let url    = asset.url;
					let config = _escli.getConfigForFile(lychee.ROOT.lychee + url);
					let source = asset.buffer.toString('utf8');
					let report = _eslint.linter.verify(source, config);


					return report;

				}

			}


			return [];

		},

		fix: function(asset, report) {

			report = report instanceof Array ? report : null;


			let filtered = [];

			if (report !== null) {

				let code  = asset.buffer.toString('utf8').split('\n');
				let range = [ 0 ];

				code.forEach(function(chunk, c) {
					range[c + 1] = range[c] + chunk.length + 1;
				});


				let prev_l    = -1;
				let prev_diff = 0;

				report.forEach(function(err) {

					let line = err.line;
					let rule = err.ruleId;
					let l    = line - 1;


					let fix = _FIXES[rule] || null;
					if (fix !== null) {

						let tmp = err.fix || null;
						if (tmp !== null && tmp.range instanceof Array) {

							let diff = 0;
							if (l === prev_l) {
								diff = prev_diff;
							}

							tmp.range = tmp.range.map(function(value) {
								return value - range[line - 1] + diff;
							});

						}

						let tmp1 = code[l];
						let tmp2 = fix(tmp1, err, code, l);

						if (l === prev_l) {
							prev_diff += tmp2.length - tmp1.length;
						} else {
							prev_diff = tmp2.length - tmp1.length;
							prev_l    = l;
						}


						code[l] = tmp2;

					} else {

						filtered.push(err);

					}

				});


				asset.buffer = new Buffer(code.join('\n'), 'utf8');

			}


			return filtered;

		}

	};


	return Module;

});

