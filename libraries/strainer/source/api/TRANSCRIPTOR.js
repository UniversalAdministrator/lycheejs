
lychee.define('strainer.api.TRANSCRIPTOR').exports(function(lychee, global, attachments) {

	const _FEATURES  = lychee.FEATURES;
	const _PLATFORMS = lychee.PLATFORMS;



	/*
	 * HELPERS
	 */



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
				'reference': 'strainer.api.TRANSCRIPTOR',
				'blob':      null
			};

		},



		/*
		 * CUSTOM API
		 */

		transcribe: function(name, value, assign) {

			name   = typeof name === 'string' ? name  : null;
			value  = value instanceof Object  ? value : null;
			assign = assign === true;


			if (name !== null && value !== null) {

				let code = [];
				let type = value.type || '';

				if (type === 'function') {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.body + ';');
				} else if (type === 'lychee.Definition') {
					code.push((assign === false ? 'const ' : '') + name + ' = lychee.import(\'' + value.value.reference + '\');');
				} else if (type === 'lychee.Namespace') {
					code.push((assign === false ? 'const ' : '') + name + ' = lychee.import(\'' + value.value.reference + '\');');
				// } else if (/^(null|undefined)$/g.test(type)) {
				//	code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (/^(Array|Number|String)$/g.test(type)) {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (/^(Buffer|Config|Font|Music|Sound|Texture)$/g.test(type)) {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type === 'Object') {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type.startsWith('_')) {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (value instanceof Object) {

					console.info(name, type);

					code.push((assign === false ? 'const ' : '') + name + ' = ' + '{');
					code.push('');


					for (let v in value) {

						let entry = value[v];
						if (entry.type === 'function') {
							code.push('\t\t' + v + ': ' + entry.body + ',');
						} else if (entry.type === 'lychee.Definition') {
							code.push('\t\t' + v + ': ' + entry.value.reference + ',');
						} else if (entry.type === 'lychee.Namespace') {
							code.push('\t\t' + v + ': ' + entry.value.reference + ',');
						}

						code.push('');

					}


					let last = code[code.length - 2];
					if (last.endsWith(',')) {
						code[code.length - 2] = last.substr(0, last.length - 1);
					}

					code.push('\t};');

				}


				return code.join('\n');

			} else {
				// TODO: No name support (generating function bodies?)
			}


			return null;

		}

	};


	return Module;

});

