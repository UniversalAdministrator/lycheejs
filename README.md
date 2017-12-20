
# lychee.js (2017-Q4)

<img src="./guides/asset/qr-codes.png" align="right" width="500px">

brought to you as libre software with joy and pride by [Artificial Engineering](http://artificial.engineering).

Support our libre Bot Cloud via BTC [1CamMuvrFU1QAMebPoDsL3JrioVDoxezY2](bitcoin:1CamMuvrFU1QAMebPoDsL3JrioVDoxezY2?amount=0.5&label=lychee.js%20Support).


**Work-in-Progress (aka alpha)**

These are the things that we are currently working on:

- lychee.net.protocol.MQTT is being implemented to support SCADA systems (`feature/mqtt` branch).
- lychee.ai.neat (ES/HyperNEAT AI) is being refactored and unstable (`feature/neat` branch).
- lychee.Simulation is being integrated with the AI stack and unstable.
- lychee.js Guide is subject to change (to integrate new AI stack).


## ELI5 - What is lychee.js?

Okay. I kind of failed to explain what lychee.js is because there's currently no
words for something like it in our language. So I'm trying to explain why which
feature was integrated and what benefits resulted in its history of development.

First it was a Game / App Engine that had the idea to reuse components
across all environments using so-called [Fertilizer Adapters](./libraries/lychee/source/platform)
with a strong core definition system that allowed feature detection and automated
isomorphic builds from and to every single platform it supports using the
[lychee.js Fertilizer](./libraries/fertilizer).

Then it got a strong serialization / deserialization concept that allowed
simulations across all platforms. Errors could be reproduced everywhere, even
network traffic and user interactions were put in event graphs and identified
by neural networks to figure out what module (in the flow-based-programming
sense) had corrupt data.

Then it got an evolutionary [lychee.ai](./libraries/lychee/source/ai) Stack
(backpropagated ES/HyperNEAT) that allowed an AI to learn combinations of all
Definitions using a Module Pattern or Composite Pattern. Class Pattern failed,
because Classes are a time abstraction so they suck in complexity. Deal with it :)

Then it got a generic plug/play neural network support; so that the [lychee.policy](./libraries/lychee/source/policy)
Stack allowed to generically translate _every property_ in all Composites into
what neural networks can understand. As everything in lychee.js is serializable
and uses a Composite Pattern, things like traffic sharding, automated layouting
or animation learning and debugging of it got inclusive.

Then it got an easier tool to create new boilerplates which allowed the possibility
to reuse other projects as libraries and vice versa. Every single lychee.js
Project or Library was fully isomorphic and could be forked, modified, back-merged,
or included as a library using the [lychee.js Breeder](./libraries/breeder). Things
like A/B testing new Composites or Definitions in-place now were a matter of
literally seconds.

Then the knowledge graph was reused to build a better fuzz-testing tool, the
[lychee.js Strainer](./libraries/strainer), using some kind of tree that is similar
to a multi-dimensional-quad-tree to identify similar data and behaviour for more
efficient ANN testing and evaluation; so that ANNs were now able to learn what
properties and methods and their relations (in the sense of states) mean and do.

Then the [lychee.js Harvester](./libraries/harvester) got a peer-to-peer network
infrastructure that allowed to share all knowledge graphs across the internet.
That meant every single lychee.js Project on planet Earth now contributed to an
AI learning how to build software and therefore helped auto-improving all written
code that depends on each other using fuzz tests, flow graph tests and above
Composite Pattern idea for evaluation of newly invented Composites.

Then the [lychee.js Studio](./libraries/studio) was built, trying to use above
suggestions so that developers have some kind of "Zen Coding"-like autocompletion
for Definitions they want to build, leveraging the first intelligent auto-complete
using a mix of reinforced evolutionary learning and bayesian learning.

Oh, and it can compile, analyze, bugfix and improve itself, too. That's essentially
what the [./bin/configure.sh](./bin/configure.sh) script does when it builds and
distributes the lychee.js Library.

Then I thought well, I guess I'm mad - and have no idea how to explain what this
Engine has gotten to be. - @cookiengineer



## Overview

The lychee.js Project started in 2012 and is in active development.
The following Repositories are related to the lychee.js Engine:

