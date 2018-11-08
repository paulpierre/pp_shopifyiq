<?php
/** ======================
 *  crawler.controller.php
 *  ======================
 *  ------
 *  ABOUT:
 *  ------
 *  The Crawler controller is called by the system cron job which crawls fulfillment records flagged in the
 *  database for shipment tracking. Everyday it will crawl http://17track.net to parse and store / update the
 *  shipping status of all outstanding fulfillment orders.
 *
 *  ----------
 *  FUNCTIONS:
 *  ----------
 *
 *  • Update the status of fulfillment records in the database
 *  • Connect to proxies to crawl and parse http://17track.net as invoked by the cron daemon
 *
 */
global $controllerObject,$controllerFunction,$controllerID,$controllerData,$product_ranks;



switch($controllerFunction)
{
    case 'log':
        log_error($_GET['log']);
    break;

    //http://api.shopifyiq/crawler/crawl_error/?msg=shit&file=shopify_rank.js&store_id=1
    case 'crawl_error':
        $error_message = isset($_GET['msg'])?$_GET['msg']:false;
        $error_file = isset($_GET['file'])?$_GET['msg']:'';
        $error_store_id = isset($_GET['store_id'])?$_GET['store_id']:'';

        crawl_error($error_message,$error_file,$error_store_id);


    break;

    case 'product_json':
        $store_domain = (isset($_GET['store_domain']))?$_GET['store_domain']:false;

        if(!$store_domain)
        {
            log_error("No store_domain was provided, aborting.");
            exit();
        }

        print '<pre>';
        $products_json = Array();

        for($i=1;$i < 100;$i++)
        {
            $ch = curl_init();
            $url = 'https://'.$store_domain . '/products.json?limit=250&page=' . $i;

            $header[0] = "Accept: text/xml,application/xml,application/xhtml+xml,application/json,";
            $header[0] .= "text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5";
            $header[] = "Cache-Control: max-age=0";
            $header[] = "Connection: keep-alive";
            $header[] = "Keep-Alive: 300";
            $header[] = "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7";
            $header[] = "Accept-Language: en-us,en;q=0.5";
            $header[] = "Pragma: ";
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
            curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $res = curl_exec($ch);
            curl_close($ch);

            $o = json_decode($res,true);
            print 'count of o: ' . count($o['products']);
            print_r($o);


            if(!isset($o['products']) || empty($o['products'])) break;
            foreach($o['products'] as $p)
            {

                $product_handle = $p['handle'];
                $product_img = $p['img'][0]['src'];
                $product_shopify_id = $p['id'];
                $product_url = 'https://' . $store_domain . '/products/' . $product_handle;
                $product_type = $p['product_type'];
                $product_price = ltrim($p['price'],'$');
                $product_name = $p['title'];
                $product_created_at = $p['created_at'];
                $product_published_at = $p['published_at'];
                $product_updated_at = $p['updated_at'];
                $product_vendor = $p['vendor'];
                $product_is_available = $p['is_available'];
                $product_tags = json_encode($p['tags']);
                $product_variants = $p['variants'];

                $products_json[$product_handle] = $p;
            }

        }



        exit();
    break;

    case 'store_stats':
        header("HTTP/1.1 200 OK");
        log_error("incoming POST:" . PHP_EOL . print_r($_POST,true));

        $store_id = (isset($_POST['store_id']))?$_POST['store_id']:false;
        $rank_status = (isset($_POST['rank_status']))?$_POST['rank_status']:false;
        $rank_us = (isset($_POST['rank_us']))?$_POST['rank_us']:false;
        $rank_global = (isset($_POST['rank_global']))?$_POST['rank_global']:false;

        if($store_id)
        {
          $db_instance = new Database();
          $db_instance->db_create('store_stats',Array(
              'store_id'=>$store_id,
              'store_stats_rank_global'=>$rank_global,
              'store_stats_rank_us'=>$rank_us,
              'store_stats_status'=>$rank_status,
              'store_stats_tcreate'=>current_timestamp()
          ));
          unset($db_instance);
        } else {
            log_error("problem, store_id was not provided!");
        }


        exit();
    break;

    case 'set_page_count':
        $store_id = (isset($_GET['store_id']))?$_GET['store_id']:false;
        $store_total_page_count = (isset($_GET['total_page_count']))?$_GET['total_page_count']:0;
        /** ------------------------
         *  UPDATE STORE INFORMATION
         *  ------------------------ */
        $store_instance = new Store($store_id);
        $store_instance->total_page_count = $store_total_page_count;
        $store_instance->tcrawl = current_timestamp();
        $store_instance->save();
        unset($store_instance);
    break;

    case 'set_product_per_page_count':
        $store_id = (isset($_GET['store_id']))?$_GET['store_id']:false;
        $store_products_per_page_count = (isset($_GET['product_count']))?$_GET['product_count']:0;
        /** ------------------------
         *  UPDATE STORE INFORMATION
         *  ------------------------ */
        $store_instance = new Store($store_id);
        $store_instance->products_per_page_count = $store_products_per_page_count;
        $store_instance->tcrawl = current_timestamp();
        $store_instance->save();
        unset($store_instance);
    break;

    case 'save':
        header("HTTP/1.1 200 OK");
        log_error("incoming POST:" . PHP_EOL . print_r($_POST,true));



        $product_id = $variant_id = $product_rank = $variant_price = $variant_compare_at_price = $variant_shopify_tupdate = null;

        $product_ranks =  json_decode(urldecode($_POST['ranks']),true);

        //Lets handle errors
        if(empty($_POST['ranks']) || empty($_POST['store'])) {
            log_error('tracking.controller.php called but no JSON data provided. POST: ' . PHP_EOL . print_r($_POST,true));
        }

        $crawl_tstart = (isset($_POST['crawl_tstart']))?date("Y-m-d H:i:s", $_POST['crawl_tstart']):null;

        $store_data = json_decode(urldecode($_POST['store']),true)[0];

        if (($store_data === null || $product_ranks === null)
            && json_last_error() !== JSON_ERROR_NONE) {
            log_error('crawler.controller.php received malformed json from crawler:' . PHP_EOL . $store_data . PHP_EOL);
        }


        log_error( 'Looping through the product objects.. ' . PHP_EOL);

        $store_id = $store_data['id'];


        $store_domain = $store_data['domain'];
        $products_data = get_product_json($store_domain);
        $product_count = count($products_data);

        $store_instance = new Store($store_id);
        $store_instance->product_count = $product_count;
        $store_instance->save();
        unset($store_instance);



        log_error('store_id: ' . $store_id . ' store_domain: ' . $store_domain);
        log_error("products:");
        log_error(print_r($products_data,true));
        log_error('store_id: '. $store_id);


        /**
         *  Lets iterate through the domain's product json file
         */

        $error_products = 0;
        /** ------------------------
         *  ITERATE THROUGH PRODUCTS
         *  ------------------------ */
        if(isset($products_data))
        {
            $crawl_status = 1;

            foreach($products_data as $o)
            {
                if($o == null) continue;
                log_error('current product object: ' . PHP_EOL .print_r($o,true));





                $product_img = $o['img'];
                $product_shopify_id = $o['product_id'];
                $product_url = $o['url'];
                $product_price = $o['price'];
                $product_name = $o['name'];
                $product_rank = $o['rank'];
                $product_type = $o['type'];
                $product_handle = $o['handle'];
                $product_vendor = $o['vendor'];
                $product_is_available = $o['is_available'];
                $product_tags = $o['tags'];

                if((!isset($product_rank) || $product_rank == 0) && $product_is_available != 1) $error_products++;


                $product_created_at = date('Y-m-d H:i:s', strtotime($o['created_at']));
                $product_updated_at = date('Y-m-d H:i:s', strtotime($o['updated_at']));
                $product_published_at =date('Y-m-d H:i:s', strtotime($o['published_at']));

                if($product_shopify_id == 0 || !isset($product_shopify_id) || empty($product_shopify_id))
                    $product_shopify_id = md5($o['url']);

                $product_array = Array(
                    'store_id'=>$store_id,
                    'product_shopify_id'=>$product_shopify_id,
                    'product_image'=>$product_img,
                    'product_url'=>$product_url,
                    'product_price'=>$product_price,
                    'product_name'=>$product_name,
                    'product_shopify_tpublish'=>$product_created_at,
                    'product_shopify_tcreate'=>$product_published_at,
                    'product_shopify_tmodified'=>$product_updated_at,
                    'product_type'=>$product_type,
                    'product_handle'=>$product_handle,
                    'product_is_available'=>$product_is_available,
                    'product_tags'=>$product_tags,
                    'product_vendor'=>$product_vendor,
                    'product_tmodified'=>current_timestamp(),
                    'product_tcreate'=>current_timestamp()
                );



                log_error('product_array: ' . PHP_EOL . print_r($product_array,true));

                /** --------------------
                 *  CHECK PRODUCT EXISTS
                 *  -------------------- */

                $product_instance = new Product();
                $product_object = $product_instance->fetch_product_by_shopify_product_id($product_shopify_id,$store_id);


                //If we found this in the database, lets update
                $is_update = ($product_object instanceof Product)?true:false;


                /** ----------------------------
                 *  IF PRODUCT EXISTS, UPDATE IT
                 *  ---------------------------- */
                if($is_update)
                {

                    $product_object->image = $product_img;
                    $product_object->url = $product_url;
                    $product_object->price = $product_price;
                    $product_object->type = $product_type;
                    $product_object->handle = $product_handle;
                    $product_object->name = $product_name;
                    $product_object->vendor = $product_vendor;
                    $product_object->shopify_tcreate = $product_created_at;
                    $product_object->shopify_tpublish = $product_published_at;
                    $product_object->shopify_tmodified = $product_updated_at;
                    $product_object->is_available = $product_is_available;
                    $product_object->tags = $product_tags;
                    $product_object->tmodified = current_timestamp();
                    $product_id = $product_object->id;
                    $product_object->save();
                    log_error('product exists. product_shopify_id: ' . $product_id);

                } else {
                    /** -----------------------------------------
                     *  CREATE PRODUCT OBJECT IF IT DOESN'T EXIST
                     *  -----------------------------------------
                     */

                    $product_object = new Product($product_array);
                    $product_object->save();
                    $product_id = $product_object->id;
                }

                /** -------------------------------
                 *  ITERATE THROUGH VARIANT OBJECTS
                 *  ------------------------------- */


                //lets process variants
                if(isset($o['variants']))
                {
                    if(empty($o['variants']))
                    {
                        $crawl_array = Array(
                            'store_id' => $store_id,
                            'proxy_id'=>1,
                            'product_id'=>$product_id,
                            'variant_id'=>$variant_id,
                            'crawl_rank'=>$product_rank,
                            //'crawl_quantity'=>$variant_quantity,
                            'crawl_price'=>$variant_price,
                            'crawl_compare_at_price'=>$variant_compare_at_price,
                            'crawl_shopify_tmodified'=>$variant_shopify_tupdate,
                            'crawl_result'=>1,
                            'crawl_status'=>$crawl_status,
                            'crawl_tstart'=>$crawl_tstart,
                            'crawl_tfinish'=>current_timestamp(),
                            'crawl_tcreate'=>current_timestamp()
                        );
                        $crawl_object = new Crawl($crawl_array);
                        $crawl_object->save();
                        unset($crawl_object);
                    } else {
                        foreach ($o['variants'] as $v) {
                            if ($o == null) continue;

                            $variant_shopify_id = $v['id'];
                            $variant_name = $v['title'];
                            $variant_price = $v['price'];
                            $variant_compare_at_price = $v['compare_at_price'];
                            $variant_sku = $v['sku'];
                            //$variant_quantity = $v['qty'];
                            $variant_shopify_tcreate = $v['created_at'];
                            $variant_shopify_tupdate = $v['updated_at'];
                            //$variant_img = $v['img'];

                            $variant_array = Array(
                                'product_id' => $product_id,
                                'store_id' => $store_id,
                                'variant_price' => $variant_price,
                                'variant_shopify_id' => $variant_shopify_id,
                                'variant_name' => $variant_name,
                                'variant_sku' => $variant_sku,
                                'variant_compare_at_price' => $variant_compare_at_price,
                                'variant_shopify_tmodified' => $variant_shopify_tupdate,
                                'variant_shopify_tcreate' => $variant_shopify_tcreate,
                                'variant_tmodified' => current_timestamp(),
                                'variant_tcreate' => current_timestamp()
                            );

                            log_error('variant_array: ' . PHP_EOL . print_r($variant_array, true));


                            /** --------------------
                             *  CHECK VARIANT EXISTS
                             *  -------------------- */

                            $variant_instance = new Variant();
                            $variant_object = $variant_instance->fetch_variant_by_shopify_variant_id($variant_shopify_id, $product_id, $store_id);


                            //If we found this in the database, lets update
                            $is_update = ($variant_object instanceof Variant) ? true : false;


                            /** ----------------------------
                             *  IF VARIANT EXISTS, UPDATE IT
                             *  ---------------------------- */
                            if ($is_update) {

                                $variant_object->name = $variant_name;
                                $variant_object->sku = $variant_sku;
                                $variant_object->compare_at_price = $variant_compare_at_price;
                                $variant_object->price = $variant_price;
                                $variant_object->shopify_tmodified = $variant_shopify_tupdate;
                                $variant_object->shopify_tcreate = $variant_shopify_tcreate;
                                $variant_object->tmodified = current_timestamp();
                                $variant_id = $variant_object->id;
                                $variant_object->save();
                                log_error('variant exists. variant_shopify_id: ' . $variant_id);

                            } else {
                                /** -----------------------------------------
                                 *  CREATE PRODUCT OBJECT IF IT DOESN'T EXIST
                                 *  -----------------------------------------
                                 */

                                $variant_object = new Variant($variant_array);
                                $variant_object->save();
                                $variant_id = $variant_object->id;
                            }


                        }

                        /** ----------------------------
                         *  LETS STORE THE CRAWL OBJECT
                         *  ---------------------------
                         */

                        $crawl_array = Array(
                            'store_id' => $store_id,
                            'proxy_id' => 1,
                            'product_id' => $product_id,
                            'variant_id' => $variant_id,
                            'crawl_rank' => $product_rank,
                            //'crawl_quantity' => $variant_quantity,
                            'crawl_price' => $variant_price,
                            'crawl_compare_at_price' => $variant_compare_at_price,
                            'crawl_shopify_tmodified' => $variant_shopify_tupdate,
                            'crawl_result' => 1,
                            'crawl_status' => $crawl_status,
                            'crawl_tstart' => $crawl_tstart,
                            'crawl_tfinish' => current_timestamp(),
                            'crawl_tcreate' => current_timestamp()
                        );
                        $crawl_object = new Crawl($crawl_array);
                        $crawl_object->save();
                        unset($crawl_object);
                    }
                }

            }
            if($error_products > 0)
            {
                crawl_error('No product rank was provided for '. $store_domain  . ' for ' . $error_products . ' of ' . count($products_data) . ' products','crawler.controller.php',$store_id);
                exit();
            }

        }

        break;

    default:
        exit("oops");
    break;
}

