/** +-----------------------------+
 *  | ShopifyIQ - "Live Spy" page |
 *  +-----------------------------+
 *  Started 12/14/2017
 */
$(document).on("click","#page-limit-selector a", function(e){

    var _selection = $(this).data("limit");
    if(_selection === 0)
    {
        load_full_catalog = true;
        max_page_count = 3;

    } else {
        load_full_catalog = false;
        max_page_count = _selection;
    }
    console.log("Page Limit Selector: " + _selection);
    $("#page-limit-selector-display").text("Page Fetch Limit: " + $(this).text());
});


/** -------------
 *  Load Products
 *  -------------
 *  When the user loads a competitor to load their products
 *  */
$(document).on("click","#page-livespy a.rank-nav-link",function(e){
    //Show loading
    $("#product-container").showLoading();

    bar = new ProgressBar.Line("#progress-bar", {
        strokeWidth: 8,
        easing: 'easeInOut',
        duration: 300,
        color: '#4286f4',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        text: {
            style: {
                // Text color.
                // Default: same as stroke color (options.color)
                color: '#333',
                position: 'absolute',
                right: '0',
                top: '30px',
                padding: 0,
                margin: 0,
                transform: null
            },
            autoStyleContainer: false
        },
        from: {color: '#ccf5ff'},
        to: {color: '#00ccff'}
    });

    //Lets reset the html and counters
    $("#product-list").DataTable().destroy();

    $("#products").empty();

    page = 1;
    page_count = 0;
    page_counter = 1;
    products_per_page = 1;
    product_rank = 1;
    is_crawling_page = true;
    is_crawling_product = false;
    is_crawling_product_details = false;
    is_empty_product_list = false;
    product_list = new Array();


    //Lets set the state flag to true so we don't do anything while we're crawling
    is_crawling = true;


    //Lets change the UI to highlight the current competitors we're crawling


    //Lets grab the competitor name and the respective URL we want to crawl
    _site = $(this).data("name");
    console.log("loading site: " + _site);
    _url = site_list[_site].url;

    //Lets structure the URL
    var url = _url+ "?page=" + page + "&sort_by=best-selling";

    $("#store-selector-display-livespy").text(_site);


    /** -------------
     *  Facebook Page
     *  -------------
     *  */
    $("#page-livespy .fb_page").attr("href","https://www.facebook.com/search/pages/?q=" + _site);


    /** ---------------------
     *  Site Meta Information
     *  ---------------------
     *  */
    //console.log(site_list);
    $("#page-livespy .site_info").attr("href","http://myip.ms/" + site_list[_site].domain);


    /** ----------------
     *  Fetch page count
     *  ----------------  */

    //We add a callback at the end to get_product_list()

    get_page_count(_site,url,function(){get_product_list(_url,page_counter);});

});

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
        if(page_count == 0 || page_counter > page_count)
        {

            //set the flag to stop crawling
            is_crawling_page = false;


            if(xhr.status !== 200) { console.log("Failed to load product details for: " + settings.url);return;}
            else get_product_details(_site);
        }
        /** ----------------------------------
         *  Still crawling? Get the next page!
         *  ---------------------------------- */
        else {
            console.log("Fetching page " + page_counter + " of " + page_count);
            //When get_page function finishes, it will call this ajaxComplete function again!
            get_product_list(_url,page_counter);


            //            bar.animate(.2);  // Number from 0.0 to 1.0
            //setTimeout(function(){bar.animate(.4);},2000);
            //setTimeout(function(){bar.animate(.8);},5000);
            //loading-text
            $("#loading-text").text("Chill bro.. Grabbing product list page " + page_counter + " of " + page_count);
            bar.animate(page_counter/page_count);
            page_counter++;


        }
    }
    if(is_empty_product_list)
    {
        is_crawling_page = false;
        is_empty_product_list = false;

        console.log(product_list);
        if(xhr.status !== 200) { console.log("Failed to load product details for: " + settings.url);return;}
        else get_product_details(_site);
    }

    if(is_crawling_product_details && !is_crawling_product && !is_crawling_page)
    {
        $("#loading-text").text("Loading your shit biatch.. Product " + product_counter + " of " + product_count);
        bar.animate(product_counter/product_count);

        //This means we're done crawling
        if(product_counter > product_count)
        {
            is_crawling_product_details = false;
            console.log("product_list:");
            console.log(product_list);

            render_product_table();
            jQuery('#product-container').hideLoading();


            $("#product-list").DataTable( {
                "pageLength": 100,
                "destroy": true,
                fixedHeader: {
                    headerOffset: 55
                }
            });


            console.log("Crawling complete");
        }

    }

});




