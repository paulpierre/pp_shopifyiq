<?php

/** ==============
 *  user.model.php
 *  ==============
 */

class User extends Database {

    /** ------------------------
     *  SET DATABASE TABLE NAMES
     *  ------------------------
     */

    const TABLE_NAME    = 'users';
    const TABLE_WHITELIST    = 'whitelist';
    const TABLE_LOGIN       = 'logins';
    const TABLE_PREFIX      = 'user_';

    public $FK_PREFIX_ARRAY      = Array();






    /** ------------------------------
     *  INITIALIZE METHOD VARS TO NULL
     *  ------------------------------
     */

    public $id              = null;
    public $name            = null;
    public $fb_id           = null;
    public $fingerprint     = null;
    public $access_token    = null;
    public $email           = null;
    public $notes           = null;
    public $status          = null;
    public $texpiry         = null;
    public $tcreate         = null;
    public $tmodified       = null;


    /** -----------------------------------
     *  DYNAMIC SETTER AND GETTER FUNCTIONS
     *  -----------------------------------
     */

    function __call($method, $params) {

        $var = lcfirst(substr($method, 4));

        if (strncasecmp($method, "get_", 4) == 0) {
            return $this->$var;
        }
        if (strncasecmp($method, "set_", 4) == 0) {
            $this->$var = $params[0];
        }
    }


    /** ----------------------------------------------
     *  OBJECT SERIALIZATION TO JSON OR DATABASE ARRAY
     *  ----------------------------------------------
     */

    public function serialize_object($type=SERIALIZE_DATABASE)
    {
        $_properties = get_object_vars($this);

        foreach($_properties as $column=>$v)
        {
            if($this->$column !== null && !is_array($this->$column))
            {
                if(is_array_prefix($this->FK_PREFIX_ARRAY,$column))
                {
                    $data[$column] = $this->$column;
                }else
                $data[self::TABLE_PREFIX . $column] = $this->$column;
            }
        }

        switch($type)
        {
            case SERIALIZE_JSON:
                return json_encode($data);
                break;

            case SERIALIZE_DATABASE:
            default:
                return $data;
                break;
        }
    }


    /** ---------------------------
     *  OBJECT CONSTRUCTOR FUNCTION
     *  ---------------------------
     */

    public function __construct($o = null)
    {


        $_properties = get_object_vars($this);

        /** ----------------------------------
         *  FETCH OBJECT INSTANCE BY OBJECT ID
         *  ----------------------------------
         */
        if($o !== null && is_numeric($o))
        {
            $o_id = $o;
            $db_conditions = Array();
            $db_conditions[self::TABLE_PREFIX . 'id'] = $o_id;

            foreach($_properties as $column=>$v)
            {
                if(!is_array($this->$column))
                    if(is_array_prefix($this->FK_PREFIX_ARRAY,$column))
                        $db_columns[] = $column ;
                    else
                        $db_columns[] = self::TABLE_PREFIX . $column;
            }

            $result = $this->db_retrieve(self::TABLE_NAME,$db_columns,$db_conditions,null,false);
            if(empty($result[0]))
                return false;//throw new Exception(self::TABLE_PREFIX . ' ID ' . $o_id . ' is not a valid '. self::TABLE_PREFIX . 'id.');




            /** ----------------------------------------
             *  SET OBJECT INSTANCE FROM DATABASE RESULT
             *  ----------------------------------------
             */
            $_properties = get_object_vars($this);


            foreach($_properties as $column=>$v)
            {
                if(!is_array($this->$column)) {
                    $setter = 'set_' . $column;
                    if(is_array_prefix($this->FK_PREFIX_ARRAY,$column))
                        $this->$setter($result[0][ $column]);
                    else
                        $this->$setter($result[0][self::TABLE_PREFIX . $column]);

                }
            }



        } elseif(is_array($o))
        {
            /** -----------------------------------------
             *  OBJECT INSTANCE CONSTRUCTED BY ARRAY ARGS
             *  -----------------------------------------
             */
            $_properties = get_object_vars($this);

            foreach($o as $key=>$val)
            {
                foreach($_properties as $column=>$v)
                {
                    $setter = '';
                    if(($key == self::TABLE_PREFIX . $column || $key == $column ) && !is_array($this->$column))
                    {
                        $setter = 'set_' . $column;
                        $this->$setter($val);
                    }
                }
            }
        }



    }


