
lychee.define('strainer.api.Callback').requires([
	'lychee.crypto.MURMUR',
	'strainer.api.PARSER'
]).exports(function(lychee, global, attachments) {

	const _MURMUR = lychee.import('lychee.crypto.MURMUR');
	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _get_function_hash = function(str) {

		let hash = new _MURMUR();

		hash.update(str);

		return hash.digest().toString('hex');

	};

	const _parse_constructor = function(constructor, stream) {

		let i1 = stream.indexOf('\n\tconst Callback =');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 19, i2 - i1 - 15).trim();
			if (body.length > 0) {

				constructor.body       = body;
				constructor.hash       = _get_function_hash(body);
				constructor.parameters = [];

				let tmpa = body.substr(0, body.indexOf('\n')).trim();
				let tmpb = tmpa.split(/function\((.*)\)/g);
				if (tmpb.length > 1) {

					let tmpc = tmpb[1].trim();
					if (tmpc.length > 0) {

						constructor.parameters = tmpc.split(',').map(function(val) {

							return {
								name:  val.trim(),
								type:  'undefined',
								value: undefined
							};

						});

					}

				}


				body.split('\n').filter(function(line, l) {

					let tmp = line.trim();
					if (tmp === '' || tmp.startsWith('//')) {
						return false;
					} else if (tmp.startsWith('/*') || tmp.startsWith('*/') || tmp.startsWith('*')) {
						return false;
					}

					return true;

				}).slice(1, -1).forEach(function(line, l) {

					let tmp1 = line.trim();

					Object.values(constructor.parameters).forEach(function(parameter) {

						if (tmp1.startsWith(parameter.name) && tmp1.includes('=')) {

							let tmp2 = tmp1.substr(tmp1.indexOf('=') + 1).trim();
							let par2 = _PARSER.detect(tmp2);
							if (par2.type !== 'undefined') {

								if (parameter.type === par2.type) {

									if (parameter.value === undefined) {
										parameter.value = par2.value;
									}

								} else if (parameter.type === 'undefined') {

									parameter.type  = par2.type;
									parameter.value = par2.value;

								}

							}

						}

					});

				});

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.api.Callback',
				'arguments': []
			};

		},

		check: function(asset) {

			let stream = asset.buffer.toString('utf8');
			let errors = [];
			let result = {
				constructor: {},
				settings:    null,
				properties:  null,
				enums:       null,
				events:      null,
				methods:     null
			};


			_parse_constructor(result.constructor, stream, errors);


			return {
				errors: errors,
				result: result
			};

		}

	};


	return Module;

});

