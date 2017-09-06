#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

# XXX: Allow /tmp/lycheejs usage
if [ -z "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="/opt/lycheejs";
fi;

LYCHEEJS_NODE="";
PACKAGE_CMD="";
CORE_FLAG="false";


if [ "$1" == "--core" ]; then
	CORE_FLAG="true";
fi;


if [ "$ARCH" == "x86_64" -o "$ARCH" == "amd64" ]; then
	ARCH="x86_64";
fi;

if [ "$ARCH" == "i386" -o "$ARCH" == "i686" -o "$ARCH" == "i686-64" ]; then
	ARCH="x86";
fi;

if [ "$ARCH" == "armv7l" -o "$ARCH" == "armv8" ]; then
	ARCH="arm";
fi;


if [ "$OS" == "darwin" ]; then

	OS="osx";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw";

elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then

	# XXX: BSD requires Linux binary compatibility

	OS="bsd";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw";

fi;

_echo_result() {

	code="$1";

	if [ "$code" == "0" ]; then
		echo -e " (I) SUCCESS\n";
	else
		echo -e " (E) FAILURE\n";
	fi;

}


if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

	cd $LYCHEEJS_ROOT;

	$LYCHEEJS_NODE ./bin/configure.js;

	echo -e "";


	if [ "$?" == "0" ]; then

		echo -e " (L) Building lychee.js Libraries";

		./libraries/fertilizer/bin/fertilizer.sh auto /libraries/lychee;

		_echo_result $?;


		echo -e " (L) Distributing lychee.js Libraries";

		if [ "$CORE_FLAG" == "false" ]; then

			./libraries/fertilizer/bin/fertilizer.sh */dist /libraries/breeder;
			./libraries/fertilizer/bin/fertilizer.sh */dist /libraries/fertilizer;
			./libraries/fertilizer/bin/fertilizer.sh */dist /libraries/harvester;
			./libraries/fertilizer/bin/fertilizer.sh */dist /libraries/strainer;

			./libraries/fertilizer/bin/fertilizer.sh */dist /libraries/ranger;
			./libraries/fertilizer/bin/fertilizer.sh */dist /libraries/studio;

		fi;

		_echo_result 0;


		echo -e " (L) Learning lychee.js Library";

		if [ "$CORE_FLAG" == "false" ]; then
			./libraries/strainer/bin/strainer.sh check /libraries/lychee;
		fi;

		_echo_result $?;

	else

		echo -e " (E) FAILURE\n";

		exit 1;

	fi;

fi;


if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

	echo -e " (L) Fixing CHMOD/CHOWN rights";


	cd $LYCHEEJS_ROOT;



	# Default chmod rights for folders

	find ./libraries -type d -print0 | xargs -0 chmod 777;
	find ./libraries -type f -print0 | xargs -0 chmod 666;

	find ./projects -type d -print0 | xargs -0 chmod 777;
	find ./projects -type f -print0 | xargs -0 chmod 666;



	# Make command line tools explicitely executable

	chmod +x ./libraries/*/harvester.js 2> /dev/null;
	chmod +x ./libraries/*/bin/*.sh     2> /dev/null;
	chmod +x ./projects/*/harvester.js  2> /dev/null;
	chmod +x ./projects/*/bin/*.sh      2> /dev/null;

	chmod 0777 ./bin;
	chmod -R 0777 ./libraries/harvester/profiles;


	chmod +x ./bin/configure.js;
	chmod +x ./bin/helper.sh;



	# Make fertilizers explicitely executable

	chmod +x ./bin/runtime/bin/*.sh;
	chmod +x ./bin/runtime/*/package.sh;
	chmod +x ./bin/runtime/*/update.sh;



	# Make runtimes explicitely executable

	if [ -f "$LYCHEEJS_NODE" ]; then
		chmod +x $LYCHEEJS_NODE;
	fi;

	if [ -f "$LYCHEEJS_NWJS" ]; then
		chmod +x $LYCHEEJS_NWJS;
	fi;


	echo -e " (I) SUCCESS\n";

fi;


if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

	if [ -e "$LYCHEEJS_ROOT/.git/config" ]; then

		echo -e " (L) Fixing GIT config";


		cd $LYCHEEJS_ROOT;

		check_remote=$(cat .git/config | grep '\[remote "upstream"\]');

		if [ "$check_remote" == "" ]; then

			echo -e "[remote \"upstream\"]" >> .git/config;
			echo -e "\turl = https://github.com/Artificial-Engineering/lycheejs.git" >> .git/config;
			echo -e "\tfetch = +refs/heads/*:refs/remotes/upstream/*" >> .git/config;

		fi;


		echo -e " (I) SUCCESS\n";

	fi;

fi;

