#!/bin/bash
#==================
# canary_crawler.sh
#==================

#+------------------------+
#| DATABASE CONFIGURATION |
#+------------------------+

_HOSTNAME=$(hostname)
if [ "${_HOSTNAME}" == "V##########" ] || [ "${_HOSTNAME}" == "##########" ]; then
    SERVER_MODE="local"

    MYSQL_USER="##########"
    MYSQL_PASS="##########"
    MYSQL_HOST="##########"
    MYSQL_DB="shopifyiq_db"
    MYSQL_BIN="/Applications/MAMP/bin/apache2/bin/mysql"
    API_PATH="##########/Projects/shopifyiq/shopifyiq/src/api"
    PHANTOMJS_BIN="phantomjs"
else
    SERVER_MODE="prod"
    MYSQL_USER="##########"
    MYSQL_PASS="##########"
    MYSQL_HOST="127.0.0.1"
    MYSQL_DB="shopifyiq_db"
    MYSQL_BIN="mysql"
    API_PATH="##########/shopifyiq/src/api"
    PHANTOMJS_BIN="phantomjs-linux"
fi

#+----------------+
#| RUN-TIME FLAGS |
#+----------------+

PROXIES_ENABLED=0 #disabled by default
MODULUS_IS_ENABLED=1 #so we can segment scans on an hourly basis. make it 0 if you want to scan everything
PHANTOM_SCRIPT="shopifyiq_rank.js"
SITES_PER_THREAD_LIMIT=100
SLEEP_PER_PAGE=30


#+-------------------+
#| RUN-TIME SETTINGS |
#+-------------------+

PHANTOMJS_DEBUG_IS_ENABLED=0
PHANTOMJS_DEBUG=""
SHOPIFY_DEBUG_STORE=0 #This is a flag to manually scan the first page listing of a store (we want to do this to debug and init a new store in the DB)
SHOPIFY_DEBUG_STORE_ID=58 #Store to manually recheck


if [ "${PHANTOMJS_DEBUG_IS_ENABLED}" == 1 ]; then
    PHANTOMJS_DEBUG="--debug=true"
fi


if [ "${MODULUS_IS_ENABLED}" == 1 ]; then
    #SQL_MODULUS=" AND MOD(store_id,12) = ROUND(HOUR(NOW())/2)" #HOUR(NOW())
    SQL_MODULUS=" AND MOD(store_id,23) = HOUR(NOW()) " #HOUR(NOW())
fi

if [ "${SHOPIFY_DEBUG_STORE}" == 1 ]; then
    SQL_MODULUS=" "
fi
#+---------------------+
#| QUIT IF CRAWL ERROR |
#+---------------------+
#sql_get_error="SELECT value FROM sys WHERE sys.key=\"CRAWLER_FAILURE\""

#should_exit=$(echo "${sql_get_error}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST} | sed -n 2p);

#if [  "${should_exit}" == 1 ]; then
#    echo "A thread has thrown an error in crawling. Quitting..Please fix it to continue crawling."
#    exit 0
#fi


#+-------------------------------------+
#| CHECK TO SEE IF PROXIES ARE ENABLED |
#+-------------------------------------+
#proxy_count="SELECT value FROM sys WHERE sys.key=\"CRAWLER_ENABLE_PROXIES\""

#proxy_count=$(echo "${sql_get_error}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST} | sed -n 2p);



