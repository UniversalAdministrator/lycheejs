#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
USER_WHO=`whoami`;
USER_LOG=`logname 2> /dev/null`;
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../"; pwd);

ALWAYS_YES="false";

if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;



_install() {

	cmd="$1";
	echo -e " (L)   $cmd";
	$cmd 1> /dev/null 2> /dev/null;

	if [ "$?" == "0" ]; then
		return 0;
	else
		return 1;
	fi;

}



if [ "$OS" == "darwin" ]; then
	OS="osx";
elif [ "$OS" == "linux" ]; then
	OS="linux";
elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then
	OS="bsd";
fi;



if [ "$USER_WHO" != "root" ]; then

	echo -e "\e[41m\e[97m";
	echo " (E) You are not root.                           ";
	echo "     Use \"sudo ./bin/maintenance/do-install.sh\". ";
	echo -e "\e[0m";

	exit 1;

elif [ "$OS" == "osx" ] && [ "$USER_WHO" == "root" ] && [ "$USER_LOG" == "root" ]; then

	echo -e "\e[41m\e[97m";
	echo " (E) You are root. Exit su shell and             ";
	echo "     Use \"sudo ./bin/maintenance/do-install.sh\". ";
	echo -e "\e[0m";

	exit 1;

else

	if [ "$ALWAYS_YES" == "true" ]; then

		SELECTION="required";

	else

		echo " (L) ";
		echo -e "\e[42m\e[97m (I) lychee.js Install Tool \e[0m";
		echo " (L) ";
		echo " (L) All your data are belong to us.                      ";
		echo " (L) This tool integrates lychee.js with your system.     ";
		echo " (L) ";
		echo " (L) No projects are harmed or modified by executing this ";
		echo " (L) script. This will only update all software packages. ";
		echo " (L) ";
		echo " (L) ";
		echo " (L) Please select the dependencies channel:              ";
		echo " (L) ";
		echo " (L) 1) minimal + optional dependencies                   ";
		echo " (L)    Required for mobile device support.               ";
		echo " (L) ";
		echo " (L) 2) minimal dependencies                              ";
		echo " (L)    No mobile device support.                         ";
		echo " (L) ";
		echo " (L) ";


		read -p " (L) Continue (1/2)? " -r

		if [[ $REPLY =~ ^[1]$ ]]; then
			SELECTION="optional";
		elif [[ $REPLY =~ ^[2]$ ]]; then
			SELECTION="required";
		else
			echo -e "\e[41m\e[97m (E) INVALID SELECTION \e[0m";
			exit 1;
		fi;

	fi;



	if [ "$OS" == "linux" ]; then

		# Arch
		if [ -x "/usr/bin/pacman" ]; then
			# XXX: libicns package not available (only AUR)
			REQUIRED_LIST="bash binutils arm-none-eabi-binutils coreutils sed zip unzip tar curl git";
			REQUIRED_CMD="pacman -S --noconfirm --needed $REQUIRED_LIST";
			OPTIONAL_LIST="jdk8-openjdk lib32-glibc lib32-libstdc++5 lib32-ncurses lib32-zlib";
			OPTIONAL_CMD="pacman -S --noconfirm --needed $OPTIONAL_LIST";

		# Alpine
		elif [ -x "/sbin/apk" ]; then

			# XXX: libicns arm-none-eabi-binutils packages not available
			REQUIRED_LIST="bash binutils coreutils sed zip unzip tar curl git";
			REQUIRED_CMD="apk add --no-cache $REQUIRED_LIST";
			# XXX: openjdk8 lib32-glibc lib32-libstdc++5 lib32-ncurses lib32-zlib packages not available
			OPTIONAL_LIST="";
			OPTIONAL_CMD="apk add --no-cache $OPTIONAL_LIST";

		# Debian/Ubuntu
		elif [ -x "/usr/bin/apt-get" ]; then
			REQUIRED_LIST="bash binutils binutils-multiarch coreutils icnsutils sed zip unzip tar curl git";
			REQUIRED_CMD="apt-get -y install $REQUIRED_LIST";
			OPTIONAL_LIST="openjdk-8-jdk libc6-i386 lib32stdc++6 lib32ncurses5 lib32z1";
			OPTIONAL_CMD="apt-get -y install $OPTIONAL_LIST";

		# Fedora
		elif [ -x "/usr/bin/dnf" ]; then
			REQUIRED_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils libicns-utils sed zip unzip tar curl git";
			REQUIRED_CMD="dnf -y install $REQUIRED_LIST";
			OPTIONAL_LIST="java-1.8.0-openjdk glibc.i686 libstdc++.i686 ncurses-libs.i686 zlib.i686";
			OPTIONAL_CMD="dnf -y install $OPTIONAL_LIST";

		# CentOS/old Fedora
		elif [ -x "/usr/bin/yum" ]; then
			REQUIRED_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils libicns-utils sed zip unzip tar curl git";
			REQUIRED_CMD="yum --setopt=alwaysprompt=no install $REQUIRED_LIST";
			OPTIONAL_LIST="java-1.8.0-openjdk glibc.i686 libstdc++.i686 ncurses-libs.i686 zlib.i686";
			OPTIONAL_CMD="yum --setopt=alwaysprompt=no install $OPTIONAL_LIST";

		# openSUSE
		elif [ -x "/usr/bin/zypper" ]; then
			REQUIRED_LIST="bash binutils coreutils icns-utils sed zip unzip tar curl git";
			REQUIRED_CMD="zypper --non-interactive install $REQUIRED_LIST";
			OPTIONAL_LIST="java-1_8_0-openjdk glibc-32bit libstdc++6-32bit libncurses5-32bit libz1-32bit";
			OPTIONAL_CMD="zypper --non-interactive install $OPTIONAL_LIST";
		fi;

	elif [ "$OS" == "bsd" ]; then

		# FreeBSD, NetBSD
		if [[ -x "/usr/sbin/pkg" ]]; then
			export ASSUME_ALWAYS_YES="yes";
			# XXX: icns-utils package not available
			REQUIRED_LIST="bash binutils coreutils sed zip unzip tar curl git";
			REQUIRED_CMD="pkg install $REQUIRED_LIST";
			OPTIONAL_LIST="openjdk8 libstdc++ lzlib ncurses";
			OPTIONAL_CMD="pkg install $OPTIONAL_LIST";
		fi;

	elif [ "$OS" == "osx" ]; then

		if [[ -x "/usr/local/bin/brew" ]]; then
			REQUIRED_LIST="binutils coreutils libicns gnu-sed gnu-tar curl git";
			REQUIRED_CMD="sudo -u $USER_LOG brew install $REQUIRED_LIST --with-default-names";
		elif [[ -x "/opt/local/bin/port" ]]; then
			REQUIRED_LIST="binutils coreutils libicns gsed zip unzip gnutar curl git";
			REQUIRED_CMD="port install $REQUIRED_LIST";
		fi;

	fi;



	if [ "$REQUIRED_CMD" != "" ]; then

		echo " (L) ";
		echo " (L) > Installing required dependencies ...";

		_install "$REQUIRED_CMD";

		if [ $? -eq 0 ]; then
			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";
		else
			echo -e "\e[41m\e[97m (E) > FAILURE \e[0m";
		fi;

	elif [ "$REQUIRED_CMD" == "" ]; then

		echo " (L) ";
		echo -e "\e[41m\e[97m";
		echo " (E)                                                           ";
		echo " (E) Your package manager is not supported.                    ";
		echo " (E) Feel free to modify this script!                          ";
		echo " (E)                                                           ";
		echo " (E) Please let us know about this at                          ";
		echo " (E) https://github.com/Artificial-Engineering/lycheejs/issues ";
		echo " (E)                                                           ";
		echo -e "\e[0m";

		exit 1;

	fi;

	if [ "$OPTIONAL_CMD" != "" ] && [ "$SELECTION" == "optional" ]; then

		echo " (L) ";
		echo " (L) > Installing optional dependencies ...";

		_install "$OPTIONAL_CMD";

		if [ $? -eq 0 ]; then
			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";
		else
			echo -e "\e[41m\e[97m (E) > FAILURE \e[0m";
		fi;

	fi;



	if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

		if [ -d /usr/share/applications ]; then

			echo " (L) ";
			echo " (L) > Integrating GUI applications ...";


			cp ./bin/helper/linux/lycheejs.svg /usr/share/icons/lycheejs.svg                                        2> /dev/null;
			cp ./bin/helper/linux/helper.desktop /usr/share/applications/lycheejs-helper.desktop                    2> /dev/null;
			sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-helper.desktop"                2> /dev/null;

			cp "$LYCHEEJS_ROOT/libraries/ranger/bin/ranger.desktop" /usr/share/applications/lycheejs-ranger.desktop 2> /dev/null;
			ranger_root="$LYCHEEJS_ROOT/libraries/ranger"                                                           2> /dev/null;
			sed -i 's|__ROOT__|'$ranger_root'|g' /usr/share/applications/lycheejs-ranger.desktop                    2> /dev/null;

			cp "$LYCHEEJS_ROOT/libraries/studio/bin/studio.desktop" /usr/share/applications/lycheejs-studio.desktop 2> /dev/null;
			studio_root="$LYCHEEJS_ROOT/libraries/studio"                                                           2> /dev/null;
			sed -i 's|__ROOT__|'$studio_root'|g' /usr/share/applications/lycheejs-studio.desktop                    2> /dev/null;


			update_desktop=`which update-desktop-database`;
			if [ "$update_desktop" != "" ]; then
				echo " (L)   update-desktop-database";
				$update_desktop 1> /dev/null 2> /dev/null;
			fi;

			update_desktop=`which xdg-desktop-menu`;
			if [ "$update_desktop" != "" ]; then
				echo " (L)   xdg-desktop-menu forceupdate";
				$update_desktop forceupdate 1> /dev/null 2> /dev/null;
			fi;


			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

		if [ -d /usr/local/bin ]; then

			echo " (L) ";
			echo " (L) > Integrating CLI applications ...";


			rm /usr/local/bin/lycheejs-breeder         2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer      2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester       2> /dev/null;
			rm /usr/local/bin/lycheejs-helper          2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger          2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer        2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer-fixer  2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer-fuzzer 2> /dev/null;
			rm /usr/local/bin/lycheejs-studio          2> /dev/null;

			ln -s "$LYCHEEJS_ROOT/bin/helper.sh"                             /usr/local/bin/lycheejs-helper;
			ln -s "$LYCHEEJS_ROOT/libraries/breeder/bin/breeder.sh"          /usr/local/bin/lycheejs-breeder;
			ln -s "$LYCHEEJS_ROOT/libraries/fertilizer/bin/fertilizer.sh"    /usr/local/bin/lycheejs-fertilizer;
			ln -s "$LYCHEEJS_ROOT/libraries/harvester/bin/harvester.sh"      /usr/local/bin/lycheejs-harvester;
			ln -s "$LYCHEEJS_ROOT/libraries/ranger/bin/ranger.sh"            /usr/local/bin/lycheejs-ranger;
			ln -s "$LYCHEEJS_ROOT/libraries/strainer/bin/strainer.sh"        /usr/local/bin/lycheejs-strainer;
			ln -s "$LYCHEEJS_ROOT/libraries/strainer/bin/strainer-fixer.sh"  /usr/local/bin/lycheejs-strainer-fixer;
			ln -s "$LYCHEEJS_ROOT/libraries/strainer/bin/strainer-fuzzer.sh" /usr/local/bin/lycheejs-strainer-fuzzer;
			ln -s "$LYCHEEJS_ROOT/libraries/studio/bin/studio.sh"            /usr/local/bin/lycheejs-studio;


			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;


		if [ -d /usr/share/bash-completion/completions ]; then

			echo " (L) ";
			echo " (L) > Integrating CLI autocompletions ...";

			cp ./bin/helper-autocomplete.sh /usr/share/bash-completion/completions/lycheejs;

			rm /usr/share/bash-completion/completions/lycheejs-breeder    2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-fertilizer 2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-harvester  2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-strainer   2> /dev/null;

			ln -s /usr/share/bash-completion/completions/lycheejs /usr/share/bash-completion/completions/lycheejs-breeder;
			ln -s /usr/share/bash-completion/completions/lycheejs /usr/share/bash-completion/completions/lycheejs-fertilizer;
			ln -s /usr/share/bash-completion/completions/lycheejs /usr/share/bash-completion/completions/lycheejs-harvester;
			ln -s /usr/share/bash-completion/completions/lycheejs /usr/share/bash-completion/completions/lycheejs-strainer;

			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		elif [ -d /etc/bash_completion.d ]; then

			echo " (L) ";
			echo " (L) > Integrating CLI autocompletions ...";

			cp ./bin/helper-autocomplete.sh /etc/bash_completion.d/lycheejs;

			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

	elif [ "$OS" == "osx" ]; then

		echo " (L) ";
		echo " (L) > Integrating GUI applications ...";


		echo " (L)   open ./bin/helper/osx/helper.app";
		open ./bin/helper/osx/helper.app 2> /dev/null;


		echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";


		if [ -d /usr/local/bin ]; then

			echo " (L) ";
			echo " (L) > Integrating CLI applications ...";


			# Well, fuck you, Apple.
			if [ ! -f /usr/local/bin/png2icns ]; then
				cp "$LYCHEEJS_ROOT/bin/helper/osx/png2icns.sh" /usr/local/bin/png2icns;
				chmod +x /usr/local/bin/png2icns;
			fi;


			rm /usr/local/bin/lycheejs-breeder         2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer      2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester       2> /dev/null;
			rm /usr/local/bin/lycheejs-helper          2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger          2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer        2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer-fixer  2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer-fuzzer 2> /dev/null;
			rm /usr/local/bin/lycheejs-studio          2> /dev/null;

			ln -s "$LYCHEEJS_ROOT/bin/helper.sh"                             /usr/local/bin/lycheejs-helper;
			ln -s "$LYCHEEJS_ROOT/libraries/breeder/bin/breeder.sh"          /usr/local/bin/lycheejs-breeder;
			ln -s "$LYCHEEJS_ROOT/libraries/fertilizer/bin/fertilizer.sh"    /usr/local/bin/lycheejs-fertilizer;
			ln -s "$LYCHEEJS_ROOT/libraries/harvester/bin/harvester.sh"      /usr/local/bin/lycheejs-harvester;
			ln -s "$LYCHEEJS_ROOT/libraries/ranger/bin/ranger.sh"            /usr/local/bin/lycheejs-ranger;
			ln -s "$LYCHEEJS_ROOT/libraries/strainer/bin/strainer.sh"        /usr/local/bin/lycheejs-strainer;
			ln -s "$LYCHEEJS_ROOT/libraries/strainer/bin/strainer-fixer.sh"  /usr/local/bin/lycheejs-strainer-fixer;
			ln -s "$LYCHEEJS_ROOT/libraries/strainer/bin/strainer-fuzzer.sh" /usr/local/bin/lycheejs-strainer-fuzzer;
			ln -s "$LYCHEEJS_ROOT/libraries/studio/bin/studio.sh"            /usr/local/bin/lycheejs-studio;


			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

		if [ -d /etc/bash_completion.d ]; then

			echo " (L) ";
			echo " (L) > Integrating CLI autocompletions ...";

			cp ./bin/helper-autocomplete.sh /etc/bash_completion.d/lycheejs;

			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

	fi;

fi;

