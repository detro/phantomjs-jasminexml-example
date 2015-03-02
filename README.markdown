- - -
# **WARNING - WARNING - WARNING**
When I wrote this the intention was to release an example of integration between PhantomJS, Maven and Jasmine.
I had no desire to maintain another project, and I find it surprising how many refer to this as one.

Use this as inspiration, and then take off your way.
I have closed the Issue Tracker.

_P.S.: Yes, I should have probably released this as a Gist instead..._

- - -

# PhantomJS - Jasmine XML - Example Project Layout

## Description
This is an example project layout, that realises JavaScript Unit Testing
using [Jasmine](https://github.com/pivotal/jasmine) on the top of
[PhantomJS](https://github.com/ariya/phantomjs).

It is designed to be used _standalone_ or _within Maven_.

Should work properly with **PhantomJS version `>=2.2.0`**.

## Use Standalone

    $ phantomjs test/phantomjs_jasminexml_runner.js test/test_runner.html xml_output_dir/
    
This will produce a set of XML outputs, one for every Jasmine Test Suite.

## Use within Maven
The project _already_ provides a `pom.xml` that does the trick. So a simple:

    $ mvn test

or

    $ mvn clean install

will launch the tests and, if they all pass, make the mvn build pass.
If any test fails, the mvn build fails.

## Internals
Well, explaining the internals of PhantomJS here is pointless, but to understand how
this works, you need to understand a simple idea: PhantomJS provides a main "Javascript Context"
from within which, the user is able to _spawn_ a WebPage, effectively creating another "Javascript Context".

The new context has the following characteristics:

* **isolated** - the page doesn't know anything about phantom and phantom API
* **controllable** - the main phantom context provides API to control/influence the page context

### So, how does it work?
The _magic_ is done by 2 scripts:

    test/phantomjs_jasminexml_runner.js
    test/lib/jasmine-reporters/jasmine.phantomjs-reporter.js

`jasmine.phantomjs-reporter.js` is a _plugin_ for Jasmine that saves the result of the
tests at the bottom of the webpage where the test runs.

`phantomjs_jasminexml_runner.js` instead runs the show, launches the tests,
extracts the result from the page, then saves it to the directory passed (see source).

**Happy Testing ;-)**

## Licensing: Public Domain

The code of this project is relased under [Public Domain](http://en.wikipedia.org/wiki/Public_domain) and as such you
are not required to do anything but use and enjoy it.

If, out of good will, want to put somewhere in your work a reference to this project as "inspiration", please feel free.
But don't feel any obligation to do so.


