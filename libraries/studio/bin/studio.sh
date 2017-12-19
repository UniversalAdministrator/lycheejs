#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_FERTILIZER=`which lycheejs-fertilizer`;
LYCHEEJS_HELPER=`which lycheejs-helper`;


# XXX: Allow /tmp/lycheejs usage
if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	LYCHEEJS_FERTILIZER="$PWD/libraries/fertilizer/bin/fertilizer.sh";
	LYCHEEJS_HELPER="$PWD/bin/helper.sh";
fi;


if [ "$LYCHEEJS_HELPER" != "" ] && [ "$LYCHEEJS_FERTILIZER" != "" ]; then

	cd $LYCHEEJS_ROOT/libraries/studio;
	cp ./index-normal.html ./index.html;
	sed -i "s|/libraries/lychee/build/html|file:///opt/lycheejs/libraries/lychee/build/html-nwjs|g" index.html;
	sed -i "s|'html/main'|'html-nwjs/main'|g" index.html;

	cd $LYCHEEJS_ROOT;

	$LYCHEEJS_FERTILIZER html-nwjs/main /libraries/studio;

	project="$1";

	if [ "$project" != "" ]; then
		$LYCHEEJS_HELPER run:html-nwjs/main /libraries/studio "$project";
	else
		$LYCHEEJS_HELPER run:html-nwjs/main /libraries/studio;
	fi;

	exit $?;

else

	exit 1;

fi;

