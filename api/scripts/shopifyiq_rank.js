/** ----------------
 *  shopifyiq_product_crawl.js
 *  -----------------
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
var store_total_page_count;

var crawl_tstart = (Math.floor(Date.now() / 1000));

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

// Lets setup the browser settings
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.localToRemoteUrlAccessEnabled = true;
//page.settings.resourceTimeout = (5*60*1000); // 5 minutes
page.settings.loadImages = true;
page.settings.webSecurityEnabled = false;
page.settings.resourceTimeout = 10000;
page.settings.XSSAuditingEnabled = false;

var CRAWLER_TIMEOUT = 1000 * 60 * 60; //5 minute time out for scraping the entire catalog
var ENABLE_LOGGING,SERVER_ERROR_URL,SERVER_POST_URL;


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

var json;
try {
  json = JSON.parse(_json);
  console.log("String is JSON!");
}
catch(e) {
  console.log("ERROR: argument provided is NOT JSON! Arg: " + JSON.stringify(sys.args));
  phantom.exit(1);
}

if(json.length < 1) {
    console.log("ERROR: The database returned no websites to crawl");
    phantom.exit(1);
}

var store_data = json;
console.log("ERROR: Scraping site: " + json[0].domain);

/* =========================
   SETUP VARIABLES FROM JSON
   ========================= */
switch (json[0].server_mode)
{
    case 'local':
        SERVER_POST_URL = "http://api.shopifyiq/crawler/save/";
        SERVER_ERROR_URL = "http://api.shopifyiq/crawler/crawl_error/";
        ENABLE_LOGGING = true;
        break;

    default:
    case 'prod':
        SERVER_POST_URL = "http://api.shopifyiq.com/crawler/save/";
        SERVER_ERROR_URL = "http://api.shopifyiq.com/crawler/crawl_error/";
        ENABLE_LOGGING = false;
        break;
}


//Lets setup the proper global variables
var product_list = new Array(); //This is the array hash containing the tracking #, order ID and fulfillment ID lookup






var store_id = json[0].id,
 store_domain = json[0].domain,
 store_url = json[0].url,
 store_target_img = json[0].t_img,
 store_target_node = json[0].t_node,
 store_target_click_url = json[0].t_url,
 store_target_price = json[0].t_price,
 store_target_name = json[0].t_name,
 store_target_details = json[0].t_details,
 store_target_page_count = json[0].t_page_count,
 store_details_type = json[0].details_type,
 store_count_type = json[0].count_type,
 store_products_per_page = json[0].count_product_per_page,
 store_page_count = json[0].count_page;





console.log("\n## PARAMETERS ##\n----------------------------------\n\n");
console.log(
    "\nstore_id: " + store_id +
    "\nstore_domain:" + store_domain +
    "\nstore_url: " + store_url +
    "\nstore_target_img: " + store_target_img +
    "\nstore_target_node: " + store_target_node +
    "\nstore_target_click_url: " + store_target_click_url +
    "\nstore_target_price: " + store_target_price +
    "\nstore_target_name: " + store_target_name +
    "\nstore_target_details: " + store_target_details +
    "\nstore_target_page_count: " + store_target_page_count +
    "\nstore_details_type: " + store_details_type +
    "\nstore_count_type: " + store_count_type +
    "\nstore_products_per_page: " + store_products_per_page +
    "\nstore_page_count: " + store_page_count
);
console.log("\n----------------------------------\n\n");


var product_list;

var _url = store_url + "?page=1&sort_by=best-selling";

error_log("\nScraping URL: " + _url);

