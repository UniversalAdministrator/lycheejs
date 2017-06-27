<application>
	<meta>
		<title>${id}</title>
		<viewport>1024x768</viewport>
		<identifier>${id}</identifier>
	</meta>
	<assets>
		<script src="./core.js"></script>
		<script>
		(function(lychee, global) {

			let environment = lychee.deserialize(${blob});
			if (environment !== null) {
				lychee.envinit(environment, ${profile});
			}

		})(lychee, typeof global !== 'undefined' ? global : this);
		</script>
	</assets>
</application>

