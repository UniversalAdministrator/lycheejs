
lychee.define('strainer.api.Module').requires([
	'strainer.api.PARSER'
]).exports(function(lychee, global, attachments) {

	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * CACHES
	 */

	const _SERIALIZE = {
		body:       'function() { return {}; }',
		hash:       _PARSER.hash('function() { return {}; }'),
		parameters: [],
		values:     [{
			type: 'SerializationBlob',
			value: {
				'constructor': null,
				'arguments':   [],
				'blob':        null
			}
		}]
	};

	const _DESERIALIZE = {
		body: 'function(blob) {}',
		hash: _PARSER.hash('function(blob) {}'),
		parameters: [{
			name:  'blob',
			type:  'SerializationBlob',
			value: {}
		}],
		values: [{
			type:  'undefined',
			value: undefined
		}]
	};



	/*
	 * HELPERS
	 */

	const _parse_methods = function(methods, stream, errors) {

		let i1 = stream.indexOf('\n\tconst Module = {');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			stream.substr(i1 + 18, i2 - i1 - 18).trim().split('\n')
				.filter(function(line) {

					let tmp = line.trim();
					if (tmp.startsWith('// deserialize: function(blob) {}')) {

						methods['deserialize'] = Object.assign({}, _DESERIALIZE);
						return false;

					} else if (
						tmp === ''
						|| tmp.startsWith('//')
						|| tmp.startsWith('/*')
						|| tmp.startsWith('*/')
						|| tmp.startsWith('*')
					) {
						return false;
					}

					return true;

				})
				.join('\n')
				.split('\n\t\t}')
				.filter(function(chunk) {
					return chunk.trim() !== '';
				}).map(function(body) {

					if (body.startsWith(',')) {
						body = body.substr(1);
					}

					return (body.trim() + '\n\t\t}');

				}).forEach(function(code) {

					let name = code.split(':')[0].trim();
					if (name !== '') {

						let body = code.split(':').slice(1).join(':').trim();

						methods[name] = {
							body:       body,
							hash:       _PARSER.hash(body),
							parameters: _PARSER.parameters(body),
							values:     _PARSER.values(body)
						};

					}

				});


			let deserialize = methods['deserialize'];
			if (deserialize !== undefined) {
				if (deserialize.parameters.length === 0) deserialize.parameters = lychee.assignunlink([], _DESERIALIZE.parameters);
				if (deserialize.values.length === 0)     deserialize.values     = lychee.assignunlink([], _DESERIALIZE.values);
			}

			let serialize = methods['serialize'];
			if (serialize !== undefined) {
				if (serialize.parameters.length === 0) serialize.parameters = lychee.assignunlink([], _SERIALIZE.parameters);
				if (serialize.values.length === 0)     serialize.values     = lychee.assignunlink([], _SERIALIZE.values);
			}


			for (let mid in methods) {

				let method = methods[mid];
				let values = method.values;

				if (values.length === 0) {

					method.values.push({
						type:  'undefined',
						value: undefined
					});

				} else if (values.length > 1) {

					let found = values.find(function(other) {
						return other.type === 'undefined' && other.value === undefined;
					}) || null;

					if (found !== null) {

						errors.push({
							ruleId:     'no-return-value',
							methodName: mid,
							fileName:   null,
							message:    'No valid return values for method "' + mid + '()".'
						});

					}

				}

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
				'reference': 'strainer.api.Module',
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


			_parse_methods(result.methods, stream, errors);


			if (result.methods['serialize'] === undefined) {

				errors.push({
					ruleId:     'no-serialize',
					methodName: 'serialize',
					fileName:   null,
					message:    'No "serialize()" method.'
				});

			}

			if (result.methods['deserialize'] === undefined) {

				errors.push({
					ruleId:     'no-deserialize',
					methodName: 'deserialize',
					fileName:   null,
					message:    'No "deserialize()" method.'
				});

			}


			return {
				errors: errors,
				result: result
			};

		}

	};


	return Module;

});

