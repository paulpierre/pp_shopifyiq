<?php
/** +----------------------------------------------------------------------------+
 *  | ShopifyIQ - A Shopify Product Ranking Tool by paul / ########## |
 *  +----------------------------------------------------------------------------+
 *  Started 12/14/2017
 */

header('Access-Control-Allow-Headers: *');
header('Acess-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

//Lets determine whether we're running in production or not
define('MODE',(strtolower(php_uname("n"))=="##########" || strtolower(php_uname("n")=="##########"))?'local':'prod');

/** ==============
 *  LOAD RESOURCES
 *  ==============
 */

include_once('constants.php');
include_once('config.php');


/** ===========
 *  URL ROUTING
 *  ===========
 */

if(isset($argv[1])) $q = explode('/',$argv[1]);
else $q = explode('/',$_SERVER['REQUEST_URI']);


$q_pos = strpos($q[count($q)-1],'?');
if($q_pos)
{
    $q[count($q)-1] = substr($q[count($q)-1],0,$q_pos);
}
if(strpos($q[count($q)-1],'?')===0) unset($q[count($q)-1]);


$controllerObject = strtolower((isset($q[1]))?$q[1]:false);
$controllerFunction = strtolower((isset($q[2]))?$q[2]:false);
$controllerID = strtolower((isset($q[3]))?$q[3]:false);
$controllerData = strtolower((isset($q[4]))?$q[4]:false);

$server_name = isset($_SERVER['HTTP_HOST'])?strtolower($_SERVER['HTTP_HOST']):$q[0];

//If the browser is requesting a resource like css or js, lets see if it exists and serve it to them
if($controllerObject == 'assets')
{
    $asset_file = VIEW_PATH . ltrim($_SERVER['REQUEST_URI'],'/');
    $file_ext = strtolower(ltrim(strrchr($_SERVER['REQUEST_URI'],'.'),'.'));
    if(empty($file_ext)) show_error();


    if(file_exists($asset_file))
    {
        switch($file_ext)
        {
            case 'css':     header('Content-type: text/css');       break;
            case 'js':      header('Content-type: text/javascript'); break;
            case 'png':     header('Content-type: image/png');      break;
            case 'jpg':     header('Content-type: image/jpeg');     break;
            case 'svg':     header('Content-type: image/svg+xml');  break;
            case 'html':    header('Content-type: text/html');      break;
            default:        header('Content-type: text/plain');     break;
        }
        exit(file_get_contents($asset_file));

    }

    else show_error();
}

/** ==================
 *  CONTROLLER ROUTING
 *  ==================
 */
//Load the object's appropriate controller
$_controller = CONTROLLER_PATH . $controllerObject . '.controller.php';
if(file_exists($_controller))  include($_controller);
else
    api_response(array(
        'code'=> RESPONSE_ERROR,
        'data'=> array('message'=>ERROR_INVALID_OBJECT)
    ));




/** ============
 *  API RESPONSE
 *  ============
 */
function api_response($res)
{
header('Content-Type: application/json');
    if(ENABLE_DEBUG)
    {
        exit('<pre>' . print_r(
                $res,true));
    }
    exit(json_encode(
        $res
    ));
}
?>