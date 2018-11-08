/** +----------------------------------+
 *  | ShopifyIQ - "Store Ranking" page |
 *  +----------------------------------+
 *  Started 12/14/2017
 */


/** ==============
 *  Event handlers
 *  ============== */


/** -----------------------------------------------------------------------
 *  CLICK ON A STORE IN STORE SELECTION MENU ON THE LEFT IN "STORE RANKING"
 *  ----------------------------------------------------------------------- */
$(document).on("click","a.main-menu",function(){
    var page = $(this).data("page");
    $(".page-content").hide();
    $("#" + page).show();
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
});


/** -------------------------------------------
 *  INITIALIZE SITE LIST MENU FOR STORE RANKING
 *  ------------------------------------------- */
var menu_html = "";
for(var k in site_list) {
    menu_html +='<li class="nav-item"><a class="nav-link" data-name="' + k + '" data-url="' + site_list[k].url + '" href="#">' +  k  + '</a></li>';
};
$("#nav-sites").append(menu_html);




/** --------------------
 *  Load Product Ranking
 *  --------------------
 *  When the user loads a competitor to load their products
 *  */
$(document).on("click","#page-ranking a.rank-nav-link",function(e){
    _store = $(this);

    //Show loading
    $("#ranking-container").showLoading();
    //Lets reset the html and counters
    $("#ranking-list").DataTable().destroy();

    $("#rankings").empty();


    is_crawling_page = false;
    is_crawling_product = false;
    is_crawling_product_details = false;
    ranking_list = new Array();
    is_crawling = false;


    //Lets change the UI to highlight the current competitors we're crawling


    //Lets grab the competitor name and the respective URL we want to crawl
    var rank_site = $(this).data("name");
    var rank_domain = $(this).data("domain");
    var rank_us = $(this).data("rank-us");
    var rank_global = $(this).data("rank-global");
    var rank_tcrawl = $(this).data("tcrawl");
    var rank_page_count = $(this).data("page-count");
    site_id = $(this).data("id");

    $("#store-selector-display").text($(this).data("name"));


    $("b.us-rank").text(parseInt(rank_us));
    $("b.global-rank").text(parseInt(rank_global));
    $("span.rank-domain").text(rank_site);
    $("b.tcrawl").text($.timeago(rank_tcrawl));
    $("b.page-count").text(rank_page_count);







    /** -------------
     *  Facebook Page
     *  -------------  */
    $(".fb_page").attr("href","https://www.facebook.com/search/pages/?q=" + rank_site);


    /** ---------------------
     *  Site Meta Information
     *  ---------------------
     *  */
    $(".site_info").attr("href","http://myip.ms/" + rank_domain);


    /** ----------------
     *  Fetch page count
     *  ----------------  */

        //We add a callback at the end to get_product_list()

    var _date = (typeof $("#ranking-datepicker").val() !== undefined && typeof $("#ranking-datepicker").val() !== "")?("&date_start=" + $("#ranking-datepicker").val()):"";

    console.log("http://" + API_DOMAIN + "/report/store/products_ranking?store_id=" + site_id + _date);
    $.get({site_id:site_id,url:"http://" + API_DOMAIN + "/report/store/products_ranking?store_id=" + site_id + _date},function(data){

        //site_rank_list
        rank_product_list = data["data"]["report"];
        //console.log("rank_product_list:");
        //console.log(rank_product_list);
        render_ranking_table();
        $("#ranking-container").hideLoading();
        $("#ranking-list").DataTable( {
            "pageLength": 100,
            "order": [[ 4, "desc" ],[ 3, "desc" ]],
            "destroy": true,
            fixedHeader: {
                headerOffset: 55
            },
            columnDefs: [
                { type: 'natural', targets: '_all' }
            ]


        });
    });
});

/** =========
 *  Functions
 *  ========= */

/** ----------------------------------
 *  Lets render the data into a table!
 *  ---------------------------------- */
