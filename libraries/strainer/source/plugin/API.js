
lychee.define('strainer.plugin.API').requires([
	'strainer.api.Callback',
	'strainer.api.Composite',
	'strainer.api.Definition',
	'strainer.api.Module'
]).exports(function(lychee, global, attachments) {

	const _api     = {
		Callback:   lychee.import('strainer.api.Callback'),
		Composite:  lychee.import('strainer.api.Composite'),
		Definition: lychee.import('strainer.api.Definition'),
		Module:     lychee.import('strainer.api.Module')
	};
	const _TAB_STR = new Array(128).fill('\t').join('');
	const _FIXES   = {
		'no-return-value': function(err, report) {

			let method = report.result.methods[err.methodName] || null;
			if (method !== null) {

				let has_already = method.values.find(function(val) {
					return val.type !== 'undefined';
				});

				if (has_already !== undefined) {
					return true;
				}

			}

			return false;

		}
	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.plugin.API',
				'arguments': []
			};

		},

		check: function(asset) {

			let header = null;
			let report = null;
			let api    = null;
			let stream = asset.buffer.toString('utf8');


			let is_definition = stream.trim().startsWith('lychee.define(');
			let is_callback   = stream.lastIndexOf('return Callback;')  > 0;
			let is_composite  = stream.lastIndexOf('return Composite;') > 0;
			let is_module     = stream.lastIndexOf('return Module;')    > 0;


			// XXX: Well, yeah. Above algorithm will crash itself
			if (asset.url === '/libraries/strainer/source/plugin/API.js') {
				is_callback  = false;
				is_composite = false;
				is_module    = true;
			}


			if (is_callback === true) {
				api = _api['Callback'] || null;
			} else if (is_composite === true) {
				api = _api['Composite'] || null;
			} else if (is_module === true) {
				api = _api['Module'] || null;
			}


			if (is_definition === true) {
				header = _api['Definition'].check(asset);
			}


			if (api !== null) {
				report = api.check(asset);
			}


			if (header !== null && report !== null) {

				return {
					header: header.result,
					memory: report.memory,
					errors: report.errors,
					result: report.result
				};

			} else if (report !== null) {

				return {
					header: null,
					memory: report.memory,
					errors: report.errors,
					result: report.result
				};

			}


			return null;

		},

		fix: function(asset, report) {

			report = report instanceof Object ? report : null;


			let filtered = [];

			if (report !== null) {

				let url = asset.url;

				report.errors.forEach(function(err) {

					let rule    = err.ruleId;
					let message = err.message    || '';
					let method  = err.methodName || '';


					let fix = _FIXES[rule] || null;
					let tmp = false;

					if (fix !== null) {
						tmp = fix(err, report);
					}

					if (tmp === false) {

						let header = '("' + rule + '") ' + url;
						if (method !== '') {
							header += '#' + method;
						}

						filtered.push({
							error:   err,
							header:  header,
							message: message
						});

					}

				});

			}


			return filtered;

		}

	};


	return Module;

});

