
lychee.specify('lychee.Definition').exports(function(lychee, sandbox) {

	const _Definition = lychee.import('lychee.Definition');
	const _Config     = lychee.import('Config');
	const _Font       = lychee.import('Font');
	const _Music      = lychee.import('Music');
	const _Sound      = lychee.import('Sound');
	const _Texture    = lychee.import('Texture');
	const _Stuff      = lychee.import('Stuff');



	/*
	 * TESTS
	 */

	sandbox.setSettings({
		id:  'sandbox.foo.bar.Qux',
		url: '/tmp/sandbox/source/foo/bar/Qux.js'
	});

	sandbox.setBlob({
		includes: [
			'sandbox.foo.Bar',
			'sandbox.foo.Qux'
		],
		requires: [
			'sandbox.foo.Doo'
		]
	});

	sandbox.setProperty('id', function(assert, expect) {

		let id    = 'sandbox.foo.Bar';
		let check = 'not.Allowed$';


		assert(this.id, sandbox.settings.id);

		assert(this.setId(id), true);
		assert(this.id,        id);

		assert(this.setId(check), false);
		assert(this.id,           id);

	});

	sandbox.setProperty('url', function(assert, expect) {

		let url = '/tmp/sandbox/source/foo/Bar.js';

		assert(this.url, '/tmp/sandbox/source/foo/bar/Qux.js');

		assert(this.setUrl(url), true);
		assert(this.url,         url);

		assert(this.setId(''), false);
		assert(this.id,        'sandbox.foo.Bar');

	});

	sandbox.setMethod('attaches', function(assert, expect) {

		let config = new _Config();


		assert(this._attaches.json instanceof _Config, false);
		assert(this._attaches.json === config,         false);

		this.attaches({
			json: config
		});

		assert(this._attaches.json, config);


		expect(assert => {

			this.exports(function(lychee, global, attachments) {
				assert(attachments['json'], config);
				return {};
			});


			let scope  = {};
			let result = this.export(scope);

			assert(result, true);

		});

	});

	sandbox.setMethod('check', function(assert, expect) {
		// TODO: check method
	});

	sandbox.setMethod('export', function(assert, expect) {
		// TODO: export method
	});

	sandbox.setMethod('exports', function(assert, expect) {


	});

	sandbox.setMethod('includes', function(assert, expect) {

		assert(this._includes,        sandbox.blob.includes);
		assert(this._includes.length, sandbox.blob.includes.length);

		this.includes([
			'sandbox.foo.Bar'
		]);

		assert(this._includes.length, sandbox.blob.includes.length);

		this.includes([
			'sandbox.foo.Foo'
		]);

		assert(this._includes.length, sandbox.blob.includes.length + 1);

	});

	sandbox.setMethod('requires', function(assert, expect) {

		assert(this._requires,        sandbox.blob.requires);
		assert(this._requires.length, sandbox.blob.requires.length);

		this.requires([
			'sandbox.foo.Doo'
		]);

		assert(this._requires.length, sandbox.blob.requires.length);

		this.requires([
			'sandbox.foo.Foo'
		]);

		assert(this._requires.length, sandbox.blob.requires.length + 1);

	});

	sandbox.setMethod('supports', function(assert, expect) {
	});

	sandbox.setMethod('tags', function(assert, expect) {
	});

});

