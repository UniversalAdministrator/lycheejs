
lychee.define('ranger.state.Console').requires([
	'ranger.ui.entity.Console',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	const _State  = lychee.import('lychee.ui.State');
	const _BLOB   = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _on_sync = function(data) {

		let blob  = data.blob || {};
		let value = [{
			stdout: blob.stdout || '',
			stderr: blob.stderr || ''
		}];


		if (value.length > 0) {

			let table = this.query('ui > console > status > 0');
			if (table !== null) {
				table.setValue(value);
			}


			let blueprint = this.query('ui > console');
			if (blueprint !== null) {
				blueprint.trigger('relayout');
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let viewport = this.viewport;
			if (viewport !== null) {

				let blueprint = this.query('ui > console');
				let element   = this.query('ui > console > status');

				if (blueprint !== null && element !== null) {

					viewport.relay('reshape', element);

					blueprint.bind('#relayout', function(blueprint) {

						element.width  = blueprint.width - 64;
						element.height = blueprint.height;

						let entity = element.getEntity('0');
						if (entity !== null) {

							entity.width  = element.width  - 32;
							entity.height = element.height - 96;

							let left  = entity.getEntity('0');
							let right = entity.getEntity('1');
							if (left !== null && right !== null) {

								left.width   = entity.width / 2 - 4;
								left.height  = entity.height - 96;
								left.trigger('relayout');

								right.width  = entity.width / 2 - 4;
								right.height = entity.height - 96;
								right.trigger('relayout');

							}

							entity.trigger('relayout');

						}

						element.trigger('relayout');

					}, this);

				}

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'ranger.state.Console';


			return data;

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = data instanceof Object         ? data       : null;


			let status = this.query('ui > console > status');
			if (status !== null) {
				status.setVisible(true);
			}


			let client = this.client;
			if (client !== null) {

				let service = client.getService('console');
				if (service !== null) {
					service.bind('sync', _on_sync, this);
					service.sync();
				}

			}


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let client = this.client;
			if (client !== null) {

				let service = client.getService('console');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
