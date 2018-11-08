/** +----------------------------------------------------------------------------+
 *  | ShopifyIQ - A Shopify Product Ranking Tool by paul / ########## |
 *  +----------------------------------------------------------------------------+
 *  Started 12/14/2017
 */

//Debug settings
var load_full_catalog = true,
    IS_DEBUG = false,
    MODE = 'prod';

/** ================
 *  Global Variables
 *  ================ */

var page = 1, //current page we are on
    page_count, //total # of pages in the store
    is_crawling_page,
    products_per_page = 0,
    page_counter = 1,
    _site,
    _url,
    product_rank = 1,
    product_handle,
    product_list = {},
    is_empty_product_list = false,
    PAGE_COUNT_URL,
    SERVER_DOMAIN,
    store_id,
    store_domain,
    store_url,
    store_target_img,
    store_target_node,
    store_target_click_url,
    store_target_price,
    store_target_name,
    store_target_details,
    store_target_page_count,
    store_details_type,
    store_count_type,
    store_products_per_page,
    store_page_count;




function shopifyiq_init(store_data){



    var json = store_data;

    switch(json.server_mode)
    {
        case 'local':
            SERVER_DOMAIN = "api.shopifyiq";
            SERVER_ERROR_URL = "http://" + SERVER_DOMAIN + "/crawler/crawl_error/";
            PAGE_COUNT_URL = "http://" + SERVER_DOMAIN + "/crawler/set_page_count?";
            PRODUCT_PER_PAGE_URL = "http://" + SERVER_DOMAIN + "/crawler/set_product_per_page_count?";

            break;

        default:
        case 'prod':
            SERVER_DOMAIN = "api.shopifyiq.com";
            SERVER_ERROR_URL = "http://" + SERVER_DOMAIN + "/crawler/crawl_error/";
            PAGE_COUNT_URL = "http://" + SERVER_DOMAIN + "/crawler/set_page_count?";
            PRODUCT_PER_PAGE_URL = "http://" + SERVER_DOMAIN + "/crawler/set_product_per_page_count?";

            break;
    }

    crawler_log("shopifyiq_init() successfully called. DATA:");
    crawler_log(JSON.stringify(store_data));


    store_id = json.id;
    store_domain = json.domain;
    store_url = json.url;
    store_target_img = json.t_img;
    store_target_node = json.t_node;
    store_target_click_url = json.t_url;
    store_target_price = json.t_price;
    store_target_name = json.t_name;
    store_target_details = json.t_details;
    store_target_page_count = json.t_page_count;
    store_details_type = json.details_type;
    store_count_type = json.count_type;
    store_products_per_page = json.count_product_per_page;
    store_page_count = json.count_page;


    page = 1;
    page_count = 0;
    //products_per_page = store_products_per_page;
    product_rank = 1;
    is_crawling_page = true;
    is_empty_product_list = false;

    //Lets set the state flag to true so we don't do anything while we're crawling
    is_crawling = true;

    _site = store_domain;
    _url = store_url;

    //Lets structure the URL
    var url = _url + "?page=" + page + "&sort_by=best-selling";


    /** ----------------
     *  Fetch page count
     *  ----------------  */

    //We add a callback at the end to get_product_list()

    get_page_count(_site,url,function(){get_product_list(url,page);});

};



/** -------------------------------------
 *  Get page count of best-seller listing
 *  ------------------------------------- */