/** ================
 *  Helper functions
 *  ================ */

/** -------------------------------------
 *  Get page count of best-seller listing
 *  ------------------------------------- */
function get_page_count(_site,url,callback)
{
    var site = _site;
    console.log("get_page_count: " + site);
    console.log("url: " + url);
    //Lets do an ajax call of the first page
    $.get(url,function(data){
        site_list[site].get_product_count(data);
        if(!load_full_catalog)
            page_count = max_page_count;

        console.log("get_page_count: " + page_count + " products_per_page: " + products_per_page);

        if(typeof callback == "function") callback();
    });
}


/** ----------------------------------
 *  Lets render the data into a table!
 *  ---------------------------------- */
function render_product_table() {

    product_list.forEach(function(item,k){
        {
            var product_rank = k;

            var row = "";
            row += "<tr id='product-" + product_rank + "' data-rank='" + product_rank + "' data-url='" + product_list[k].url + "'>";
            row += "<td class='product_rank'>" + product_rank + "</td>";
            row += "<td class='product_img'><a href='http:\/\/nullrefer.com/?" + product_list[k].url + "' target='_blank'><img src='" + product_list[k].img + "' style='width:100px;height:100px;'></a></td>";
            row += "<td class='product_name '>" + product_list[k].name + "</td>";
            row += "<td class='product_price'>$" + product_list[k].price + "</td>";
            row += "<td class='product_preview text-center' style='width:150px !important;'><button type='button' class='btn btn-sm text-center' data-toggle='modal' data-target='.modal' data-content='http:\/\/nullrefer.com/?" + product_list[k].url + "'><img src='http://au.kg/images/eye.png' style='width:20px;height:20px;'></button>";
            row += "<a href='https://www.facebook.com/search/videos/?q=" + product_list[k].name + "' target='_blank'><img src='https://www.shareicon.net/download/2015/08/29/92522_media_512x512.png' width='50' height='50'></a><a href='https://www.youtube.com/results?search_query=" + product_list[k].name + "' target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/YouTube_icon_block.png/479px-YouTube_icon_block.png' width='30px' height='30px'></a></td>";
            row += "<td class='product_variations text-center'></td>";
            row += "<td class='product_tags text-center'><a class='text-center' data-trigger='hover' data-toggle='popover' data-container='body' data-placement='top' data-html='true' id='tag-" + product_rank + "' href='#'><img src='https://au.kg/images/eye.png' style='width:20px;height:20px;'/></a><div class='content hide'  id='popover-content-tag-" + product_rank + "'></div></td>";
            row += "<td class='product_created_at'></td>";
            row += "<td class='product_published_at'></td>";
            row += "</tr>";

            $("#products").append(row);

            if (product_list[k].created_at) $("#product-" + product_rank + " .product_created_at").html(product_list[k].created_at + "<br><br><strong>" + jQuery.timeago(product_list[k].created_at) + "</strong>");
            if (product_list[k].published_at) $("#product-" + product_rank + " .product_published_at").html(product_list[k].published_at+ "<br><br><strong>" + jQuery.timeago(product_list[k].published_at) + "</strong>");
            //$("#product-" + product_rank + " .product_updated_at").text(jQuery.timeago(product_list[k].updated_at));
            //$("#product-" + rank + " .product_description div.content").attr("data-content",data.description);
            // if(data.description)$("#product-" + rank + " .product_description div.content").attr("data-content",data.description);
            if (product_list[k].tags) $("#popover-content-tag-" + product_rank).text(product_list[k].tags);
            if (product_list[k].variants) $("#product-" + product_rank + " .product_variations").text(product_list[k].variants.length);
        }
    });
}






