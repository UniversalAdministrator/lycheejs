
lychee.define('strainer.plugin.ESLINT').tags({
	platform: 'node'
}).requires([
	'strainer.fix.ESLINT'
]).supports(function(lychee, global) {

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

	const _CONFIG = new Config('/.eslintrc.json');
	const _FIXES  = lychee.import('strainer.fix.ESLINT');
	let   _eslint = null;
	let   _escli  = null;



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


			let errors = [];

			if (asset !== null) {

				if (_escli !== null && _eslint !== null) {

					let url    = asset.url;
					let config = null;

					try {
						config = _escli.getConfigForFile(lychee.ROOT.lychee + url);
					} catch (err) {
						config = null;
					}


					// XXX: ESLint by default does ignore the config
					// given in its CLIEngine constructor -_-
					if (config === null) {

						try {
							config = _escli.getConfigForFile('/opt/lycheejs/bin/configure.js');
						} catch (err) {
							config = null;
						}

					}


					let source = asset.buffer.toString('utf8');
					let report = _escli.linter.verify(source, config);
					if (report.length > 0) {

						for (let r = 0, rl = report.length; r < rl; r++) {
							errors.push(report[r]);
						}

					}

				}

			}

			return errors;

		},

		fix: function(asset, report) {

			report = report instanceof Array ? report : null;


			let filtered = [];

			if (report !== null) {

				let code     = asset.buffer.toString('utf8').split('\n');
				let modified = false;
				let range    = [ 0 ];

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

						if (tmp1 !== tmp2) {
							code[l]  = tmp2;
							modified = true;
						}

					} else {

						filtered.push(err);

					}

				});


				if (modified === true) {
					asset.buffer    = new Buffer(code.join('\n'), 'utf8');
					asset._MODIFIED = true;
				}

			}

			return filtered;

		}

	};


	return Module;

});

