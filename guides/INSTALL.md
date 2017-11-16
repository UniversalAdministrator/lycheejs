
# Install Guide for lychee.js

![./asset/quickstart.gif](./asset/quickstart.gif)

This is the it-works-failsafe guide of how to install the lychee.js
Engine on your development machine. For everything related to Bundles,
Dev Ops, Security, Deployments and Virtualization - please consult the
[lychee.js Guide](https://github.com/Artificial-Engineering/lycheejs-guide.git).


### 1) Installation

The Net Installer automatically installs the lychee.js Engine
on any UNIX-compatible machine (arm, x86 or amd64). The only
requirements beforehand are working `bash`, `curl` and `git`.

The lychee.js Engine installation requires at least 2GB of free
memory space at `/opt/lycheejs`. 4GB are recommended to have a
fully working AI knowledge integration.

Depending on your internet connection speed, the installation
will take a couple minutes (needs to download ca. 500MB zip
file of runtime binaries which is hosted in the releases section
of the [lycheejs-runtime](https://github.com/Artificial-Engineering/lycheejs-runtime/releases)
repository).

Notes:

- **Windows** is **unsupported** as development host. Use a VM, the [Docker Image (Arch Linux)](https://hub.docker.com/r/cookiengineer/lycheejs), the [Docker Mini Image (Alpine Linux)](https://hub.docker.com/r/cookiengineer/lycheejs-mini/) or the [Dockerfile](https://github.com/Artificial-Engineering/lycheejs-bundle/blob/master/bin/package/docker/Dockerfile) instead.
- GNU/Linux requires either of `apk`, `apt-get`, `dnf`, `pacman`, `yum` or `zipper` installed beforehand.
- Mac OSX requires [brew](https://brew.sh) installed beforehand.
- FreeBSD/NetBSD requires `pkg` installed and [Linux Compatibility](https://www.freebsd.org/doc/handbook/linuxemu-lbc-install.html) activated beforehand.

```bash
# Install lychee.js Engine into /opt/lycheejs
sudo bash -c "$(curl -fsSL https://lychee.js.org/install.sh)";
```


### 2) (Required) Manual eslint Installation

The lychee.js Engine heavily relies on [eslint](https://github.com/eslint)
for both static and dynamic code analysis, as eslint helps
to ease up the parsing part in the lychee.js Strainer as
it can rely on an easy-to-parse codestyle.

If `eslint` is not installed, most of the AI-related code
learning features and autofix functionalities will be
deactivated and/or probably throw an endless list of errors.

Therefore it is recommended to install eslint on your system
globally and to link it into the lychee.js folder.

```bash
sudo npm install -g eslint;

cd /opt/lycheejs;
npm link eslint;
```


### 3) Bootup

The `lycheejs-harvester` integrates all projects with the
Software Bots. Start the `development` profile and open
`http://localhost:8080` in your Blink-based Browser.

```bash
cd /opt/lycheejs;

# Bootup lychee.js Harvester
lycheejs-harvester start development;
```


### 4) Repository Integration

<img src="./asset/quickstart-collaborators.png" align="right" width="340px">

The lychee.js Project is tightly integrated with our
Artificial Intelligence, which is represented by the account
[@humansneednotapply](https://github.com/humansneednotapply).

If you want to have our AI to learn and improve from your project
(read the LICENSE section for caveats first), you need to create a
[Personal Access Token](https://github.com/settings/tokens)
with `repo` rights and put the token in the `.github/TOKEN` file:

```bash
cd /opt/lycheejs;

echo "MY-PERSONAL-ACCESS-TOKEN" > .github/TOKEN;
```

Then you must add the account [@humansneednotapply](https://github.com/humansneednotapply)
to your lychee.js Project's repository collaborators in its
`Settings > Collaborators & teams` section.

Notes:

- You need to add @humansneednotapply to each of your lychee.js Projects' repositories.
- You do **not** need to add @humansneednotapply to your lychee.js Fork.


### 5) IDE Integration

The [lychee.js Strainer](../libraries/strainer) also allows usage
in quickfix mode, which in return can be easily integrated into
any IDE as an external linter command.

The `lycheejs-strainer-fixer` command will show errors
every time it could not understand your code, its meanings
or its relations to other definitions.

The output format of the `lycheejs-strainer-fixer` command is
the following, where each line represents a separate error:

```bash
/path/to/file.js:line:column: Error Message. [error-rule-id]
```

```bash
# Example Output
[$] cd /opt/lycheejs;
[$] lycheejs-strainer-fixer libraries/lychee/source/app/Main.js
libraries/lychee/source/app/Main.js:37:11: Parsing error: Unexpected token an. [parser-error]
libraries/lychee/source/app/Main.js:426:3: Invalid return value for method "init()". [no-return-value]
libraries/lychee/source/app/Main.js:507:3: Invalid return value for method "destroy()". [no-return-value]
libraries/lychee/source/app/Main.js:559:22: Invalid parameter values for "id" for method "setState()". [no-parameter-value]
libraries/lychee/source/app/Main.js:577:26: Invalid parameter values for "whatever" for method "getState()". [no-parameter-value]

5 problems
```


**VIM / NeoVIM**:

An integration for VIM's [ALE](https://github.com/w0rp/ALE) plugin
is available. Copy the [strainer.vim](../bin/linter/ale/strainer.vim)
file to `~/.vim/ale_linters/javascript/strainer.vim` and add the
following lines to your `.vimrc`:

```vim
if filereadable("lychee.store") || filereadable("lychee.pkg")
	let g:ale_linters = { 'javascript': [ 'strainer' ] }
endif
```

