/** +----------------------------------------------------------------------------+
 *  | ShopifyIQ - A Shopify Product Ranking Tool by paul / ########## |
 *  +----------------------------------------------------------------------------+
 *  Started 12/14/2017
 */

//Debug settings
var load_full_catalog,
    max_page_count = 1,
    IS_DEBUG = true,
    MODE = 'prod';

//TODO: !!!fix pagination page ount function so that it also works for  https://www.looselystore.com/collections/all
/** ================
 *  Global Variables
 *  ================ */

var page = 1, //current page we are on
    page_count, //total # of pages in the store
    product_count = 0, //# of products per page
    is_crawling_page = false,
    is_crawling_product = false,
    is_crawling_product_details = false,
    products_per_page = 0,
    page_counter = 0,
    product_counter = 0,
    _site,
    _url,
    tmp_ctr=0,
    is_blocked = false, //if shopify blocks us
    product_rank = 1,
    product_list = Array(),
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
    store_count_type;

switch(MODE)
{
    case 'local':
        SERVER_DOMAIN = "api.shopifyiq";
        load_full_catalog = true;
        PAGE_COUNT_URL = "http://" + SERVER_DOMAIN + "/crawler/set_page_count?";

    break;

    case 'prod':
        SERVER_DOMAIN = "api.shopifyiq.com";
        load_full_catalog = true;
        PAGE_COUNT_URL = "http://" + SERVER_DOMAIN + "/crawler/set_page_count?";
    break;
}


function shopifyiq_init(store_data){

    crawler_log("shopifyiq_init() successfully called. DATA:");
    crawler_log(JSON.stringify(store_data));


    product_list = [];

    var json = store_data;


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
    store_start_page = json.start_page;
    store_end_page = json.end_page;

    page = store_start_page;
    page_count = 0;
    page_counter = (store_start_page)?store_start_page:1;
    products_per_page = 1;
    product_rank = 1;
    is_crawling_page = true;
    is_crawling_product = false;
    is_crawling_product_details = false;
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

    get_page_count(_site,url,function(){get_product_list(_url,page);});

};



/** -------------------------------------
 *  Get page count of best-seller listing
 *  ------------------------------------- */
function get_page_count(_site,url,callback)
{
    var site = _site;
    crawler_log("get_page_count: " + site);
    //Lets do an ajax call of the first page
    $.get(url,function(data){
        //site_list[site].get_product_count(data);
        store_get_product_count(data,store_target_page_count,store_count_type);


        if(!load_full_catalog)
            max_page_count = store_end_page;
        else max_page_count = page_count;

        set_page_count(store_id,page_count);

        crawler_log("get_page_count: " + max_page_count + " products_per_page: " + products_per_page);

        if(typeof callback == "function") callback();
    });
}
/** --------------------------------
 *  Set the page count on the server
 *  -------------------------------- */
function set_page_count(id,count)
{
    var srv = new Image();
    srv.src = PAGE_COUNT_URL + "store_id=" + id + "&total_page_count=" + count;
}



/** -----------------------------------
 *  Crawl product page for all products
 *  ----------------------------------- */
function get_product_list(url,page) {
    url += "?page=" + page + "&sort_by=best-selling";

    crawler_log("get_product_list() url:" + url + " page: " + page);

    //Set flag to true so we don't incur ajax event handler portion that controls page increment
    is_crawling_product = true;

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
                crawler_log("product_node_list EMPTY!! NO PRODUCTS FOUND ON PAGE: " + url + " URL: " + page);
                is_crawling_product = false;
                is_empty_product_list = true;
            }



            /** ---------------------------------------------------
             *  Iterate through each product and store it in memory
             *  --------------------------------------------------- */
                //crawler_log("get_product_list: Iterate through each product and store it in memory: ");

            var _ctr = 1;
            $(product_node_list).each(function (k, v) {

                var product_img = $(v).find(store_target_img).attr("src"),
                    product_url = "http://" + store_domain + $(v).find(store_target_click_url).attr("href"),
                    product_name = $(v).find(store_target_name).text().replace(/(\r\n|\n|\r)/gm,"").replace(/  /g,"");

                //crawler_log("get_product_list: Product found: product_img:" + product_img + " product_url: " + product_url + " product_name: " + product_name);



                var match  = /(?:\$?[0-9.]+)/g.exec($(v).find(store_target_price).first().text());
                product_price = (match)?match[0]:null;

                //(?:\$[0-9.]+)

                //Lets set the relative rank of the product
                product_rank = ((page - 1) * products_per_page) + _ctr;

                //crawler_log("product_rank: " + product_rank + " _ctr: " + _ctr + " page: " + page);

                //Now lets store that rank and accompanying data into the array for rendering later

                product_list[tmp_ctr] = {
                    img: product_img,
                    url: product_url,
                    price: product_price,
                    name: product_name,
                    rank:product_rank
                };

                _ctr++;
                tmp_ctr++;
            });

            //Set the flag to false now that we're done
            is_crawling_product = false;
        })
        .fail(function () {
            crawler_log("## FATAL error");
        });
}




