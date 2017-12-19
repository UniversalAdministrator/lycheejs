#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_FERTILIZER=`which lycheejs-fertilizer`;
LYCHEEJS_HELPER=`which lycheejs-helper`;


if [ "$LYCHEEJS_HELPER" != "" ] && [ "$LYCHEEJS_FERTILIZER" != "" ]; then

	cd $LYCHEEJS_ROOT/libraries/studio;
	cp ./index-debug.html ./index.html;
	sed -i "s|/libraries/lychee/build/html|file:///opt/lycheejs/libraries/lychee/build/html-nwjs|g" index.html;
	sed -i "s|'html/main'|'html-nwjs/main'|g" index.html;

	cd $LYCHEEJS_ROOT/libraries/studio;
	nw .;

	exit $?;

else

	exit 1;

fi;

