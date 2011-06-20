
phantom.injectJs("lib/utils/core.js")

if ( phantom.args.length !== 2 ) {
    console.log("Usage: phantom_test_runner.js HTML_RUNNER RESULT_DIR");
    phantom.exit();
} else {
    var htmlrunner = phantom.args[0],
        resultdir = phantom.args[1],
        page = new WebPage();
    
    // Echo the output of the tests to the Standard Output
    page.onConsoleMessage = function(msg, source, linenumber) {
        console.log("jasmine> " + msg);
    };

    page.open(htmlrunner, function(status) {
        if (status === "success") {
            utils.core.waitfor(function() { // wait for this to be true
                return page.evaluate(function() {
                    return document.getElementById("testsPassed") !== null ? true : document.getElementById("testsFailed") !== null ? true : false;
                });
            }, function() { // once done...
                // Retrieve the result of the tests
                var suitesResults = page.evaluate(function(){
                    var jsonResults = [],
                        results = document.querySelectorAll(".suiteResult");
                        
                    for ( var i = 0, len = results.length; i < len; ++i ) {
                        jsonResults.push({
                            "filename" : results[i].getElementsByClassName("filename")[0].textContent,
                            "xmlbody" : results[i].getElementsByClassName("xmlbody")[0].textContent
                        });
                    }
                    
                    return jsonResults;
                });
                
                // Save the result of the tests in files
                for ( var i = 0, len = suitesResults.length; i < len; ++i ) {
                    phantom.writeToFile(resultdir + '/' + suitesResults[i].filename, suitesResults[i].xmlbody);
                }
                
                // Return the correct exit status. '0' only if all the tests passed
                phantom.exit(page.evaluate(function(){
                    return document.getElementById("testsPassed") !== null ? 0 : 1; //< exit(0) is success, exit(1) is failure
                }));
            }, function() { // or, once it timesout...
                phantom.exit(1);
            });
        } else {
            console.log("phantomjs> Could not load '" + htmlrunner + "'.");
            phantom.exit(1);
        }
    });
}