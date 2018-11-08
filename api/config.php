<?php
/** +----------------------------------------------------------------------------+
 *  | ShopifyIQ - A Shopify Product Ranking Tool by paul / ########## |
 *  +----------------------------------------------------------------------------+
 *  Started 12/14/2017
 */
set_time_limit(0);
ini_set('mysql.connect_timeout',1600);
ini_set('max_execution_time', 1600);
ini_set('default_socket_timeout',1600);
ini_set("mysql.trace_mode", "0");

date_default_timezone_set('America/Los_Angeles');


/** ==========================
 *  DEFINE THE NAME OF THE APP
 *  ========================== */

define('APP_NAME','shopifyiq');
define('APP_DOMAIN','api.shopifyiq.com');
define('APP_VERSION','1.0');


/** ================
 *  CRAWLER SETTINGS
 *  ================ */
define('API_TIME_INTERVAL',60*60*12); //every 12hrs


/** =================
 *  APPLICATION FLAGS
 *  ================= */

//Enable caching. In prod, set to true
define('ENABLE_CACHE',false);

/** ==============================
 *  INCLUDE MODELS AND CONTROLLERS
 *  ============================== */

//Lets define the path of the API based on Apache config's DOCUMENT_ROOT. Make sure DOC ROOT ends with "/"

switch(MODE) {
    case 'local':
        define('API_DIRECT_PATH','##########/shopifyiq/src/api');
        break;

    default:
    case 'prod':
        define('API_DIRECT_PATH','##########/shopifyiq/src/api');
        break;
}

define('API_PATH',API_DIRECT_PATH .'/');


//Lets point out the name of models and controllers folder
$classesDir = array (
    API_PATH.'model/'
);

function __autoload($class_name) {

    global $classesDir;
    foreach ($classesDir as $directory) {
        log_error('__autoload: '.$directory . strtolower($class_name) . '.model.php');
        if (file_exists($directory . strtolower($class_name) . '.model.php')) {
            require_once ($directory . strtolower($class_name) . '.model.php');
            return;
        }
    }
}

/** =============================
 *  DEFINE SOME GLOBAL PATH NAMES
 *  ============================= */

//operational paths
define('LIB_PATH',API_PATH . '../shared/lib/');
define('DATA_PATH',API_PATH. 'data/');
define('CONTROLLER_PATH', API_PATH .'controller/');
define('MODEL_PATH', API_PATH .'model/');
define('VIEW_PATH', API_PATH .'view/');
define('VIEW_HELPER_PATH', API_PATH .'view/helper/');
define('IMG_PATH', API_PATH .'view/assets/img/');
define('CSS_PATH', API_PATH .'view/assets/css/');
define('JS_PATH', API_PATH .'view/assets/js/');



//Define log directory
define('LOG_PATH',API_PATH . 'log/');

//Lets load some functional classes and utility functions
include(LIB_PATH . 'utility.php');
include(LIB_PATH . 'database.class.php');


/** =====================
 *  Databse Configuration
 * ====================== */
switch(MODE)
{
    case 'local':
    define('TMP_PATH',API_PATH . 'tmp/');
    define('WWW_HOST','www.'.APP_NAME);
    define('API_HOST','api.' .APP_NAME);
    define('SITE_URL','http://' . API_HOST);
    define('DATABASE_HOST','##########');
    define('DATABASE_PORT',3306);
    define('DATABASE_NAME',APP_NAME . '_db');
    define('DATABASE_USERNAME',APP_NAME. '_db');
    define('DATABASE_PASSWORD','##########');

//Enable debugging mode
define('ENABLE_DEBUG',false);
define('ENABLE_LOGS',true);
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
break;

    default:
    case 'prod':
        define('TMP_PATH',API_PATH . 'tmp/');
        define('WWW_HOST',APP_DOMAIN);
        define('API_HOST','api.shopifyiq.com');
        define('SITE_URL','https://' . API_HOST);
        define('DATABASE_HOST','localhost');
        define('DATABASE_PORT',3306);
        define('DATABASE_NAME',APP_NAME . '_db');
        define('DATABASE_USERNAME',APP_NAME. '_db');
        define('DATABASE_PASSWORD','##########');
        //Enable debugging mode
        define('ENABLE_DEBUG',false);
        define('ENABLE_LOGS',false);
        //
        if(ENABLE_LOGS)
        {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);

        } else {
            error_reporting(E_ERROR | E_PARSE);
        }

        break;
}

if(ENABLE_CACHE)
{
    require_once(LIB_PATH . 'phpFastCache/phpFastCache.php');
    \phpFastCache\CacheManager::setup(array("path" => TMP_PATH));
    \phpFastCache\CacheManager::CachingMethod("phpfastcache");

    /**
     *  FLUSH CACHE
     */
    //if(MODE == 'local') $cache = \phpFastCache\CacheManager::getInstance(); $cache->clean();//exit();
}

?>