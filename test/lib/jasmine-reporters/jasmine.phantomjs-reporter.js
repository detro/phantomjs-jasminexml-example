(function() {
	var debug = 0;

    if (! jasmine) {
        throw new Exception("jasmine library does not exist in global namespace!");
    }

    function elapsed(startTime, endTime) {
        return (endTime - startTime)/1000;
    }

    function ISODateString(d) {
        function pad(n) { return n < 10 ? '0'+n : n; }

        return d.getFullYear() + '-'
            + pad(d.getMonth()+1) +'-'
            + pad(d.getDate()) + 'T'
            + pad(d.getHours()) + ':'
            + pad(d.getMinutes()) + ':'
            + pad(d.getSeconds());
    }

    function trim(str) {
        return str.replace(/^\s+/, "" ).replace(/\s+$/, "" );
    }

    function escapeInvalidXmlChars(str) {
        return str.replace(/\&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;");
    }

    /**
     * PhantomJS Reporter generates JUnit XML for the given spec run.
     * Allows the test results to be used in java based CI.
     * It appends some DOM elements/containers, so that a PhantomJS script can pick that up.
     *
     * @param {boolean} consolidate whether to save nested describes within the
     *                  same file as their parent; default: true
     * @param {boolean} useDotNotation whether to separate suite names with
     *                  dots rather than spaces (ie "Class.init" not
     *                  "Class init"); default: true
     */
    var PhantomJSReporter =  function(consolidate, useDotNotation) {
        this.consolidate = consolidate === jasmine.undefined ? true : consolidate;
        this.useDotNotation = useDotNotation === jasmine.undefined ? true : useDotNotation;
    };  

    PhantomJSReporter.prototype = {
   		jasmineStarted: function(suiteInfo) {
   			if (debug) {
   				this.log('Running suite with ' + suiteInfo.totalSpecsDefined);
   			}

   			this._suites = [];
   		},

   		suiteStarted: function(suite) {
   			if (debug) {
   				this.log("Suite started: '" + suite.description + "' whose full description is: " + suite.fullName);
   			}

            suite.startTime = new Date();
            suite.specs = [];

            this._currentSuite = suite;
            this._suites.push(suite);
        },

   		specStarted: function(spec) {
   			if (debug) {
   				this.log("Spec started: '" + spec.description + "' whose full description is: " + spec.fullName);
   			}

   			spec.startTime = new Date();
   		},

   		specDone: function(spec) {
   			if (debug) {
   				this.log("Spec: '" + spec.description + "' was " + spec.status);
   			}

   			spec.didFail = spec.status == 'passed';
   			spec.duration = elapsed(spec.startTime, new Date());
   			spec.output = '<testcase classname="' + this.getFullName(this._currentSuite) +
            '" name="' + escapeInvalidXmlChars(spec.description) + '" time="' + spec.duration + '">';

            var failure = '';
            var failures = spec.failedExpectations.length;

            for (var i = 0; i < failures; i++) {
                failure += ((i + 1) + ": " + escapeInvalidXmlChars(spec.message) + " ");
            }
            if (failure) {
            	spec.output += "<failure>" + trim(failure) + "</failure>";
            }
            spec.output += "</testcase>";

   			this._currentSuite.specs.push(spec);

   			if (debug) {
   				console.log(spec);
   			}
   		},

   		suiteDone: function(suite) {
   			if (debug) {
   				this.log("Suite: '" + suite.description + "' was " + suite.status);
   			}

   			suite.startTime = suite.startTime || new Date();
   			suite.duration = elapsed(suite.startTime, new Date());

            var specs = this._currentSuite.specs;
            var specOutput = "";
            // for JUnit results, let's only include directly failed tests (not nested suites')

            var failedCount = suite.failedExpectations.length;

            for (var i = 0; i < specs.length; i++) {
                specOutput += "\n  " + specs[i].output;
            }
            suite.output = '\n<testsuite name="' + this.getFullName(suite) +
                '" errors="0" tests="' + specs.length + '" failures="' + failedCount +
                '" time="' + suite.duration + '" timestamp="' + ISODateString(suite.startTime) + '">';
            suite.output += specOutput;
            suite.output += "\n</testsuite>";

   			this._currentSuite = null;

   			if (debug) {
   				console.log(suite);
   			}
   		},

        jasmineDone: function() {
        	if (debug) {
        		this.log('Finished suite');
        	}

            var suites = this._suites,
            passed = true;

	        for (var i = 0; i < suites.length; i++) {
	            var suite = suites[i],
	                filename = 'TEST-' + this.getFullName(suite, true) + '.xml',
	                output = '<?xml version="1.0" encoding="UTF-8" ?>';

	            passed = passed & suite.failedExpectations.length == 0;

                output += suite.output;
                this.createSuiteResultContainer(filename, output);
	        }
	        this.createTestFinishedContainer(passed);

            this._suites = null;

            if (debug) {
            	console.log(this);
            }
        },

        createSuiteResultContainer: function(filename, xmloutput) {
            jasmine.phantomjsXMLReporterResults = jasmine.phantomjsXMLReporterResults || [];
            jasmine.phantomjsXMLReporterResults.push({
                "xmlfilename" : filename,
                "xmlbody" : xmloutput
            });
        },
        
        createTestFinishedContainer: function(passed) {
            jasmine.phantomjsXMLReporterPassed = passed
        },

        getFullName: function(suite, isFilename) {
            var fullName;
            if (this.useDotNotation) {
                fullName = suite.description;
                for (var parentSuite = suite.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
                    fullName = parentSuite.description + '.' + fullName;
                }
            }
            else {
                fullName = suite.getFullName();
            }

            // Either remove or escape invalid XML characters
            if (isFilename) {
                return fullName.replace(/[^\w]/g, "");
            }
            return escapeInvalidXmlChars(fullName);
        },

        log: function(str) {
            var console = jasmine.getGlobal().console;

            if (console && console.log) {
                console.log(str);
            }
        }
    };

    // export public
    jasmine.PhantomJSReporter = PhantomJSReporter;
})();
