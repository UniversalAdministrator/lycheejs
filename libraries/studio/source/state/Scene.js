
lychee.define('studio.state.Scene').includes([
	'lychee.ui.State'
]).requires([
	// 'studio.ui.element.select.Scene',
	// 'studio.ui.element.modify.Scene',
	// 'studio.ui.element.preview.Scene',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	const _State = lychee.import('lychee.ui.State');
	const _SCENE = lychee.import('lychee.codec.SCENE');
	const _BLOB  = attachments["json"].buffer;

	// const _LAYER_TYPES = {
	// 	'lychee.ui.Blueprint',
	// 	'lychee.ui.Element',
	// 	'lychee.ui.Layer',
	// 	'lychee.app.Layer'
	// };



	/*
	 * HELPERS
	 */

	const _update_view = function() {
	};

	const _on_select_change = function(value) {
	};

	const _on_modify_change = function(value) {
	};

	const _on_preview_change = function(action) {
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'studio.state.Scene';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let select = this.query('ui > asset > select');
			if (select !== null) {
				select.bind('change', _on_select_change, this);
			}


			let modify  = this.query('ui > asset > modify');
			let preview = this.query('ui > asset > preview');

			if (modify !== null && preview !== null) {

				modify.bind('change', function(value) {

					preview.setValue(value);

					setTimeout(function() {
						preview.trigger('relayout');
					}, 200);

				}, this);
				preview.bind('change', _on_preview_change, this);

			}

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : null;


			let project = this.main.project;
			let select  = this.query('ui > scene > select');

			if (project !== null && select !== null) {

				let filtered = [];
				let scenes   = project.getScenes();

				scenes.forEach(function(state) {

					// TODO: Iterate over state.layers
					// TODO: Iterate recursively until no blueprint,
					// no element and no layer is found

				});

				select.setData(filtered);

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