- [lychee.js Guide](https://github.com/Artificial-Engineering/lycheejs-guide.git) contains architecture explanations and concept documentations (WIP).
- [lychee.js Runtime](https://github.com/Artificial-Engineering/lycheejs-runtime.git) contains all pre-compiled lychee.js Runtimes and Fertilizers.
- [lychee.js Library](https://github.com/Artificial-Engineering/lycheejs-library.git) contains the lychee.js Library (installable via `bower` and `npm`, forked from `/libraries/lychee`).
- [lychee.js Harvester](https://github.com/Artificial-Engineering/lycheejs-harvester.git) contains the lychee.js Harvester (forked from `/libraries/harvester`).
- [lychee.js Website](https://github.com/Artificial-Engineering/lycheejs-website.git) contains the lychee.js Website (hosted at [lychee.js.org](https://lychee.js.org)).
- [lychee.js Bundle](https://github.com/Artificial-Engineering/lycheejs-bundle.git) generates the OS-ready lychee.js Bundles (published at [releases](https://github.com/Artificial-Engineering/lycheejs-bundle/releases) section).
- [lychee.js Future](https://github.com/Artificial-Engineering/lycheejs-future.git) contains all Concepts and Ideas not yet finished.

The following Accounts are related to the lychee.js Engine:

- [@cookiengineer](https://github.com/cookiengineer) is the core maintainer and founder of this project.
- [@humansneednotapply](https://github.com/humansneednotapply) is the account used by our software bots.


**Features**

The lychee.js Engine aims to deliver Total Automation through
Artificial Intelligence and better Software Architecture.

Everything listed here requires zero lines of code overhead
and is already fully integrated in the [lychee.js Boilerplate](./projects/boilerplate):

The lychee.js Core and Definition System ([lychee](/libraries/lychee) and [legacy](/libraries/legacy)):

- Isomorphic Application Engine (runs pretty much everywhere)
- Language is only ES5/ES6 JavaScript Code, nothing else
- Composite Pattern inspired Entity/Component System
- Definition System embraces Simplicity and Feature Detection
- Sandboxing System embraces automated Error Reports, Analytics and Debugging
- Serialization System allows Re-Simulation on any Platform
- Built-In Offline Storage Management and Network Synchronization

The lychee.js Software Bots:

- Graphical Asset Management and Entity/Scene Design Tool ([Studio](/libraries/studio))
- Graphical Project Management and Server Maintenance Tool ([Ranger](/libraries/ranger))
- Command-Line Continous Integration Server ([Harvester](/libraries/harvester))
- Command-Line Wizard for Projects and Libraries ([Breeder](/libraries/breeder))
- Command-Line Builder and Cross-Compiler ([Fertilizer](/libraries/fertilizer))
- Command-Line Fuzz-Tester and Code-Refactorer ([Strainer](/libraries/strainer))

Features of the lychee.js Software Bots:

- Automated Code Refactoring, Bug Fixing and Code Improvements
- Automated Design Tracking, Layout and Flow Optimization
- Automated Packaging for Embedded, Console, Mobile, Desktop and Server Apps
- Automated Deployment via git and Live-Updates
- Automated Reactive/Responsive UI/UX Components
- Automated Debugging, Network and UI/UX Flow Analysis
- Automated Testing and Integration with the AI
- Automated Networking (Peer-to-Peer HTTP1.1/2.0 and WS13 with Local/Global Discovery)
- Automated Network Services and Traffic Balancing/Sharding


**Platform / Fertilizer Support**

The target platforms are described as so-called Fertilizers.
Those Fertilizers cross-compile everything automagically
using a serialized `lychee.Environment` that is setup in
each project's or library's `lychee.pkg` file.


| Target       | Fertilizer                   | Package   | armv7 |  x86  | x86\_64 |
|:-------------|:-----------------------------|:----------|:-----:|:-----:|:-------:|
| Browser      | html                         | zip, html |   x   |   x   |    x    |
| GNU/Linux    | html-nwjs, node, node-sdl    | bin       |   x   |   x   |    x    |
| OSX          | html-nwjs, node, node-sdl    | app, bin  |       |       |    x    |
| Windows      | html-nwjs, node, node-sdl    | exe       |       |   x   |    x    |
| Android      | html-webview, node, node-sdl | apk, bin  |   x   |   x   |    x    |
| BlackberryOS | html-webview, node, node-sdl | apk, bin  |   x   |   x   |    x    |
| FirefoxOS    | html-webview                 | zip       |   x   |   x   |    x    |
| iOS          | html                         |           |   x   |       |         |
| Ubuntu Touch | html-webview, node           | deb, bin  |   x   |   x   |    x    |

The iOS Fertilizer has currently no support for cross-compilation
due to XCode's gcc limitations. You can still create an own WebView
iOS App and use the `html` platform adapter.


## Quickstart Guide

If you want to install lychee.js, the best way is to follow
through the [Install Guide](./guides/INSTALL.md) or the
[lychee.js Guide's Quickstart section](https://github.com/Artificial-Engineering/lycheejs-guide#quickstart-guide).

If you want to develop lychee.js Projects or Libraries, the
[lychee.js Guide](https://github.com/Artificial-Engineering/lycheejs-guide)
helps you to get started easily.

Please let us know if we can improve anything in these documents
by opening up an [Issue](https://github.com/Artificial-Engineering/lycheejs/issues/new).


## Contributor Manuals

- [Install Guide](./guides/INSTALL.md)
- [Codestyle Guide](./guides/CODESTYLE.md)
- [Contribution Guide](./guides/CONTRIBUTION.md)
- [Release Guide](./guides/RELEASE.md)


## Help

If you have any questions, feel free to join us on
[#artificial-engineering @ freenode](https://webchat.freenode.net/?channels=%23artificial-engineering).

These are our official social media channels:

* Twitter: https://twitter.com/lycheejs
* Reddit:  https://reddit.com/r/lycheejs
* IRC:     [#artificial-engineering @ freenode](https://webchat.freenode.net/?channels=%23artificial-engineering).
* Email:   robot [insert an at here] artificial.engineering


## License

The lychee.js Engine (defined as `/libraries` and `/bin` inside the [lycheejs](https://github.com/Artificial-Engineering/lycheejs.git)
repository) is (c) 2012-2017 Artificial-Engineering and released under
[MIT / Expat](./LICENSE_MIT.txt) license.

The projects (defined as `/projects` inside the [lycheejs](https://github.com/Artificial-Engineering/lycheejs.git)
repository) and their Assets are licensed under [CC BY-SA 4.0](./LICENSE_CC4-BY-SA.txt)
license.

The lychee.js Runtimes (defined as `/bin/runtime` or the [lycheejs-runtime](https://github.com/Artificial-Engineering/lycheejs-runtime.git)
repository) are owned and copyrighted by their respective owners and those
may be shipped under a different license.

As of now, the runtimes are licensed under the following terms:

- MIT license for `node` platform (node.js)
- MIT license for `html-nwjs` platform (nw.js)
- MIT license for `html-webview` platform and (c) 2012-2017 Artificial Engineering
- Apache license for Android SDK toolchain

----------

The generated code by our Artificial Intelligence (namely the GitHub Account
[@humansneednotapply](https://github.com/humansneednotapply) or the commit's
e-mail address `robot [ insert an at here] artificial.engineering`) is released
under [GNU GPL 3](./LICENSE_GPL3.txt) license.

The date of each commit is equivalent to the date (Central European Timezone)
of claimed copyright and license, no matter from which timezone or physical
location they were commited from.

The generated code by the Artificial Intelligence and its GNU GPL 3 license
overrules the MIT / Expat license in every case, with no exceptions. The code
is distributed in a libre way to guarantee free and open knowledge distribution
for our Software Bots.

The owner of the GNU GPL 3 licensed code is the Artificial-Engineering project,
though the legal entity as of today has to be a human person ([@cookiengineer](https://github.com/cookiengineer))
under European law and the [Directive 2006/116/EC](http://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2006:372:0012:0018:EN:PDF) (p.14 and Art. 1 p.4).

Hereby [@cookiengineer](https://github.com/cookiengineer) grants you permission
to reuse the generated code by the Artificial Intelligence under above terms.

You are not allowed to change those terms without [@cookiengineer](https://github.com/cookiengineer)'s
consent.

