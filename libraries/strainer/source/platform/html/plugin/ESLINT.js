
lychee.define('strainer.plugin.ESLINT').tags({
	platform: 'html'
}).supports(function(lychee, global) {

	return true;

}).exports(function(lychee, global, attachments) {

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
		'semi':                  _auto_fix,
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

		}

	};



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

				// XXX: No implementation for HTML platform possible

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

