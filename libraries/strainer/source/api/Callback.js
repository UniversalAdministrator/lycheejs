
lychee.define('strainer.api.Callback').requires([
	'strainer.api.PARSER'
]).exports(function(lychee, global, attachments) {

	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _parse_constructor = function(constructor, stream) {

		let i1 = stream.indexOf('\n\tconst Callback =');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 19, i2 - i1 - 16).trim();
			if (body.length > 0) {

				constructor.body       = body;
				constructor.hash       = _PARSER.hash(body);
				constructor.parameters = _PARSER.parameters(body);


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
				settings:    {},
				properties:  {},
				enums:       {},
				events:      {},
				methods:     {}
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

