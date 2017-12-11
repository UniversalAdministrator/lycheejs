
lychee.define('strainer.plugin.API').requires([
	'strainer.api.Callback',
	'strainer.api.Composite',
	'strainer.api.Core',
	'strainer.api.Definition',
	'strainer.api.Module'
]).exports(function(lychee, global, attachments) {

	const _api     = {
		Callback:   lychee.import('strainer.api.Callback'),
		Composite:  lychee.import('strainer.api.Composite'),
		Core:       lychee.import('strainer.api.Core'),
		Definition: lychee.import('strainer.api.Definition'),
		Module:     lychee.import('strainer.api.Module')
	};



	/*
	 * FIXES
	 */

	const _split_chunk = function(code, search, offset) {

		let index = code.indexOf(search, offset);
		if (index !== -1) {

			let chunk0 = code.substr(0, index + search.length);
			let chunk1 = code.substr(index + search.length);

			return [ chunk0, chunk1 ];

		}


		return null;

	};

	const _TAB_STR = new Array(128).fill('\t').join('');
	const _FIXES   = {

		'no-define': function(err, report, code) {

			let url = err.url || null;
			if (url !== null) {

				if (url.endsWith('/bootstrap.js') || url.endsWith('/features.js')) {
					return code;
				}


				let tmp = err.url.split('/');
				if (tmp.length > 3) {

					let type = tmp[1];
					if (type === 'libraries') {

						let folder = tmp[3];
						if (folder === 'source') {

							let is_platform = tmp[4] === 'platform';
							if (is_platform === true) {

								let platform = tmp[5];
								let name     = [ tmp[2] ].concat(tmp.slice(6));

								let check = name[name.length - 1].indexOf('.');
								if (check !== -1) {
									name[name.length - 1] = name[name.length - 1].substr(0, check);
								}

								return '\nlychee.define(\'' + name.join('.') + '\').tags({\n\t\'platform\': \'' + platform + '\'\n});\n' + code.trim() + '\n';

							} else {

								let name  = [ tmp[2] ].concat(tmp.slice(4));
								let check = name[name.length - 1].indexOf('.');
								if (check !== -1) {
									name[name.length - 1] = name[name.length - 1].substr(0, check);
								}

								return '\nlychee.define(\'' + name.join('.') + '\');\n' + code.trim() + '\n';

							}


						} else {

							// XXX: Ignore this error in other folders
							return code;

						}

					} else if (type === 'projects') {

						let folder = tmp[3];
						if (folder === 'source') {

							let is_platform = tmp[4] === 'platform';
							if (is_platform === true) {

								let platform = tmp[5];
								let name     = [ 'app' ].concat(tmp.slice(6));

								let check = name[name.length - 1].indexOf('.');
								if (check !== -1) {
									name[name.length - 1] = name[name.length - 1].substr(0, check);
								}

								return '\nlychee.define(\'' + name.join('.') + '\').tags({\n\t\'platform\': \'' + platform + '\'\n});\n' + code.trim() + '\n';

							} else {

								let name  = [ 'app' ].concat(tmp.slice(4));
								let check = name[name.length - 1].indexOf('.');
								if (check !== -1) {
									name[name.length - 1] = name[name.length - 1].substr(0, check);
								}

								return '\nlychee.define(\'' + name.join('.') + '\');\n' + code.trim() + '\n';

							}

						} else {

							// XXX: Ignore this error in other folders
							return code;

						}

					}

				}

			}


			return null;

		},

		'no-exports': function(err, report, code) {

			let url = err.url;
			if (url !== null) {

				if (url.endsWith('/bootstrap.js') || url.endsWith('/features.js')) {
					return code;
				}

			}


			let i1 = code.indexOf('lychee.define(');
			let i2 = code.indexOf('tags({');
			let i3 = code.indexOf('attaches({');
			let i4 = code.indexOf('requires([');
			let i5 = code.indexOf('includes([');
			let i6 = code.indexOf('supports(function(lychee, global) {');
			let i7 = code.indexOf('exports(function(lychee, global, attachments) {');

			if (i7 === -1) {

				let chunk = null;

				if (i6 !== -1) {
					chunk = _split_chunk(code, '})', i6);
				} else if (i5 !== -1) {
					chunk = _split_chunk(code, '])', i5);
				} else if (i4 !== -1) {
					chunk = _split_chunk(code, '])', i4);
				} else if (i3 !== -1) {
					chunk = _split_chunk(code, '})', i3);
				} else if (i2 !== -1) {
					chunk = _split_chunk(code, '})', i2);
				} else if (i1 !== -1) {
					chunk = _split_chunk(code, ')',  i1);
				}


				if (chunk !== null) {
					return chunk[0] + '.exports(function(lychee, global, attachments) {\n\n\n})' + chunk[1];
				}


			}


			return null;

		},

		'no-requires': function(err, report, code) {

			let name  = err.reference;
			let entry = report.memory[name] || null;
			if (entry !== null) {

				let ref = entry.value.reference;
				let i1  = code.indexOf('requires([');
				let i2  = code.indexOf('\n])', i1);
				let i3  = code.indexOf('exports(function(lychee, global, attachments) {\n');

				if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

					let tmp1 = code.substr(i1 + 9, i2 - i1 - 7);
					if (tmp1.length > 0 && tmp1.startsWith('[') && tmp1.endsWith(']')) {

						let chunk = tmp1.split('\n');
						if (chunk.length > 2) {
							chunk.splice(1, 0, '\t\'' + ref + '\',');
						} else {
							chunk.splice(1, 0, '\t\'' + ref + '\'');
						}

						return code.substr(0, i1 + 9) + chunk.join('\n') + code.substr(i2 + 2);

					}

				} else {

					i1 = code.indexOf('lychee.define(');
					i2 = code.indexOf(')', i1);

					if (i1 !== -1 && i2 !== -1 && i2 < i3) {
						return code.substr(0, i2 + 1) + '.requires([\n\t\'' + ref + '\'\n])' + code.substr(i2 + 1);
					}

				}

			}


			return null;

		},

		'no-includes': function(err, report, code) {

			let name  = err.reference;
			let entry = report.memory[name] || null;
			if (entry !== null) {

				let ref = entry.value.reference;
				let i1  = code.indexOf('includes([');
				let i2  = code.indexOf('\n])', i1);
				let i3  = code.indexOf('exports(function(lychee, global, attachments) {\n');

				if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

					let tmp1 = code.substr(i1 + 9, i2 - i1 - 7);
					if (tmp1.length > 0 && tmp1.startsWith('[') && tmp1.endsWith(']')) {

						let chunk = tmp1.split('\n');
						if (chunk.length > 2) {
							chunk.splice(1, 0, '\t\'' + ref + '\',');
						} else {
							chunk.splice(1, 0, '\t\'' + ref + '\'');
						}

						return code.substr(0, i1 + 9) + chunk.join('\n') + code.substr(i2 + 2);

					}

				} else {

					i1 = code.indexOf('requires([');
					i2 = code.indexOf('\n])', i1);

					if (i1 !== -1 && i2 !== -1 && i2 < i3) {

						return code.substr(0, i2 + 3) + '.includes([\n\t\'' + ref + '\'\n])' + code.substr(i2 + 3);

					} else {

						i1 = code.indexOf('lychee.define(');
						i2 = code.indexOf(')', i1);

						if (i1 !== -1 && i2 !== -1 && i2 < i3) {
							return code.substr(0, i2 + 1) + '.includes([\n\t\'' + ref + '\'\n])' + code.substr(i2 + 1);
						}

					}

				}

			}


			return null;

		},

		'no-settings': function(err, report, code) {

			let type = report.header.type;
			if (type === 'Composite') {

				let i1 = code.indexOf('\n\tconst Composite =');
				let i2 = code.indexOf('\n\t};', i1);

				if (i1 !== -1 && i2 !== -1) {

					let chunk = code.substr(i1, i2 - i1 + 4).split('\n');

					chunk.splice(2, 0, '\n\t\tlet settings = Object.assign({}, data);\n');

					return code.substr(0, i1) + chunk.join('\n') + code.substr(i2 + 4);

				}

			}


			return null;

		},

		'no-garbage': function(err, report, code) {

			let type = report.header.type;
			if (type === 'Composite') {

				let i1 = code.indexOf('\n\tconst Composite =');
				let i2 = code.indexOf('\n\t};', i1);

				if (i1 !== -1 && i2 !== -1) {

					let chunk = code.substr(i1, i2 - i1 + 4).split('\n');

					chunk.splice(chunk.length - 1, 0, '\n\t\tsettings = null;\n');

					return code.substr(0, i1) + chunk.join('\n') + code.substr(i2 + 4);

				}

			}


			return null;

		},

		'no-constructor-call': function(err, report, code) {

			let type = report.header.type;
			if (type === 'Composite') {

				let name  = err.reference;
				let entry = report.memory[name] || null;
				if (entry !== null) {

					let i1 = code.indexOf('\n\tconst Composite =');
					let i2 = code.indexOf('\n\t};', i1);

					if (i1 !== -1 && i2 !== -1) {

						let chunk = code.substr(i1, i2 - i1 + 4).split('\n');
						let i3    = chunk.findIndex(function(line) {
							return line.includes('settings = null');
						});

						if (i3 !== -1) {
							chunk.splice(i3, 0, '\t\t' + name + '.call(this, settings);\n');
						} else {
							chunk.splice(chunk.length - 1, 0, '\n\t\t' + name + '.call(this, settings);\n');
						}


						return code.substr(0, i1) + chunk.join('\n') + code.substr(i2 + 4);

					}

				}

			}


			return null;

		},

		'no-deserialize': function(err, report, code) {

			let type  = report.header.type;
			let chunk = [];

			let ids = report.header.includes;
			if (type === 'Composite' && ids.length > 0) {

				ids.map(function(id) {

					let reference = null;

					for (let name in report.memory) {

						let entry = report.memory[name];
						let value = entry.value || null;
						if (
							value !== null
							&& value instanceof Object
							&& value.reference === id
						) {
							reference = name;
							break;
						}

					}

					return reference;

				}).filter(function(reference) {
					return reference !== null;
				}).forEach(function(reference, r) {
					chunk.push('' + reference + '.prototype.deserialize.call(this, blob);');
				});

			}


			let inject = '\n\t\t// deserialize: function(blob) {},\n';
			if (chunk.length > 0) {

				inject = '\n\t\tdeserialize: function(blob) {\n\n' + chunk.map(function(ch) {
					if (ch !== '') {
						return ch.padStart(ch.length + 3, '\t');
					} else {
						return ch;
					}
				}).join('\n') + '\n\n\t\t},\n';

			}


			if (type === 'Composite') {

				let i1 = code.indexOf('\n\tComposite.prototype = {\n');
				let i2 = code.indexOf('\n\t};', i1);
				if (i1 !== -1 && i2 !== -1) {
					return code.substr(0, i1 + 26) + inject + code.substr(i1 + 26);
				}

			} else if (type === 'Module') {

				let i1 = code.indexOf('\n\tconst Module = {\n');
				let i2 = code.indexOf('\n\t};', i1);
				if (i1 !== -1 && i2 !== -1) {
					return code.substr(0, i1 + 26) + inject + code.substr(i1 + 26);
				}

			}


			return null;

		},

		'no-serialize': function(err, report, code) {

			let type        = report.header.type;
			let chunk       = [];
			let identifier  = report.header.identifier;
			let has_methods = Object.keys(report.result.methods).length > 0;

			let ids = report.header.includes;
			if (type === 'Composite' && ids.length > 0) {

				ids.map(function(id) {

					let reference = null;

					for (let name in report.memory) {

						let entry = report.memory[name];
						let value = entry.value || null;
						if (
							value !== null
							&& value instanceof Object
							&& value.reference === id
						) {
							reference = name;
							break;
						}

					}

					return reference;

				}).filter(function(reference) {
					return reference !== null;
				}).forEach(function(reference, r) {

					if (r === 0) {
						chunk.push('let data = ' + reference + '.prototype.serialize.call(this);');
					} else {
						chunk.push('data = Object.assign(data, ' + reference + '.prototype.serialize.call(this);');
					}

				});

				chunk.push('data[\'constructor\'] = \'' + identifier + '\';');
				chunk.push('');
				chunk.push('');
				chunk.push('return data;');

			} else if (type === 'Composite') {

				chunk.push('return {');
				chunk.push('\t\'constructor\': \'' + identifier + '\',');
				chunk.push('\t\'arguments\': []');
				chunk.push('};');

			} else if (type === 'Module') {

				chunk.push('return {');
				chunk.push('\t\'reference\': \'' + identifier + '\',');
				chunk.push('\t\'arguments\': []');
				chunk.push('};');

			}


			let inject = '\n\t\tserialize: function() {\n\n' + chunk.map(function(ch) {
				if (ch !== '') {
					return ch.padStart(ch.length + 3, '\t');
				} else {
					return ch;
				}
			}).join('\n') + '\n\n\t\t}';

			if (has_methods === true) {
				inject += ',\n\n';
			} else {
				inject += '\n\n';
			}

			if (type === 'Composite') {

				let i1 = code.indexOf('\n\tComposite.prototype = {\n');
				let i2 = code.indexOf('\n\t\tdeserialize: function(blob) {\n');
				let i3 = code.indexOf('\n\t\t// deserialize: function(blob) {},\n');
				let i4 = code.indexOf('\n\t};', i1);
				if (i1 !== -1 && i4 !== -1) {

					if (i2 !== -1) {

						let i20 = code.indexOf('\n\t\t},\n', i2);
						let i21 = code.indexOf('\n\t\t}\n', i2);

						if (i20 !== -1) {
							return code.substr(0, i20 + 6) + inject + code.substr(i20 + 6);
						} else if (i21 !== -1) {
							return code.substr(0, i21 + 4) + ',\n' + inject + code.substr(i21 + 5);
						}

					} else if (i3 !== -1) {
						return code.substr(0, i3 + 38) + inject + code.substr(i3 + 38);
					} else {
						return code.substr(0, i1 + 26) + inject + code.substr(i1 + 26);
					}

				}

			} else if (type === 'Module') {

				let i1 = code.indexOf('\n\tconst Module = {\n');
				let i2 = code.indexOf('\n\t};', i1);
				if (i1 !== -1 && i2 !== -1) {
					return code.substr(0, i1 + 26) + inject + code.substr(i1 + 26);
				}

			}


			return null;

		},

		'unguessable-return-value': function(err, report, code) {

			let method = report.result.methods[err.reference] || null;
			if (method !== null) {

				let has_already = method.values.find(function(val) {
					return val.type !== 'undefined';
				});

				if (has_already !== undefined) {
					return code;
				}

			}

			return null;

		},

		'unguessable-property-value': function(err, report, code) {

			let property = report.result.properties[err.reference] || null;
			if (property !== null) {

				if (property.value.type !== 'undefined') {
					return code;
				}

			}

			return null;

		}

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


				let is_core       = asset.url.startsWith('/libraries/lychee/source/core') && first.endsWith('(function(global) {');
				let is_definition = stream.trim().startsWith('lychee.define(');
				let is_callback   = stream.lastIndexOf('return Callback;')  > 0;
				let is_composite  = stream.lastIndexOf('return Composite;') > 0;
				let is_module     = stream.lastIndexOf('return Module;')    > 0;


				// XXX: Well, yeah. Above algorithm will crash itself
				if (asset.url === '/libraries/strainer/source/plugin/API.js') {
					is_callback  = false;
					is_composite = false;
					is_module    = true;
				}


				if (is_definition === true) {
					header = _api['Definition'].check(asset);
				} else if (is_core === true) {
					header = _api['Core'].check(asset);
				} else {

					// XXX: autofix assumes lychee.Definition
					header = _api['Definition'].check(asset);

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
						errors: [],
						memory: {},
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

		}

	};


	return Module;

});