    /** ----------------------------------------
     *  SAVE THE OBJECT INSTANCE WITH NEW DATA
     *  ----------------------------------------
     */
    public function save($o = null)
    {

        $o_id = null;
        $db_columns = Array();

        if($o == null && !is_numeric($this->id))
        {

            /** ----------------------------------------------------------------
             *  CREATE A NEW RECORD IF ID ISN'T SET OR OBJECT ISN'T BEING PASSED
             *  ----------------------------------------------------------------
             */
            return $this->add_row($this);
        }

        /** -------------------------------
         *  SIMPLY UPDATE ALL INSTANCE VARS
         *  -------------------------------
         */

        if(!is_array($o) && $o instanceof Item) $o = $o->id;

        /** ----------------------------------
         *  OR PASS AN ARRAY WITH UPDATED DATA
         *  ----------------------------------
         */

        /**
         *  This method can either take an array of valid user table columns
         *  and store it, if it is not provided, it will assume to save all
         *  the properties within the object
         */

        if($o != null && is_array($o))
        {
            $o_id = $this->id;
            $data = $o;

            $_properties = get_object_vars($this);

            foreach($data as $key=>$val)
            {
                foreach($_properties as $column=>$v)
                {
                    if($key == self::TABLE_PREFIX . $column && !is_array($this->$column) && trim($val) !== trim($this->$column))
                    {
                        log_error('col [' . $column . '] ' . $val . ' -> ' . $this->$column);
                        $db_columns[$key] = $val;
                    }
                }
            }

            //Nothing new to update
            if(empty($db_columns)) return false;

            $db_columns[self::TABLE_PREFIX . 'tmodified'] = current_timestamp();
            log_error('DIFF: ' . print_r($db_columns,true));

        } elseif($o != null && is_numeric($o))
        {
            $o_id = $o;
            $this->id = $o_id;


            /**
             *  No array data provided, then lets just save the properties within the object **/

            $_properties = get_object_vars($this);
            foreach($_properties as $column=>$v)
            {

                if($this->$column !== null && !is_array($v))
                    if(is_array_prefix($this->FK_PREFIX_ARRAY,$column))
                        $db_columns[$column] = $v;
                    else
                        $db_columns[self::TABLE_PREFIX . $column] = $v;
            }

            $db_columns[self::TABLE_PREFIX . 'tmodified'] = current_timestamp();
        } elseif($o == null && is_numeric($this->id) && $this->id > 0 )
        {
            $db_columns = $this->serialize_object();
            $o_id = $this->id;
            $db_columns[self::TABLE_PREFIX . 'tmodified'] = current_timestamp();

        }

        if(empty($db_columns))
            throw new Exception('No data provided to update ' . self::TABLE_NAME);

        $db_conditions = array(self::TABLE_PREFIX . 'id'=>$o_id);

        try {
            $this->db_update(self::TABLE_NAME,$db_columns,$db_conditions,false);
        } catch(Exception $e) {
            log_error('Error'. $e->getCode() .': '. $e->getMessage());
        }
    }

    /** -------------------------------
     *  CHECK TO SEE IF USER IS A VALID
     *  -------------------------------
     */
    public function get_user_data($o)
    {
        $user_email = $o['user_email'];
        $user_facebook_id = $o['user_fb_id'];

        $db_columns = Array(
            'user_id',
            'user_access_token',
            'user_name',
            'user_fb_id',
            'user_email',
            'user_fingerprint',
            'user_status'
        );
        $db_conditions = Array(
            'user_fb_id'=>$user_facebook_id,
            'user_email'=>$user_email
        );

        $res = $this->db_retrieve(self::TABLE_NAME,$db_columns,$db_conditions);

        if(empty($res)) return false;
        else return $res;
    }

    /** --------------------------------
     *  CHECK TO SEE IF USER WHITELISTED
     *  --------------------------------
     */
    public function is_whitelisted_user($user_email)
    {

        $db_columns = Array(
            'user_email',
            'whitelist_texpiry',
            'whitelist_status'
        );
        $db_conditions = Array(
            'user_email'=>$user_email
        );

        $res = $this->db_retrieve(self::TABLE_WHITELIST,$db_columns,$db_conditions);

        if($res[0]['whitelist_status'] ==0 || empty($res)) return false;


        //if(empty($res) || $res[0]['whitelist_status'] !==1) return false;
        else return $res[0];
    }

    public function log_access($o)
    {
        $user_id = $o['id'];
        $user_ip = $o['ip'];
        $user_fp = $o['fp'];
        $login_info = $o['info'];
        $user_referrer = $o['referrer'];
        $user_login_status = $o['status'];
        $login_tcreate = $login_tmodified = current_timestamp();

        $db_columns = Array(
            'user_id'=>$user_id,
            'user_ip'=>$user_ip,
            'user_fingerprint' => $user_fp,
            'login_info'=>$login_info,
            'login_referrer'=>$user_referrer,
            'login_status'=>$user_login_status,
            'login_tcreate'=>$login_tcreate,
            'login_tmodified'=>$login_tcreate
        );

        try {
            $insert_id = $this->db_create(self::TABLE_LOGIN,$db_columns);
            $this->set_id($insert_id);
            return $insert_id;

        } catch(Exception $e) {
            log_error('Error'. $e->getCode() .': '. $e->getMessage());
        }
        return false;
    }



    /** --------------------------------
     *  ADD A NEW OBJECT TO THE DATABASE
     *  --------------------------------
     */
    public function add_row($o = null)
    {
        /**
         *  $order should be a order object being passed
         */

        if($o instanceof User)
        {
            $db_columns =  $o->serialize_object();
            $db_columns[self::TABLE_PREFIX . 'tmodified'] = current_timestamp();
            $db_columns[self::TABLE_PREFIX . 'tcreate'] = current_timestamp();
            if(!isset($db_columns[self::TABLE_PREFIX . 'id'])) $db_columns[self::TABLE_PREFIX . 'id'] = $this->id;
        } else {
            throw new Exception('Not a valid ' . self::TABLE_NAME .' object!' . print_r($o,true));
        }

        if(isset($db_columns[self::TABLE_PREFIX . 'id']) || $db_columns[self::TABLE_PREFIX . 'id'] == null) unset($db_columns[self::TABLE_PREFIX . 'id']);

        try {
            $insert_id = $this->db_create(self::TABLE_NAME,$db_columns);
            $this->set_id($insert_id);
            return $insert_id;

        } catch(Exception $e) {
            log_error('Error'. $e->getCode() .': '. $e->getMessage());
        }
        return false;
    }
}