function render_ranking_table() {

    rank_product_list.forEach(function(item,k){

        var product_rank = k,d1_rank,d3_rank,d7_rank,d0_qty,d1_qty,d3_qty,d7_qty;
        //console.log("rank data:");
        //console.log(rank_product_list[k]);

        /**
         *  Rank gains
         */

        if(rank_product_list[k].rank == rank_product_list[k].rank_d1 || !rank_product_list[k].rank_d1) //Same
        { d1_rank = "<span style='color:#ccc;'>0 =</span>";
        } else if(parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d1)) { //Gain
            d1_rank = "<strong class='text-success'>" + Math.abs(rank_product_list[k].rank_d1-rank_product_list[k].rank) + "</strong> <img   style='width:15px;height:15px;' src='/view/assets/img/arrow_up.png'/> <br/><span style='color:#c0c0c0;font-size:12px;'>(#" +rank_product_list[k].rank_d1 +")</span>";
        } else if(parseInt(rank_product_list[k].rank) > parseInt(rank_product_list[k].rank_d1)) //Drop
        {d1_rank = "<span class='text-danger'>" + (-Math.abs(rank_product_list[k].rank - rank_product_list[k].rank_d1)) + "</span> <img style='width:15px;height:15px;' src='/view/assets/img/arrow_down.png'/> <br/><span style='color:#c0c0c0;font-size:12px;'>(#" +rank_product_list[k].rank_d1 +")</span>";}

        if(rank_product_list[k].rank == rank_product_list[k].rank_d3 || !rank_product_list[k].rank_d3) //Same
        { d3_rank =  "<span style='color:#ccc;'>0 =</span>";
        } else if(parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d3)) { //Gain
            d3_rank = "<strong class='text-success'>" + Math.abs(rank_product_list[k].rank_d3-rank_product_list[k].rank) + "</strong> <img  style='width:15px;height:15px;' src='/view/assets/img/arrow_up.png'/> <br/><span style='color:#c0c0c0;font-size:12px;'>(#" +rank_product_list[k].rank_d3 +")</span>";
        } else if(parseInt(rank_product_list[k].rank) > parseInt(rank_product_list[k].rank_d3)) //Drop
        {d3_rank ="<span class='text-danger'>" + (-Math.abs(rank_product_list[k].rank - rank_product_list[k].rank_d3)) + "</span> <img src='/view/assets/img/arrow_down.png'  style='width:15px;height:15px;'/> <br/><span style='color:#c0c0c0;font-size:12px;'>(#" +rank_product_list[k].rank_d3 +")</span>"; }

        if(rank_product_list[k].rank == rank_product_list[k].rank_d7 || !rank_product_list[k].rank_d7) //Same
        { d7_rank =  "<span style='color:#ccc;'>0 =</span>";
        } else if(parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d7)) { //Gain
            d7_rank = "<strong class='text-success'>" +  Math.abs(rank_product_list[k].rank_d7 - rank_product_list[k].rank) + "</strong> <img  style='width:15px;height:15px;' src='/view/assets/img/arrow_up.png'/><br/><span style='color:#c0c0c0;font-size:12px;'>(#" +rank_product_list[k].rank_d7 +")</span>";
        } else if(parseInt(rank_product_list[k].rank) > parseInt(rank_product_list[k].rank_d7)) //Drop
        {d7_rank =  "<span class='text-danger'>" + (-Math.abs(rank_product_list[k].rank - rank_product_list[k].rank_d7)) + "</span> <img src='/view/assets/img/arrow_down.png'  style='width:15px;height:15px;'/> <br/><span style='color:#c0c0c0;font-size:12px;'>(#" +rank_product_list[k].rank_d7 +")</span>"; }


        /**
         *
         * Product Quantity

        if(rank_product_list[k].qty_diff_d1 == null || rank_product_list[k].qty_diff_d1 == 0)
            d1_qty = "<span style='color:#ccc;'>-</span>"; else
            d1_qty =rank_product_list[k].qty_diff_d1 + "<br/><strong class='text-success'> ($" + parseFloat((rank_product_list[k].qty_diff_d1 * rank_product_list[k].price),2).toFixed(2) + ")</strong>";

        if(rank_product_list[k].qty_diff_d3 == null || rank_product_list[k].qty_diff_d3 == 0)
            d3_qty = "<span style='color:#ccc;'>-</span>"; else
            d3_qty = rank_product_list[k].qty_diff_d3+"<br/><strong class='text-success'> ($" + parseFloat((rank_product_list[k].qty_diff_d3 * rank_product_list[k].price),2).toFixed(2) + ")</strong>";

        if(rank_product_list[k].qty_diff_d7 == null || rank_product_list[k].qty_diff_d7 == 0)
            d7_qty = "<span style='color:#ccc;'>-</span>"; else
            d7_qty =rank_product_list[k].qty_diff_d7+"<br/><strong class='text-success'> ($" + parseFloat((rank_product_list[k].qty_diff_d7 * rank_product_list[k].price),2).toFixed(2) + ")</strong>";
         */
        /**
         <th>Rank</th>
         <th>D1</th>
         <th>D1%</th>
         <th>D3</th>
         <th>D3%</th>
         <th>D7</th>
         <th>D7%</th>
         <th>Image</th>
         <th>Product Name</th>
         <th>Price</th>
         <th>Preview</th>
         <th>Available</th>
         <th>Published</th>
         <th>Updated</th>
         */
        d1_percent_delta = parseInt(((rank_product_list[k].rank_d1-rank_product_list[k].rank) / product_counts[rank_product_list[k].store_id]) * 100);

        d3_percent_delta = parseInt(((rank_product_list[k].rank_d3-rank_product_list[k].rank) / product_counts[rank_product_list[k].store_id]) * 100);

        d7_percent_delta = parseInt(((rank_product_list[k].rank_d7-rank_product_list[k].rank) / product_counts[rank_product_list[k].store_id]) * 100);

        if(d1_percent_delta > 50 || d3_percent_delta > 50 || d7_percent_delta > 50)
        {
            _delay +=500;
            setTimeout(function(){
                $("rankings #ranking-" + product_rank).addClass('animated flash');
                //alert("product rank: " + product_rank);
                console.log("#global-rankings #ranking-" + product_rank);
            },_delay);
        }

        var row = "";
        //console.log("RANKING: " + rank_product_list[k].rank);
        row += "<tr class='ranking-row" + ((parseInt(rank_product_list[k].rank)===0)?' product-unavailable':'') +"' id='ranking-" + product_rank + "' data-rank='" + product_rank + "' data-url='" + rank_product_list[k].url + "'>";
        row += "<td class='product_rank'>#" + rank_product_list[k].rank + " </td>";

        //row += "<td class='product_rank'>" + rank_product_list[k].rank + "</td>";
        row += "<td class='product_rank'>" + d1_rank + "</td>";
        row += "<td class='product_delta_rate'>" + ((d1_percent_delta>0)?d1_percent_delta+ "<strong>%</strong>":"") +"</td>";

        row += "<td class='product_rank'>" + d3_rank + "</td>";
        row += "<td class='product_delta_rate'>" + ((d3_percent_delta>0)?d3_percent_delta+ "<strong>%</strong>":"") + "</td>";

        row += "<td class='product_rank'>" + d7_rank + "</td>";
        row += "<td class='product_delta_rate'>" + ((d7_percent_delta>0)?d7_percent_delta+ "<strong>%</strong>":"") + "</td>";

        row += "<td class='product_img'><a href='http:\/\/nullrefer.com/?" + rank_product_list[k].url + "' target='_blank'><img src='" + rank_product_list[k].img + "'></a></td>";
        row += "<td class='product_name '>" + rank_product_list[k].name + "</td>";
        row += "<td class='product_price'>" + rank_product_list[k].price + "</td>";
        row += "<td class='product_preview text-center'><button type='button' class='btn btn-sm text-center btn-product-chart' data-toggle='modal' data-target='#chart-modal-container' data-store-id='" + site_id + "' data-product-id='" + rank_product_list[k].product_id + "' data-product-name='" + rank_product_list[k].name+ "'><img src='/assets/img/chart_icon.png' style='width:20px;height:20px;'></button><button type='button' class='btn btn-sm text-center btn-preview' data-toggle='modal' data-target='.modal' data-content='http:\/\/nullrefer.com/?" + rank_product_list[k].url + "'><img src='http://au.kg/images/eye.png'/></button>";
        row += "<a href='https://www.facebook.com/search/videos/?q=" + rank_product_list[k].name + "' target='_blank'><img src='https://www.shareicon.net/download/2015/08/29/92522_media_512x512.png' class='btn-facebook'/></a><a href='https://www.youtube.com/results?search_query=" + rank_product_list[k].name + "' target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/YouTube_icon_block.png/479px-YouTube_icon_block.png' class='btn-youtube' ></a>";
        row += "<a href='http://google.com/search?q=" + rank_product_list[k].name + "' target='_blank'><img src='/assets/img/google_icon.png' class='btn-google' ></a></td>";
        //row += "<td class='product_available text-center'>" + ((parseInt(rank_product_list[k].is_available) == 1)?"":"<img src='/view/assets/img/warning.png'/>") + "</td>";
        //row += "<td class='product_qty text-center'>" + rank_product_list[k].qty + "</td>";
        //row += "<td class='product_qty text-center'>" + d1_qty + "</td>";
        //row += "<td class='product_qty text-center'>" + d3_qty + "</td>";
        //row += "<td class='product_qty text-center'>" + d7_qty + "</td>";

        //row += "<td class='product_created_at'>" + $.timeago(rank_product_list[k].shopify_tcreate) + "</td>";
        row += "<td class='product_published_at'>" + $.timeago(rank_product_list[k].shopify_tpublish) + "</td>";
        row += "<td class='product_updated_at'>" + ((rank_product_list[k].tmodified =="0000-00-00 00:00:00")?"-":$.timeago(rank_product_list[k].tmodified)) + "</td>";

        row += "</tr>";

        $("#rankings").append(row);

        /**
         *                             <th>Rank</th>
         <th>D1</th>
         <th>D3</th>
         <th>D7</th>
         <th>Image</th>
         <th>Product Name</th>
         <th>Price</th>
         <th>Preview</th>
         <th>Available</th>
         <th>QTY</th>
         <th>QTY D1</th>
         <th>QTY D3</th>
         <th>QTY D7</th>
         <th>Created</th>
         <th>Published</th>
         */
    });

}
