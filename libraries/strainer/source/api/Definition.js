
lychee.define('strainer.api.Definition').requires([
	'strainer.api.PARSER'
]).exports(function(lychee, global, attachments) {

	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _create_error = function(rule, message) {

		return {
			url:       null,
			rule:      rule,
			reference: null,
			message:   message,
			line:      0,
			column:    0

		};

	};

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _parse_value = function(str) {

		let val = undefined;
		if (/^(this|global)$/g.test(str) === false) {

			try {
				val = eval('(' + str + ')');
			} catch (err) {
			}

		}

		return val;

	};

	const _parse_identifier = function(result, stream, errors) {

		let i1  = stream.indexOf('lychee');
		let i2  = stream.indexOf('\n', i1);
		let tmp = stream.substr(0, i2).trim();

		if (tmp.startsWith('lychee.define(')) {

			let tmp1 = tmp.split(/lychee\.define\("?'?([A-Za-z.-]+)"?'?\)\.(.*)/g);
			if (tmp1.length > 1) {

				let id = tmp1[1];
				if (id.charAt(0) === id.charAt(0).toUpperCase()) {
					result.identifier = 'lychee.' + id;
				} else {
					result.identifier = id;
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

	const _parse_supports = function(supports, stream, errors) {

		let i1 = stream.indexOf('supports(');
		let i2 = stream.indexOf('})', i1);

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 9, i2 - i1 - 8).trim();
			if (body.length > 0) {

				supports.body       = body;
				supports.hash       = _PARSER.hash(body);
				supports.parameters = _PARSER.parameters(body);

			}

		}

	};

	const _parse_attaches = function(attaches, stream, errors) {

		let i1 = stream.indexOf('attaches({');
		let i2 = stream.indexOf('\n})', i1);
		let i3 = stream.indexOf('exports(function(lychee, global, attachments) {\n');

		if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

			let tmp1 = stream.substr(i1 + 9, i2 - i1 - 7);
			if (tmp1.length > 0 && tmp1.startsWith('{') && tmp1.endsWith('}')) {

				let tmp2 = _parse_value(tmp1);
				if (tmp2 !== undefined) {

					for (let t in tmp2) {
						attaches[t] = lychee.serialize(tmp2[t]);
					}

				}

			}

		}

	};

	const _parse_tags = function(tags, stream, errors) {

		let i1 = stream.indexOf('tags({');
		let i2 = stream.indexOf('\n})', i1);
		let i3 = stream.indexOf('exports(function(lychee, global, attachments) {\n');

		if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

			let tmp1 = stream.substr(i1 + 5, i2 - i1 - 3);
			if (tmp1.length > 0 && tmp1.startsWith('{') && tmp1.endsWith('}')) {

				let tmp2 = _parse_value(tmp1);
				if (tmp2 !== undefined) {

					for (let t in tmp2) {
						tags[t] = tmp2[t];
					}

				}

			}

		}

	};

	const _parse_requires = function(requires, stream, errors) {

		let i1 = stream.indexOf('requires([');
		let i2 = stream.indexOf('\n])', i1);
		let i3 = stream.indexOf('exports(function(lychee, global, attachments) {\n');

		if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

			let tmp1 = stream.substr(i1 + 9, i2 - i1 - 7);
			if (tmp1.length > 0 && tmp1.startsWith('[') && tmp1.endsWith(']')) {

				let tmp2 = _parse_value(tmp1);
				if (tmp2 !== undefined && tmp2 instanceof Array) {

					tmp2.forEach(function(value) {

						if (requires.indexOf(value) === -1) {
							requires.push(value);
						}

					});

				}

			}

		}

	};

	const _parse_includes = function(includes, stream, errors) {

		let i1 = stream.indexOf('includes([');
		let i2 = stream.indexOf('\n])', i1);
		let i3 = stream.indexOf('exports(function(lychee, global, attachments) {\n');

		if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

			let tmp1 = stream.substr(i1 + 9, i2 - i1 - 7);
			if (tmp1.length > 0 && tmp1.startsWith('[') && tmp1.endsWith(']')) {

				let tmp2 = _parse_value(tmp1);
				if (tmp2 !== undefined && tmp2 instanceof Array) {

					tmp2.forEach(function(value) {

						if (includes.indexOf(value) === -1) {
							includes.push(value);
						}

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
				'reference': 'strainer.api.Definition',
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
				_parse_attaches(result.attaches, stream, errors);
				_parse_tags(result.tags, stream, errors);
				_parse_requires(result.requires, stream, errors);
				_parse_includes(result.includes, stream, errors);
				_parse_supports(result.supports, stream, errors);

				// XXX: exports are unnecessary
				// _parse_exports(result.exports, stream, errors);

				let i1 = stream.indexOf('lychee.define(');
				let i2 = stream.indexOf('exports(function(lychee, global, attachments) {\n', i1);

				if (i1 === -1 || i2 === -1) {
					errors.push(_create_error('no-definition', 'Invalid Definition (wrong API usage).'));
				}


				let i3 = stream.indexOf('requires([\n');
				let i4 = stream.indexOf('includes([\n');
				let i5 = stream.indexOf('supports(function(lychee, global) {\n');
				let i6 = stream.indexOf('exports(function(lychee, global, attachments) {\n');

				if (i3 !== -1 && i4 !== -1 && i3 > i4) {
					errors.push(_create_error('no-meta', 'Invalid Definition ("requires()" after "includes()").'));
				}

				if (i3 !== -1 && i5 !== -1 && i3 > i5) {
					errors.push(_create_error('no-meta', 'Invalid Definition ("requires()" after "supports()").'));
				}

				if (i4 !== -1 && i5 !== -1 && i4 > i5) {
					errors.push(_create_error('no-meta', 'Invalid Definition ("includes()" after "supports()").'));
				}

				if (i3 !== -1 && i6 !== -1 && i3 > i6) {
					errors.push(_create_error('no-meta', 'Invalid Definition ("requires()" after "exports()").'));
				}

				if (i4 !== -1 && i6 !== -1 && i4 > i6) {
					errors.push(_create_error('no-meta', 'Invalid Definition ("includes()" after "exports()").'));
				}

				if (i5 !== -1 && i6 !== -1 && i5 > i6) {
					errors.push(_create_error('no-meta', 'Invalid Definition ("supports()" after "exports()").'));
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