page.open(_url, function(status) {

    console.log("OPENING PAGE: " + _url);
    console.log("STATUS: " + status);
    var _data;

  if(status === "success") {
      console.log("Calling parse_results()\n");

      _data = parse_results(store_data);

      console.log("_data: " + _data);
  } else {
        crawl_error("Failed to open best-sellers with url: " + _url);
  }
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
    if (page.injectJs('jq.js')) console.log("SUCCESS: injectJs: jq.js");
    else console.log("##ERROR injectJs: jq.js");


    if(page.injectJs('shopifyiq_rank_crawler.js')) console.log("SUCCESS: injectJs: shopifyiq_crawler.js");
    else console.log("##ERROR injectJs: shopifyiq_crawler.js");

    //console.log("running waitFor, checking visibility for: " + store_target_node);


    page.evaluate(function(store_data) {
        console.log("running shopifyiq_init() with data:" + JSON.stringify(store_data));


        $(document).ready(function() {
            console.log("Running shopifyiq_init with data: " + JSON.stringify(store_data));
            shopifyiq_init(store_data[0]);
        },store_data);
        //console.log("##DONE!!!###")
        //phantom.exit();
    },store_data);

    waitFor(function(product_list) {
        // Check in the page if a specific element is now visible

        return page.evaluate(function() {
            return (
                !is_crawling_page &&
                typeof product_list !== undefined
                && Object.keys(product_list).length > 1);
        });

    }, function() {
        product_list =  page.evaluate(function() {
            console.log("evaluate product_list: ");
            console.log(JSON.stringify(product_list));
            return JSON.stringify(product_list);
        });
     store_total_page_count =  page.evaluate(function() {
         console.log("TOTAL page count: " + page_count);
         return JSON.stringify(product_list);
     });

        store_results(product_list);
    },CRAWLER_TIMEOUT);



}

function store_results(data)
{
    console.log("##STORE RESULTS:");
    //console.log(data);
    var p = require('webpage').create();

    if(ENABLE_LOGGING) fs.write('logs/data.txt', data, 'w');


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

    p.open( SERVER_POST_URL, "POST", "crawl_tstart=" + crawl_tstart  + "&store=" +  encodeURIComponent(_json)+ "&ranks=" + encodeURIComponent(data), function(status) {
        if (status !== 'success') {
            console.log("POST TO SHOPIFYIQ STORAGE API FAILED.");
            crawl_error("store_results(): POST product_list results to ShopifyIQ db failed.");
        } else {
            error_log("Server response: " + p.content);
        }
        phantom.exit(1);
    });

}


page.onLoadFinished = function()
{
    //if(ENABLE_LOGGING) fs.write('logs/dump.html', page.content, 'w');
}

/* ===========================================
   WRITE ANY CRAWLING FAILURE TO THE DATABASE!
   =========================================== */
function crawl_error(crawl_error_msg) {
    var _p = require('webpage').create();
    _p.open( SERVER_ERROR_URL + "?msg=" + crawl_error_msg + "&file=shopify_rank.js&store_id=" + store_id, function(status) {
        if (status !== 'success') {
            console.log("POST TO SHOPIFYIQ STORAGE API FAILED.");
        } else {
            error_log("Server response: " + p.content);
        }
    });
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
    if (redirectURLs.indexOf(requestData.url) !== -1 || requestData.url.indexOf(store_domain) !== -1 || requestData.url.indexOf("shopifyiq") !==-1) {
        error_log("!!!!!!!#### REDIRECT OR NON-DOMAIN RESOURCE REQUESTED")

        // this is a redirect url
        networkRequest.abort();
    }


    /**
     * ---
     * Disable requesting URLs that don't match the store_target_name!
     * ---
     */
    var regex = new RegExp(store_target_name, 'ig');
    match = regex.exec(requestData.url);
    crawler_log("## RESOURCE REQUEST MATCH FOR " + store_target_name + " match data: " + match);
    //if(!match) throw new Error("There was an error loading product details for " + _site);
    if(!match && !requestData.url.match(/(shopifyiq)/ig)) networkRequest.abort();

};

page.onResourceReceived = function(response) {
    if (response.status >= 300 && response.status < 400 && response.redirectURL) { // maybe more specific
        redirectURLs.push(response.redirectURL);
    }
};


page.onNavigationRequested = function(url, type, willNavigate, main) {
    console.log('\033[0;32m NAVIGATION REQUEST:\033[0m:' + url);

    console.log('Trying to navigate to: ' + url);
    console.log('Caused by: ' + type);
    console.log('Will actually navigate: ' + willNavigate);
    console.log('Sent from the page\'s main frame: ' + main);
}


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