function crawler_log(msg)
{
    if(!IS_DEBUG) return;
    var _i = new Image();
    console.log(msg);
    _i.src="http://" + SERVER_DOMAIN +"/crawler/log/?log=" + msg;
    delete _i;
}


function store_get_product_details(data,target_details,target_details_type) {
    //crawler_log("store_get_product_details() called: target_details: " + target_details + " target_details_type: " + target_details_type + " data.length: " + data.length);
    crawler_log("Grabbing product " + product_counter + " of " + product_count + " - rank: " + product_list[product_counter-1].rank + " name: " + product_list[product_counter-1].name);

/*
    var _match  = /(Page temporarily unavailable)/g.exec(data);
    if(_match) {
        crawler_log("PAGE TEMPORARILY BLOCKED!!!");
        is_blocked = true;
    }
*/
    var json,match;
    switch(parseInt(target_details_type))
    {
        default:
        case 1:
            json = $(data).find(target_details).html();
            if (!json) crawler_log("##target_details_type ERROR!!!: " + target_details_type + " target_details: " + target_details + " JSON: " + json);

            return JSON.parse(json);
        break;

        case 2:
            json = $(data).find("form.product_form").attr("data-product");
            if (!json) crawler_log("##target_details_type ERROR!!!: " + target_details_type + " target_details: " + target_details + " JSON: " + json);

            return JSON.parse(json);
        break;

        case 3:
            var regex = new RegExp(target_details, 'g');
            match = regex.exec(data); //data.match(regex);
                       // match = /(?:product: )(.*)(?=},)/g.exec(data);

            //crawler_log("target_details_type: " + target_details_type + " target_details: " + target_details+" MATCH STATUS: " + match);
            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) {
                crawler_log("target_details_type ERROR!!!: " + target_details_type + " target_details: " + target_details+" MATCH STATUS: " + match);
                return { id:0,available:0};
            }
            //else

            var _m;
            if(match.length == 1)
                _m = match[0]
            else _m = match[1];

            json = ("["  + _m + "}]");

            try {
                data = JSON.parse(json)[0];

            } catch(e)
            {
                json = ( _m + "}]");
                data = JSON.parse(json)[0];
            }

            return data;
        break;
    }

}