function get_page_count(_site,url,callback)
{

    /** -----------------------------------------------------------------
     *  If page count and product per page was never set. Lets grab it.
     *  Otherwise lets use the values provided to us from the server.
     *  ----------------------------------------------------------------- */
    if(store_page_count !== "undefined" &&  store_products_per_page !== "undefined" && parseInt(store_page_count) > 0 && parseInt(store_products_per_page) > 0)
    {
        page_count = parseInt(store_page_count);
        products_per_page = parseInt(store_products_per_page);
        crawler_log("get_page_count: " + page_count + " products_per_page: " + products_per_page);
        if(typeof callback == "function") callback();

    } else {

        var site = _site;
        crawler_log("get_page_count: " + site);
        //Lets do an ajax call of the first page
        $.get(url,function(data){
            //site_list[site].get_product_count(data);
            store_get_product_count(data,store_target_page_count,store_count_type);


            if(!load_full_catalog) page_count = 1;


            set_page_count(store_id,page_count);
            set_product_per_page_count(store_id,products_per_page);


            crawler_log("get_page_count: " + page_count + " products_per_page: " + products_per_page);

            if(typeof callback == "function") callback();
        });

    }



}
/** --------------------------------
 *  Set the page count on the server
 *  -------------------------------- */
function set_page_count(id,count)
{
    var srv = new Image();
    srv.src = PAGE_COUNT_URL + "store_id=" + id + "&total_page_count=" + count;
}

function set_product_per_page_count(id,count)
{
    var srv = new Image();
    srv.src = PRODUCT_PER_PAGE_URL + "store_id=" + id + "&product_count=" + count;
}



/** -----------------------------------
 *  Crawl product page for all products
 *  ----------------------------------- */
