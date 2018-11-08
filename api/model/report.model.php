<?php

/** ================
 *  report.model.php
 *  ================
 */

class ProductRank {
    const TABLE_MODEL_RANK = 'model_rank';

    public $store_id = null; //The target store we want to evaluate
    public $model_store_id = null; //The store ID who's data modeling we want to pull up

    public $store_rank_data = Array();
    public $model_rank_data = Array();
    public $model_product_count = null;

    public $store_gross_revenue = null;
    public $store_gross_units = null;

    public $store_product_count = null;


    public function load_model_data($store_id = null)
    {
        if($store_id == null && $this->$store_id == null)
        {
            throw new Exception('You must specify the model\'s store_id');
        }

        if($store_id == null) $store_id = $this->store_id;

        //Lets fetch the table and load it into the object

        $db_columns = Array(

        );

        $db_conditions = Array(
            'store_id'=>$store_id
        );
        $result = $this->db_retrieve(self::TABLE_NAME,$db_columns,$db_conditions,null,false);

    }


}

