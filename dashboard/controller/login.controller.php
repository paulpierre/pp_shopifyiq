<?php
global $is_authenticated,$controllerObject,$controllerFunction,$controllerID,$controllerData;

switch($controllerFunction)
{
    case 'auth':

        //TODO: REMOVE  ME!!! Trigger positive authentication
        api_response(Array(
            'code' => RESPONSE_SUCCESS,
            'data' => Array(
                'message' => 'Login success',
                'siq_hash'=> $siq_hash,
                'url'=> '/dashboard'
            )
        ));

        //$_POST[''];
        log_error('controller: /login/auth .. $_POST data:');
        error_log(print_r($_POST,true));

        $user_id = 0;
        $user_login_status = 0;
        $user_name = (isset($_POST['name']))?$_POST['name']:false;
        $user_email = (isset($_POST['email']))?$_POST['email']:false;
        $user_facebook_id = (isset($_POST['id']))?$_POST['id']:false;
        $user_fingerprint = (isset($_POST['fp']))?$_POST['fp']:false;
        $user_access_token = (isset($_POST['token']))?$_POST['token']:false;
        $user_ip = $_SERVER['REMOTE_ADDR'];

        /**
         *  Lets make sure all the proper variables have been set by Facebook login
         */
        if(!$user_name || !$user_email || !$user_facebook_id || !$user_fingerprint)
        {
            /**
             *  TODO: lets also log the IP, fingerprint and failed login attempt into the database, save the user's IP
             */

            log_error('MISSING EITHER: user_name, user_email, user_facebook_id, user_fingerprint');
            api_response(array(
                'code'=> RESPONSE_ERROR,
                'data'=> array(
                    'message'=>'You are not authorized to user ShopifyIQ, your IP ' . $user_ip. ' has been logged and the administrator has been notified. Now is a good time to fuck off :)')
            ));
        }

        log_error('Variables from facebook properly set. Lets check to see if the user exists.');


        /**
         *  Lets check to see if the user exists
         */

        $user_instance = new User();

        $o = Array(
            'user_fb_id'=>$user_facebook_id,
            'user_email'=>$user_email
        );
        $res = $user_instance->get_user_data($o);

        $user_id = isset($res['user_id'])?$res['user_id']:0;

        log_error('Calling: get_user_data. Response: ' );
        log_error(print_r($res,true));

        $siq_hash = md5($user_email . $user_fingerprint); //lets setup our unique authentication hash



        /**
         *  Check if the user exists in the database
         */
        if(!$res) {

            /**
             *  If they do not exist, lets check the whitelist, if they are on it,
             *  let's register them by adding their credentials and hash to the database
             */

            log_error('The user does not exists with the following information: ' . print_r($o, true));

            $white_list_data = $user_instance->is_whitelisted_user($user_email);
            $is_whitelist = ($white_list_data != false && !empty($white_list_data));
            log_error('Checking white list. Result: ' . $is_whitelist);

            $login_tcreate = $login_tmodified = current_timestamp();

            if (!$is_whitelist) {
                log_error('User is NOT whitelisted. Lets log this');


                $login_info = 'not whitelisted: ' . $user_email . ' - ' . $user_facebook_id;

                $user_instance->log_access(Array(
                    'id'=>$user_id,
                    'ip'=>$user_ip,
                    'fp'=>$user_fingerprint,
                    'referrer'=>$_SERVER['HTTP_REFERER'],
                    'status'=>$user_login_status,
                    'info'=>$login_info
                ));

                $is_authenticated = false;

                api_response(Array(
                    'code' => RESPONSE_ERROR,
                    'data' => Array(
                        'message' => 'Your account is not whitelisted and not valid or you have been blocked. Your IP ' . $user_ip . ' has been logged and the administrator has been notified. Well, fuck off now. '
                    )
                ));
            }

            log_error('User is whitelisted! Registering the user.');


            $user_whitelist_status = $white_list_data['whitelist_status'];
            $user_whitelist_expiry = $white_list_data['whitelist_texpiry'];

            if($user_whitelist_status == 2)
            {
                $unix_time = strtotime('today - ' . WHITELIST_DEFAULT_EXPIRY);
                $user_texpiry = date("Y/m/d H:i:s",$unix_time);
            } else {
                $unix_time = strtotime('today - ' . WHITELIST_USER_EXPIRY);
                $user_texpiry = date("Y/m/d H:i:s",$unix_time);
            }


            $user_last_fingerprint = $user_fingerprint;
            /**
             *  TODO: register the user here
             */


            $row_id = $user_instance->add_row(new User(
                Array(
                    'user_name'=>$user_name,
                    'user_fb_id'=>$user_facebook_id,
                    'user_fingerprint'=>$user_fingerprint,
                    'user_access_token'=>$user_access_token,
                    'user_email'=>$user_email,
                    'user_status'=>1,
                    'user_texpiry'=>$user_texpiry
            ))
            );

        } else {
            $user_last_fingerprint = isset($res[0]['user_fingerprint'])?$res[0]['user_fingerprint']:false;
        }


        /**
         *  Now they ARE registered and also whitelisted, lets make sure the device fingerprint matches
         */

        log_error('Checking to make sure fingerprints match last session fingerprint'. PHP_EOL . 'user_last_fingerprint: ' . $user_last_fingerprint . ' user_fingerprint: ' . $user_fingerprint);

        if($user_last_fingerprint !== $user_fingerprint)
        {

            /**
             *  Warn them that their fingerprint don't match and they have violated ToS
             */

            log_error('Fingerprints DO NOT MATCH! Warn user.');


            $login_info = 'fingerprint no matches: ' . $user_email . ' - fp: ' . $user_fingerprint;

            $user_instance->log_access(Array(
                'id'=>$user_id,
                'ip'=>$user_ip,
                'fp'=>$user_fingerprint,
                'referrer'=>isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:"",
                'status'=>$user_login_status,
                'info'=>$login_info
            ));

            $is_authenticated = false;
            api_response(Array(
                'code' => RESPONSE_ERROR,
                'data' => Array(
                    'message' => 'Although you are whitelisted. You are using a device OTHER than the original device you registered with, violating our Service Agreement. Your IP ' . $user_ip . ' has been logged and the administrator has been notified. Please contact Paul'
                )
            ));
        }


        /**
         *  Okay the user has passed all the checks, allow them to login
         */
        log_error('Fingerprints DO match. Lets log the user in.');


        /**
         * Lets write the cookie w/ the hash
         */
        setcookie('siq_hash', $siq_hash, time() + (86400 * 30), "/"); //30 days
        setcookie('siq_email', urldecode($user_email), time() + (86400 * 30), "/"); //30 days
        setcookie('siq_fp', $user_fingerprint, time() + (86400 * 30), "/"); //30 days

        $login_info = 'success login: ' . $user_email;

        $user_instance->log_access(Array(
            'id'=>$user_id,
            'ip'=>$user_ip,
            'fp'=>$user_fingerprint,
            'referrer'=>isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:'',
            'status'=>1,
            'info'=>$login_info
        ));

        api_response(Array(
            'code' => RESPONSE_SUCCESS,
            'data' => Array(
                'message' => 'Login success',
                'siq_hash'=> $siq_hash,
                'url'=> '/dashboard'
            )
        ));
    break;

    default:
        include_once(VIEW_PATH . $controllerObject . '.view.php');
    break;
}

?>