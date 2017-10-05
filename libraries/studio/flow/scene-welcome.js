
(function(flow) {

	flow.then(function(oncomplete) {

		let entity = this.main.state.query('ui > project > select > search');
		entity.setValue('/projects/boilerplate');
		entity.trigger('change', [ entity.value ]);

		setTimeout(function() {
			oncomplete(true);
		}, 200);

	});

	flow.then(function(oncomplete) {

		let entity = this.main.state.query('ui > menu');
		entity.setValue('Scene');
		entity.trigger('change', [ entity.value ]);

		setTimeout(function() {
			oncomplete(true);
		}, 1000);

	});

	flow.then(function(oncomplete) {

		let entity = this.main.state.query('ui > scene > select > search');
		entity.setValue('welcome/ui/welcome');
		entity.trigger('change', [ entity.value ]);

		setTimeout(function() {
			oncomplete(true);
		}, 200);

	});

	flow.bind('error', function(error) {
		console.error(error);
	});

	flow.bind('complete', function() {
		console.info('Flow completed.');
	});

	flow.init();

})(new lychee.app.Flow(this.MAIN));

