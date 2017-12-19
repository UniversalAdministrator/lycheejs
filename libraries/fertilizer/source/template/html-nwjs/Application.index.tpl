<!DOCTYPE Html>
<html>
<head>
	<meta charset="utf-8">
	<title>${id}</title>

	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
	<link rel="icon" href="./icon.png" sizes="128x128" type="image/png">

	<script src="./core.js"></script>

	<style>
		.lychee-Renderer {
			margin: 0 auto;
		}
	</style>

</head>
<body>
<script>
(function(lychee, global) {

	let environment = lychee.deserialize(${blob});
	if (environment !== null) {

		lychee.init(environment, {
			profile: ${profile}
		});

	}

})(lychee, typeof global !== 'undefined' ? global : this);
</script>
</body>
</html>
