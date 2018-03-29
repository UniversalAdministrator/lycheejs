
lychee.specify('lychee').exports(function(lychee, sandbox) {

	const _Definition = lychee.import('lychee.Definition');



	/*
	 * TESTS
	 */

	sandbox.setMethod('assignsafe', function(assert, expect) {

	});

	sandbox.setMethod('assignunlink', function(assert, expect) {
	});

	sandbox.setMethod('blobof', function(assert, expect) {
	});

	sandbox.setMethod('diff', function(assert, expect) {
	});

	sandbox.setMethod('enumof', function(assert, expect) {
	});

	sandbox.setMethod('interfaceof', function(assert, expect) {
	});

	sandbox.setMethod('deserialize', function(assert, expect) {
	});

	sandbox.setMethod('serialize', function(assert, expect) {
	});

	sandbox.setMethod('assimilate', function(assert, expect) {
	});

	sandbox.setMethod('define', function(assert, expect) {

		let id  = 'sandbox.foo.Bar';
		let def = this.define(id);
		let env = this.environment;

		assert(def instanceof _Definition, true);
		assert(def.id,                     id);

		expect(assert => {

			def.exports(function(lychee, global, attachments) {
				assert(env.definitions[id] === def);
				return {};
			});

		});

	});

	sandbox.setMethod('export', function(assert, expect) {
	});

});

