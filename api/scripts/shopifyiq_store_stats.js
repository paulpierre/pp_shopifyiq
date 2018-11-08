/** ------------------------
 *  shopifyiq_domain_data.js
 *  ------------------------
 *  by paul (##########)
 *  A PhantomJS script that takes in a list of URI encoded JSON list of
 *  tracking numbers, order ID's and fulfillment IDs.
 *
 *  It runs a list of tracking numbers to 17track and then parses the
 *  tracking results via jQuery and passes the JSON data to PHP for
 *  parsing and storing in the database.
 */

 /* ==============================
    LETS SET EVERTHING UP PROPERLY
    ============================== */

var MODE = 'prod';

// Lets delcare the requisite dependencies
var page = require('webpage').create();
var fs = require('fs');
var sys = require('system');
var p = require('webpage').create();


page.onConsoleMessage = function(msg) {
    console.log(msg);
};

/**
 *  alexa: http://www.alexa.com/siteinfo/omgtrue.com
 *      • global rank: $("strong.metrics-data.align-vmiddle:first").text().replace(/(?:\r\n|\r|\n| )/g, '');
 *      • US rank: $("span[data-cat=countryRank] strong.metrics-data.align-vmiddle").text().replace(/(?:\r\n|\r|\n| )/g, '');
 *      •
 *  myip.ms:
 *      • global site ranking position:  /(#)(.*)(?=position)/g.exec($("td.vmiddle:nth-child(2)").text())[2];
 *      • visitors per day:  /(rating )(.*)(?=visitors)/g.exec($("td.vmiddle:nth-child(2)").text())[2];
 *
 *  WHOIS: http://whois.domaintools.com/omgtrue.com
 *      • whois created: /(Creation Date: )(.*)(?=Registrar Registration)/g.exec($("div.well-sm").text())[2];
 *      • whois updated: /(Updated Date: )(.*)(?=Creation Date:)/g.exec($("div.well-sm").text())[2];
 */

// Lets setup the browser settings
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.localToRemoteUrlAccessEnabled = true;
//page.settings.resourceTimeout = (5*60*1000); // 5 minutes
page.settings.loadImages = false;
page.settings.webSecurityEnabled = false;
page.settings.resourceTimeout = 10000;
page.settings.XSSAuditingEnabled = false;

var CRAWLER_TIMEOUT = 1000 * 60 * 5; //5 minute time out for scraping the entire catalog
var ENABLE_LOGGING;
var SERVER_POST_URL;
switch (MODE)
{
    case 'local':
        SERVER_POST_URL = "http://api.shopifyiq/crawler/store_stats/";
        ENABLE_LOGGING = true;
        break;

    case 'prod':
        SERVER_POST_URL = "http://api.shopifyiq.com/crawler/store_stats/";
        ENABLE_LOGGING = false;
        break;
}


//Lets setup the proper global variables
var store_stats = new Array(); //This is the array hash containing the tracking #, order ID and fulfillment ID lookup





// Lets make sure that we're passed on 1 argument. This must be a URI encoded JSON string
if(sys.args.length !== 2)
{
  error_log("JSON String not provided as argument.\nArgs: " + JSON.stringify(sys.args));
  phantom.exit(1);
}

//Lets take the encoded URI data and convert it to legitimate JSON
var _json = decodeURIComponent(sys.args[1]);//.replace(/\\"/g, '"');

console.log("evaluating argument: " + _json);
console.log("decoded: " + _json);

//Lets make sure we get actual JSON data
//TODO: If there is an exception, call the PHP crawl object with the proper failure
try {
  var json = JSON.parse(_json);
  console.log("String is JSON!");
}
catch(e) {
  error_log("ERROR: argument provided is NOT JSON! Arg: " + JSON.stringify(sys.args));
  phantom.exit(1);
}

if(json.length < 1) {
    error_log("The database returned no websites to crawl");
    phantom.exit(1);
}

var store_data = json;
error_log("Grabbing site meta data for domain: " + json[0].domain);

/* =========================
   SETUP VARIABLES FROM JSON
   ========================= */



 var store_id = json[0].id,
 store_domain = json[0].domain;




console.log(
    "\nstore_id: " + store_id +
    "\nstore_domain:" + store_domain);


error_log("\n----------------------------------\n\n");
var _url = "https://www.alexa.com/siteinfo/" + store_domain.replace("www.","");

error_log("\nGrabbing data from URL: " + _url);

page.open(_url, function(status) {

    //If we connect successfully lets go ahead and parse the tracking information on the page
  //TODO: need else statement to send error to PHP to log crawl object error!
    console.log("OPENING PAGE: " + _url);
    console.log("STATUS: " + status);
    var _data;

  if(status === "success") {
      console.log("Calling parse_results()\n");

      parse_results(store_data);


  } else {
      console.log("FAILED!");
      phantom.exit(1);
  }

  //Lets exit when we're done
  //phantom.exit(1);
});


page.onLoadStarted = function(){
    this.page.navigationLocked = true;
}

page.onLoadFinished = function()
{
    this.page.navigationLocked = false;

}

