
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

		if (tmp.includes(' = ') && tmp.endsWith('function(global) {')) {

			let tmp1 = tmp.split(/lychee\.([A-Za-z]+)\s=(.*)/g);
			if (tmp1.length > 1) {

				let id = tmp1[1];
				if (id.charAt(0) === id.charAt(0).toUpperCase()) {
					result.identifier = 'lychee.' + id;
				}

			}

		} else {

			errors.push({
				url:       null,
				rule:      'no-identifier',
				reference: null,
				message:   'Invalid Definition identifier.',
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
				let first  = stream.trim().split('\n')[0];

				_parse_identifier(result, stream, errors);


				let check1 = first.endsWith('(function(global) {');
				let check2 = errors.find(function(other) {
					return other.rule === 'no-identifier';
				}) || null;


				if (check1 === true) {

					if (check2 !== null) {

						let name = asset.url.split('/').pop();
						if (name.endsWith('.js')) {
							name = name.substr(0, name.length - 3);
						}

						if (name.charAt(0) === name.charAt(0).toUpperCase()) {
							result.identifier = 'lychee.' + name;
						} else {
							result.identifier = name;
						}

						errors.splice(errors.indexOf(check2), 1);

					}

				} else {

					errors.push({
						url:       null,
						rule:      'no-core',
						reference: null,
						message:   'Invalid core Definition.',
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