function get_product_list(url,page) {
    url += "?page=" + page + "&sort_by=best-selling";

    crawler_log("get_product_list() url:" + url + " page: " + page);

    //Set flag to true so we don't incur ajax event handler portion that controls page increment

    $.ajax({
        url: url,
        cache: true
    })
        .done(function (data) {

            //This is the counter that counts from 1 to the total # of products in the page

            //Lets grab the node that contains the list of products
            crawler_log("get_product_list: looking for store_target_node: " + store_target_node);
            var product_node_list = $(data).find(store_target_node);

            //If the current page is empty, it means we either over-counted the number of pages + products per page or we're dealing with scroll loaded items
            if(!product_node_list)
            {
                crawl_error("product_node_list EMPTY!! NO PRODUCTS FOUND ON URL: " + url + " page: " + page);
                is_empty_product_list = true;
            }



            /** ---------------------------------------------------
             *  Iterate through each product and store it in memory
             *  --------------------------------------------------- */
                //crawler_log("get_product_list: Iterate through each product and store it in memory: ");

            var _ctr = 1;
            $(product_node_list).each(function (k, v) {

                var product_url = "http://" + store_domain + $(v).find(store_target_click_url).attr("href"),

                product_rank = ((page - 1) * products_per_page) + _ctr;

                var match = /products\/([A-Za-z0-9-])+/gi.exec(product_url);
                if(!match || typeof match[0] == "undefined")
                {
                    crawl_error("Error in get_product_list() getting product handle, url: " + product_url);
                }
                var product_handle = match[0].replace(/products\//g,"");

                crawler_log("adding product_handle:" + product_handle + " rank: " + product_rank);
                product_list[product_handle] = {
                    "handle":product_handle,
                    "rank":product_rank
                };

                crawler_log("product list length: " + Object.keys(product_list).length);


                _ctr++;
                //tmp_ctr++;
            });

            //Set the flag to false now that we're done
        })
        .fail(function () {
            crawl_error("Fatal Error in get_product_list() ajax call url: " + this.url);
            is_empty_product_list = true;
            return false;
        });
}


function store_get_product_count(data,target_page_count,page_count_type) {

    switch(parseInt(page_count_type))
    {
        default:
        case 0:
            page_count = target_page_count;
            products_per_page = $(data).find(store_target_node).length;
            /*
            if (!products_per_page) {
                crawl_error("store_get_product_count(): there was an error loading page count for " + _site);
                //throw new Error("There was an error loading page count for " + _site);

            }*/
        break;

        case 1:
            page_count = parseInt($(data).find(target_page_count).text().replace(/ /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            //crawler_log(page_count);
            //if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(store_target_node).length;
            crawler_log("products_per_page: " + products_per_page);
            /*if (!products_per_page) {
                crawl_error("store_get_product_count(): there was an error loading page count for " + _site);
                throw new Error("There was an error loading page count for " + _site);
            }*/
        break;

        case 2:
            page_count = parseInt($(data).find(target_page_count).prev().text().replace(/ /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            //crawler_log(page_count);
            //if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(store_target_node).length;
            crawler_log("products_per_page: " + products_per_page);
            /*if (!products_per_page) {
                crawl_error("store_get_product_count(): there was an error loading page count for " + _site);
                throw new Error("There was an error loading page count for " + _site);
            }*/
        break;

        case 3:
            var match = /(\d+)[ ]+of[ ]+(\d+)/gim.exec($(data).find(target_page_count).text().replace(/  /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            //crawler_log(match);
            page_count = match[2];
            //if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(store_target_node).length;
            crawler_log("products_per_page: " + products_per_page);
            /*if (!products_per_page) {
                crawl_error("store_get_product_count(): there was an error loading page count for " + _site);
                throw new Error("There was an error loading page count for " + _site);
            }*/
        break;
    }

        if(!page_count || !products_per_page)
        {
            crawl_error("store_get_product_count(): there was an error loading page count for " + _site);
            products_per_page = store_products_per_page;
            page_count = store_page_count;
        }


    return page_count;

}

function shopifyiq_callback()
{
    is_crawling_page = false;
    crawler_log("product_list:");
    crawler_log(product_list);
    crawler_log("Crawling complete");

}

/** ------------------
 *  Ajax event handler
 *  ------------------
 *  This is fired any time an ajax call is being made
 *  */
$(document).ajaxComplete(function(event, xhr, settings){

    /** -----------------------------------------------------------
     *  If we're ajax calling for pages and not individual products
     *  ----------------------------------------------------------- */
    crawler_log("page_counter: " + page_counter + " page_count: " + page_count);
    crawler_log("is_crawling_page: " + is_crawling_page);


    if(is_crawling_page)
    {

        /** ----------------------------
         *  Done crawling all the pages?
         *  ---------------------------- */

        if(page_count === 0 || page_counter >= page_count)
        {
            //set the flag to stop crawling
            is_crawling_page = false;
            shopifyiq_callback();

            if(xhr.status !== 200) { crawl_error("ajaxComplete(): xhr error for url: " + settings.url);return;}
            //else {
            //    shopifyiq_callback();
            //    return true;
           // }
        }
        /** ----------------------------------
         *  Still crawling? Get the next page!
         *  ---------------------------------- */
        else {
            crawler_log("Fetching page " + page_counter + " of " + page_count + " URL: " + _url);
            //When get_page function finishes, it will call this ajaxComplete function again!
            get_product_list(_url,page_counter);
            page_counter++;
        }
    }
    if(is_empty_product_list)
    {

        crawler_log("is_empty_product_list: " + is_empty_product_list);

        is_empty_product_list = false;

        crawler_log(product_list);
        if(xhr.status !== 200) { crawl_error("ajaxComplete(): xhr error for url: " + settings.url);return;}
        else {
            shopifyiq_callback();
            }
    }
});


/** ================
 *  Helper functions
 *  ================ */


/* ===========================================
   WRITE ANY CRAWLING FAILURE TO THE DATABASE!
   =========================================== */
function crawl_error(crawl_error_msg) {
    var _p = new Image();
    _p.src =  SERVER_ERROR_URL + "?msg=" + crawl_error_msg + "&file=shopify_rank_crawler.js&store_id=" + store_id;
    delete _p;
}


function crawler_log(msg)
{
    if(!IS_DEBUG) return;
    var _i = new Image();
    console.log(msg);
    _i.src="http://" + SERVER_DOMAIN +"/crawler/log/?log=" + msg;
    delete _i;
}
