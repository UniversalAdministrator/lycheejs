<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>${id}</title>

	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

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
