
lychee.define('fertilizer.template.nidium.Library').includes([
	'fertilizer.Template'
]).exports(function(lychee, global, attachments) {

	const _Template = lychee.import('fertilizer.Template');
	const _TEMPLATE = attachments["tpl"];



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		_Template.call(this, data);


		this.__index = lychee.deserialize(lychee.serialize(_TEMPLATE));



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {
			console.log('fertilizer: CONFIGURE');
			oncomplete(true);
		}, this);

		this.bind('build', function(oncomplete) {

			let env   = this.environment;
			let stash = this.stash;

			if (env !== null && stash !== null) {

				console.log('fertilizer: BUILD ' + env.id);


				let sandbox = this.sandbox;
				let index   = this.__index;


				index.buffer = index.buffer.replaceObject({
					blob: env.serialize(),
					id:   env.id
				});


				stash.write(sandbox + '/index.js', index);


				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {
			console.log('fertilizer: PACKAGE');
			oncomplete(true);
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Template.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.template.nidium.Library';


			return data;

		}

	};


	return Composite;

});

