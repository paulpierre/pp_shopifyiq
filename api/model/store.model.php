<?php

/** ==============
 *  store.model.php
 *  ==============
 */

class Store extends Database {

    /** ------------------------
     *  SET DATABASE TABLE NAMES
     *  ------------------------
     */
    const TABLE_NAME    = 'stores';
    const TABLE_OWNER   = 'owners';
    const TABLE_PRODUCT = 'products';
    const TABLE_VARIANT = 'variants';
    const TABLE_CRAWL   = 'crawls';
    const TABLE_PREFIX      = 'store_';




    /** ------------------------------
     *  INITIALIZE METHOD VARS TO NULL
     *  ------------------------------
     */

    public $id = null;
    public $owner_id = null;

    public $shopify_shop_id = null;
    public $fb_pixel_id = null;
    public $paypal_merchant_id = null;

    public $name = null;
    public $domain = null;
    public $url = null;
    public $total_page_count = null;

    public $target_img = null;
    public $target_click_url = null;
    public $target_node = null;
    public $target_price = null;
    public $target_name = null;
    public $target_details = null;
    public $target_page_count = null;
    public $details_type = null;/* 1=selector, 2=regex */
    public $products_per_page_count = null;
    public $product_count = null;

    public $country = null;
    public $fb_page = null;
    public $notes = null;

    public $status = null;
    public $is_enabled = null;

    public $domain_tcreate = null;
    public $domain_tmodified = null;
    public $domain_texpire = null;

    public $tcrawl = null;
    public $tcreate = null;
    public $tmodified = null;


    /** ------------------------------------------
     *  ARRAY CONTAINING PREFIXES FOR FOREIGN KEYS
     *  ------------------------------------------
     */

    public $FK_PREFIX_ARRAY      = Array('owner_');

    /** -------------------------
     *  ARRAY OF CHILDREN OBJECTS
     *  -------------------------
     */

    public $store_products  = Array();

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


        /** -----------------------------------------
         *  RETRIEVE ANY CHILDREN  OBJECTS
         *  -----------------------------------------
         */
        if($this->id !== null) $this->get_store_products();

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


    /** --------------------------------
     *  GRAB ALL STORE CHILDREN PRODUCTS
     *  --------------------------------
     */
    public function get_store_products()
    {
        if($this->id == null || $this->id <1)
            throw new Exception('Must provide object ID to get children: ' . self::TABLE_NAME);

        $o_id = $this->id;
        $db_conditions = Array();
        $db_conditions[self::TABLE_PREFIX . 'id'] = $o_id;
        $result = $this->db_retrieve(self::TABLE_PRODUCT,Array('product_id'),$db_conditions,null,false);
        if(empty($result))
            return false;//throw new Exception(self::TABLE_PREFIX . ' ID ' . $this->id . ' is not a valid '. self::TABLE_PREFIX . 'id.');
        else {
            foreach($result as $o)
            {
                $product_id = $o['product_id'];
                $this->store_products[] = new Product($product_id);
            }
        }
        return $result;
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

        if($o instanceof Store)
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




