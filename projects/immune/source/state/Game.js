
lychee.define('game.state.Game').requires([
	'game.app.entity.Cell',
	'game.app.entity.Unit',
	'game.app.entity.Vesicle',
	'lychee.app.Layer',
	'lychee.ui.Layer'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _State  = lychee.import('lychee.app.State');
	const _BLOB   = attachments["json"].buffer;
	const _LEVELS = attachments["levels.json"].buffer;



	/*
	 * HELPERS
	 */

	const _on_touch = function(id, position, delta) {

		let game   = this.getLayer('game');
		let entity = game.getEntity(null, position);
		if (entity !== null) {
			// TODO: Touched an Entity
			console.log('Touched entity', entity);
		} else {
			console.log('you cant touch this', position);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},


		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : 'immune-01';


			let layer = this.getLayer('ui');
			if (layer !== null) {
				layer.bind('touch', _on_touch, this);
			}


			let level = _LEVELS[data] || null;
			if (level !== null) {

				let entities = level.map(function(value) {
					return lychee.deserialize(value);
				});

				let game = this.getLayer('game');
				if (game !== null) {
					game.setEntities(entities);
				}

			}


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let layer = this.getLayer('ui');
			if (layer !== null) {
				layer.unbind('touch', _on_touch, this);
			}

			let game = this.getLayer('game');
			if (game !== null) {
				game.removeEntities();
			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});