/* =================================
   PARSE THE RESULTS AND RETURN JSON
   ================================= */
function parse_results(store_data)
{
    console.log("running parse_results()");
    //Lets inject a local copy of jquery so we can conveniently use jQuery selectors
    //if (page.injectJs('jq.js')) console.log("SUCCESS: injectJs: jq.js");
    //else console.log("##ERROR injectJs: jq.js");


    page.evaluate(function() {
        $(document).ready(function() {
        });

    });

    waitFor(function(store_stats) {
        return page.evaluate(function() {
            var rank_global = $("strong.metrics-data.align-vmiddle:first").text().replace(/(?:\r\n|\r|\n| |,)/g, ''),rank_us = $("span[data-cat=countryRank] strong.metrics-data.align-vmiddle").text().replace(/(?:\r\n|\r|\n| |,)/g, '');

            return (rank_global && rank_us);
        });
    }, function() {
        store_stats =  page.evaluate(function() {
            var rank_global = $("strong.metrics-data.align-vmiddle:first").text().replace(/(?:\r\n|\r|\n| |,)/g, ''),rank_us = $("span[data-cat=countryRank] strong.metrics-data.align-vmiddle").text().replace(/(?:\r\n|\r|\n| |,)/g, '');
            var store_stats = {"rank_us":rank_us,"rank_global":rank_global};
            console.log("evaluate store_stats: " + store_stats);
            return JSON.stringify(store_stats);
        });
        store_results(store_stats);
    },CRAWLER_TIMEOUT);


}

function store_results(data)
{
    try {
        var rank_us = JSON.parse(data).rank_us;
        var rank_global =JSON.parse(data).rank_global;
        var rank_status = 1;
    } catch(e){
        var rank_us = 0;
        var rank_global =0;
        var rank_status = 2;

    }
    console.log("##STORE RESULTS:");
    console.log(data);
    var p = require('webpage').create();

    if(ENABLE_LOGGING) fs.write('logs/store_stats.txt', data, 'w');


    p.onResourceTimeout = function(request) {
        error_log("DB CONTROLLER TIMEOUT: " + JSON.stringify(request));
    };

    p.onResourceError = function(resourceError) {
        console.log('\033[1;31m' + 'Error (#' + resourceError.id + '): URL: ' + request.url.substr(0,80) + ' || ' + resourceError.errorCode + ' || Description: ' + resourceError.errorString + '\033[0m');
    };


    p.onResourceRequested = function(request) {
        console.log('\033[0;36m' + '--> Request (#' + request.id + '): ' + request.url.substr(0,80) + '\033[0m');
    };

    p.onResourceReceived = function(response) {
        console.log('\033[1;34m' + '<-- Response (#' + response.id + '): ' + response.url.substr(0,80) + '\033[0m');
    };

    p.open( SERVER_POST_URL, "POST", "rank_status=" + rank_status +"&rank_us=" + rank_us  + "&rank_global=" + rank_global + "&store_id=" +  store_id, function(status) {
        if (status !== 'success') {
            console.log("POST TO SHOPIFYIQ STORE_STATS STORAGE API FAILED.");
        } else {
            error_log("Server response: " + p.content);
        }
        phantom.exit(1);
    });

}


page.onLoadFinished = function()
{
    if(ENABLE_LOGGING) fs.write('logs/dump.html', page.content, 'w');
}


function error_log(log)
{
    if(ENABLE_LOGGING)
    {
        var LOG_DATA = "[" + new Date().toLocaleString() + "]:\n";
        LOG_DATA+=log+"\n\n";

        try {
            fs.write("logs/crawler.log", LOG_DATA, 'a');
            console.log(LOG_DATA);
        } catch(e) {
            console.log(e);
        }
    }
}


/* ======================
   RESOURCE REQUEST EVENT
   ====================== */

/*
page.onResourceRequested = function(requestData, networkRequest) {

  if (!requestData.url.match(/(canary)|(17track)(?=.*js)|(17track)(?=.*restapi)|(jquery)|(17track)(?=.*nums=)/g)) {
      error_log("BLOCKING URL: " + requestData.url);
      networkRequest.cancel();
  }
};*/
var redirectURLs;
page.onResourceRequested = function(requestData, networkRequest) {
    console.log('\033[0;36m URL REQUEST:\033[0m:' + url);

    if (requestData.url.match(/.png|.jpg|.css|.gif|.mp4|.svg|.tiff|.otf|.tff|.jpeg|.webp|.avi|.mpg/g)) {
        error_log("033[0;30mBLOCKING URL:033[0m " + requestData.url);
        networkRequest.abort();
        //networkRequest.cancel();
    }


    //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData) + "\n");
    if (redirectURLs.indexOf(requestData.url) !== -1 || requestData.url.indexOf("alexa") !==-1 || requestData.url.indexOf("shopifyiq") !==-1) {
        error_log("!!!!!!!#### REDIRECT OR NON-DOMAIN RESOURCE REQUESTED")

        // this is a redirect url
        networkRequest.abort();
    }



};


function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 1000); //< repeat check every 250ms
}

