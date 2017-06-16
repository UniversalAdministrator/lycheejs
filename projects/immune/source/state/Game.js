
lychee.define('game.state.Game').requires(
	'game.app.entity.Cell',
	'game.app.entity.Unit',
	'game.app.entity.Vesicle',
	'lychee.app.Layer',
	'lychee.ui.Layer',
	'lychee.ui.entity.Label'
).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _State = lychee.import('lychee.app.State');
	const _BLOB  = attachments["json"].buffer;



	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

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


			// TODO: data is level identifier


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});

