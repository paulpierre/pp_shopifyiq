<?php
/** =====================
 *  report.controller.php
 *  =====================
 *  ------
 *  ABOUT:
 *  ------
 *  Sends report data
 */
global $controllerObject,$controllerFunction,$controllerID,$controllerData,$vendor_array;

include_once (API_PATH . 'sql_queries.php'); //Contains all our SQL queries

/** ----------
 *  DATE RANGE
 *  ---------- */

$date_start = isset($_GET['date_start']) && is_valid_date($_GET['date_start'])?urldecode($_GET['date_start']):false;
$date_end = isset($_GET['date_end']) && is_valid_date($_GET['date_end'])?urldecode($_GET['date_end']):false;

if($date_start && $date_end)
{
    if(strtotime($date_start) > strtotime($date_end))
        api_response(array(
            'code'=> RESPONSE_ERROR,
            'msg'=> 'The ending time in the range cannot be before the end time. Try again.',
        ));
}

//if no date was specified lets just use today
if($date_start === false && $date_end === false)
    $date_start = $date_end = date('Y-m-d',strtotime("-1 days"));


/** ----------
 *  PAGINATION
 *  ---------- */

$page_limit = isset($_GET['limit'])?urldecode($_GET['limit']):false;
$page_index = isset($_GET['p'])?urldecode($_GET['p']):0;


/** -------
 *  SORTING
 *  ------- */
$sort_column = isset($_GET['sort_column'])?urldecode($_GET['sort_column']):false;
$sort_type = isset($_GET['sort_type'])?urldecode($_GET['sort_type']):false;

$store_id = (isset($_GET['store_id']))?urldecode($_GET['store_id']):false;
$product_id = (isset($_GET['product_id']))?urldecode($_GET['product_id']):false;

$status_id = (isset($_GET['status_id']))?urldecode($_GET['status_id']):false;


$report_name = $controllerID;


