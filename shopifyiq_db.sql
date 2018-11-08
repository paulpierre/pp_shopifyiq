
/** +----------------------------------------------------------------------------+
 *  | ShopifyIQ - A Shopify Product Ranking Tool by paul / ########## |
 *  +----------------------------------------------------------------------------+
 *  db name: shopifyiq_db
 *  Started 12/14/2017
 */

DROP TABLE IF EXISTS `users`; /* user logins */
DROP TABLE IF EXISTS `logins`; /* any issues with login */

DROP TABLE IF EXISTS `crawl_errors`;
DROP TABLE IF EXISTS `owners`;
DROP TABLE IF EXISTS `stores`;

DROP TABLE IF EXISTS `store_stats`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `variants`;
DROP TABLE IF EXISTS `crawls`;

DROP TABLE IF EXISTS `proxies`;
DROP TABLE IF EXISTS `model_rank`;

/*==========
  model_rank
  ========== */

CREATE TABLE `model_rank`(
`rank_id` int(6) NOT NULL AUTO_INCREMENT,
 `rank` int(4) NOT NULL,
 `volume` float(20,20) NOT NULL,
 `revenue` float(20,20) NOT NULL,
 `store_id` int(5) NOT NULL,
  PRIMARY KEY (`rank_id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(store_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;



/*=========
  whitelist
  =========
*/

CREATE TABLE `whitelist`(
 `whitelist_id` int(10) NOT NULL AUTO_INCREMENT,
 `user_email` varchar(100) NOT NULL,
 `whitelist_status` int(1) NOT NULL, /* 0=not whitelisted, 1=whitelisted, 2=blacklisted */
 `whitelist_texpiry` DATETIME NOT NULL,
 `whitelist_tcreate` DATETIME NOT NULL,
 `whitelist_tmodified` DATETIME NOT NULL,
 PRIMARY KEY (`whitelist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*======
  logins
  ======
*/

CREATE TABLE `logins`(
 `login_id` int(10) NOT NULL AUTO_INCREMENT,
 `user_id` int(10) NOT NULL,
 `user_ip` varchar(20) NOT NULL,
 `login_info` varchar(100) NOT NULL,

 `user_fingerprint` varchar(50) NOT NULL,
 `login_referrer` varchar(150) NOT NULL,
 `login_status` int(1) NOT NULL, /* 0=fail, 1=successful */
 `login_tcreate` DATETIME NOT NULL,
 `login_tmodified` DATETIME NOT NULL,
 PRIMARY KEY (`login_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*=====
  users
  =====
*/

CREATE TABLE `users`(
 `user_id` int(10) NOT NULL AUTO_INCREMENT,
 `user_name` varchar(255) NOT NULL,
 `user_fb_id` varchar(255) NOT NULL,
 `user_fingerprint` varchar(50) NOT NULL,
 `user_access_token` varchar(100) NOT NULL,
 `user_texpiry` DATETIME NOT NULL,
 `user_email` varchar(100) NOT NULL,
 `user_notes` varchar(1000) NOT NULL,
 `user_status` int(1) NOT NULL,
 `user_tcreate` DATETIME NOT NULL,
 `user_tmodified` DATETIME NOT NULL,
 PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*============
  crawl_errors
  ============
*/
/* TABLE ADDED 01-31-2018 */
CREATE TABLE `crawl_errors`(
 `error_id` int(10) NOT NULL AUTO_INCREMENT,
 `error_message` varchar(1000) NOT NULL,
 `error_file` varchar(200) NOT NULL,
 `error_store_id` int(5) NOT NULL,
 `error_tcreate` DATETIME NOT NULL,
 PRIMARY KEY (`error_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*======
  owners
  ======
*/

CREATE TABLE `owners`(
 `owner_id` int(10) NOT NULL AUTO_INCREMENT,
 `owner_name` varchar(255) NOT NULL,
 `owner_company_name` varchar(255) NOT NULL,
 `owner_linkedin` varchar(255) NOT NULL,
 `owner_notes` varchar(1000) NOT NULL,
 `owner_status` int(1) NOT NULL,
 `owner_tcreate` DATETIME NOT NULL,
 `owner_tmodified` DATETIME NOT NULL,
 PRIMARY KEY (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



/*======
  stores
  ======
*/

CREATE TABLE `stores`(
 `store_id` int(10) NOT NULL AUTO_INCREMENT,
 `owner_id` int(10) NOT NULL,

 `store_shopify_shop_id` varchar(255) NOT NULL,
 `store_fb_pixel_id` varchar(255) NOT NULL,
 `store_paypal_merchant_id` varchar(255) NOT NULL,

 `store_name` varchar(255) NOT NULL,
 `store_domain` varchar(255) NOT NULL,
 `store_url` varchar(255) NOT NULL,
 `store_product_count` int(5) NOT NULL,
 `store_products_per_page_count` int(5) NOT NULL, /* ADDED 01-31-2018 */
 `store_logo_url` varchar(500) NOT NULL,
 `store_total_page_count` int(5) NOT NULL,
 `store_target_img` varchar(255) NOT NULL,
 `store_target_click_url` varchar(500) NOT NULL,
 `store_target_node` varchar(255) NOT NULL,
 `store_target_price` varchar(255) NOT NULL,
 `store_target_name` varchar(255) NOT NULL,
 `store_target_details` varchar(255) NOT NULL,
 `store_target_page_count` varchar(255) NOT NULL, /* if number, hard limit, if text, then selector targeting */
 `store_page_count_type` int(3) NOT NULL,
  /*
  0 = hard value set for store_target_page_count
  1 = .text()
  2 = .prev().text()
  3 = regex "page x of y" - grab the "Y"

  REPLACEMENTS:
      .replace(/ /g, "").replace(/\n/g, ""));
      .replace(/\"\'/g, "")


   */

 `store_details_type` int(3) NOT NULL,
 /*
 1 = selector + .html()  eg: $(data).find("#ProductJson-product-template").html();
 2 = selector + attr() eg: $(data).find("form.product_form").attr("data-product");
      In this case, we will comma delimit selector + "attr" parameter name
 3 = REGEX  eg: (?:cart_products = )(.*)(?=}];)

 */

 `store_country` varchar(3) NOT NULL,
 `store_fb_page` varchar(500) NOT NULL,
 `store_notes` varchar(1000) NOT NULL,

 `store_status` int(1) NOT NULL,

 `store_is_enabled` int(1) NOT NULL,

 `store_domain_tcreate` DATETIME NOT NULL,
 `store_domain_tmodified` DATETIME NOT NULL,
 `store_domain_texpire` DATETIME NOT NULL,
 `store_tcrawl` DATETIME NOT NULL,
 `store_crawl_tstart` DATETIME NOT NULL,
 `store_tcreate` DATETIME NOT NULL,
 `store_tmodified` DATETIME NOT NULL,


 FOREIGN KEY (`owner_id`) REFERENCES `owners`(owner_id),
 PRIMARY KEY (`store_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*=======
  product
  ======= */

CREATE TABLE `products`(
 `product_id` int(10) NOT NULL AUTO_INCREMENT,
 `store_id` int(10) NOT NULL,

 `product_name` varchar(500) NOT NULL,
 `product_price` float(5,2) NOT NULL,
 `product_shopify_id` varchar(255) NOT NULL,
 `product_url` varchar(500) NOT NULL,
 `product_image` varchar(1000) NOT NULL,
 `product_tags` varchar(1000) NOT NULL,
 `product_is_available` int(1) NOT NULL,
 `product_type` varchar(500) NOT NULL, /* ADDED 01-31-2018 */
 `product_handle` varchar(500) NOT NULL, /* ADDED 01-31-2018 */
 `product_vendor` varchar(200) NOT NULL,  /* ADDED 01-31-2018 */
 `product_shopify_tcreate` DATETIME NOT NULL,
 `product_shopify_tpublish` DATETIME NOT NULL,
 `product_shopify_tmodified` DATETIME NOT NULL,  /* ADDED 01-31-2018 */
 `product_tmodified` DATETIME NOT NULL,
 `product_tcreate` DATETIME NOT NULL,
  PRIMARY KEY (`product_id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



/*=======
  variant
  ======= */

CREATE TABLE `variants`(
 `variant_id` int(10) NOT NULL AUTO_INCREMENT,
 `product_id` int(10) NOT NULL,
 `store_id` int(10) NOT NULL,
 `variant_shopify_id` varchar(255) NOT NULL,

 `variant_name` varchar(500) NOT NULL,
 `variant_sku` varchar(255) NOT NULL,
 `variant_price` float(5,2) NOT NULL,

 `variant_compare_at_price` float(5,2) NOT NULL,
 `variant_shopify_tmodified` DATETIME NOT NULL,
 `variant_shopify_tcreate` DATETIME NOT NULL,

 `variant_tmodified` DATETIME NOT NULL,
 `variant_tcreate` DATETIME NOT NULL,
  PRIMARY KEY (`variant_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(product_id),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*===========
  store_stats
  ===========
  On a daily basis, we grab store meta data from myip.ms
*/

CREATE TABLE `store_stats`(
 `store_stats_id` int(10) NOT NULL AUTO_INCREMENT,
 `store_id` int(10) NOT NULL,
 /*ALEXA metadata */
 `store_stats_rank_global` int(10) NOT NULL,
 `store_stats_rank_us` int(10) NOT NULL,

 `store_stats_status` int(1) NOT NULL,
 `store_stats_tcreate` DATETIME NOT NULL,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(store_id),

 PRIMARY KEY (`store_stats_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;



/*=======
  proxies
  ======= */

CREATE TABLE `proxies`(
 `proxy_id` int(10) NOT NULL AUTO_INCREMENT,
 `proxy_ip` VARCHAR(25) NOT NULL,
 `proxy_port` int(10) NOT NULL,
 `proxy_is_enabled` int(1) NOT NULL,
 `proxy_tmodified` DATETIME NOT NULL,
 `proxy_tcreate` DATETIME NOT NULL,
 PRIMARY KEY (`proxy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*======
  crawls
  ====== */

CREATE TABLE `crawls`(
 `crawl_id` int(10) NOT NULL AUTO_INCREMENT,
 `product_id` int(10) NOT NULL,
 `store_id` int(10) NOT NULL,
 `variant_id` int(10) NOT NULL,
 `proxy_id` int(10) NOT NULL,

 `crawl_rank` int(5) NOT NULL,
 `crawl_quantity` int(5) NOT NULL,
 `crawl_price` float(5,2) NOT NULL,
 `crawl_compare_at_price` float(5,2) NOT NULL,
 `crawl_shopify_tmodified` DATETIME NOT NULL,

 `crawl_result` int(1) NOT NULL,

 `crawl_tstart` TIMESTAMP NOT NULL,
 `crawl_tfinish` TIMESTAMP NOT NULL,
 `crawl_tcreate` TIMESTAMP NOT NULL,

 PRIMARY KEY (`crawl_id`),
 FOREIGN KEY (`store_id`) REFERENCES `stores`(store_id),
 FOREIGN KEY (`product_id`) REFERENCES `products`(product_id),
 FOREIGN KEY (`variant_id`) REFERENCES `variants`(variant_id),
 FOREIGN KEY (`proxy_id`) REFERENCES `proxies`(proxy_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO owners(owner_name) VALUES("Unknown");
INSERT INTO proxies(proxy_ip) VALUES("");