function store_get_product_count(data,target_page_count,page_count_type) {

    switch(parseInt(page_count_type))
    {
        default:
        case 0:
            page_count = target_page_count;
            products_per_page = $(data).find(store_target_node).length;
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        break;

        case 1:
            page_count = parseInt($(data).find(target_page_count).text().replace(/ /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            crawler_log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(store_target_node).length;
            crawler_log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        break;

        case 2:
            page_count = parseInt($(data).find(target_page_count).prev().text().replace(/ /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            crawler_log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(store_target_node).length;
            crawler_log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        break;

        case 3:
            //var match = /(\d{1})+(\d{1,2})+/g.exec($(data).find(target_page_count).text().replace(/  /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            //(\d+)[ ]+of[ ]+(\d+)
            var match = /(\d+)[ ]+of[ ]+(\d+)/gim.exec($(data).find(target_page_count).text().replace(/  /g, "").replace(/\n/g, "").replace(/\"\'/g, ""));
            crawler_log(match);
            page_count = match[2];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(store_target_node).length;
            crawler_log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        break;
    }

    return page_count;

}



function shopifyiq_callback()
{
    crawler_log("FIRING crawl_finish");
    document.dispatchEvent(new Event('crawl_finish'));
    //crawler_log("POST THIS DATA: " + JSON.stringify(product_list));
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
    if(is_crawling_page && !is_crawling_product)
    {
        /** ----------------------------
         *  Done crawling all the pages?
         *  ---------------------------- */
        if(max_page_count == 0 || page_counter >= max_page_count)//page_count)
        {

            //set the flag to stop crawling
            is_crawling_page = false;


            if(xhr.status !== 200) { crawler_log("Failed to load product details for: " + settings.url);return;}
            else get_product_details(_site);
        }
        /** ----------------------------------
         *  Still crawling? Get the next page!
         *  ---------------------------------- */
        else {
            crawler_log("Fetching page " + page_counter + " of " + max_page_count + " URL: " + _url);
            //When get_page function finishes, it will call this ajaxComplete function again!
            get_product_list(_url,page_counter);
            page_counter++;


        }
    }
    if(is_empty_product_list)
    {
        is_crawling_page = false;
        is_empty_product_list = false;

        crawler_log(product_list);
        if(xhr.status !== 200) { crawler_log("Failed to load product details for: " + settings.url);return;}
        else get_product_details(_site);
    }

    if(is_crawling_product_details && !is_crawling_product && !is_crawling_page)
    {

        //This means we're done crawling
        if(product_counter > product_count)
        {
            //crawler_log("product " + product_counter + " of " + product_count);
            is_crawling_product_details = false;

            shopifyiq_callback();
            crawler_log("Crawling complete");
        }

    }


});


/** ================
 *  Helper functions
 *  ================ */





    /** ----------------------------------------------------------------
     *  Lets crawl through each product URL and grab valuable meta-data!
     *  ---------------------------------------------------------------- */
    function get_product_details(_site)
    {
        crawler_log("get_product_details: " + _site);
        crawler_log("product_list.length: " + product_list.length);

        is_crawling_product_details = true;
        product_count = product_list.length;//product_rank;
        product_counter = 1;
        /** -----------------------------------------------------------------------------------
         *  Now that we have our entire list of products, lets add details to the product array
         *  ----------------------------------------------------------------------------------- */
        var i=0,_timeout=0;
        for(i=0; i <=product_list.length;i++)

        {

            (function(i,_timeout) {
                _timeout = i*5000;

                setTimeout(function() {
                    crawler_log("### index: " + i + " with URL: " + product_list[i].url);

                    fetch_details(i);
                },_timeout);
            })(i,_timeout);


        }
    }

    function fetch_details(i)
    {
        crawler_log("CHECKING product_list index: " + i + " with URL: " + product_list[i].url);

        if(!product_list[i]) return;

        //TODO: figure out a way to batch calls so they're not firing too many get requests at once
        //because shopify is blocking too many subsequent requests. perhaps make them random?

        $.get({k:i,url:product_list[i].url,success:function(data) {

            var k = this.k;
            var _data = data;

            //data = site_list[_site].get_product_details(_data);
            data = store_get_product_details(_data,store_target_details,store_details_type);
            //product_list[k].rank = k;
            product_list[k].created_at = data.created_at;
            product_list[k].published_at = data.published_at;
            product_list[k].product_id = data.id;
            product_list[k].is_available = data.available;
            product_list[k].tags = data.tags;
            product_list[k]["variants"] = Array();
            if(typeof data.variants !== "undefined")
            {
                for(var i = 0; i<= data.variants.length -1;i++)
                {
                    var item = data.variants[i];
                    var _name = (typeof item.name !== undefined)?item.name:null,
                        _price = (typeof item.price !== undefined)?parseFloat(item.price * .10):null,
                        _compare_at_price = (typeof item.compare_at_price !== undefined)?parseFloat(item.compare_at_price * .10):null,
                        _sku = (typeof item.sku !== undefined)?item.sku:null,
                        _qty = (typeof item.inventory_quantity !== undefined)?item.inventory_quantity:null,
                        _weight = (typeof item.weight !== undefined)?item.weight:null,
                        //Featured image stuff
                        _variant_img = (typeof item.featured_image !== undefined && item.featured_image !== null && typeof item.featured_image.src !== undefined)?item.featured_image.src:null,
                        _created_at = (typeof item.featured_image !== undefined && item.featured_image !== null && typeof item.featured_image.created_at !== undefined)?item.featured_image.created_at:null,
                        _updated_at = (typeof item.featured_image !== undefined && item.featured_image !== null && typeof item.featured_image.updated_at !== undefined)?item.featured_image.updated_at:null;

                    product_list[k]["variants"].push({
                        id:item.id,
                        name:_name,
                        price:_price,
                        compare_at_price:_compare_at_price,
                        sku:_sku,
                        qty:_qty,
                        created_at:_created_at,
                        updated_at:_updated_at,
                        weight:_weight,
                        img:_variant_img
                    });
                }
            }
            product_counter++;
        },error: function(XMLHttpRequest, textStatus, errorThrown){
            var k = this.k;
            //product_list[k].rank = k;
            product_list[k].img = "http://www.intrans.iastate.edu/root_images/intrans-images/icons/404-icon.png";
            product_list[k].created_at = null;
            product_list[k].published_at = null;
            product_list[k].product_id = null;
            product_list[k].is_available = false;
            product_list[k].tags = null;
            product_list[k]["variants"] = [];
            switch(XMLHttpRequest.status)
            {
                default:
                case 404:
                    crawler_log("Product: " + product_list[k].name + " NOT FOUND" + " ERROR:"  + errorThrown);
                    break;

                case 430:
                    crawler_log("### ERROR 430 BLOCK!! setting is_blocked flag to true to sleep");
                    break;

            }
            product_counter++; //lets increment the counter anyway
        }});
    }