switch($controllerFunction)
{


    case 'product':
        switch($report_name)
        {
            //http://api.shopifyiq/report/product/store_comparison?date_start=2018-01-01&date_end=2018-12-05&product_id=11680&store_id=30&sort_column=crawl_tcreate&sort_type=0

            case 'store_comparison':

                if ($store_id === false || !is_numeric($store_id)) {
                    api_response(array(
                        'code' => RESPONSE_ERROR,
                        'msg' => 'You must specify a valid store ID.'
                    ));
                }
                if ($product_id === false || !is_numeric($product_id)) {
                    api_response(array(
                        'code' => RESPONSE_ERROR,
                        'msg' => 'You must specify a valid product ID.'
                    ));
                }

                $res = process_query(Array(
                    'q'             => SQL_REPORT_GET_PRODUCT_STORE_COMPARISON_BY_STORE_ID,
                    'date_start'    => $date_start,
                    'date_end'    => $date_end,
                    'date_column'   => 'crawl_tcreate',
                    'query_id'      => $store_id,
                    'sort_column'   => $sort_column,
                    'sort_type'     => $sort_type
                ));


                if(empty($res)) $message = 'No data could be found for the selected period.';
                else $message = '';

                $data_set = Array();

                foreach($res as $o)
                {
                    $data_set[$o['id']]['data'][] = Array(
                        'x'=>$o['d0_date'],
                        'y'=>$o['d0_rank']
                    );
                    if(!isset($data_set[$o['id']]['name'])) $data_set[$o['id']]['name'] = $o['name'];
                    if(!isset($data_set[$o['id']]['age'])) $data_set[$o['id']]['age'] = $o['age'];
                    if(!isset($data_set[$o['id']]['variant_id'])) $data_set[$o['id']]['variant_id'] = $o['variant_id'];

                    //if(count($data_set) > 10) break;
                }

                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'msg' =>$message,
                    'data' => Array(
                        'date_start'    => $date_start,
                        'date_end'      => $date_end,
                        'store_id'     => $store_id,
                        'product_id'    =>$product_id,
                        'report'        => $data_set
                    )
                ));


                break;

            //http://api.shopifyiq/report/product/ranking?date_start=2018-01-01&date_end=2018-02-05&product_id=11680&store_id=30&sort_column=crawl_tcreate&sort_type=0
            case 'ranking':
                if ($store_id === false || !is_numeric($store_id)) {
                    api_response(array(
                        'code' => RESPONSE_ERROR,
                        'msg' => 'You must specify a valid store ID.'
                    ));
                }
                if ($product_id === false || !is_numeric($product_id)) {
                    api_response(array(
                        'code' => RESPONSE_ERROR,
                        'msg' => 'You must specify a valid product ID.'
                    ));
                }

                $res = process_query(Array(
                    'q'             => SQL_REPORT_GET_PRODUCT_RANKING_BY_STORE_ID,
                    'date_start'    => $date_start,
                    'date_end'    => $date_end,
                    'date_column'   => 'crawl_tcreate',
                    'query_id'      => $store_id,
                    'query_id2'     => $product_id,
                    'sort_column'   => $sort_column,
                    'sort_type'     => $sort_type
                ));


                if(empty($res)) $message = 'No data could be found for the selected period.';
                else $message = '';

                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'msg' =>$message,
                    'data' => Array(
                        'date_start'    => $date_start,
                        'date_end'      => $date_end,
                        'store_id'     => $store_id,
                        'report'        => $res
                    )
                ));



            break;
        }
    break;

    /** =============
     *  STORE REPORTS
     *  ============= */

    case 'store':

        switch($report_name) //Lets see which refund report they want
        {
            case 'store_list':



                /** ---------------------------------------
                 *  Ensure parameters are validated and set
                 *  --------------------------------------- */
/*
                if ($store_id === false || !is_numeric($store_id)) {
                    api_response(array(
                        'code' => RESPONSE_ERROR,
                        'msg' => 'You must specify a valid store ID.',
                    ));
                }
*/
                /** ---------------------------------------------
                 *  Pass parameters and specific query to process
                 *  --------------------------------------------- */

                $res = process_query(Array(
                    'q'             => SQL_REPORT_STORE_LIST
                    //'query_id'      => $store_id
                ));
                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'data' => Array(
                        'report'        => $res
                    )
                ));
                break;

            break;


            case 'product_count_all':
                //SQL_REPORT_GET_PRODUCT_COUNT_BY_STORE_ID
                $res = process_query(Array(
                    'q'             => SQL_REPORT_GET_PRODUCT_COUNTS,
                ));


                foreach($res as $o)
                {
                    $_res[$o["store_id"]] = $o["product_count"];
                }


                if(empty($res)) $message = 'No data could be found for the selected period.';
                else $message = '';

                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'msg' =>$message,
                    'data' => Array(
                        'report'        => $_res
                    )
                ));
                break;


            case 'product_count':
                //SQL_REPORT_GET_PRODUCT_COUNT_BY_STORE_ID
                $res = process_query(Array(
                    'q'             => SQL_REPORT_GET_PRODUCT_COUNT_BY_STORE_ID,
                    'query_id'      =>$store_id
                ));


                if(empty($res)) $message = 'No data could be found for the selected period.';
                else $message = '';

                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'msg' =>$message,
                    'data' => Array(
                        'report'        => $res
                    )
                ));
            break;

            /** +-------------------------------------------------+
             *  | SQL_REPORT_VENDOR_DELIVERY_SUMMARY_BY_VENDOR_ID |
             *  +-------------------------------------------------+
             *
             *  DESCRIPTION:
             *  Look up the count of the different delivery statuses of a single vendor
             *
             *  END-POINT:
             *  http://api.shopifyiq/report/store/products_ranking?date_start=2018-1-20&store_id=41
             *      date_start=2017-10-09
             *      store_id=41
             *
             */

            case 'products_ranking':

                /** ---------------------------------------
                 *  Ensure parameters are validated and set
                 *  --------------------------------------- */

                if ($store_id === false || !is_numeric($store_id)) {
                    api_response(array(
                        'code' => RESPONSE_ERROR,
                        'msg' => 'You must specify a valid store ID.',
                    ));
                }

                /** ---------------------------------------------
                 *  Pass parameters and specific query to process
                 *  --------------------------------------------- */
                
                $res = process_query(Array(
                    'q'             => SQL_REPORT_PRODUCT_RANKING_BY_STORE_ID,
                    'date_start'    => $date_start,
                    'date_column'   => 'C.crawl_tcreate',
                    'query_id'      => $store_id,
                    'page_index'    => $page_index,
                    'page_limit'    => $page_limit,
                    'sort_column'   => $sort_column,
                    'sort_type'     => $sort_type
                ));


                if(empty($res)) $message = 'No data could be found for the selected period.';
                else $message = '';

                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'msg' =>$message,
                    'data' => Array(
                        'date_start'    => $date_start,
                        'store_id'     => $store_id,
                        'report'        => $res
                    )
                ));

            break;


            /** +-------------------------------------------------+
             *  | SQL_REPORT_VENDOR_DELIVERY_SUMMARY_BY_VENDOR_ID |
             *  +-------------------------------------------------+
             *
             *  DESCRIPTION:
             *  Look up the count of the different delivery statuses of a single vendor
             *
             *  END-POINT:
             *  http://api.shopifyiq/report/store/products_ranking?date_start=2018-1-20&store_id=41
             *      date_start=2017-10-09
             *      store_id=41
             *
             */

            case 'global_products_ranking':

                /** ---------------------------------------
                 *  Ensure parameters are validated and set
                 *  --------------------------------------- */

                /** ---------------------------------------------
                 *  Pass parameters and specific query to process
                 *  --------------------------------------------- */

                $res = process_query(Array(
                    'q'             => SQL_REPORT_GLOBAL_PRODUCT_RANKING,
                    'date_start'    => $date_start,
                    'query_id'      => $store_id,
                    'page_index'    => $page_index,
                    'page_limit'    => $page_limit,
                    'sort_column'   => $sort_column,
                    'sort_type'     => $sort_type
                ));

                //error_log(print_r($res,true));

                /** ---------------------------------------------------------------
                 *  Lets process the data to also generate the sparkline chart data
                 *  --------------------------------------------------------------- */
                $chart_array = Array();

                $db_string = ' ';
                foreach($res as $o)
                {
                    $db_string .= ' (product_id=' . $o['product_id'] . ' AND store_id=' . $o['store_id'] .') OR';
                }
                $db_string = rtrim($db_string, ' OR');
                //$date_start
                //$db_instance = new Database();
                //$q =  'SELECT store_id, product_id, variant_id, crawl_rank, crawl_tcreate FROM crawls WHERE ' . $db_string . ' AND crawl_rank !=0 AND crawl_tcreate >= DATE(NOW()) - INTERVAL 7 DAY';
                //error_log($q);
                //$chart_array = $db_instance->db_query($q,'shopifyiq_db');
                unset($db_instance);

                //print 'chart_array:';
                //error_log(print_r($chart_array,true));

                if(empty($res)) $message = 'No data could be found for the selected period.';
                else $message = '';

                api_response(array(
                    'code' => RESPONSE_SUCCESS,
                    'msg' =>$message,
                    'data' => Array(
                        'date_start'    => $date_start,
                        'report'        => $res,
                        //'chart'         => $chart_array
                    )
                ));

                break;

            default:
                api_response(array(
                    'code'=> RESPONSE_ERROR,
                    'data'=> array('message'=>ERROR_INVALID_FUNCTION)
                ));
            break;

        }
    break;

    default:
        api_response(array(
            'code'=> RESPONSE_ERROR,
            'data'=> array('message'=>ERROR_INVALID_FUNCTION)
        ));
    break;
}

