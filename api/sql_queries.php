<?php
/**
 * SQL Queries
 * User: paulpierre
 * Date: 11/22/17
 * Time: 4:39 PM
 */

/**
 *  NOTE: You'll need to run a string replacement for the follow macros
 *  {WHERE} - Custom where clause
 *  {ID} - ID of the thing you'd like to lookup
 *  {DATE_RANGE} - Date range look up
 *  {COLUMNS} - Custom column lookup clause
 *  {DATE_COLUMN}
 */


/** ==========================
 *  VENDOR SUMMARY PERFORMANCE
 *  ==========================
 */



define('SQL_REPORT_PRODUCT_RANKING_BY_STORE_ID','
SELECT
    D0.product_id,
    D0.variant_id,
    D0.name,
    D0.img,
    D0.shopify_id,
    D0.url,
    D0.is_available,
    D0.shopify_tcreate,
    D0.shopify_tpublish,
    D0.rank,
    D0.qty,
    D0.price,
    D0.compare_price,
    D0.tmodified,
    D0.tcrawl,
    D1.rank_D1,
    D1.qty_D1,
    D1.price_D1,
    D1.compare_price_D1,
    D3.rank_D3,
    D3.qty_D3,
    D3.price_D3,
    D3.compare_price_D3,
    D7.rank_D7,
    D7.qty_D7,
    D7.price_D7,
    D7.compare_price_D7,
    D0.tmodified,
    ABS(D0.qty-D1.qty_d1) as qty_diff_d1,
    ABS(D0.qty-D3.qty_d3) as qty_diff_d3,
    ABS(D0.qty-D7.qty_d7) as qty_diff_d7 
FROM(SELECT
	C.product_id as product_id,
	C.variant_id as variant_id,
	P.product_name as name,
	P.product_shopify_id as shopify_id,
	P.product_url as url,
	P.product_image as img,
	P.product_is_available as is_available,
	P.product_shopify_tcreate as shopify_tcreate,
	P.product_shopify_tpublish as shopify_tpublish,
	C.crawl_rank as rank,
	ABS(C.crawl_quantity) as qty,
	C.crawl_price as price,
	C.crawl_compare_at_price as compare_price,
	C.crawl_shopify_tmodified as tmodified,
	C.crawl_tcreate as tcrawl
FROM crawls C
	LEFT JOIN products P
ON C.product_id = P.product_id
AND C.store_id = P.store_id
WHERE
	C.store_id={ID} AND
	DATE(C.crawl_tcreate) = DATE("{DATE_RANGE}")
) AS D0 LEFT JOIN (

SELECT
	C.product_id,
	C.variant_id,
	C.crawl_rank as rank_d1,
	ABS(C.crawl_quantity) as qty_d1,
	C.crawl_price as price_d1,
	C.crawl_compare_at_price as compare_price_d1,
	C.crawl_shopify_tmodified as date_modified_d1

FROM crawls C
LEFT JOIN products P

    ON C.product_id = P.product_id
    AND C.store_id = P.store_id
WHERE
	C.store_id={ID} AND
	DATE({DATE_COLUMN}) = DATE_SUB("{DATE_RANGE}", INTERVAL 1 DAY)
) AS D1 ON D0.product_id = D1.product_id
LEFT JOIN (

SELECT
	C.product_id,
	C.variant_id,
	C.crawl_rank as rank_d3,
	ABS(C.crawl_quantity) as qty_d3,
	C.crawl_price as price_d3,
	C.crawl_compare_at_price as compare_price_d3,
	C.crawl_shopify_tmodified as date_modified_d3

FROM crawls C
LEFT JOIN products P

    ON C.product_id = P.product_id
    AND C.store_id = P.store_id
WHERE
	C.store_id={ID} AND
	DATE({DATE_COLUMN}) = DATE_SUB("{DATE_RANGE}", INTERVAL 3 DAY)
) AS D3 ON D0.product_id = D3.product_id

LEFT JOIN (

SELECT
	C.product_id,
	C.variant_id,
	C.crawl_rank as rank_d7,
	ABS(C.crawl_quantity) as qty_d7,
	C.crawl_price as price_d7,
	C.crawl_compare_at_price as compare_price_d7,
	C.crawl_shopify_tmodified as date_modified_d7

FROM crawls C
LEFT JOIN products P

    ON C.product_id = P.product_id
    AND C.store_id = P.store_id
WHERE
	C.store_id={ID} AND
	DATE({DATE_COLUMN}) = DATE_SUB("{DATE_RANGE}", INTERVAL 7 DAY)
) AS D7 ON D0.product_id = D7.product_id

GROUP BY D0.product_id

ORDER BY D0.rank ASC
');

define('SQL_REPORT_STORE_LIST','
SELECT
	S1.store_id as id,
	S1.store_name as name,
	S1.store_domain as domain,
	S1.store_total_page_count as page_count,
	S1.store_tcrawl as t_crawl,
	IFNULL(S2.store_stats_rank_us, 0) as rank_us,
	IFNULL(S2.store_stats_rank_global, 0) as rank_global
FROM stores S1
LEFT JOIN store_stats S2 ON S1.store_id = S2.store_id
GROUP BY id
ORDER BY rank_global ASC
');


define('SQL_REPORT_GLOBAL_PRODUCT_RANKING','
SELECT
    D0.store_id as store_id,
    D0.store_name,
    D0.domain,
    D0.rank_global,
    D0.rank_us,
    D0.img,
    D0.product_id,
    D0.variant_id,
    D0.name,
    D0.shopify_id,
    D0.url,
    D0.is_available,
    D0.shopify_tcreate,
    D0.shopify_tpublish,
    D0.rank,
    D0.qty,
    D0.price,
    D0.compare_price,
    D0.tmodified,
    D0.tcrawl,
    D1.rank_D1,
    D1.qty_D1,
    D1.price_D1,
    D1.compare_price_D1,
    D3.rank_D3,
    D3.qty_D3,
    D3.price_D3,
    D3.compare_price_D3,
    D7.rank_D7,
    D7.qty_D7,
    D7.price_D7,
    D7.compare_price_D7,
    ABS(D0.qty-D1.qty_d1) as qty_diff_d1,
    ABS(D0.qty-D3.qty_d3) as qty_diff_d3,
    ABS(D0.qty-D7.qty_d7) as qty_diff_d7 

FROM(SELECT
    S.store_name as store_name,
    S.store_domain as domain,
    S.store_id as store_id,
    SS.store_stats_rank_global as rank_global,
    SS.store_stats_rank_us as rank_us,
	C.product_id as product_id,
	C.variant_id as variant_id,
	P.product_name as name,
	P.product_shopify_id as shopify_id,
	P.product_url as url,
	P.product_image as img,
	P.product_is_available as is_available,
	P.product_shopify_tcreate as shopify_tcreate,
	P.product_shopify_tpublish as shopify_tpublish,
	C.crawl_rank as rank,
	ABS(C.crawl_quantity) as qty,
	C.crawl_price as price,
	C.crawl_compare_at_price as compare_price,
	C.crawl_shopify_tmodified as tmodified,
	C.crawl_tcreate as tcrawl
FROM crawls C
	LEFT JOIN products P
ON C.product_id = P.product_id
AND C.store_id = P.store_id
    LEFT JOIN stores S
ON C.store_id = S.store_id
   LEFT JOIN store_stats SS
ON C.store_id = SS.store_id
WHERE
	
	DATE(C.crawl_tcreate) = DATE("{DATE_RANGE}")
) AS D0 LEFT JOIN (

SELECT
	C.product_id,
	C.variant_id,
	C.crawl_rank as rank_d1,
	ABS(C.crawl_quantity) as qty_d1,
	C.crawl_price as price_d1,
	C.crawl_compare_at_price as compare_price_d1,
	C.crawl_shopify_tmodified as date_modified_d1

FROM crawls C
LEFT JOIN products P

    ON C.product_id = P.product_id
    AND C.store_id = P.store_id
WHERE
	
	DATE(C.crawl_tcreate) = DATE_SUB("{DATE_RANGE}", INTERVAL 1 DAY)
) AS D1 ON D0.product_id = D1.product_id
LEFT JOIN (

SELECT
	C.product_id,
	C.variant_id,
	C.crawl_rank as rank_d3,
	ABS(C.crawl_quantity) as qty_d3,
	C.crawl_price as price_d3,
	C.crawl_compare_at_price as compare_price_d3,
	C.crawl_shopify_tmodified as date_modified_d3

FROM crawls C
LEFT JOIN products P

    ON C.product_id = P.product_id
    AND C.store_id = P.store_id
WHERE
		DATE(C.crawl_tcreate) = DATE_SUB("{DATE_RANGE}", INTERVAL 3 DAY)
) AS D3 ON D0.product_id = D3.product_id

LEFT JOIN (

SELECT
	C.product_id,
	C.variant_id,
	C.crawl_rank as rank_d7,
	ABS(C.crawl_quantity) as qty_d7,
	C.crawl_price as price_d7,
	C.crawl_compare_at_price as compare_price_d7,
	C.crawl_shopify_tmodified as date_modified_d7

FROM crawls C
LEFT JOIN products P

    ON C.product_id = P.product_id
    AND C.store_id = P.store_id
WHERE
		DATE(C.crawl_tcreate) = DATE_SUB("{DATE_RANGE}", INTERVAL 7 DAY)
) AS D7 ON D0.product_id = D7.product_id
WHERE D0.rank !=0 AND D0.shopify_tpublish > DATE_SUB("{DATE_RANGE}", INTERVAL 1 MONTH)
GROUP BY product_id
ORDER BY D0.rank_global ASC, D0.rank ASC LIMIT 500
');

/*
define('SQL_REPORT_GET_PRODUCT_STORE_COMPARISON_BY_STORE_ID','
SELECT C.product_id as id,
  P.product_name as name,
  C.variant_id as variant_id,
  C.crawl_rank as rank,
  C.crawl_tcreate as crawl_tcreate,DATEDIFF(CURDATE(),
  P.product_shopify_tpublish) as age
FROM crawls C
LEFT JOIN products P
ON C.product_id = P.product_id
WHERE C.store_id={ID} AND crawl_rank !=0 AND P.product_is_available=1
{DATE_RANGE} ORDER BY C.crawl_tcreate ASC
');*/

define('SQL_REPORT_GET_PRODUCT_STORE_COMPARISON_BY_STORE_ID','
SELECT
    D0.product_id as id,
    D0.variant_id as variant_id,
    D0.product_name as name,
    DATEDIFF(CURDATE(),D0.product_shopify_tpublish) as age,
    (D3.crawl_rank-D0.crawl_rank) as delta,
    D0.crawl_rank as d0_rank,
    DATE(D0.tcrawl) as d0_date,
    D3.crawl_rank as d3_rank,
    DATE(D3.tcrawl) as d3_date
   	FROM (
   		SELECT
			C.product_id as product_id,
			C.variant_id as variant_id,
			C.crawl_rank as crawl_rank,
			C.crawl_tcreate as tcrawl,
			P.product_name,
			P.product_shopify_tpublish
		FROM crawls C
			LEFT JOIN products P on P.product_id=C.product_id
			WHERE 
				C.store_id={ID} AND
				C.crawl_rank !=0
	) AS D0
	
	LEFT JOIN (
		SELECT
			C.product_id as product_id,
			C.variant_id as variant_id,
			C.crawl_rank as crawl_rank,
			C.crawl_tcreate as tcrawl
		FROM crawls C
		WHERE
			C.store_id={ID} AND
			DATE(C.crawl_tcreate) = DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND C.crawl_rank !=0
	) AS D3 ON D0.product_id = D3.product_id
	WHERE D0.crawl_rank < D3.crawl_rank
	

/*GROUP BY D0.product_id */

ORDER BY d0_date DESC

');




define('SQL_REPORT_GET_PRODUCT_RANKING_BY_STORE_ID','
SELECT store_id, product_id, variant_id, crawl_rank, crawl_price, crawl_tcreate
FROM crawls
WHERE store_id={ID} AND product_id={ID2} AND crawl_rank !=0
{DATE_RANGE}
');


define('SQL_REPORT_GET_PRODUCT_COUNT_BY_STORE_ID','
SELECT COUNT(product_id) as product_count
FROM products
WHERE store_id={ID};
');


define('SQL_REPORT_GET_PRODUCT_COUNTS','
SELECT store_id,COUNT(product_id) as product_count
FROM products GROUP BY store_id
');


/* Speed = Distance / Time

Time = Rank delta from start to period / 7-30 day period
 */
define('SQL_REPORT_GET_PRODUCT_GLOBAL_VELOCITY','
SELECT
    D0.product_id as id,
    D0.variant_id as variant_id,
    D0.product_name as name,
    DATEDIFF(CURDATE(),D0.product_shopify_tpublish) as age,
    (D3.crawl_rank-D0.crawl_rank) as delta,
    D0.crawl_rank as d0_rank,
    DATE(D0.tcrawl) as d0_date,
    D3.crawl_rank as d3_rank,
    DATE(D3.tcrawl) as d3_date
   	FROM (
   		SELECT
			C.product_id as product_id,
			C.variant_id as variant_id,
			C.crawl_rank as crawl_rank,
			C.crawl_tcreate as tcrawl,
			P.product_name,
			P.product_shopify_tpublish
		FROM crawls C
			LEFT JOIN products P on P.product_id=C.product_id
			WHERE 
				C.store_id={ID} AND
				C.crawl_rank !=0
	) AS D0
	
	LEFT JOIN (
		SELECT
			C.product_id as product_id,
			C.variant_id as variant_id,
			C.crawl_rank as crawl_rank,
			C.crawl_tcreate as tcrawl
		FROM crawls C
		WHERE
			C.store_id={ID} AND
			DATE(C.crawl_tcreate) = DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND C.crawl_rank !=0
	) AS D3 ON D0.product_id = D3.product_id
	WHERE D0.crawl_rank < D3.crawl_rank
	

/*GROUP BY D0.product_id */

ORDER BY d0_date DESC
');
