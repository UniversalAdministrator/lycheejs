
lychee.define('strainer.api.Composite').requires([
	'strainer.api.PARSER',
	'strainer.api.TRANSCRIPTOR'
]).exports(function(lychee, global, attachments) {

	const _PARSER       = lychee.import('strainer.api.PARSER');
	const _TRANSCRIPTOR = lychee.import('strainer.api.TRANSCRIPTOR');



	/*
	 * CACHES
	 */

	const _SERIALIZE = {
		type:       'function',
		body:       'function() { return {}; }',
		chunk:      'function() {',
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
		type:       'function',
		body:       'function(blob) {}',
		chunk:      'function(blob) {',
		hash:       _PARSER.hash('function(blob) {}'),
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

	const _find_enum = function(key, stream) {

		let str1 = '\n\tComposite.' + key + ' = ';
		let str2 = ';';

		let i0 = stream.indexOf('\n\tconst Composite =');
		let i1 = stream.indexOf(str1, i0);
		let i2 = stream.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {
			return key + ' = ' + stream.substr(i1 + str1.length, i2 - i1 - str1.length + str2.length);
		}

		return 'undefined';

	};

	const _find_statement = function(line, stream) {

		let i1 = stream.indexOf(line);
		let i2 = stream.indexOf(';', i1);

		if (i1 !== -1 && i2 !== -1) {
			return (line + stream.substr(i1 + line.length, i2 - i1 - line.length + 1)).trim();
		}

		return 'undefined';

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

	const _find_method = function(key, stream) {

		let str1 = '\n\t\t' + key + ': function';
		let str2 = '\n\t\t}';

		let i0 = stream.indexOf('\n\tComposite.prototype = {');
		let i1 = stream.indexOf(str1, i0);
		let i2 = stream.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {
			return 'function' + stream.substr(i1 + str1.length, i2 - i1 - str1.length + str2.length).trim();
		}

		return 'undefined';

	};

	const _parse_memory = function(memory, stream, errors) {

		let i1 = stream.indexOf('.exports(function(lychee, global, attachments) {');
		let i2 = stream.indexOf('\n\tconst Composite =');

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

		let i1 = stream.indexOf('\n\tconst Composite =');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 20, i2 - i1 - 17).trim();
			if (body.length > 0) {

				constructor.type       = 'function';
				constructor.body       = body;
				constructor.hash       = _PARSER.hash(body);
				constructor.parameters = _PARSER.parameters(body);

			}

		}

	};

	const _parse_settings = function(settings, stream) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => line.startsWith('\tconst Composite = '));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			let body = buffer.slice(check1, check2).join('\n').trim().substr(18);
			if (body.length > 0) {

				let object = _PARSER.settings(body);
				if (Object.keys(object).length > 0) {

					for (let o in object) {
						settings[o] = object[o];
					}

				}

			}

		}

	};

	const _parse_properties = function(properties, stream) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => line.startsWith('\tconst Composite = '));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			let body = buffer.slice(check1, check2).join('\n').trim().substr(18);
			if (body.length > 0) {

				body.split('\n').forEach(line => {

					let chunk = line.trim();
					if (chunk.startsWith('this.') && chunk.includes(' = ')) {

						if (chunk.endsWith('[') || chunk.endsWith('{')) {

							let statement = _find_statement(line, body);
							if (statement !== 'undefined') {
								chunk = statement;
							}

						}


						let tmp = chunk.split(/this\.([A-Za-z_]+)([\s]+)=([\s]+)([^\0]*);/g).filter(ch => ch.trim() !== '');
						if (tmp.length === 2) {

							let name = tmp[0];
							let prop = _PARSER.detect(tmp[1]);
							if (prop.type === 'undefined' && /^([A-Za-z0-9]+)$/g.test(prop.chunk)) {

								let mutations = _PARSER.mutations(prop.chunk, body);
								if (mutations.length > 0) {

									let val = mutations.find(function(mutation) {
										return mutation.type !== 'undefined';
									});

									if (val !== undefined) {
										prop.type  = val.type;
										prop.value = val.value;
									}

								}

							}

							if (
								properties[name] === undefined
								|| (
									prop.type !== 'undefined'
									&& (
										properties[name].value.type === 'undefined'
										|| properties[name].value.type === 'null'
									)
								)
							) {

								properties[name] = {
									chunk: chunk,
									value: prop
								};

							}

						}

					}

				});

			}

		}

	};

	const _parse_enums = function(enums, stream) {

		let i1 = stream.indexOf('\n\t};', stream.indexOf('\n\tconst Composite =')) + 4;
		let i2 = stream.indexOf('\n\tComposite.prototype =', i1);

		if (i1 !== -1 && i2 !== -1) {

			stream.substr(i1, i2 - i1).trim().split('\n')
				.filter(function(line) {

					let tmp = line.trim();
					if (tmp.startsWith('Composite.') && tmp.includes('=')) {
						return true;
					}

					return false;

				}).forEach(function(chunk) {

					let enam = null;

					if (chunk.includes('//')) {
						chunk = chunk.split('//')[0];
					}


					if (chunk.endsWith(';')) {

						enam = _PARSER.enum(chunk.trim());

					} else {

						let name = chunk.split('=')[0].trim().split('.')[1];
						let body = _find_enum(name, stream);

						if (body !== 'undefined') {
							enam = _PARSER.enum(body);
						}

					}


					if (enam !== null && enam.name !== undefined) {

						if (enam.values !== undefined) {

							enums[enam.name] = {
								values: enam.values
							};

						} else if (enam.value !== undefined) {

							enums[enam.name] = {
								value: enam.value
							};

						}

					}

				});

		}

	};

	const _add_event = function(events, event, method) {

		method = typeof method === 'string' ? method : null;


		let cache = events[event.name];
		if (cache === undefined) {

			cache = events[event.name] = {
				name:       event.name,
				methods:    [],
				parameters: event.parameters
			};

			if (method !== null) {
				cache.methods.push(method);
			}

		} else {

			if (method !== null) {

				if (cache.methods.includes(method) === false) {
					cache.methods.push(method);
				}

			}


			let c_params = cache.parameters;
			let e_params = event.parameters;

			if (c_params.length !== e_params.length) {

				if (c_params.length > e_params.length) {

					c_params.forEach(function(param, c) {

						let other = e_params[c];
						if (other !== undefined) {

							if (param.type === 'undefined' && other.type !== 'undefined') {
								param.chunk = other.chunk;
								param.type  = other.type;
								param.value = other.value;
							}

						}

					});

				} else {

					e_params.forEach(function(param, e) {

						let other = c_params[e];
						if (other !== undefined) {

							if (param.type === 'undefined' && other.type !== 'undefined') {
								param.chunk = other.chunk;
								param.type  = other.type;
								param.value = other.value;
							}

						} else if (other === undefined) {
							c_params[e] = param;
						}

					});

				}

			}

		}
	};

	const _parse_events = function(constructor, methods, events, stream, errors) {

		let construct = constructor.body || null;
		if (construct !== null) {

			let ewents = _PARSER.events(construct);
			if (ewents.length > 0) {

				ewents.forEach(function(event) {
					_add_event(events, event);
				});

			}

		}

		for (let mid in methods) {

			let method = methods[mid];
			let body   = method.body;
			let ewents = _PARSER.events(body);
			if (ewents.length > 0) {

				ewents.forEach(function(event) {
					_add_event(events, event, mid);
				});

			}

		}

	};

	const _parse_methods = function(methods, stream, errors) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => (line === '\tComposite.prototype = {'));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			buffer.slice(check1 + 1, check2).filter(line => {

				if (line.startsWith('\t\t')) {

					let tmp = line.substr(2);
					if (/^([A-Za-z0-9]+):\sfunction/g.test(tmp)) {
						return true;
					} else if (tmp.startsWith('// deserialize: function(blob) {}')) {
						methods['deserialize'] = Object.assign({}, _DESERIALIZE);
					} else if (tmp.startsWith('// serialize: function() {}')) {
						methods['serialize'] = Object.assign({}, _SERIALIZE);
					}

				}

				return false;

			}).forEach(chunk => {

				let name = chunk.split(':')[0].trim();
				let body = _find_method(name, stream);

				if (body !== 'undefined') {

					methods[name] = {
						type:       'function',
						body:       body,
						chunk:      chunk,
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
				let ref    = _find_reference(method.chunk, stream);
				let values = method.values;

				if (params.length > 0) {

					let found = params.filter(function(other) {
						return other.type === 'undefined' && other.value === undefined;
					}).map(function(other) {
						return other.name;
					});

					if (found.length > 0) {

						if (/^(control|render|update|deserialize|serialize)$/g.test(mid) === false) {

							let key = found[0];
							let col = ref.chunk.indexOf(key);
							if (col !== -1) {
								col = col + 1;
							} else {
								col = ref.column;
							}

							errors.push({
								url:       null,
								rule:      'no-parameter-value',
								reference: mid,
								message:   'Invalid parameter values for "' + found.join('", "') + '" for method "' + mid + '()".',
								line:      ref.line,
								column:    col
							});

						}

					}

				}

				if (values.length === 0) {

					if (/^(render|update)$/g.test(mid) === false) {

						errors.push({
							url:       null,
							rule:      'no-return-value',
							reference: mid,
							message:   'Invalid return value for method "' + mid + '()".',
							line:      ref.line,
							column:    ref.column
						});

					}


					method.values.push({
						type:  'undefined',
						value: undefined
					});

				} else if (values.length > 0) {

					if (/^(serialize|deserialize)$/g.test(mid) === false) {

						values.forEach(function(val) {

							if (val.type === 'undefined' && val.value === undefined) {

								let message = 'Unguessable return value for method "' + mid + '()".';
								let chunk   = (val.chunk || '').trim();

								if (chunk !== '') {
									message = 'Unguessable return value "' + chunk + '" for method "' + mid + '()".';
								}

								errors.push({
									url:       null,
									rule:      'unguessable-return-value',
									reference: mid,
									message:   message,
									line:      ref.line,
									column:    ref.column
								});

							}

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
				'reference': 'strainer.api.Composite',
				'arguments': []
			};

		},

		check: function(asset, header) {

			asset  = _validate_asset(asset) === true ? asset  : null;
			header = header instanceof Object        ? header : {};


			let errors = [];
			let memory = {};
			let result = {
				constructor: {
					type:       null,
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
				_parse_settings(result.settings, stream, errors);
				_parse_properties(result.properties, stream, errors);
				_parse_enums(result.enums, stream, errors);
				_parse_methods(result.methods, stream, errors);
				_parse_events(result.constructor, result.methods, result.events, stream, errors);


				if (result.constructor.parameters.length === 1) {

					let check = result.constructor.parameters[0];
					if (check.name === 'data' || check.name === 'settings') {

						check.type = 'Object';

					} else if (/^(main|client|remote|server)$/g.test(check.name) === false) {

						let chunk = result.constructor.body.split('\n')[0];
						let ref   = _find_reference('\n\tconst Composite = ' + chunk, stream);

						errors.push({
							url:       null,
							rule:      'no-composite',
							reference: 'constructor',
							message:   'Composite has no "settings" object.',
							line:      ref.line,
							column:    ref.column
						});

					}

				} else {

					let ref = _find_reference('\n\tconst Composite = function(', stream, true);
					if (ref.chunk === '') {

						ref = _find_reference('Composite =', stream, true);

						errors.push({
							url:       null,
							rule:      'no-composite',
							reference: 'constructor',
							message:   'Composite is not constant (missing "const" declaration).',
							line:      ref.line,
							column:    ref.column
						});

					}

				}


				let body = result.constructor.body || null;
				if (body !== null) {

					let check = result.constructor.parameters[0] || null;
					if (check !== null && check.name === 'data') {

						let ref1 = _find_reference('\n\t\tlet settings = ',  body, true);
						let ref2 = _find_reference('\n\t\tsettings = null;', body);

						if (ref1.line !== 0 && ref2.line === 0) {

							let ref = _find_reference('\n\t\tlet settings = ', stream, true);

							errors.push({
								url:       null,
								rule:      'no-garbage',
								reference: 'constructor',
								message:   'Composite produces garbage (missing "settings = null" statement).',
								line:      ref.line,
								column:    ref.column
							});

						} else if (ref1.line === 0) {

							let ref = _find_reference('\n\tconst Composite = function(', stream, true);

							errors.push({
								url:       null,
								rule:      'no-settings',
								reference: 'constructor',
								message:   'Composite ignores settings (missing "let settings = Object.assign({}, data)" statement).',
								line:      ref.line,
								column:    ref.column
							});

						}

					}


					for (let name in memory) {

						let entry = memory[name];
						if (entry.type === 'lychee.Definition') {

							let id  = entry.value.reference;
							let ref = _find_reference('\n\t\t' + name + '.call(this', body, true);

							if (header.includes.includes(id) === false && ref.line !== 0) {

								errors.push({
									url:       null,
									rule:      'no-includes',
									reference: name,
									message:   'Invalid Definition (missing includes() entry for "' + id + '").',
									line:      0,
									column:    0
								});

							} else if (header.includes.includes(id) === true && ref.line === 0) {

								errors.push({
									url:       null,
									rule:      'no-constructor-call',
									reference: name,
									message:   'Invalid Definition (missing constructor call for "' + id + '").',
									line:      0,
									column:    0
								});

							} else if (header.includes.includes(id) === false && header.requires.includes(id) === false) {

								errors.push({
									url:       null,
									rule:      'no-requires',
									reference: name,
									message:   'Invalid Definition (missing requires() entry for "' + id + '").',
									line:      0,
									column:    0
								});

							}

						}

					}

				}


				for (let p in result.properties) {

					let property = result.properties[p];
					if (property.value.type === 'undefined') {

						let method = result.methods['set' + p.charAt(0).toUpperCase() + p.substr(1)] || null;
						if (method !== null) {

							let found = method.parameters.find(function(val) {
								return p === val.name;
							});

							if (found !== undefined && found.type !== 'undefined') {
								property.value.type = found.type;
							}

						}

					}

					if (property.value.type === 'undefined' && property.value.value === undefined) {

						let ref = _find_reference(property.chunk, stream);

						errors.push({
							url:       null,
							rule:      'unguessable-property-value',
							reference: p,
							message:   'Unguessable property "' + p + '".',
							line:      ref.line,
							column:    ref.column
						});

					}

				}


				if (
					result.methods['deserialize'] === undefined
					|| result.methods['serialize'] === undefined
				) {

					let ref = _find_reference('\n\tComposite.prototype =', stream, true);

					if (result.methods['deserialize'] === undefined) {

						errors.push({
							url:       null,
							rule:      'no-deserialize',
							reference: 'deserialize',
							message:   'No "deserialize()" method.',
							line:      ref.line,
							column:    ref.column
						});

					}

					if (result.methods['serialize'] === undefined) {

						errors.push({
							url:       null,
							rule:      'no-serialize',
							reference: 'serialize',
							message:    'No "serialize()" method.',
							line:       ref.line,
							column:     ref.column
						});

					}

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

						let chunk = _TRANSCRIPTOR.transcribe('Composite', construct);
						if (chunk !== null) {
							code.push('');
							code.push('');
							code.push('\t' + chunk);
						}

					}


					if (Object.keys(result.methods).length > 0) {

						let chunk = _TRANSCRIPTOR.transcribe('Composite.prototype', result.methods, true);
						if (chunk !== null) {
							code.push('');
							code.push('');
							code.push('\t' + chunk);
						}

					}


					code.push('');
					code.push('');
					code.push('\treturn Composite;');

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

