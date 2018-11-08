/** +----------------------------------------------------------------------------+
 *  | ShopifyIQ - A Shopify Product Ranking Tool by paul / ########## |
 *  +----------------------------------------------------------------------------+
 *  Started 12/14/2017
 */


/** ==============
 *  Initialization
 *  ============== */
var siq_fp, siq_fn, siq_ln, siq_em,siq_hash,fb_status;
$(document).ready(function(){

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    /** Get first name :
     *
     *
     *
     * **/


    /** ========================
     *  Initialize UI components
     *  ======================== */

        /** --------------------
         *  INITIALIZE TOOL TIPS
         *  -------------------- */
        $('.tooltip-container').each(function() { // Notice the .each() loop, discussed below
            $(this).qtip({
                content: {
                    text: $(this).find('div.tooltip').html() // Use the "div" element next to this for the content
                },
                position: {
                    adjust: {
                        x: -35
                    }
                },
                style: {
                    classes: 'qtip-bootstrap'
                }
            });
        });



        $.get("http://" + API_DOMAIN + "/report/store/store_list",function(data){
            //site_rank_list
            var menu_html = "";

            site_rank_list = data["data"]["report"];

            $("#store-count").html("<span style='color:#ccc;'> - <img src='/assets/img/shopify_icon.png' style='width:20px;height:20px;position:relative;bottom:5px;'/>" + site_rank_list.length + "</span>");

            for(var k in site_rank_list) {
                menu_html +='<a class="rank-nav-link'  + ((site_rank_list[k].rank_us==0)?' no-rank':'') +'" data-rank-us="'+ site_rank_list[k].rank_us +'" data-rank-global="'+ site_rank_list[k].rank_global +'" data-tcrawl="'+ site_rank_list[k].t_crawl +'" data-domain="'+ site_rank_list[k].domain +'" data-page-count="' + site_rank_list[k].page_count +'" data-name="' + site_rank_list[k].name + '" data-id="' + site_rank_list[k].id + '" href="#">' +  site_rank_list[k].name  + ' <span>(' + $.timeago(site_rank_list[k].t_crawl) + ')</span></a>';
            };
            $("#store-selector,#store-selector-livespy").append(menu_html);

        });

        /** ------------------------
         *  INITIALIZE TABS / PAGES
         *  ------------------------ */

        $("#page-global-ranking").show();


        /** -------------------------
         *  DATE PICKER INTIALIZATION
         *  ------------------------- */

        //$( "input.datepicker" ).datepicker();
        //$( "input.datepicker" ).datepicker("option","dateFormat","yy-mm-dd");



    //Lets set the value to the day before today, e.g. yesterday
        var d = new Date();

        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

        var today = new Date(utc + (3600000 * (-8)));
        console.log("Adjusted: " + today);
        console.log("Normal: " + d);
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        if(dd<10) dd='0'+dd;
        if(mm<10) mm='0'+mm;
        if(dd-1 == 0) dd= 30;
        today = yyyy+'-'+mm+'-'+(dd-1);
        today =  "2018-04-03"; //TODO: REMOVE ME!!

    $("input.datepicker").val(today);

    $('input.datepicker').daterangepicker({
        locale: {format:'YYYY-MM-DD'},
        singleDatePicker: true,
        showDropdowns: true,
        startDate:today
    });


        /** ---------------------------------
         *  DISPLAY RANKING CHART FOR PRODUCT
         *  --------------------------------- */
        $(document).on("click",".btn-product-chart",function(){
            _lastChart = $(this);
            var store_id = $(this).data("store-id");
            var product_id = $(this).data("product-id");
            var product_name = $(this).data("product-name");
            get_product_rank(store_id,product_id,product_name,"product-ranking-chart");
            get_store_comparison_rank(store_id,product_id,product_name,"store-comparison-ranking-chart")
        });

        /** --------------------------------------------
         *  SET DATE RANGE FOR RANKING CHART FOR PRODUCT
         *  -------------------------------------------- */
        var start = moment($("input.datepicker").val()).subtract(29, 'days');
        var end = moment($("input.datepicker").val());

        date_start = start.format('YYYY-MM-DD');
        date_end = end.format('YYYY-MM-DD');



        function cb(start, end) {
            $('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
            date_start = start.format('YYYY-MM-DD');
            date_end = end.format('YYYY-MM-DD');
        }

    /** --------------------------------
     *  INITIALIZE THE DATE RANGE PICKER
     *  -------------------------------- */
        $('#reportrange').daterangepicker({
            locale: {format:'YYYY-MM-DD'},
            startDate: start,
            endDate: end,
            ranges: {
                'Today': [moment($("input.datepicker").val()), moment($("input.datepicker").val())],
                'Yesterday': [moment($("input.datepicker").val()).subtract(1, 'days'), moment($("input.datepicker").val()).subtract(1, 'days')],
                'Last 7 Days': [moment($("input.datepicker").val()).subtract(6, 'days'), moment($("input.datepicker").val())],
                'Last 30 Days': [moment($("input.datepicker").val()).subtract(29, 'days'), moment($("input.datepicker").val())],
                'This Month': [moment($("input.datepicker").val()).startOf('month'), moment($("input.datepicker").val()).endOf('month')],
                'Last Month': [moment($("input.datepicker").val()).subtract(1, 'month').startOf('month'), moment($("input.datepicker").val()).subtract(1, 'month').endOf('month')]
            }
        }, cb);

        cb(start, end);

    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        date_start =picker.startDate.format('YYYY-MM-DD');
        date_end =picker.endDate.format('YYYY-MM-DD');
        //$(_lastChart).click();
        var store_id = $(_lastChart).data("store-id");
        var product_id = $(_lastChart).data("product-id");
        var product_name = $(_lastChart).data("product-name");
        get_product_rank(store_id,product_id,product_name,"product-ranking-chart");
    });


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
        $("ul.navbar-nav li").removeClass("active");
        $(this).addClass("active");
    });


    /** -------------------------------------------------
     *  Click on a store name inside Global ranking table
     *  ------------------------------------------------- */
    $(document).on("click","td.product_store_name a",function(){
        $("a.main-menu[data-page='page-ranking']").click();
        $(".rank-nav-link[data-name='" + $(this).data("name")+ "']").click();
    });


    /** ---------------
     *  Product preview
     *  --------------- */
    $(document).on("click","td.product_preview .btn-preview",function(){
        var content = $(this).attr("data-content");

        $(".modal-body").html("<iframe style='width:100%;min-height:700px;border:0px;' src='" + content + "'/>");
    });







    //
    $(document).on("change","input#ranking-datepicker",function(e){
        $(_store).click();
    });


    $(document).on("click","a.rank_debug",function(e){
        var i = $(this).data("index");
        console.log(rank_product_list[i]);
    });


    /** ---------------------------
     *  Load Global Product Ranking
     *  ---------------------------
     * */
    load_global_ranking();


});


