
lychee.define('strainer.plugin.API').requires([
	'strainer.api.Callback',
	'strainer.api.Composite',
	'strainer.api.Core',
	'strainer.api.Definition',
	'strainer.api.Module',
	'strainer.api.Specification',
	'strainer.fix.API'
]).exports(function(lychee, global, attachments) {

	const _FIXES = lychee.import('strainer.fix.API');
	const _api   = {
		Callback:      lychee.import('strainer.api.Callback'),
		Composite:     lychee.import('strainer.api.Composite'),
		Core:          lychee.import('strainer.api.Core'),
		Definition:    lychee.import('strainer.api.Definition'),
		Module:        lychee.import('strainer.api.Module'),
		Specification: lychee.import('strainer.api.Specification')
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
				'reference': 'strainer.plugin.API',
				'arguments': []
			};

		},

		check: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let header = null;
				let report = null;
				let api    = null;
				let stream = asset.buffer.toString('utf8');
				let first  = stream.trim().split('\n')[0];


				let is_core          = asset.url.startsWith('/libraries/lychee/source/core') && first.endsWith('(function(global) {');
				let is_definition    = first.startsWith('lychee.define(');
				let is_specification = first.startsWith('lychee.specify(');
				let i_callback       = stream.lastIndexOf('return Callback;');
				let i_composite      = stream.lastIndexOf('return Composite;');
				let i_module         = stream.lastIndexOf('return Module;');
				let i_check          = Math.max(i_callback, i_composite, i_module);
				let is_callback      = i_check !== -1 && i_check === i_callback;
				let is_composite     = i_check !== -1 && i_check === i_composite;
				let is_module        = i_check !== -1 && i_check === i_module;


				if (is_definition === true) {
					header = _api['Definition'].check(asset);
				} else if (is_specification === true) {
					header = _api['Specification'].check(asset);
				} else if (is_core === true) {
					header = _api['Core'].check(asset);
				} else {

					if (asset.url.includes('/review/')) {
						header = _api['Specification'].check(asset);
					} else if (asset.url.includes('/source/')) {
						header = _api['Definition'].check(asset);
					} else {

						// XXX: autofix assumes lychee.Definition syntax
						header = _api['Definition'].check(asset);

					}

				}


				if (is_callback === true) {
					api = _api['Callback'] || null;
				} else if (is_composite === true) {
					api = _api['Composite'] || null;
				} else if (is_module === true) {
					api = _api['Module'] || null;
				}


				if (api !== null) {

					report = api.check(asset, header.result);

				} else {

					// XXX: autofix assumes lychee.Definition
					report = {
						memory: {},
						errors: [],
						result: {
							constructor: {
								body:       null,
								hash:       null,
								parameters: []
							},
							settings:    {},
							properties:  {},
							enums:       {},
							events:      {},
							methods:     {}
						}
					};

				}


				if (header !== null && report !== null) {

					if (header.errors.length > 0) {

						let errors = [];

						errors.push.apply(errors, header.errors);
						errors.push.apply(errors, report.errors);

						report.errors = errors;

					}


					report.errors.forEach(function(err) {

						if (err.url === null) {
							err.url = asset.url;
						}

					});


					if (is_callback === true) {
						header.result.type = 'Callback';
					} else if (is_composite === true) {
						header.result.type = 'Composite';
					} else if (is_module === true) {
						header.result.type = 'Module';
					}


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

			}


			return null;

		},

		fix: function(asset, report) {

			asset  = _validate_asset(asset) === true ? asset  : null;
			report = report instanceof Object        ? report : null;


			let filtered = [];

			if (asset !== null && report !== null) {

				let code     = asset.buffer.toString('utf8');
				let modified = false;


				report.errors.forEach(function(err) {

					let rule = err.rule;

					let fix = _FIXES[rule] || null;
					if (fix !== null) {

						let result = fix(err, report, code);
						if (result !== null) {
							code     = result;
							modified = true;
						} else {
							filtered.push(err);
						}

					} else {

						filtered.push(err);

					}

				});


				if (modified === true) {
					asset.buffer    = new Buffer(code, 'utf8');
					asset._MODIFIED = true;
				}

			}


			return filtered;

		},

		transcribe: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let report = asset.buffer || {
					header: {},
					memory: {},
					errors: [],
					result: {}
				};


				// TODO: Replace asset.buffer.header.identifier
				// in case library's definition starts with library namespace


				let api    = null;
				let header = null;
				let code   = null;


				let is_core       = asset.url.startsWith('/libraries/lychee/source/core');
				let is_definition = is_core === false && asset.url.includes('/api/');


				if (is_definition === true) {
					header = _api['Definition'].transcribe(asset);
				} else if (is_core === true) {
					header = _api['Core'].transcribe(asset);
				}


				let type = report.header.type || null;
				if (type === 'Callback') {
					api = _api['Callback'] || null;
				} else if (type === 'Composite') {
					api = _api['Composite'] || null;
				} else if (type === 'Module') {
					api = _api['Module'] || null;
				}


				if (header !== null && api !== null) {

					let tmp = api.transcribe(asset);
					if (tmp !== null) {
						code = header.replace('%BODY%', tmp);
					}

				}


				return code;

			}


			return null;

		}

	};


	return Module;

});

