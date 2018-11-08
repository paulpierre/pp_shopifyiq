/** +-----------------------------------+
 *  | ShopifyIQ - "Global Ranking" page |
 *  +-----------------------------------+
 *  Started 12/14/2017
 */


/** ==============
 *  Event handlers
 *  ============== */
    $(document).on("click","#global-ranking",function(e){
        load_global_ranking();
    });

    $(document).on("change","input#global-ranking-datepicker",function(e){
        load_global_ranking();
    });

    /** ---------------------
     *  GLOBAL RANKING FILTER
     *  --------------------- */
    var options = [];
    $( '.dropdown-menu a' ).on( 'click', function( event ) {

        var $target = $( event.currentTarget ),
            val = $target.attr( 'data-value' ),
            $inp = $target.find( 'input' ),
            idx;

        if ( ( idx = options.indexOf( val ) ) > -1 ) {
            options.splice( idx, 1 );
            setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
        } else {
            options.push( val );
            setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
        }

        $( event.target ).blur();

        console.log( options );
        return false;
    });


/** =========
 *  Functions
 *  ========= */
function load_global_ranking()
{
    //Show loading
    $("#global-ranking-container").showLoading();
    $("#loading-text").text("Loading global ranking list...");


    //Lets reset the html and counters
    $("#global-ranking-list").DataTable().destroy();

    $("#global-rankings").empty();


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

    $("b.us-rank").text(parseInt(rank_us));
    $("b.global-rank").text(parseInt(rank_global));
    //$("b.tcrawl").text($.timeago(rank_tcrawl));

    //We add a callback at the end to get_product_list()

    var _date = (typeof $("#global-ranking-datepicker").val() !== undefined && typeof $("#global-ranking-datepicker").val() !== "")?("date_start=" + $("#global-ranking-datepicker").val()):"";

    $.get({url:"http://" + API_DOMAIN + "/report/store/global_products_ranking?" + _date},function(data){
        console.log("http://" + API_DOMAIN + "/report/store/global_products_ranking?" + _date);
        console.log(data);
        rank_product_list = data["data"]["report"];

        //lets get product_count
        $.get("http://" + API_DOMAIN + "/report/store/product_count_all",function(d){
            console.log("URL: " + "http://" + API_DOMAIN + "/report/store/product_count_all");
            //console.log(d);
            //return;

            product_counts = d["data"]["report"];


            render_global_ranking_table();

            render_global_sparklines();

            $("#global-ranking-list").DataTable( {
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
            $("#global-ranking-container").hideLoading();
        });





    });
}







function render_global_sparklines()
{
    var _start = moment($("#global-ranking-datepicker").val() ).subtract(30, 'days');
    var _end = moment($("#global-ranking-datepicker").val() );

    _end = _end.format('YYYY-MM-DD');
    _start = _start.format('YYYY-MM-DD');
    $("td.product_chart").each(function(i,val){
        var store_id = $(this).data("store-id"),
            product_id = $(this).data("product-id"),
            chart_id = $(this).find("canvas").attr("id");

        set_product_rank_chart(store_id,product_id,"",chart_id,"sparkline",_start,_end);

    });

}


/** ----------------------------------
 *  Lets render the data into a table!
 *  ---------------------------------- */
function render_global_ranking_table() {

    var _delay = 1000;

    //console.log("site_rank_list:");
    //console.log(site_rank_list);
    rank_product_list.forEach(function(item,k){

        var product_rank = k,
            d1_rank,
            d3_rank,
            d7_rank,
            d0_qty,
            d1_qty,
            d3_qty,
            d7_qty,
            d1_percent_delta=0,
            d3_percent_delta=0,
            d7_percent_delta=0;


        /**
         *  Rank gains
         */

        if(rank_product_list[k].rank === rank_product_list[k].rank_d1 || !rank_product_list[k].rank_d1) //Same
        { d1_rank = "<span style='color:#ccc;'>0 =</span>";
        } else if(parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d1)) { //Gain
            d1_rank = "<strong class='text-success-light'>+" + Math.abs(rank_product_list[k].rank_d1 - rank_product_list[k].rank) + "</strong> <img style='width:15px;height:15px;' src='/view/assets/img/arrow_up.png'/><span style='width:85%;border-top:1px solid #ccc;margin:0 auto;display:block;color:#ccc'>#"  + rank_product_list[k].rank_d1+"</span>";
        } else if(parseInt(rank_product_list[k].rank) > parseInt(rank_product_list[k].rank_d1)) //Drop
        {d1_rank = "<span class='text-danger-light'>" + (-Math.abs(rank_product_list[k].rank - rank_product_list[k].rank_d1)) + "</span> <img style='width:15px;height:15px;' src='/view/assets/img/arrow_down.png'/><span style='width:85%;border-top:1px solid #ccc;margin:0 auto;display:block;color:#ccc'>#"  + rank_product_list[k].rank_d1+"</span>";}

        if(rank_product_list[k].rank === rank_product_list[k].rank_d3 || !rank_product_list[k].rank_d3) //Same
        { d3_rank =  "<span style='color:#ccc;'>0 =</span>";
        } else if(parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d3)) { //Gain
            d3_rank = "<strong class='text-success-light'>+" + Math.abs(rank_product_list[k].rank_d3 - rank_product_list[k].rank) + "</strong> <img  style='width:15px;height:15px;' src='/view/assets/img/arrow_up.png'/><span style='width:85%;border-top:1px solid #ccc;margin:0 auto;display:block;color:#ccc'>#"  + rank_product_list[k].rank_d3+"</span>";
        } else if(parseInt((rank_product_list[k].rank)) > parseInt(rank_product_list[k].rank_d3)) //Drop
        {d3_rank ="<span class='text-danger-light'>" + (-Math.abs(rank_product_list[k].rank - rank_product_list[k].rank_d3)) + "</span> <img src='/view/assets/img/arrow_down.png'  style='width:15px;height:15px;'/><span style='width:85%;border-top:1px solid #ccc;margin:0 auto;display:block;color:#ccc'>#"  + rank_product_list[k].rank_d3+"</span>"; }

        if(rank_product_list[k].rank === rank_product_list[k].rank_d7 || !rank_product_list[k].rank_d7) //Same
        { d7_rank =  "<span style='color:#ccc;'>0 =</span>";
        } else if(parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d7)) { //Gain
            d7_rank = "<strong class='text-success-light'>+" +  Math.abs(rank_product_list[k].rank_d7 - rank_product_list[k].rank) + "</strong> <img  style='width:15px;height:15px;' src='/view/assets/img/arrow_up.png'/><span style='width:85%;border-top:1px solid #ccc;margin:0 auto;display:block;color:#ccc'>#"  + rank_product_list[k].rank_d7+"</span>";
        } else if(parseInt(rank_product_list[k].rank) > parseInt(rank_product_list[k].rank_d7)) //Drop
        {d7_rank =  "<span class='text-danger-light'>" + (-Math.abs(rank_product_list[k].rank - rank_product_list[k].rank_d7)) + "</span> <img src='/view/assets/img/arrow_down.png'  style='width:15px;height:15px;'/><span style='width:85%;border-top:1px solid #ccc;margin:0 auto;display:block;color:#ccc'>#"  + rank_product_list[k].rank_d7+"</span>"; }

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

        d1_percent_delta = parseInt(((rank_product_list[k].rank_d1-rank_product_list[k].rank) / product_counts[rank_product_list[k].store_id]) * 100);

        d3_percent_delta = parseInt(((rank_product_list[k].rank_d3-rank_product_list[k].rank) / product_counts[rank_product_list[k].store_id]) * 100);

        d7_percent_delta = parseInt(((rank_product_list[k].rank_d7-rank_product_list[k].rank) / product_counts[rank_product_list[k].store_id]) * 100);

        if(d1_percent_delta > 50 || d3_percent_delta > 50 || d7_percent_delta > 50)
        {
            _delay +=500;
            setTimeout(function(){
                $("#global-rankings #ranking-" + product_rank).addClass('animated flash');
                //alert("product rank: " + product_rank);
                console.log("#global-rankings #ranking-" + product_rank);
            },_delay);
        }


        var row = "";
        row += "<tr class='ranking-row" + ((rank_product_list[k].rank==0)?' product-unavailable':'') + "' id='ranking-" + product_rank + "' data-rank='" + product_rank + "' data-url='" + rank_product_list[k].url + "'>";
        row += "<td class='product_rank'><a href='#' class='rank_debug' data-index='" + product_rank + "'>" + rank_product_list[k].rank + " </a></span><span style='padding-top:5px;width:80%;color:#ccc;display:block;border-top:1px solid #ccc;margin:0 auto;'><img src='/assets/img/products_icon.png' style='width:15px;height:15px;position:relative;bottom:2px;opacity:0.5;'/>" + product_counts[rank_product_list[k].store_id].toLocaleString('en-US') + "</span></td>";

        //row += "<td class='product_rank'>" + rank_product_list[k].rank + "</td>";
        row += "<td class='product_rank'>" + d1_rank + "</td>";
        row += "<td class='product_delta_rate'>" + ((d1_percent_delta>0)?"<strong class='text-success'>"+ d1_percent_delta+ "%</strong>":"") +"</td>";

        row += "<td class='product_rank'>" + d3_rank + "</td>";
        row += "<td class='product_delta_rate'>" + ((d3_percent_delta>0)?"<strong class='text-success'>"+ d3_percent_delta+ "%</strong>":"") + "</td>";

        row += "<td class='product_rank'>" + d7_rank + "</td>";
        row += "<td class='product_delta_rate'>" + ((d7_percent_delta>0)?"<strong class='text-success'>"+ d7_percent_delta+ "%</strong>":"") + "</td>";

        row += "<td class='product_chart'  data-store-id='" + rank_product_list[k].store_id + "' data-product-id='" + rank_product_list[k].product_id + "' style='color:#ccc;'><canvas id='spark-" + rank_product_list[k].store_id + "-" + rank_product_list[k].product_id + "' class='sparkline'></canvas></td>";
        row += "<td class='product_store_rank' style='color:#ccc;'>" + parseInt(rank_product_list[k].rank_global).toLocaleString('en-US') + "</td>";

        /**
         *     var i = $(this).data("index");
         console.log(rank_product_list[i]);
         * @type {string}
         */
        row += "<td class='product_img'><a href='http:\/\/nullrefer.com/?" + rank_product_list[k].url + "' target='_blank'><img src='" + rank_product_list[k].img + "'></a></td>";
        row += "<td class='product_store_name'><a data-name='"  + rank_product_list[k].store_name  + "' href='#'>" + rank_product_list[k].store_name + "</a></td>";

        row += "<td class='product_name'>" + rank_product_list[k].name + "</td>";
        row += "<td class='product_price'>$" + rank_product_list[k].price + "</td>";

        row += "<td class='product_preview text-center'><button type='button' class='btn btn-sm text-center btn-product-chart' data-toggle='modal' data-target='#chart-modal-container' data-store-id='" + rank_product_list[k].store_id + "' data-product-id='" + rank_product_list[k].product_id + "' data-product-name='" + rank_product_list[k].name+ "'><img src='/assets/img/chart_icon.png' style='width:20px;height:20px;'></button><button type='button' class='btn btn-sm text-center btn-preview' data-toggle='modal' data-target='.modal' data-content='http:\/\/nullrefer.com/?" + rank_product_list[k].url + "'><img src='http://au.kg/images/eye.png'/></button>";
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

        //console.log("rank: " + rank_product_list[k].rank + " d1: " + rank_product_list[k].rank_d1);
        //console.log("rank: " + rank_product_list[k].rank + " d3: " + rank_product_list[k].rank_d3);
        //console.log("rank: " + rank_product_list[k].rank + " d7: " + rank_product_list[k].rank_d7);

        if(
            (parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d1) && rank_product_list[k].rank_d1) ||
            (parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d3) && rank_product_list[k].rank_d3) ||
            (parseInt(rank_product_list[k].rank) < parseInt(rank_product_list[k].rank_d7) && rank_product_list[k].rank_d7)
        )
            $("#global-rankings").append(row);

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
