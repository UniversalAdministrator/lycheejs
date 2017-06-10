
lychee.define('strainer.api.Module').requires([
	'lychee.crypto.MURMUR',
	'strainer.api.PARSER'
]).exports(function(lychee, global, attachments) {

	const _MURMUR = lychee.import('lychee.crypto.MURMUR');
	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _get_function_body = function(name, stream) {

		let i1   = stream.indexOf('\n\t\t' + name + ': function(');
		let i2   = stream.indexOf(':', i1);
		let i3   = stream.indexOf('\n\t\t}', i1);
		let body = null;

		if (i1 !== -1 && i2 !== -1 && i3 !== -1) {
			body = stream.substr(i2 + 1, i3 - i2 + 3).trim();
		}

		return body;

	};

	const _get_function_hash = function(str) {

		let hash = new _MURMUR();

		hash.update(str);

		return hash.digest().toString('hex');

	};

	const _parse_methods = function(methods, properties, stream, errors) {

		let i1 = stream.indexOf('\n\tconst Module =');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			let last_line   = '';
			let last_name   = null;
			let last_method = null;

			stream.substr(i1, i2 - i1 + 4).trim().split('\n').filter(function(line, l, self) {

				let tmp = line.trim();
				if (tmp === '// deserialize: function(blob) {},') {
					return true;
				} else if (tmp === '' || tmp.startsWith('//')) {
					return false;
				} else if (tmp.startsWith('/*') || tmp.startsWith('*/') || tmp.startsWith('*')) {
					return false;
				}

				return true;

			}).slice(1, -1).forEach(function(line, l) {

				if (line.includes('function(')) {

					let tmp1 = line.trim();
					if (tmp1.startsWith('//')) {
						tmp1 = tmp1.substr(2).trim();
					}

					let tmp2 = tmp1.split(/"?'?([A-Za-z]+)"?'?:\sfunction\((.*)\)/g);
					let tmp3 = tmp2.pop();
					if (tmp3 === ' {' || tmp3 === ' {},') {

						let body = _get_function_body(tmp2[1], stream);
						let hash = null;
						if (body !== null) {
							hash = _get_function_hash(body);
						}


						if (tmp2[1] === 'serialize') {

							methods['serialize'] = {
								body:       body,
								hash:       hash,
								parameters: [],
								values:     [{
									type:  'SerializationBlob',
									value: {
										'constructor': null,
										'arguments':   [],
										'blob':        null
									}
								}]
							};

						} else if (tmp2[1] === 'deserialize') {

							methods['deserialize'] = {
								body:       body,
								hash:       hash,
								parameters: [{
									name:  'blob',
									type:  'SerializationBlob',
									value: {}
								}],
								values:     [{
									type:  'undefined',
									value: undefined
								}]
							};

							if (tmp1 === 'deserialize: function(blob) {},') {
								methods['deserialize'].body = 'function(blob) {}';
								methods['deserialize'].hash = _get_function_hash(methods['deserialize'].body);
							}

						} else {

							last_name = tmp2[1];

							// last_method = methods['setWhatever'] = { parameters: [{ name: 'foo', type: 'String', value: null }] }
							last_method = methods[tmp2[1]] = {
								body:       body,
								hash:       hash,
								parameters: [],
								values:     []
							};


							let tmp4 = tmp2[2].trim();
							if (tmp4.length > 0) {

								last_method.parameters = tmp4.split(',').map(function(val) {

									return {
										name:  val.trim(),
										type:  'undefined',
										value: undefined
									};

								});

							}

						}

					}

				} else if (line === '\t\t},' || line === '\t\t}') {

					last_name   = null;
					last_method = null;

				} else if (last_method !== null) {

					let tmp1 = line.trim();
					if (tmp1.startsWith('return') && tmp1.endsWith('{')) {

						let has_object = last_method.values.find(function(val) {
							return val.type === 'Object';
						});

						if (has_object === undefined) {
							last_method.values.push({
								type:  'Object',
								value: {}
							});
						}

					} else if (tmp1.startsWith('return') && tmp1.endsWith(';')) {

						if ((last_line.includes('function(') || last_line.includes('=>')) && last_line.endsWith('{')) {
							return;
						}


						let tmp2 = tmp1.substr(6, tmp1.length - 7).trim();
						if (tmp2.includes('&&') || tmp2.includes('||')) {

							let has_true = last_method.values.find(function(val) {
								return val.value === true;
							});

							if (has_true === undefined) {
								last_method.values.push({
									type:  'Boolean',
									value: true
								});
							}

							let has_false = last_method.values.find(function(val) {
								return val.value === false;
							});

							if (has_false === undefined) {
								last_method.values.push({
									type:  'Boolean',
									value: false
								});
							}

						} else if (tmp2.length > 0) {

							let ret2 = _PARSER.detect(tmp2);
							if (ret2.type === 'undefined' && ret2.value === undefined && tmp2 !== 'undefined') {

								// XXX: Trace variable mutations
								if (/^[A-Za-z0-9]+/g.test(tmp2) === true) {

									let mutation = _PARSER.trace(tmp2, last_method.body).pop();
									if (mutation !== undefined) {
										ret2.type  = mutation.type;
										ret2.value = mutation.value;
									}

								}


								if (ret2.type === 'undefined') {

									ret2.type  = 'undefined';
									ret2.value = tmp2;

									errors.push({
										ruleId:     'no-return-value',
										methodName: last_name,
										fileName:   null,
										message:    'Unguessable return "' + last_name + '()" ("' + tmp2 + '").'
									});

								}

							}


							let has_already = last_method.values.find(function(val) {

								if (/Array|Object/g.test(val.type)) {
									return JSON.stringify(val.value) === JSON.stringify(ret2.value);
								} else {
									return val.type === ret2.type && val.value === ret2.value;
								}

							});

							if (has_already === undefined && ret2.value !== undefined) {

								last_method.values.push({
									type:  ret2.type,
									value: ret2.value
								});

							}

						}

					} else {

						Object.values(last_method.parameters).forEach(function(parameter) {

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

							} else if (tmp1.includes(parameter.name)) {

								if (tmp1.startsWith('this\.' + parameter.name)) {

									let property = properties[parameter.name] || null;
									if (property !== null) {

										if (parameter.type === 'undefined') {
											parameter.type = property.type;
										}

										if (parameter.value === null) {
											parameter.value = property.value instanceof Object ? lychee.assignunlink({}, property.value) : property.value;
										}

									}

								}

							}

						});

					}

				}


				last_line = line;

			});


			for (let mid in methods) {

				let method = methods[mid];
				if (method.values.length === 0) {

					method.values.push({
						type:  'undefined',
						value: undefined
					});

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
				constructor: null,
				settings:    {},
				properties:  {},
				enums:       {},
				events:      {},
				methods:     {}
			};


			_parse_methods(result.methods, result.properties, stream, errors);


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

