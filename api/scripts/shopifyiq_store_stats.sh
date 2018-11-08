#!/bin/bash
#==================
# canary_crawler.sh
#==================

#+------------------------+
#| DATABASE CONFIGURATION |
#+------------------------+

_HOSTNAME=$(hostname)
if [ "${_HOSTNAME}" == "##########" ] || [ "${_HOSTNAME}" == "##########" ]; then
    MYSQL_USER="##########"
    MYSQL_PASS="##########"
    MYSQL_HOST="127.0.0.1"
    MYSQL_DB="##########"
    MYSQL_BIN="/Applications/MAMP/bin/apache2/bin/mysql"
    API_PATH="##########/shopifyiq/src/api"
    PHANTOMJS_BIN="phantomjs"
else
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
PHANTOM_SCRIPT="shopifyiq_store_stats.js"
SITES_PER_THREAD_LIMIT=100
SLEEP_PER_PAGE=10


#+-------------------+
#| RUN-TIME SETTINGS |
#+-------------------+

PHANTOMJS_DEBUG_IS_ENABLED=1
PHANTOMJS_DEBUG=""
SHOPIFY_DEBUG_STORE=0 #This is a flag to manually scan the first page listing of a store (we want to do this to debug and init a new store in the DB)
SHOPIFY_DEBUG_STORE_ID=8 #Store to manually recheck

if [ "${PHANTOMJS_DEBUG_IS_ENABLED}" == 1 ]; then
    PHANTOMJS_DEBUG="--debug=true"

fi

if [ "${MODULUS_IS_ENABLED}" == 1 ]; then
    SQL_MODULUS=" AND MOD(store_id,23) = HOUR(NOW())"
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
sql_get_total="SELECT count(store_id) FROM stores WHERE store_is_enabled = 1 ${SQL_MODULUS};";
tracking_count=$(echo "${sql_get_total}" | ${MYSQL_BIN} --user=${MYSQL_USER} --password=${MYSQL_PASS} ${MYSQL_DB} --host ${MYSQL_HOST} | sed -n 2p);
echo "Stores to crawl this hour: $tracking_count"

if [ "${tracking_count}" -eq 0 ]; then
    echo "No stores to crawl. Perhaps something went wrong with this query:\n\n ${sql_get_total}"
    exit 0;
fi

thread_count=${tracking_count}
#let thread_count=thread_count+1

echo "$thread_count threads to launch"

#+--------------------------------+
#| LETS GRAB THE STORE INFORMATION|
#+--------------------------------+


sql_query="SELECT store_id, store_domain FROM stores WHERE store_is_enabled = 1 ${SQL_MODULUS} ORDER BY store_tcrawl ASC";


if [ "${SHOPIFY_DEBUG_STORE}" == 1 ]; then
    sql_query="SELECT store_id, store_domain FROM stores WHERE store_id = ${SHOPIFY_DEBUG_STORE_ID}";
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

    #If the total page count has not been set yet, lets set it to 1, doing this will get us the actual page count
    if [ "${STORE_TOTAL_PAGE_COUNT}" == 0 ]; then
        STORE_TOTAL_PAGE_COUNT=1
    fi

    echo "Store total page count: ${STORE_TOTAL_PAGE_COUNT}"

    STORE_LIST[COUNTER]=$(echo "${STORE_ID}|${STORE_DOMAIN}");

    let COUNTER=COUNTER+1

done <<<"$store_list"


#echo "Stores: "
#printf '%s\n' "${STORE_LIST[@]}"
#exit 0





COUNTER=0
while [ ${COUNTER} -lt ${thread_count} ]; do


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


        echo "INDEX: ${store_index} COUNT: ${thread_count}"
        echo "--------------------------------------------"
        echo "STORE_ID: ${STORE_ID}"
        echo "STORE_DOMAIN: ${STORE_DOMAIN}"

        echo "--------------------------------------------"




        JSON_STR="["
        JSON_STR+="{\"id\":\"$STORE_ID\",\"domain\":\"$STORE_DOMAIN\"},"

        #lets trim the last comma
        JSON=$(echo "$JSON_STR" | sed 's/,*$//') #${JSON_STR:0:-1}
        JSON+="]"

        echo "JSON: $JSON"

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
            printf "\n\nRunning command: ./bin/phantomjs ${PHANTOMJS_DEBUG} --ignore-ssl-errors=true --web-security=false --disk-cache=true scripts/${PHANTOM_SCRIPT} $JSON"
            #nohup ./bin/phantomjs --debug=true --disk-cache=true scripts/${PHANTOM_SCRIPT} $JSON &
            ./bin/${PHANTOMJS_BIN} "$PHANTOMJS_DEBUG" --ignore-ssl-errors=true --web-security=false --disk-cache=true scripts/${PHANTOM_SCRIPT} "$JSON"
            #exit 0

            if [ "${SHOPIFY_DEBUG_STORE}" == 1 ]; then
                exit 0
            fi

            sleep ${SLEEP_PER_PAGE}
        fi


        let COUNTER=COUNTER+1

done

exit 0
