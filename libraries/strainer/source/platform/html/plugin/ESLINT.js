
lychee.define('strainer.plugin.ESLINT').tags({
	platform: 'html'
}).requires([
	'strainer.fix.ESLINT'
]).supports(function(lychee, global) {

	return true;

}).exports(function(lychee, global, attachments) {

	const _FIXES = lychee.import('strainer.fix.ESLINT');



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

