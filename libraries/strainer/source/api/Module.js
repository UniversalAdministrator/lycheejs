
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

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _find_memory = function(key, stream) {

		let str1 = 'const ' + key + ' = ';
		let str2 = '\n\t};';

		let i1 = stream.indexOf(str1);
		let i2 = stream.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {
			return stream.substr(i1 + str1.length, i2 - i1 - str1.length + str2.length).trim();
		}

		return 'undefined';

	};

	const _parse_memory = function(memory, stream, errors) {

		let i1 = stream.indexOf('.exports(function(lychee, global, attachments) {');
		let i2 = stream.indexOf('\n\tconst Module =');

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 48, i2 - i1 - 48).trim();
			if (body.length > 0) {

				body.split('\n')
					.map(function(line) {
						return line.trim();
					}).filter(function(line) {
						return line.startsWith('const ');
					}).forEach(function(line) {

						let tmp = line.substr(6).trim();
						let i1  = tmp.indexOf('=');
						if (i1 !== -1) {

							let key   = tmp.substr(0, i1).trim();
							let chunk = tmp.substr(i1 + 1).trim();

							if (key !== '' && chunk !== '') {

								if (chunk.startsWith('function(')) {

									chunk = _find_memory(key, stream);

									if (chunk.endsWith(';')) {
										chunk = chunk.substr(0, chunk.length - 1);
									}

									memory[key] = {
										body:       chunk,
										hash:       _PARSER.hash(chunk),
										parameters: _PARSER.parameters(chunk),
										values:     _PARSER.values(chunk)
									};

								} else {

									memory[key] = _PARSER.detect(chunk);

								}

							}

						}

					});

			}

		}

	};

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
				let params = method.parameters;
				let values = method.values;


				if (params.length > 0) {

					let found = params.filter(function(other) {
						return other.type === 'undefined' && other.value === undefined;
					}).map(function(other) {
						return other.name;
					});

					if (found.length > 0) {

						if (/^(control|render|update|deserialize|serialize)$/g.test(mid) === false) {

							errors.push({
								ruleId:     'no-parameter-value',
								methodName: mid,
								fileName:   null,
								message:    'Invalid parameter values for "' + found.join('", "') + '" for method "' + mid + '()".'
							});

						}

					}

				}

				if (values.length === 0) {

					errors.push({
						ruleId:     'no-return-value',
						methodName: mid,
						fileName:   null,
						message:    'Invalid return value for method "' + mid + '()".'
					});


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

			asset = _validate_asset(asset) === true ? asset : null;


			let errors = [];
			let memory = {};
			let result = {
				constructor: {},
				settings:    {},
				properties:  {},
				enums:       {},
				events:      {},
				methods:     {}
			};

			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');

				_parse_memory(memory, stream, errors);
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

			}


			return {
				errors: errors,
				memory: memory,
				result: result
			};

		}

	};


	return Module;

});