/** ----------------------------------------------------------------
 *  Lets crawl through each product URL and grab valuable meta-data!
 *  ---------------------------------------------------------------- */
function get_product_details(_site)
{

    is_crawling_product_details = true;
    product_count = product_rank;
    product_counter = 1;
    /** -----------------------------------------------------------------------------------
     *  Now that we have our entire list of products, lets add details to the product array
     *  ----------------------------------------------------------------------------------- */
    for(var i = 1; i <=product_list.length-1;i++)
    {
        if(!product_list[i]) return;
        $.get({k:i,url:product_list[i].url,success:function(data) {
            var k = this.k;
            var _data = data;
            data = site_list[_site].get_product_details(_data)

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
            product_list[k].img = "http://www.intrans.iastate.edu/root_images/intrans-images/icons/404-icon.png";
            product_list[k].created_at = null;
            product_list[k].published_at = null;
            product_list[k].product_id = null
            product_list[k].is_available = false;
            product_list[k].tags = null;
            product_list[k]["variants"] = Array();
            switch(XMLHttpRequest.status)
            {
                default:
                case 404:
                    console.log("Product: " + product_list[k].name + " NOT FOUND");
                    break;

            }
            product_counter++; //lets increment the counter anyway
        }});

    }

}

/** -----------------------------------
 *  Crawl product page for all products
 *  ----------------------------------- */
function get_product_list(url,page) {
    url += "?page=" + page + "&sort_by=best-selling";

    //Set flag to true so we don't incur ajax event handler portion that controls page increment
    is_crawling_product = true;

    $.ajax({
        url: url,
        cache: true
    })
        .done(function (data) {

            //This is the counter that counts from 1 to the total # of products in the page

            //Lets grab the node that contains the list of products
            var product_node_list = $(data).find(site_list[_site].node);

            //If the current page is empty, it means we either over-counted the number of pages + products per page or we're dealing with scroll loaded items
            if(!product_node_list)
            {
                console.log("product_node_list EMPTY!! NO PRODUCTS FOUND ON PAGE: " + url + " URL: " + page);
                is_crawling_product = false;
                is_empty_product_list = true;
            }



            /** ---------------------------------------------------
             *  Iterate through each product and store it in memory
             *  --------------------------------------------------- */

            var _ctr = 1;
            $(product_node_list).each(function (k, v) {

                var product_img = $(v).find(site_list[_site].img).attr("src"),
                    product_url = "http://" + site_list[_site].domain + $(v).find(site_list[_site].click_url).attr("href"),
                    product_name = $(v).find(site_list[_site].name).text();

                var match  = /(?:\$?[0-9.]+)/g.exec($(v).find(site_list[_site].price).first().text());
                product_price = (match)?match[0]:null;

                //(?:\$[0-9.]+)

                //Lets set the relative rank of the product
                product_rank = ((page - 1) * products_per_page) + _ctr;

                //console.log("product_rank: " + product_rank + " _ctr: " + _ctr + " page: " + page);

                //Now lets store that rank and accompanying data into the array for rendering later
                product_list[product_rank] = {
                    img: product_img,
                    url: product_url,
                    price: product_price,
                    name: product_name
                };

                _ctr++;
            });

            //Set the flag to false now that we're done
            is_crawling_product = false;
        })
        .fail(function () {
            alert("error");
        });
}

