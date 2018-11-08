<?php
global $is_authenticated,$controllerObject,$controllerFunction,$controllerID,$controllerData;
$is_authenticated = true;
/*
if(!$is_authenticated)
{
    header('Location: /login');
    //$controllerObject = 'login';
}*/
include_once(VIEW_PATH . $controllerObject . '.view.php');
?>