function process_query($o) //$_q,$_date, $query_id='',$status_id='',$limit=''
{
    global $report_name;

    $date_start = isset($o['date_start'])?$o['date_start']:false;
    $date_end = isset($o['date_end'])?$o['date_end']:false;
    $date_column = isset($o['date_column'])?$o['date_column']:false;

    $query_id = isset($o['query_id'])?$o['query_id']:'';
    $query_id2 = isset($o['query_id2'])?$o['query_id2']:'';

    $query =  isset($o['q'])?$o['q']:false;
    $status_id =  isset($o['status_id'])?$o['status_id']:'';
    

    $limit_index = isset($o['page_index'])?$o['page_index']--:false;
    $limit_max = isset($o['page_limit'])?$o['page_limit']:false;
    $limit = '';
    
    if($limit_max)
    {
        $limit = ' LIMIT ' . $limit_max . ' OFFSET ' . ($limit_max * $limit_index);
    }

    $sort = '';
    $sort_column = isset($o['sort_column'])?$o['sort_column']:false;
    $sort_type  = isset($o['sort_type'])?$o['sort_type']:false;

    if($sort_column)
    {
        $sort = ' ORDER BY ' . $sort_column . ' ' . (($sort_type == 0)?'ASC':'DESC');
    }

    if($date_start && $date_end)
        $date_filter = ' AND ' . $date_column . ' BETWEEN "' . $date_start . '" AND "' . $date_end . '"';
    else $date_filter = $date_start;

    //Lets process any date range
    $q = replace_strings($query,Array(
        '{DATE_RANGE}'      => $date_filter,
        '{ID}'              => $query_id,
        '{ID2}'              => $query_id2,

        '{STATUS}'          => $status_id,
        '{LIMIT}'           => $limit,
        '{SORT}'            => $sort,
        '{DATE_COLUMN}'        => $date_column
    ));


    $db_instance = new Database();
    $result = $db_instance->db_query($q,DATABASE_NAME);

    unset($db_instance);

    log_error('report_query: ' . PHP_EOL . $q . PHP_EOL . print_r($result,true));
    if($result === false)
    {
        api_response(array(
            'code'=> RESPONSE_ERROR,
            'msg'=>'There was an error running report: ' . $report_name,
        ));
    } else
    return $result;
}


function is_valid_date($date)
{
    if (preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/",$date))
    return true;
     else
        return false;
}

