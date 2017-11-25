
lychee.define('studio.state.Scene').requires([
	// 'studio.ui.element.select.Scene',
	// 'studio.ui.element.modify.Scene',
	// 'studio.ui.element.preview.Scene',
	'lychee.app.Layer',
	'lychee.event.Flow',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	const _Flow  = lychee.import('lychee.event.Flow');
	const _Layer = lychee.import('lychee.app.Layer');
	const _State = lychee.import('lychee.ui.State');
	// const _SCENE = lychee.import('lychee.codec.SCENE');
	const _BLOB  = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _walk_layer = function(data, query) {

		let cache = this;


		cache.push({
			query:       query,
			constructor: data.constructor,
			layer:       lychee.blobof(_Layer, data)
		});


		if (data.blob instanceof Object) {

			let entities = data.blob.entities;
			let map      = data.blob.map;

			if (entities instanceof Array) {

				if (map instanceof Object) {

					entities.forEach(function(entity, e) {

						let id = null;

						for (let mid in map) {

							if (map[mid] === e) {
								id = mid;
							}

						}

						if (id !== null) {
							_walk_layer.call(cache, entity, query + ' > ' + id);
						} else {
							_walk_layer.call(cache, entity, query + ' > ' + e);
						}

					});

				} else {

					entities.forEach(function(entity, e) {
						_walk_layer.call(cache, entity, query + ' > ' + e);
					});

				}

			}

		}

	};

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
			// let select  = this.query('ui > scene > select');

			// if (project !== null && select !== null) {
			if (project !== null) {

				let cache   = { configs: [], states: [] };
				let flow    = new _Flow();
				let sandbox = project.identifier + '/source';


				flow.bind('load', function(oncomplete) {

					let scenes = project.getScenes();
					if (scenes.length > 0) {

						let remaining = scenes.length;

						scenes.forEach(function(path) {

							let config = new Config(sandbox + '/' + path);

							config.onload = function(result) {

								if (result === true) {
									cache.configs.push(this);
								}

								remaining--;

								if (remaining === 0) {
									oncomplete(true);
								}

							};

							config.load();

						});

					} else {

						oncomplete(true);

					}

				}, this);

				flow.bind('parse', function(oncomplete) {

					let configs = cache.configs;
					if (configs.length > 0) {

						configs.forEach(function(config) {

							let state  = config.url.split('/').pop().split('.')[0].toLowerCase();
							let layers = config.buffer.layers;

							if (cache.states[state] === undefined) {
								cache.states[state] = [];
							}

							for (let lid in layers) {
								_walk_layer.call(cache.states[state], layers[lid], lid);
							}

						});

					}

					// TODO: lychee.blobof(interface, blob);
					// that returns true if inheritance chain is correct

					oncomplete(true);

					// TODO: Iterate recursively until no blueprint,
					// no element and no layer is found
				}, this);

				flow.bind('render', function(oncomplete) {

					console.log(cache);
					oncomplete(true);

				}, this);

				flow.then('load');
				flow.then('parse');
				flow.then('render');

				flow.init();

				// TODO: select.setData(list);
				// TODO: list.setData(...);
				// select.setData(filtered);

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

