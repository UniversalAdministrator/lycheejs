
lychee.define('strainer.api.PARSER').exports(function(lychee, global, attachments) {

	const _DICTIONARY = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _detect_type = function(str) {

		let type = 'undefined';


		if (str === 'undefined') {
			type = 'undefined';
		} else if (str === 'null') {
			type = 'null';
		} else if (str === 'true' || str === 'false') {
			type = 'Boolean';
		} else if (str.includes('===') && !str.includes('?')) {
			type = 'Boolean';
		} else if (str === '[]' || str.startsWith('[') || str.startsWith('Array.from')) {
			type = 'Array';
		} else if (str === '{}' || str.startsWith('{')) {
			type = 'Object';
		} else if (str.startsWith('Composite.')) {
			type = 'Enum';
		} else if (str.startsWith('new Composite')) {
			type = 'Composite';
		} else if (str.startsWith('new ')) {

			let tmp = str.substr(4);
			let i1  = tmp.indexOf('(');
			if (i1 !== -1) {
				tmp = tmp.substr(0, i1);
			}

			type = tmp;

		} else if (str.startsWith('\'') && str.endsWith('\'')) {
			type = 'String';
		} else if (str.startsWith('"') && str.endsWith('"')) {
			type = 'String';
		} else if (str.startsWith('\'') || str.startsWith('"')) {
			type = 'String';
		} else if (str.includes('toString')) {
			type = 'String';
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9\.]+$/g.test(str)) {
			type = 'Number';
		} else if (str === 'Infinity') {
			type = 'Number';
		} else if (str.includes(' + ') && (str.includes('\'') || str.includes('"'))) {
			type = 'String';
		} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
			type = 'Number';
		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(/(.*)instanceof\s([A-Za-z_\.]+)([\s]+)(.*)\?/g);
				if (tmp.length > 2) {
					type = tmp[2];
				}

			} else if (str.startsWith('typeof') && str.includes('===') && str.includes('?') && str.includes(':')) {

				let tmp = (str.split('?')[0].split('===')[1] || '').trim();
				if (tmp.startsWith('\'') || tmp.startsWith('\"')) {
					tmp = tmp.substr(1, tmp.length - 2);
				}


				switch (tmp) {
					case 'undefined': type = 'undefined'; break;
					case 'null':      type = 'null';      break;
					case 'boolean':   type = 'Boolean';   break;
					case 'number':    type = 'Number';    break;
					case 'string':    type = 'String';    break;
					case 'function':  type = 'Function';  break;
					case 'object':    type = 'Object';    break;
					default:          type = 'undefined'; break;
				}


				if (type === 'undefined') {

					let tmp1 = str.split(':').pop();
					if (tmp1.endsWith(';')) {
						tmp1 = tmp1.substr(0, tmp1.length - 1);
					}

					type = _detect_type(tmp1.trim());

				}

			} else if (str.includes('/g.test(')  && str.includes('?') && str.includes(':')) {

				type = 'String';

			} else if (str.endsWith('| 0') || str.endsWith('| 0;')) {

				type = 'Number';

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				type = 'Object';

			} else if (str.startsWith('lychee.interfaceof') || str.startsWith('_lychee.interfaceof')) {

				let tmp = str.split(/lychee.interfaceof\(([A-Za-z_\.]+),(.*)\)/g);
				if (tmp.length > 1) {
					type = tmp[1];
				}

			} else if (str.startsWith('lychee.enumof') || str.startsWith('_lychee.enumof')) {

				type = 'Enum';

			} else if (str.startsWith('lychee.assignunlink') || str.startsWith('_lychee.assignunlink')) {

				type = 'Object';

			} else if (str.startsWith('lychee.diff') || str.startsWith('_lychee.diff')) {

				type = 'Object';

			} else if (str === 'this') {

				type = 'Object';

			} else if (str.endsWith(' || null')) {

				let tmp1 = str.substr(0, str.length - 8).trim();

				type = _detect_type(tmp1);

			} else if (str === 'main') {

				type = 'lychee.app.Main';

			}

		}


		return type;

	};

	const _clone_value = function(data) {

		let clone = undefined;

		if (data !== undefined) {

			try {
				data = JSON.parse(JSON.stringify(data));
			} catch (err) {
			}

		}

		return clone;

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

	const _detect_value = function(str) {

		let value = undefined;


		if (str === 'undefined') {
			value = undefined;
		} else if (str === 'null') {
			value = null;
		} else if (str === 'true' || str === 'false') {
			value = str === 'true';
		} else if (str.includes('===') && !str.includes('?')) {
			value = true;
		} else if (str === '[]' || str.startsWith('[')) {

			let tmp = _parse_value(str);
			if (tmp === undefined) {
				tmp = [];
			}

			value = tmp;

		} else if (str === '{}' || str.startsWith('{')) {

			let tmp = _parse_value(str);
			if (tmp === undefined) {
				tmp = {};
			}

			value = tmp;

		} else if (str.startsWith('Composite.')) {
			value = str;
		} else if (str.startsWith('new Composite')) {
			value = str;
		} else if (str.startsWith('new ')) {

			let tmp = str.substr(4);
			let i1  = tmp.indexOf('(');
			let i2  = tmp.indexOf(')', i1);

			if (i1 !== -1 && i2 !== -1) {

				tmp = tmp.substr(i1 + 1, i2 - i1 - 1);

				if (tmp.includes(',') === false) {
					value = _parse_value(tmp);
				}

			} else if (i1 !== -1) {
				value = '<' + tmp.substr(0, i1) + '>';
			}

		} else if (str.startsWith('\'') && str.endsWith('\'')) {
			value = str.substr(1, str.length - 2);
		} else if (str.startsWith('"') && str.endsWith('"')) {
			value = str.substr(1, str.length - 2);
		} else if (str.startsWith('\'') || str.startsWith('"')) {
			value = "<string>";
		} else if (str.includes('toString')) {
			value = "<string>";
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9\.]+$/g.test(str)) {
			value = _parse_value(str);
		} else if (str === 'Infinity') {
			value = Infinity;
		} else if (str.includes(' + ') && (str.includes('\'') || str.includes('"'))) {
			value = "<string>";
		} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
			value = 1337;
		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				value = _detect_value(tmp.trim());

			} else if (str.startsWith('typeof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				value = _detect_value(tmp.trim());

			} else if (str.includes('/g.test(')  && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				value = _detect_value(tmp.trim());

			} else if (str.endsWith('| 0') || str.endsWith('| 0;')) {

				value = 1337;

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				value = {};

			} else if (str.startsWith('lychee.interfaceof')) {

				if (str.indexOf(':') !== -1) {

					let tmp = str.split(':').pop();
					if (tmp.endsWith(';')) {
						tmp = tmp.substr(0, tmp.length - 1);
					}

					value = _detect_value(tmp.trim());

				} else {

					let tmp = str.substr(19, str.indexOf(',') - 19).trim();
					if (tmp.length > 0) {
						value = tmp;
					}

				}

			} else if (str.startsWith('lychee.enumof')) {

				let tmp = str.split(/lychee\.enumof\(Composite\.([A-Z]+),(.*)\)/g);
				if (tmp.length > 2) {
					value = 'Composite.' + tmp[1];
				}

			} else if (str.startsWith('lychee.assignunlink')) {

				value = {};

			} else if (str.startsWith('lychee.diff')) {

				value = {};

			} else if (str === 'this') {

				value = 'this';

			} else if (str.endsWith(' || null')) {

				let tmp1 = str.substr(0, str.length - 8).trim();

				value = _detect_value(tmp1);

			} else if (str === 'main') {

				value = {
					'constructor': 'lychee.app.Main',
					'arguments': []
				};

			}

		}


		return value;

	};




	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.api.PARSER',
				'blob':      null
			};

		},



		/*
		 * CUSTOM API
		 */

		detect: function(str) {

			str = typeof str === 'string' ? str : 'undefined';


			if (str.endsWith(';')) {
				str = str.substr(0, str.length - 1);
			}

			if (str.endsWith(' || null')) {
				str = str.substr(0, str.length - 8).trim();
			}


			let val = {
				type:  _detect_type(str),
				value: _detect_value(str)
			};


			if (val.value === undefined && str !== 'undefined') {

				let dictionary = [];

				if (val.type !== 'undefined') {

					dictionary = _DICTIONARY.filter(function(other) {
						return str.startsWith(other.name) && other.type === val.type;
					}).sort(function(a, b) {
						if (a.name.length === b.name.length) return -1;
						if (a.name.length !== b.name.length) return  1;
						return 0;
					});

				} else if (val.type === 'undefined') {

					dictionary = _DICTIONARY.filter(function(other) {
						return str.startsWith(other.name);
					}).sort(function(a, b) {
						if (a.name.length > b.name.length) return -1;
						if (a.name.length < b.name.length) return  1;
						return 0;
					});

				}


				let entry = dictionary[0] || null;
				if (entry !== null) {

					val.type  = entry.type;
					val.value = entry.value;


					if (str !== entry.name) {

						if (lychee.debug === true) {
							console.info('strainer.api.PARSER: Fuzzy guessing for "' + str + '" with "' + entry.name + '".');
						}

					}


				} else {

					if (lychee.debug === true) {
						console.warn('strainer.api.PARSER: No guessing for "' + str + '".');
					}

				}

			}


			return val;

		},

		trace: function(name, code) {

			return code.split('\n').filter(function(line) {
				return line.includes(name + ' = ');
			}).map(function(line) {

				let i1 = line.indexOf('=');
				let i2 = line.indexOf(';', i1);
				if (i2 === -1) {
					i2 = line.length;
				}

				return line.substr(i1 + 2, i2 - i1 - 2);

			}).map(function(chunk) {

				return {
					type:  _detect_type(chunk),
					value: _detect_value(chunk)
				};

			}).filter(function(value) {
				return value.type !== 'undefined';
			});

		}

	};


	return Module;

});

