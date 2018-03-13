
lychee.define('strainer.api.Callback').requires([
	'strainer.api.PARSER',
	'strainer.api.TRANSCRIPTOR'
]).exports(function(lychee, global, attachments) {

	const _PARSER       = lychee.import('strainer.api.PARSER');
	const _TRANSCRIPTOR = lychee.import('strainer.api.TRANSCRIPTOR');



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _find_reference = function(chunk, stream, fuzzy) {

		fuzzy = fuzzy === true;


		let ref = {
			chunk:  '',
			line:   0,
			column: 0
		};

		let lines = stream.split('\n');
		let line  = lines.findIndex(function(other) {

			if (fuzzy === true) {
				return other.includes(chunk.trim());
			} else {
				return other.trim() === chunk.trim();
			}

		});

		if (line !== -1) {

			ref.chunk = lines[line];
			ref.line  = line + 1;

			let column = lines[line].indexOf(chunk);
			if (column !== -1) {
				ref.column = column + 1;
			}

		}

		return ref;

	};

	const _find_memory = function(key, stream) {

		let str0 = 'const ' + key;
		let i0   = stream.indexOf(str0);
		let i1   = stream.indexOf('\n', i0);

		if (i0 !== -1 && i1 !== -1) {

			let tmp1 = stream.substr(i0 + str0.length, i1 - str0.length - i0).trim();
			if (
				tmp1.startsWith('=')
				&& tmp1.endsWith(';')
			) {

				return tmp1.substr(1, tmp1.length - 2).trim();

			} else if (
				tmp1.startsWith('=')
				&& tmp1.endsWith('{')
			) {

				let str2 = '\n\t};';
				let i2   = stream.indexOf(str2, i0);
				if (i2 !== -1) {

					let tmp2 = stream.substr(i0 + str0.length, i2 - str0.length - i0 + str2.length).trim();
					if (tmp2.startsWith('=') && tmp2.endsWith(';')) {

						return tmp2.substr(1, tmp2.length - 2).trim();

					}

				}

			}

		}


		return 'undefined';

	};

	const _parse_memory = function(memory, stream, errors) {

		let i1 = stream.indexOf('.exports(function(lychee, global, attachments) {');
		let i2 = stream.indexOf('\n\tconst Callback =');

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 48, i2 - i1 - 48);
			if (body.length > 0) {

				body.split('\n')
					.filter(line => {
						return line.startsWith('\tconst ') || line.startsWith('\tlet ');
					})
					.map(line => line.trim())
					.forEach(line => {

						let tmp = '';
						if (line.startsWith('const ')) {
							tmp = line.substr(6).trim();
						} else if (line.startsWith('let ')) {
							tmp = line.substr(4).trim();
						}


						let i1 = tmp.indexOf('=');
						if (i1 !== -1) {

							let key   = tmp.substr(0, i1).trim();
							let chunk = tmp.substr(i1 + 1).trim();

							if (key !== '' && chunk !== '') {

								if (chunk.endsWith(';')) {

									chunk = chunk.substr(0, chunk.length - 1);
									memory[key] = _PARSER.detect(chunk);

								} else if (chunk.startsWith('function(')) {

									chunk = _find_memory(key, stream);

									memory[key] = {
										type:       'function',
										body:       chunk,
										hash:       _PARSER.hash(chunk),
										parameters: _PARSER.parameters(chunk),
										values:     _PARSER.values(chunk)
									};

								} else {

									chunk = _find_memory(key, stream);
									memory[key] = _PARSER.detect(chunk);

								}

							}

						}

					});

			}

		}

	};

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

			asset = _validate_asset(asset) === true ? asset : null;


			let errors = [];
			let memory = {};
			let result = {
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
			};

			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');

				_parse_memory(memory, stream, errors);
				_parse_constructor(result.constructor, stream, errors);


				let ref = _find_reference('\n\tconst Callback = function(', stream, true);
				if (ref.chunk === '') {

					ref = _find_reference('Callback =', stream, true);

					errors.push({
						url:       null,
						rule:      'no-callback',
						reference: 'constructor',
						message:   'Callback is not constant (missing "const" declaration).',
						line:      ref.line,
						column:    ref.column
					});

				}

			}


			return {
				errors: errors,
				memory: memory,
				result: result
			};

		},

		transcribe: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let code = [];


				let api = asset.buffer;
				if (api instanceof Object) {

					let memory = api.memory || null;
					let result = api.result || null;


					if (memory instanceof Object) {

						for (let m in memory) {

							let chunk = _TRANSCRIPTOR.transcribe(m, memory[m]);
							if (chunk !== null) {
								code.push('\t' + chunk);
							}

						}

					}


					let construct = result.constructor || null;
					if (construct !== null) {

						let chunk = _TRANSCRIPTOR.transcribe('Callback', construct);
						if (chunk !== null) {
							code.push('');
							code.push('');
							code.push('\t' + chunk);
						}

					}


					code.push('');
					code.push('');
					code.push('\treturn Callback;');

				}


				if (code.length > 0) {
					return code.join('\n');
				}

			}


			return null;

		}

	};


	return Module;

});