/** ================
 *  Helper functions
 *  ================ */

function get_product_rank(store_id,product_id,product_name,chart_id)
{
    if(typeof window.product_chart_rank !== "undefined")window.product_chart_rank.destroy();
    set_product_rank_chart(store_id,product_id,product_name,chart_id,"scatter-comparison")
}

function get_store_comparison_rank(store_id,product_id,product_name,chart_id)
{
    if(typeof window.product_comparison_chart_rank !== "undefined") window.product_comparison_chart_rank.destroy();
    set_store_comparison_chart(store_id,product_id,product_name,chart_id)
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function set_store_comparison_chart(store_id,product_id,product_name,chart_id,chart_type,start_date,end_date)
{
    var ctx = document.getElementById(chart_id).getContext("2d");


    if(typeof end_date == "undefined" || typeof start_date == "undefined")
    {
        end_date = date_end;
        start_date = date_start;
    }
    console.log("date_start: " + date_start + " date_end: "  + date_end);

    /** ------------------------------------
     *  Ajax call to /report/product/ranking
     *  ------------------------------------  */
    //end_date =  end_date.format('YYYY-MM-DD');
    //start_date =  start_date.format('YYYY-MM-DD');
    console.log("http://" + API_DOMAIN + "/report/product/store_comparison?date_start=" + start_date +"&date_end=" + end_date +"&product_id=" + product_id +"&store_id=" + store_id +"&sort_column=crawl_tcreate&sort_type=0");

    $.get({product_name:product_name,url:"http://" + API_DOMAIN + "/report/product/store_comparison?date_start=" + start_date +"&date_end=" + end_date +"&product_id=" + product_id +"&store_id=" + store_id +"&sort_column=crawl_tcreate&sort_type=0"},function(data) {
        //console.log(data);
        var product_comparison_rank_data = new Array();
        product_comparison_rank_data = data["data"]["report"];


        if(product_comparison_rank_data.length == 0) {
            //TODO: uncomment this in the future!!
            //alert(data["msg"]);
            return;
        }

        var rank_data = new Array();//,price_data = new Array();




        /**
         *                     $data_set[$o['id']]['data'][] = Array(
         'date'=>$o['crawl_tcreate'],
         'rank'=>$o['rank']
         );
         if(!isset($data_set[$o['id']]['name'])) $data_set[$o['id']]['name'] = $o['name'];
         if(!isset($data_set[$o['id']]['age'])) $data_set[$o['id']]['age'] = $o['age'];
         if(!isset($data_set[$o['id']]['variant_id'])) $data_set[$o['id']]['variant_id'] = $o['variant_id'];
         */


        var i=0;
        //for (var i=0;i < product_comparison_rank_data.length-1;i++) {
        for(var o in product_comparison_rank_data){
            //rank_data[i]={y:Math.abs(product_comparison_rank_data[i].crawl_rank),x:product_comparison_rank_data[i].crawl_tcreate};
            //price_data[i]={y:product_comparison_rank_data[i].crawl_price,x:product_comparison_rank_data[i].crawl_tcreate};
            rank_data[i] = {
                label:(product_comparison_rank_data[o].name.length>20)?(product_comparison_rank_data[o].name.substring(0, 20) + ".."):product_comparison_rank_data[o].name,
                fill:false,
                borderColor:getRandomColor(),
                data:product_comparison_rank_data[o].data,
                yAxisID:"y-axis-1"
            }
            i++;
            if(i>15) break;
        };
        //}

        //console.log('rank_data: ' + rank_data + ' price_data: ' + price_data);

        console.log(rank_data);
/*

        for(var i=0;i <rank_data.length -1;i++)
        {
            if(rank_data[i].y > max_value) max_value = rank_data[i].y;
        }
*/
        //console.log("max value: " + max_value);


        var config;

        switch(chart_type)
        {

            default:

                config = {

                    type: 'line',
                    data: {
                        datasets:rank_data /*[{
                            label: "Rank",
                            fill: false,
                            backgroundColor: window.chartColors.blue,
                            borderColor: window.chartColors.blue,
                            data:rank_data,yAxisID: "y-axis-1",
                        }] */
                    },
                    options: {

                        tooltips: {
                            enabled: true,
                            mode: 'single',
                           /*
                            callbacks: {
                                label: function(tooltipItems, data) {
                                    if(tooltipItems.datasetIndex==1) return data.datasets[tooltipItems.datasetIndex].label +': $' + tooltipItems.yLabel;
                                    else return data.datasets[tooltipItems.datasetIndex].label +': #' + tooltipItems.yLabel;
                                }
                            }*/
                        },


                        responsive: true,

                        title:{
                            display:true,
                            text:"Top D3 Products in Store",
                        },

                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                type:'time',
                                distribution:'series',
                                time: {
                                    unit:'day',
                                    //max:date_start,
                                    //min:date_end
                                },
                                autoSkip:false,
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Date'
                                }
                            }],
                            yAxes: [
                                {
                                    ticks: {
                                        callback:function(value){ return "#" + Number(value).toFixed(0); },
                                        reverse: true,
                                        autoSkip: true,
                                        /*
                                        callback: function(label, index, labels) {
                                            return "#" + label;
                                        },*/
                                    },
                                    display: true,
                                    id:"y-axis-1",
                                    position:"left",
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Rank'
                                    }
                                }

                            ]
                        }
                    }
                };
                break;
        }


        window.product_comparison_chart_rank = new Chart(ctx, config);

    });
}



