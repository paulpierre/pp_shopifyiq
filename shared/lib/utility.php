<?php

function cookie_string_to_array($cookie_string=null)
{
    if(!$cookie_string) return false;
    //$cookie_string = '_ga=GA1.2.1838254826.1477528233; as_fp=55; as_vc=78; as_cs_qc=-1; as_ss_qc=1';
    $line = explode(';',trim($cookie_string));
    foreach($line as $cookie)
    {
        $v = explode('=',trim($cookie));
        $cookie_array[$v[0]] = $v[1];
    }
    return $cookie_array;
}

function is_array_prefix($array_needle, $array_haystack)
{
    if(empty($array_needle) || empty($array_haystack)) return false;

    foreach($array_needle as $needle)
    {
        if(is_array($array_haystack)) {
        foreach($array_haystack as $item)
        {
            if(strtolower(substr($item,0,strlen($needle))) == strtolower($needle)) return true;
        }
        } else {
            $haystack = $array_haystack;
            if(strtolower(substr($haystack,0,strlen($needle))) == strtolower($needle)) return true;
        }
    }
}

function isJson($string) {
    return ((is_string($string) &&
        (is_object(json_decode($string)) ||
            is_array(json_decode($string))))) ? true : false;
}
/*
function is_crawler_error($message=null)
{
    $db_instance = new Database();
    $db_instance->db_update('sys',Array('value'=>1),Array('`key`'=>'CRAWLER_FAILURE'));
    if($message)
        $db_instance->db_update('sys',Array('value'=>$message),Array('`key`'=>'CRAWLER_FAILURE_MESSAGE'));
    unset($db_instance);
}
*/
function makeRandomString($bits = 256) {
    $bytes = ceil($bits / 8);
    $return = '';
    for ($i = 0; $i < $bytes; $i++) {
        $return .= chr(mt_rand(0, 255));
    }
    return $return;
}

function current_timestamp()
{
    return date("Y/m/d H:i:s");
}

function replace_strings($source,$array)
{
    if(!is_array($array)) return false;
    foreach ($array as $k=>$v)
    {
        $source = str_replace($k,$v,$source);
    }
    return $source;
}

function generate_random_ip()
{
    $result = "";
    for ($a = 0; $a < 4; $a++) {
        if ($a > 0) {
            $result = $result . ".";
        }
        $a2 = rand(1, 254);
        $result = $result . $a2;
    }
    return $result;
}

function is_valid_ip($ip)
{
    return (filter_var($ip, FILTER_VALIDATE_IP))?true:false;
}

function duration($etime) {

    if ($etime < 1) {
        return 'just now';
    }

    $a = array( 12 * 30 * 24 * 60 * 60  =>  'year',
        30 * 24 * 60 * 60       =>  'month',
        24 * 60 * 60            =>  'day',
        60 * 60                 =>  'hour',
        60                      =>  'minute',
        1                       =>  'second'
    );

    foreach ($a as $secs => $str) {
        $d = $etime / $secs;
        if ($d >= 1) {
            $r = round($d);
            return $r . ' ' . $str . ($r > 1 ? 's' : '');
        }
    }
}


 function time_ago($ptime) {
    $etime = time() - $ptime;

    if ($etime < 1) {
        return 'just now';
    }

    $a = array( 12 * 30 * 24 * 60 * 60  =>  'year',
        30 * 24 * 60 * 60       =>  'month',
        24 * 60 * 60            =>  'day',
        60 * 60                 =>  'hour',
        60                      =>  'minute',
        1                       =>  'second'
    );

    foreach ($a as $secs => $str) {
        $d = $etime / $secs;
        if ($d >= 1) {
            $r = number_format($d,1);
            return $r . ' ' . $str . ($r > 1 ? 's' : '');
        }
    }
}

 function aasort (&$array, $key, $sortType=SORT_DESC) {
    if(empty($array)) return true;
    $sorter=array();
    $ret=array();
    reset($array);
    foreach ($array as $ii => $va) {
        $sorter[$ii]=$va[$key];
    }
    asort($sorter);
    foreach ($sorter as $ii => $va) {
        $ret[$ii]=$array[$ii];
    }
    if($sortType == SORT_DESC)
    {$array=array_reverse($ret,true);}
}

function log_error($error_message)
{
    //print $error_message . PHP_EOL;
    if(ENABLE_LOGS) {
        if(MODE=='local') error_log($error_message);
        else file_put_contents(LOG_PATH .'http_error.log',$error_message,FILE_APPEND);
    }
}

function show_error()
{
    header('HTTP/1.0 404 Not Found');
    $_html = <<<EOF
<!DOCTYPE html>
<html>
<head>
    <title>404 Not Found</title>
    <meta name="robots" content="noindex" />
    <meta name="googlebot" content="noindex">
    <meta name="referrer" content="no-referrer" />
</head>
<body>
    <h1>404</h1>
    <h3>Not found</h3>
    <script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', APP_GOOGLE_ANALYTICS_ID, 'auto');
  ga('send', 'pageview');
</script>
</body>
</html>
EOF;
    exit($_html);

}