function get_product_json($store_domain)
{
    global $product_ranks;

    $products_json = Array();
    $ch = curl_init();
    for($i=1;$i < 100;$i++)
    {

        $url = 'https://'.$store_domain . '/products.json?limit=250&page=' . $i;
        log_error('url: ' . $url);
        $header[0] = "Accept: text/xml,application/xml,application/xhtml+xml,application/json,";
        $header[0] .= "text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5";
        $header[] = "Cache-Control: max-age=0";
        $header[] = "Connection: keep-alive";
        $header[] = "Keep-Alive: 300";
        $header[] = "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7";
        $header[] = "Accept-Language: en-us,en;q=0.5";
        $header[] = "Pragma: ";
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $res = curl_exec($ch);


        $o = json_decode($res,true);
        log_error('count of o: ' . count($o['products'])) ;
        //print_r($o);


        if(!isset($o['products']) || empty($o['products'])) break;
        foreach($o['products'] as $p)
        {
            $product_is_available = 0;
            foreach($p['variants'] as $v)
            {
                if($v['available']== 1) {$product_is_available = 1; break;}
            }

            $product_rank = (isset($product_ranks[$p['handle']]['rank']))?$product_ranks[$p['handle']]['rank']:0;

            $product_img = (isset($p['images'][0]['src']))?$p['images'][0]['src']:'';

            $products_json[$p['handle']] = Array(
                'img'=>$product_img,
                'price'=>$p['variants'][0]['price'],
                'product_id'=>$p['id'],
                'url'=>'https://' . $store_domain . '/products/' . $p['handle'],
                'type'=>$p['product_type'],
                'name'=>$p['title'],
                'handle'=>$p['handle'],
                'rank'=>$product_rank,
                'created_at'=>$p['created_at'],
                'published_at'=>$p['published_at'],
                'updated_at'=>$p['updated_at'],
                'tags'=>json_encode($p['tags']),
                'vendor'=>$p['vendor'],
                'variants'=>$p['variants'],
                'is_available'=>$product_is_available
            );

/*
            $product_img = $o['img'];
            $product_shopify_id = $o['product_id'];
            $product_url = $o['url'];
            $product_price = ltrim($o['price'],'$');
            $product_name = $o['name'];
            $product_rank = $o['rank'];
            $product_created_at = $o['created_at'];
            $product_published_at = $o['published_at'];
            $product_shopify_id = $o['product_id'];
            $product_is_available = $o['is_available'];
            $product_tags = json_encode($o['tags']);
            */
        }
        curl_close($ch);
    }
    return $products_json;
}

function crawl_error($error_message,$error_file,$error_store_id)
{
    if(!$error_message) {
        log_error("Error invoking crawl_error in crawler.controller, the parama 'msg' was not set.");
        exit();
    }

    $db_instance = new Database();
    $db_instance->db_create('crawl_errors',Array(
        'error_message'=>$error_message,
        'error_file'=>$error_file,
        'error_store_id'=>$error_store_id,
        'error_tcreate'=>current_timestamp()
    ));
    unset($db_instance);
    exit();
}