function set_product_rank_chart(store_id,product_id,product_name,chart_id,chart_type,start_date,end_date)
{
    var ctx = document.getElementById(chart_id).getContext("2d");


    if(typeof end_date == "undefined" || typeof start_date == "undefined")
    {
        end_date = date_end;
        start_date = date_start;
    }
    //console.log("date_start: " + date_start + " date_end: "  + date_end);

    /** ------------------------------------
     *  Ajax call to /report/product/ranking
     *  ------------------------------------  */
    //end_date =  end_date.format('YYYY-MM-DD');
    //start_date =  start_date.format('YYYY-MM-DD');
    //console.log("http://" + API_DOMAIN + "/report/product/ranking?date_start=" + start_date +"&date_end=" + end_date +"&product_id=" + product_id +"&store_id=" + store_id +"&sort_column=crawl_tcreate&sort_type=0");

    $.get({product_name:product_name,url:"http://" + API_DOMAIN + "/report/product/ranking?date_start=" + start_date +"&date_end=" + end_date +"&product_id=" + product_id +"&store_id=" + store_id +"&sort_column=crawl_tcreate&sort_type=0"},function(data) {
        //console.log(data);
        var product_rank_data = data["data"]["report"];


        if(product_rank_data.length == 0) {
            //TODO: uncomment this in the future!!!
            //alert(data["msg"]);
            return;
        }

        var rank_data = new Array(),price_data = new Array();

        for (var i=0;i < product_rank_data.length-1;i++) {
            rank_data[i]={y:Math.abs(product_rank_data[i].crawl_rank),x:product_rank_data[i].crawl_tcreate};
            price_data[i]={y:product_rank_data[i].crawl_price,x:product_rank_data[i].crawl_tcreate};
        }

        //console.log('rank_data: ' + rank_data + ' price_data: ' + price_data);

        //console.log(rank_data);

        var max_value = 0;

        for(var i=0;i <rank_data.length -1;i++)
        {
            if(rank_data[i].y > max_value) max_value = rank_data[i].y;
        }

        //console.log("max value: " + max_value);


        var config;

        switch(chart_type)
        {
            case 'sparkline':
                //max_value

                config = {
                    type: 'line',
                    data: {
                        datasets: [{
                            //label: "Rank",
                            fill: true,
                            borderWidth: 3,
                            backgroundColor:"#fff",
                            borderColor: "#83d4a0",
                            data:rank_data,yAxisID: "y-axis-1",

                        }]
                    },
                    options: {
                        animation: false,
                        layout: {
                            padding: {
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            }
                        },
                        elements: {
                            point: {
                                radius: 0
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltips: {
                            enabled: true,
                            mode: 'single',
                            callbacks: {
                                label: function(tooltipItems, data) {
                                    if(tooltipItems.datasetIndex==1) return data.datasets[tooltipItems.datasetIndex].label +': $' + tooltipItems.yLabel;
                                    else return data.datasets[tooltipItems.datasetIndex].label +': #' + tooltipItems.yLabel;
                                }
                            }
                        },


                        responsive: true,
                        maintainAspectRatio: false,


                        scales: {
                            xAxes: [{

                                type:'time',
                                distribution:'series',
                                time: {
                                    unit:'day',
                                    //max:date_start,
                                    //min:date_end
                                },
                                display: false,

                                ticks: {
                                    display: true
                                },


                            }],
                            yAxes: [
                                {

                                    ticks: {
                                        display: false,
                                        reverse:true,
                                      beginAtZero:true,
                                        max:max_value,
                                        min:0
                                    },
                                    gridLines: {
                                        display: false,
                                        drawBorder: false,
                                    },
                                    display: false,
                                    id:"y-axis-1",
                                    position:"left",
                                    scaleLabel: {
                                        display: false
                                    }
                                }

                            ]
                        }
                    }
                };
                break;

            default:

                config = {

                    type: 'line',
                    data: {
                        datasets: [{
                            label: "Rank",
                            fill: false,
                            backgroundColor: window.chartColors.blue,
                            borderColor: window.chartColors.blue,
                            data:rank_data,yAxisID: "y-axis-1",
                        }, {
                            label: "Price",
                            fill: false,
                            backgroundColor: window.chartColors.green,
                            borderColor: window.chartColors.green,
                            borderDash: [5, 5],
                            data: price_data,yAxisID: "y-axis-2",
                        }]
                    },
                    options: {

                        tooltips: {
                            enabled: true,
                            mode: 'single',
                            callbacks: {
                                label: function(tooltipItems, data) {
                                    if(tooltipItems.datasetIndex==1) return data.datasets[tooltipItems.datasetIndex].label +': $' + tooltipItems.yLabel;
                                    else return data.datasets[tooltipItems.datasetIndex].label +': #' + tooltipItems.yLabel;
                                }
                            }
                        },


                        responsive: true,

                        title:{
                            display:true,
                            text:product_name
                        },

                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                type:'time',
                                distribution:'series',
                                time: {
                                    unit:'day',
                                    //max:date_start,
                                    //min:date_end
                                },
                                autoSkip:false,
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Date'
                                }
                            }],
                            yAxes: [
                                {
                                    ticks: {
                                        reverse: true,
                                        callback: function(label, index, labels) {
                                            return "#" + label;
                                        },
                                    },
                                    display: true,
                                    id:"y-axis-1",
                                    position:"left",
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Rank'
                                    }
                                },
                                {
                                    ticks: {
                                        callback: function(label, index, labels) {
                                            return "$" + label.toFixed(2);
                                        },
                                    },
                                    id:"y-axis-2",
                                    display: true,
                                    position:"right",
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Price'
                                    }
                                }

                            ]
                        }
                    }
                };
                break;
        }

        window.product_chart_rank = new Chart(ctx, config);
    });
}


