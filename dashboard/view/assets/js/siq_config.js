
//Debug settings
var load_full_catalog = true,
    max_page_count = 1;


/** ================
 *  Global Variables
 *  ================ */

var page = 1,
    page_count,
    product_count = 0,
    is_crawling_page = false,
    is_crawling_product = false,
    is_crawling_product_details = false,
    products_per_page = 0,
    page_counter = 0,
    product_counter = 0,
    _site,
    _url,
    MODE,
    site_id,
    _store,
    date_start,
    date_end,
    _lastChart,
    product_counts,
    rank_product_list,
    API_DOMAIN,
    ranking_list = Array(),
    site_rank_list = Array(),
    product_rank = 1,
    product_list = Array(),
    is_empty_product_list = false,
    bar;

MODE='prod';




switch(MODE)
{
    case 'local':
        API_DOMAIN="api.shopifyiq";

        $.ajaxSetup({
            cache: false
        });
        break;

    case 'prod':
        API_DOMAIN="api.shopifyiq.com";

        $.ajaxSetup({
            cache: true
        });
        break;
}