if [ "${PROXIES_ENABLED}" == 1 ]; then

    echo "Proxies are enabled for this crawl"

    #+-----------------+
    #| GET PROXY COUNT |
    #+-----------------+
    sql_get_total="SELECT count(*) FROM proxies WHERE proxy_is_enabled=1;";
    proxy_count=$(echo "${sql_get_total}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST} | sed -n 2p);
    echo "Proxies available: ${proxy_count}"


    #+-------------+
    #| GET PROXIES |
    #+-------------+

    sql_get_list="SELECT proxy_id, proxy_ip, proxy_port FROM proxies WHERE proxy_is_enabled=1;";
    result=$(echo "${sql_get_list}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST}); #| sed -n 2p | cut -f2

    while read -r line; do
        index=$(echo "$line" | cut -f1);

        if [ "${index}" == "proxy_id" ]; then
            continue
        fi

        proxy_ip=$(echo "$line" | cut -f2);
        proxy_port=$(echo "$line" | cut -f3);
        #echo "index: $index proxy_ip: $proxy_ip proxy_port: $proxy_port"
        PROXIES[index]=$(echo ${proxy_ip} ${proxy_port});
    done <<< "$result"

    echo "Proxies: "
    printf '%s\n' "${PROXIES[@]}"

fi


#+--------------------------------------------+
#| GET THE # OF STORES TO CRAWL FOR THIS HOUR |
#+--------------------------------------------+
sql_get_total="SELECT count(store_id) FROM stores WHERE store_is_enabled = 1;" #${SQL_MODULUS}
tracking_count=$(echo "${sql_get_total}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST} | sed -n 2p);
echo "Stores to crawl this hour: $tracking_count"

if [ "${tracking_count}" -eq 0 ]; then
    echo "No stores to crawl. Perhaps something went wrong with this query:\n\n ${sql_get_total}"
    exit 0;
fi

store_count=${tracking_count}
#let thread_count=thread_count+1

echo "$store_count threads to launch"

#+--------------------------------+
#| LETS GRAB THE STORE INFORMATION|
#+--------------------------------+


#========================DEBUG
#COUNTER=0
#RECORD_COUNT=0
#QUERY_LIMIT=$((store_enabled_count/46))
#echo "QUERY_LIMIT: ${QUERY_LIMIT}";
#while [ ${COUNTER} -lt 46 ]; do
#
#    echo "half hour count: ${COUNTER}"
#    sql_query="SELECT store_id, store_domain, store_url, store_target_click_url, store_target_img, store_target_node, store_target_price, store_target_name, store_target_details, store_target_page_count, store_details_type, store_page_count_type, store_total_page_count FROM stores WHERE store_is_enabled = 1  AND store_tcrawl < DATE_SUB(NOW(), INTERVAL 12 HOUR) AND store_crawl_tstart < DATE_SUB(NOW(),INTERVAL 12 HOUR) ORDER BY store_tcrawl ASC LIMIT ${QUERY_LIMIT}";
#    echo "QUERY: ${sql_query}"
#    store_list=$(echo "${sql_query}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST});
#
#    while read -r line; do
#        STORE_ID=$(echo "$line" | cut -f1);
#        STORE_DOMAIN=$(echo "$line" | cut -f2);
#
#        if [ "${STORE_ID}" == "store_id" ]; then
#            continue
#        fi
#        echo "domain : ${STORE_DOMAIN}"

#        sql_insert_crawl_date="UPDATE stores SET store_crawl_tstart=NOW() WHERE store_id=${STORE_ID};"
#        store_list=$(echo "${sql_insert_crawl_date}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST});


#        let RECORD_COUNT=RECORD_COUNT+1
#    done <<<"$store_list"
#    #echo "LOOP COUNT: ${RECORD_COUNT}"
#    let COUNTER=COUNTER+1
#done
#echo "total record count: ${RECORD_COUNT}";
#exit 0
#========================DEBUG
QUERY_LIMIT=$((store_count/46))

sql_query="SELECT store_id, store_domain, store_url, store_target_click_url, store_target_img, store_target_node, store_target_price, store_target_name, store_target_details, store_target_page_count, store_details_type, store_page_count_type, store_total_page_count FROM stores WHERE store_is_enabled = 1  AND store_tcrawl < DATE_SUB(NOW(), INTERVAL 8 HOUR) AND store_crawl_tstart < DATE_SUB(NOW(),INTERVAL 12 HOUR) ORDER BY store_tcrawl ASC LIMIT ${QUERY_LIMIT}";
#sql_query="SELECT store_id, store_domain, store_url, store_target_click_url, store_target_img, store_target_node, store_target_price, store_target_name, store_target_details, store_target_page_count, store_details_type, store_page_count_type, store_total_page_count FROM stores WHERE store_is_enabled = 1 ${SQL_MODULUS} ORDER BY store_tcrawl ASC";
#sql_query="SELECT store_id, store_domain, store_url, store_target_click_url, store_target_img, store_target_node, store_target_price, store_target_name, store_target_details, store_target_page_count, store_details_type, store_page_count_type, store_total_page_count FROM stores WHERE store_is_enabled = 1 AND store_tcrawl <  CURDATE() ORDER BY store_tcrawl ASC LIMIT 2";


if [ "${SHOPIFY_DEBUG_STORE}" == 1 ]; then
    sql_query="SELECT store_id, store_domain, store_url, store_target_click_url, store_target_img, store_target_node, store_target_price, store_target_name, store_target_details, store_target_page_count, store_details_type, store_page_count_type, store_total_page_count, store_products_per_page_count  FROM stores WHERE store_id = ${SHOPIFY_DEBUG_STORE_ID}";
fi

echo "MYSQL: $sql_query"

#+----------------------------------------------+
#| GRAB QUERY RESULT FROM MYSQL BUT LIMIT TO 40 |
#+----------------------------------------------+
store_list=$(echo "${sql_query}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST});

echo "RESULT: \n $store_list"


#+---------------------------------------------+
#| ITERATE THROUGH LIST AND CONVERT IT TO JSON |
#+---------------------------------------------+
COUNTER=0
while read -r line; do


    STORE_ID=$(echo "$line" | cut -f1);

    #Lets skip the first header column
    if [ "${STORE_ID}" == "store_id" ]; then
        continue
    fi

    STORE_DOMAIN=$(echo "$line" | cut -f2);
    STORE_URL=$(echo "$line" | cut -f3);
    STORE_TARGET_CLICK_URL=$(echo "$line" | cut -f4);
    STORE_TARGET_IMG=$(echo "$line" | cut -f5);
    STORE_TARGET_NODE=$(echo "$line" | cut -f6);
    STORE_TARGET_PRICE=$(echo "$line" | cut -f7);
    STORE_TARGET_NAME=$(echo "$line" | cut -f8);
    STORE_TARGET_DETAILS=$(echo "$line" | cut -f9);
    STORE_TARGET_PAGE_COUNT=$(echo "$line" | cut -f10);
    STORE_DETAILS_TYPE=$(echo "$line" | cut -f11);
    STORE_PAGE_COUNT_TYPE=$(echo "$line" | cut -f12);
    STORE_TOTAL_PAGE_COUNT=$(echo "$line" | cut -f13);
    STORE_PRODUCTS_PER_PAGE_COUNT=$(echo "$line" | cut -f14);

    #If the total page count has not been set yet, lets set it to 1, doing this will get us the actual page count
    if [ "${STORE_TOTAL_PAGE_COUNT}" == 0 ]; then
        STORE_TOTAL_PAGE_COUNT=1
    fi

    echo "Store total page count: ${STORE_TOTAL_PAGE_COUNT}"

    STORE_LIST[COUNTER]=$(echo "${STORE_ID}|${STORE_DOMAIN}|${STORE_URL}|${STORE_TARGET_CLICK_URL}|${STORE_TARGET_IMG}|${STORE_TARGET_NODE}|${STORE_TARGET_PRICE}|${STORE_TARGET_NAME}|${STORE_TARGET_DETAILS}|${STORE_TARGET_PAGE_COUNT}|${STORE_DETAILS_TYPE}|${STORE_PAGE_COUNT_TYPE}|${STORE_TOTAL_PAGE_COUNT}|${STORE_PRODUCTS_PER_PAGE_COUNT}");

    let COUNTER=COUNTER+1

done <<<"$store_list"


echo "Stores: "
printf '%s\n' "${STORE_LIST[@]}"


#+----------------------------+
#| ITERATE THROUGH EACH STORE |
#+----------------------------+

COUNTER=0
while [ ${COUNTER} -lt ${store_count} ]; do

        #+--------------------------------------------------------------------------------+
        #| NOW LETS LOOP THROUGH ALL THE PAGES OF THE SITE TO SCRAPE, BUT PAUSE INBETWEEN |
        #+--------------------------------------------------------------------------------+

        CTR=1
        STORE_START_PAGE=0
        STORE_END_PAGE=0


        store_index=(${COUNTER})
        IFS='|' read -r -a store_array <<< "${STORE_LIST[$store_index]}"
        STORE_ID=${store_array[0]}
        STORE_DOMAIN=${store_array[1]}
        STORE_URL=${store_array[2]}
        STORE_TARGET_CLICK_URL=${store_array[3]}
        STORE_TARGET_IMG=${store_array[4]}
        STORE_TARGET_NODE=${store_array[5]}
        STORE_TARGET_PRICE=${store_array[6]}
        STORE_TARGET_NAME=${store_array[7]}
        STORE_TARGET_DETAILS=${store_array[8]}
        STORE_TARGET_PAGE_COUNT=${store_array[9]}
        STORE_DETAILS_TYPE=${store_array[10]}
        STORE_PAGE_COUNT_TYPE=${store_array[11]}
        STORE_TOTAL_PAGE_COUNT=${store_array[12]}
        STORE_PRODUCTS_PER_PAGE_COUNT=${store_array[13]}

        echo "INDEX: ${store_index} COUNT: ${thread_count}"
        echo "--------------------------------------------"
        echo "STORE_ID: ${STORE_ID}"
        echo "STORE_DOMAIN: ${STORE_DOMAIN}"
        echo "STORE_URL: ${STORE_URL}"
        echo "STORE_TARGET_CLICK_URL: ${STORE_TARGET_CLICK_URL}"
        echo "STORE_TARGET_IMG: ${STORE_TARGET_IMG}"
        echo "STORE_TARGET_NODE: ${STORE_TARGET_NODE}"
        echo "STORE_TARGET_PRICE: ${STORE_TARGET_PRICE}"
        echo "STORE_TARGET_NAME: ${STORE_TARGET_NAME}"
        echo "STORE_TARGET_DETAILS: ${STORE_TARGET_DETAILS}"
        echo "STORE_TARGET_PAGE_COUNT: ${STORE_TARGET_PAGE_COUNT}"
        echo "STORE_DETAILS_TYPE: ${STORE_DETAILS_TYPE}"
        echo "STORE_PAGE_COUNT_TYPE: ${STORE_PAGE_COUNT_TYPE}"
        echo "STORE_TOTAL_PAGE_COUNT: ${STORE_TOTAL_PAGE_COUNT}"
        echo "STORE_PRODUCTS_PER_PAGE_COUNT: ${STORE_PRODUCTS_PER_PAGE_COUNT}"
        echo "--------------------------------------------"




        JSON="[{\"server_mode\":\"$SERVER_MODE\",\"id\":\"$STORE_ID\",\"domain\":\"$STORE_DOMAIN\",\"url\":\"$STORE_URL\",\"t_url\":\"$STORE_TARGET_CLICK_URL\",\"t_img\":\"$STORE_TARGET_IMG\",\"t_node\":\"$STORE_TARGET_NODE\",\"t_price\":\"$STORE_TARGET_PRICE\",\"t_name\":\"$STORE_TARGET_NAME\",\"t_details\":\"$STORE_TARGET_DETAILS\",\"t_page_count\":\"$STORE_TARGET_PAGE_COUNT\",\"details_type\":\"$STORE_DETAILS_TYPE\",\"count_type\":\"$STORE_PAGE_COUNT_TYPE\",\"count_page\":\"$STORE_TOTAL_PAGE_COUNT\",\"count_product_per_page\":\"$STORE_PRODUCTS_PER_PAGE_COUNT\"}]"


        echo "JSON: $JSON"

        #+-----------------------------------------------+
        #| LETS UPDATE THE CRAWL ATTEMPT IN THE DATABASE |
        #+-----------------------------------------------+
        sql_insert_crawl_date="UPDATE stores SET store_crawl_tstart=NOW() WHERE store_id=${STORE_ID};"
        sql_update_result=$(echo "${sql_insert_crawl_date}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST});
        echo "UPDATING CRAWL ATTEMPT TIMESTAMP: $sql_update_result"


        #+----------------------------------------------------------------------------+
        #| LETS PASS THE JSON LIST TO PHANTOMJS WHICH WILL PASS IT OT PHP FOR STORAGE |
        #+----------------------------------------------------------------------------+

        #Lets use a proxy if relevant
        echo "PROXIES_ENABLED: $PROXIES_ENABLED"

        if [ "${PROXIES_ENABLED}" -eq "1" ]; then

            #Lets randomly pick a proxy to use for now so we cycle through them to prevent rate limiting from tracking platform
            proxy_index=$((1 + RANDOM % proxy_count))
            proxy_array=(${PROXIES[$proxy_index]})
            proxy_ip=${proxy_array[0]};
            proxy_port=${proxy_array[1]};

            printf "\n\n+--------------+"
            printf "\n| EXECUTING !! |\n"
            printf "+--------------+\n"

            printf "proxy_index: $proxy_index proxy_ip: $proxy_ip proxy_port: $proxy_port\n"

            printf "\n\nRunning command: ./bin/phantomjs ${PHANTOMJS_DEBUG} --ignore-ssl-errors=true --web-security=false --disk-cache=true --proxy=${proxy_ip}:${proxy_port} scripts/${PHANTOM_SCRIPT} $JSON"
            #nohup ./bin/phantomjs --debug=true --disk-cache=true --proxy=${proxy_ip}:${proxy_port} scripts/canary_17track.js $JSON &
            #./bin/${PHANTOMJS_BIN} "$PHANTOMJS_DEBUG" --debug=true --disk-cache=true --ignore-ssl-errors=true --web-security=false --proxy=${proxy_ip}:${proxy_port} scripts/${PHANTOM_SCRIPT} "$JSON"
            #exit 0

            if [ "${SHOPIFY_DEBUG_STORE}" == 1 ]; then
                exit 0
            fi

            sleep ${SLEEP_PER_PAGE}
        else

            printf "\n\n+--------------+"
            printf "\n| EXECUTING !! |\n"
            printf "+--------------+\n"
            printf "\n\nRunning command: /bin/${PHANTOMJS_BIN} "$PHANTOMJS_DEBUG" --ignore-ssl-errors=true --web-security=false --disk-cache=true scripts/${PHANTOM_SCRIPT} $JSON"
            #nohup ./bin/phantomjs --debug=true --disk-cache=true scripts/${PHANTOM_SCRIPT} $JSON &
            ./bin/${PHANTOMJS_BIN} $PHANTOMJS_DEBUG --ignore-ssl-errors=true --web-security=false --disk-cache=true scripts/${PHANTOM_SCRIPT} "$JSON"
            exit 0

            if [ "${SHOPIFY_DEBUG_STORE}" == 1 ]; then
                exit 0
            fi

            sleep ${SLEEP_PER_PAGE}
        fi


        let COUNTER=COUNTER+1

done

exit 0
