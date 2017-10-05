
lychee.define('app.state.Welcome').includes([
	'lychee.ui.State'
]).requires([
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.entity.Text'
]).exports(function(lychee, global, attachments) {

	const _State = lychee.import('lychee.ui.State');
	const _BLOB  = attachments["json"].buffer;



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

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Welcome';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let menu = this.query('ui > menu');
			if (menu !== null) {

				menu.setHelpers([
					'refresh'
				]);

				this.query('ui > welcome > dialog').bind('change', function(value) {
					menu.setValue(value);
					menu.trigger('change', [ value ]);
				}, this);

			}

		}

	};


	return Composite;

});
