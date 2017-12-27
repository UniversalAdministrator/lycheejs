
lychee.define('strainer.api.Core').requires([
	'strainer.api.PARSER'
]).exports(function(lychee, global, attachments) {

	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _parse_identifier = function(result, stream, errors) {

		let i1  = stream.indexOf('lychee');
		let i2  = stream.indexOf('\n', i1);
		let tmp = stream.substr(0, i2).trim();

		if (tmp.includes(' = ') && tmp.endsWith('(function(global) {')) {

			let tmp1 = tmp.split(/lychee\.([A-Za-z]+)\s=(.*)/g);
			if (tmp1.length > 1) {

				let id = tmp1[1];
				if (id.charAt(0) === id.charAt(0).toUpperCase()) {
					result.identifier = 'lychee.' + id;
				}

			} else if (tmp === 'lychee = (function(global) {') {

				result.identifier = 'lychee';

			}

		} else {

			errors.push({
				url:       null,
				rule:      'no-define',
				reference: null,
				message:   'Invalid Definition (missing "<lychee.Definition> = (function(global) {})()").',
				line:      0,
				column:    0
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.api.Core',
				'arguments': []
			};

		},

		check: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			let errors = [];
			let result = {
				identifier: null,
				attaches:   {},
				tags:       {},
				requires:   [],
				includes:   [],
				supports:   {}
			};

			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');


				_parse_identifier(result, stream, errors);


				let i1 = stream.indexOf('=');
				let i2 = stream.indexOf(': (function(global) {\n', i1);
				let i3 = stream.indexOf('= (function(global) {\n');

				if (i1 === -1) {

					errors.push({
						url:       null,
						rule:      'no-core-define',
						reference: null,
						message:   'Invalid Core (missing assignment).',
						line:      0,
						column:    0
					});

				}

				if (i1 !== i3 && i2 === -1) {

					errors.push({
						url:       null,
						rule:      'no-core-exports',
						reference: null,
						message:   'Invalid Core (missing (function(global) {})().',
						line:      0,
						column:    0
					});

				}

			}


			return {
				errors: errors,
				result: result
			};

		}

	};


	return Module;

});

