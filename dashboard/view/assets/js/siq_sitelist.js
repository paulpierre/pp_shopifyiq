
/** =========================
 *  Target site configuration
 *  ========================= */
var site_list = {
    /**
     *  Tools:
     *  reverse whois - http://viewdns.info/reversewhois/?q=webmaster%40sportindo.com
     *  ranking of shopify stores - https://myip.ms/browse/sites/1/ipID/23.227.38.0/ipIDii/23.227.38.255
     *  www.scamadviser.com/check-website/omgtrue.com
     */

    /**
     *
     * https://thewhateverworld.com/collections/all?page=1&sort_by=best-selling
     * https://www.luardano.com/collections/all?page=1&sort_by=best-selling
     * https://theelegancestore.com/collections/all?page=1&sort_by=best-selling
     * https://www.radgears.com/collections/all?page=1&sort_by=best-selling
     * https://www.swaggydoo.com/collections/all?page=1&sort_by=best-selling
     * https://dealshopie.com/collections/all?page=1&sort_by=best-selling
     * https://www.boulevard92.com/collections/all?page=1&sort_by=best-selling
     *
     * https://thegadgetmole.com/collections/all?page=1&sort_by=best-selling
     * https://betterdaystore.com/collections/all?page=1&sort_by=best-selling
     * https://www.untoldtrends.com/collections/all?page=1&sort_by=best-selling
     * https://shopitoutlet.com/collections/all?page=1&sort_by=best-selling
     * https://thechoiceday.com/collections/all?page=1&sort_by=best-selling
     * https://swpply.com/collections/all?page=1&sort_by=best-selling
     * https://dapiz.com/collections/all?page=1&sort_by=best-selling
     * https://wakashopping.net/collections/all?page=1&sort_by=best-selling
     * https://www.greatprice.sale/collections/all?page=1&sort_by=best-selling
     *
     */
    //https://www.kreatools.com/collections/all/?page=1&sort_by=best-selling
    "kreatools":{
        domain:"www.kreatools.com",
        url:"https://www.kreatools.com/collections/all",
        node: "div#product-loop div.product-index",
        img: "div.prod-image a div img",
        click_url: "div.prod-image a",
        price: "div.price font:first",
        name: "span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            json = $(data).find("form.product_form").attr("data-product");
            if(!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div#pagination font a").text());
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



    //https://wooxify.com/collections/all?sort_by=best-selling
    "wooxify.com":{
        domain:"wooxify.com",
        url:"https://wooxify.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    "boulevard92.com":{
        domain:"www.boulevard92.com",
        url:"https://www.boulevard92.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "a.grid-product__image-link img",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "a.grid-product__meta span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:product:)(.*)(?=},)/g.exec(data);

            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) { return {};}
            else
                json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


        //https://dealarcher.com/collections/all?page=1&sort_by=best-selling
    "dealarcher.com":{
        domain:"dealarcher.com",
        url:"https://dealarcher.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "a.grid__image img",
        click_url: "a.grid__image",
        price: "p.sale span.money",
        name: "p a:first",
        did_load:false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) { return {};}
            else
                json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://www.fandaly.com/collections/all?page=1&sort_by=best-selling
    "fandaly.com":{
        domain:"www.fandaly.com",
        url:"https://www.fandaly.com/collections/all",
        node: "div.product-grid div.product",
        img: "div.aspect-product__images img",
        click_url: "div.right div.name a",
        price: "div.price span.price-new span.money",
        name: "div.right div.name a",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("ul.pagination li:last").prev().text());
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



    //https://www.popgrab.com/collections/all?page=1&sort_by=best-selling
    "popgrab.com":{
        domain:"www.popgrab.com",
        url:"https://www.popgrab.com/collections/all",
        node: "div.grid:first div.grid-view-item",
        img: "img.grid-view-item__image",
        click_url: "a.grid-view-item__link",
        price: "span.product-price__price.product-price__sale span.money",
        name: "div.grid-view-item__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){
            //pagination__text
            var match = /(\d+)[ ]+of[ ]+(\d+)/gim.exec($(data).find("li.pagination__text").text());
            console.log(match);
            page_count = match[2];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //https://fontiene.com/collections/all?page=1&sort_by=best-selling
    "fontiene.com":{
        domain:"fontiene.com",
        url:"https://fontiene.com/collections/all",
        node:"div.product-list div.grid-item",
        img:"div.coll-image-wrap a img",
        click_url:"div.coll-image-wrap a",
        price:"p.coll-prod-price.accent-text",
        name:"div.coll-prod-meta h5 a",
        did_load:false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) { return {};}
            else
                json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;

        },//div.pagination.wide a.active:last
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.pagination.wide a.active:last").prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


    "gemmojo.com":{
        domain:"gemmojo.com",
        url:"https://gemmojo.com/collections/all",
        node: "div.grid-uniform:first div.grid-product",
        img: "a.grid-product__image-link img",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    "prettysmarty.com":{
        domain:"prettysmarty.com",
        url:"https://prettysmarty.com/collections/all",
        node: "div.grid:first div.grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__meta",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //https://curiouscuration.com/collections/all?page=1&sort_by=best-selling
   "curiouscuration":{
        domain:"curiouscuration.com",
        url:"https://curiouscuration.com/collections/all",
        node:"#CollectionSection div.grid-product__wrapper",
        img:"a.grid-product__image-link img",
        click_url:"a.grid-product__image-link",
        price:"span.grid-product__price",
        name:"span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


    //https://www.stellartrends.com/collections/all?page=1&sort_by=best-selling
    "stellartrends":{
        domain:"www.stellartrends.com",
        url:"https://www.stellartrends.com/collections/all",
        node:"#CollectionSection div.grid-product__wrapper",
        img:"a.grid-product__image-link img",
        click_url:"a.grid-product__image-link",
        price:"span.grid-product__price",
        name:"span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



    //     https://www.coowesome.com/collections/all?page=1&sort_by=best-selling

    "coowesome.com":{
        domain:"coowesome.com",
        url:"https://www.coowesome.com/collections/all",
        node:"div.product_c div.main_box",
        img:"div.product-image a img",
        click_url:"div.product-image a",
        price:"div.price span span.money",
        name:"div.desc h5 a",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("div.product-json").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.page_c ul li a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //https://thegearvibe.com/collections/all?page=1&sort_by=best-selling
    "thegearvibe.com":{
        domain:"thegearvibe.com",
        url:"https://thegearvibe.com/collections/all",
        node:"div.product-list div.product-wrap",
        img:"div.image__container img",
        click_url:"div.product_image a",
        price:"span.price span.money span.money",
        name:"span.title",
        did_load:false,
        get_product_details:function(data){

            //product_form_options
            json = $(data).find("form.product_form").attr("data-product");
            if(!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){
            var match = /(\d+)[ ]+of[ ]+(\d+)/gim.exec($(data).find("div.eight.columns.breadcrumb_text").text());
            console.log(match);
            page_count = match[2];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //     https://www.ldsman.com/collections/all?page=1&sort_by=best-selling
    "ldsman.com":{
        domain:"www.ldsman.com",
        url:"https://www.ldsman.com/collections/all",
        node:"div.grid-uniform:first div.grid__item",
        img:"a.grid__image img:first",
        click_url:"a.grid__image",
        price:"span.price",
        name:"p.h5 a",
        did_load:false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) { return {};}
            else
                json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



    // https://www.theclevhouse.com/collections/all?page=1&sort_by=best-selling

    "theclevhouse":{
        domain:"www.theclevhouse.com",
        url:"https://www.theclevhouse.com/collections/all",
        node:"div.product_c div.main_box",
        img:"div.product-image a img",
        click_url:"div.product-image a",
        price:"div.price span span.money",
        name:"div.desc h5 a",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("div.product-json").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.page_c ul li:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //nalaiandco.com/collections/all?page=1&sort_by=best-selling

    "nalaiandco.com":{
        domain:"nalaiandco.com",
        url:"https://nalaiandco.com/collections/all",
        node:"#CollectionSection div.grid-product__wrapper",
        img:"a.grid-product__image-link img",
        click_url:"a.grid-product__image-link",
        price:"span.grid-product__price",
        name:"span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //https://ezistuff.com/collections/all?page=1&sort_by=best-selling
    "ezistuff.com":{
        domain:"ezistuff.com",
        url:"https://ezistuff.com/collections/all",
        node:"div.grid-uniform:first div.grid-product",
        img:"img.product--image",
        click_url:"a.grid-product__image-link",
        price:"span.grid-product__price",
        name:"span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);
            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


    //     https://geniusproducts.co/collections/all?page=1&sort_by=best-selling
    "geniusproducts.co":{
        domain:"geniusproducts.co",
        url:"https://geniusproducts.co/collections/all",
        node:"div.product-list div.product-block",
        img:"div.image-label-wrap img",
        click_url:"a.product-link",
        price:"span.price span.money",
        name:"div.title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:product=)(.*)(?=})/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){
//
            var match = /(\d+)[ ]+of[ ]+(\d+)/gim.exec($(data).find("span.pagecount").text());
            console.log(match);
            page_count = match[2];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //https://www.onlinepresales.com/collections/all?page=1&sort_by=best-selling
    "onlinepresales":{
        domain:"onlinepresales.com",
        url:"https://www.onlinepresales.com/collections/all",
        node:"#shopify-section-collection-template div.products div.thumbnail",
        img:"div.image__container img",
        click_url:"a",
        price:"span.price.sale span span.money",
        name:"span.title",
        did_load:false,
        get_product_details:function(data){
            json = $(data).find("form.product_form").attr("data-product");
            if(!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){

            page_count = parseInt($(data).find("div.paginate span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    "stuffcandy":{
        domain:"stuffcandy.com",
        url:"https://stuffcandy.com/collections/all",
        node:"div.product-list div.product-wrap",
        img:"div.image__container img",
        click_url:"div.product_image a",
        price:"span.price.sale span span.money",
            name:"span.title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:products = \[)(.*)(?=}])/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){
            page_count = 2;
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },




//https://www.littleplayland.com/collections/all?page=1&sort_by=best-selling
    "littleplayland": {
        domain: "www.littleplayland.com",
        url: "http://www.littleplayland.com/collections/all",
        node: "div.product_c div.main_box",
        img: "div.product-image a img",
        click_url: "div.product-image a",
        price: "div.price span.money",
        name: "div.desc h5 a",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("div.product-json").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            console.log("!!JSON:")
            console.log(data);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.page_c ul li").last().text());
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://www.sheswish.com/collections/all?page=1&sort_by=best-selling
    "sheswish": {
        domain: "sheswish.com",
        url: "http://www.sheswish.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__meta",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://www.maketrendy.com/collections/all?page=1&sort_by=best-selling


    "maketrendy": {
        domain: "maketrendy.com",
        url: "http://maketrendy.com/collections/all",
        node: "div.product-grid div.grid__item",
        img: "div.indiv-product a img",
        click_url: "div.indiv-product a",
        price: "span.money",
        name: "div.indiv-product-title-text",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {

            var match = /(\d{1,2})+/g.exec($(data).find("li.pagination-text").text());
            console.log(match);
            page_count = match[0];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://www.delightprints.com/collections/all?page=1&sort_by=best-selling
    "delightprints.com": {
        domain: "delightprints.com",
        url: "http://www.delightprints.com/collections/all",
        node: "div.grid-uniform:first .grid-item",
        img: "div.product-grid-image--centered img",
        click_url: "a.product-grid-item",
        price: "small span.money",
        name: "p",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product = )(.*)(?=};)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://www.looselystore.com/collections/all?page=1&sort_by=best-selling
    "looselystore": {
        domain: "looselystore.com",
        url: "http://www.looselystore.com/collections/all",
        node: ".product-wrap",
        img: "div.image__container img",
        click_url: "div.product_image a",
        price: "span.price span.money",
        name: "span.title",
        did_load: false,

        get_product_details: function (data) {
            json = $(data).find("form.product_form").attr("data-product");
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },

        get_product_count: function (data) {

            var match = /(\d{1,2})+/g.exec($(data).find(".breadcrumb_text").text());
            console.log(match);
            page_count = match[0];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://www.theperfectsculpt.com/collections/all?page=1&sort_by=best-selling

    "theperfectsculpt": {
        domain: "www.theperfectsculpt.com",
        url: "http://www.theperfectsculpt.com/collections/all",
        node: "div.product-list:first div.product-wrap",
        img: "a.grid__image img",
        click_url: "a.hidden-product-link",
        price: "p.price_wrapper span.price span.money",
        name: "p.name_wrapper",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = 2;
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://www.petninjashop.com/collections/all?page=1&sort_by=best-selling
    "petninjashop": {
        domain: "www.petninjashop.com",
        url: "http://www.petninjashop.com/collections/all",
        node: "div.collection-main-body div.grid-view-item",
        img: "a.grid__image img",
        click_url: "a.grid__image",
        price: "p.product-grid--price span:nth-child(2) span.money",
        name: "p.product-grid--title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination li.pagination-number:last").text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://valuegearonline.com/collections/all?page=1&sort_by=best-selling

    "valuegearonline": {
        domain: "www.valuegearonline.com",
        url: "http://www.valuegearonline.com/collections/all",
        node: "div.product-grid div.product",
        img: "div.image a img",
        click_url: "div.image a",
        price: "span.money.price-new",
        name: "div.name a",
        did_load: false,
        get_product_details:function(data){
            match = /(?:products = )(.*)(?=}])/g.exec(data);
            if(!match) throw new Error("There was an error loading product details for " + _site);

            json = (match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination li:last").prev().text());
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://wiki-store.com/collections/all?page=1&sort_by=best-selling
    "wiki-store.com": {
        domain: "wiki-store.com",
        url: "http://www.wiki-store.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "div.product--wrapper div img",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://perfectsculptbras.com/collections/all?page=1&sort_by=best-selling
    "perfectsculptbras.com (secretslimwear)": {
        domain: "perfectsculptbras.com",
        url: "http://www.perfectsculptbras.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "div.grid-product__image-wrapper a img",
        click_url: "div.grid-product__image-wrapper a",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = 1;

            products_per_page = $(data).find(site_list[_site].node).length;

        }
    },


//https://www.gizmogecko.com/collections/all?page=1&sort_by=best-selling
    "gizmogecko.com": {
        domain: "gizmogecko.com",
        url: "http://www.gizmogecko.com/collections/all",
        node: "div.grid-uniform.grid-link__container div.grid__item",
        img: "span.grid-link__image-centered img",
        click_url: "a.grid-link",
        price: "p.grid-link__meta span:last",
        name: "p.grid-link__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://www.beyondvault.com/collections/all?page=1&sort_by=best-selling
    "beyondvault.com": {
        domain: "www.beyondvault.com",
        url: "https:/www.beyondvault.com/collections/all",
        node: "div.grid-item.product-item",
        img: "a.product-grid-image img",
        click_url: "a.product-grid-image",
        price: "span.special-price span.money",
        name: "a.product-title",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) { return {};}
            else
                json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = 12;
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



//https://www.lovelivingchic.com/collections/all?page=1&sort_by=best-selling
    "lovelivingchic": {
        domain: "www.lovelivingchic.com",
        url: "http://www.lovelivingchic.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



//https://magictoytruck.com/collections/all?page=1&sort_by=best-selling
    "magictoytruck.com": {
        domain: "www.magictoytruck.com",
        url: "http://www.magictoytruck.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = 1;

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//http://maisiemaven.com/collections/all?page=1&sort_by=best-selling
    "maisiemaven.com": {
        domain: "www.maisiemaven.com",
        url: "http://www.maisiemaven.com/collections/all",
        node: "#Collection div.grid-view-item",
        img: "img.grid-view-item__image",
        click_url: "a.grid-view-item__link",
        price: "span.product-price__price span.money",
        name: "div.grid-view-item__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            var match = /(\d{1,2})+/g.exec($(data).find("li.pagination__text").text());
            console.log(match);
            page_count = match[0];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://prettysmarty.com/collections/all?page=1&sort_by=best-selling
    //https://wiki-store.com/collections/all?page=1&sort_by=best-selling
    "prettysmarty": {
        domain: "www.prettysmarty.com",
        url: "http://www.prettysmarty.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "a.grid-product__meta",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://tumblecat.com/collections/all?page=1&sort_by=best-selling
    "tumblecat.com": {
        domain: "tumblecat.com",
        url: "https://tumblecat.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__meta",
        price: "span.grid-product__price",
        name: "a.grid-product_title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://wishaddict.com/collections/all?page=1&sort_by=best-selling
    "wishaddict.com": {
        domain: "www.wishaddict.com",
        url: "https://www.wishaddict.com/collections/all",
        node: "div.grid:first div.grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__meta",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://freeshipdeals.com/collections/all?page=1&sort_by=best-selling
    "freeshipdeals.com": {
        domain: "freeshipdeals.com",
        url: "https://www.freeshipdeals.com/collections/all",
        node: "#CollectionSection div.grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://www.dipeedeals.com/collections/all?page=1&sort_by=best-selling
    "dipeedeals.com": {
        domain: "dipeedeals.com",
        url: "http://www.dipeedeals.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//**TODO: figure out how to get this site!
//https://geekyget.com/collections/all?page=1&sort_by=best-selling


//https://hoppamania.com/collections/all?page=1&sort_by=best-selling
    "hoppamania.com": {
        domain: "hoppamania.com",
        url: "http://www.hoppamania.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "a.grid__image img",
        click_url: "a.grid__image",
        price: "p.sale",
        name: "p.h5 a",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://closeoutitemz.com/collections/all?page=1&sort_by=best-selling
    "closeoutitemz.com": {
        domain: "closeoutitemz.com",
        url: "https://www.closeoutitemz.com/collections/all",
        node: "#CollectionSection div.grid__item",
        img: "span.grid-link__image-centered img",
        click_url: "a.grid-link",
        price: "s.grid-link__sale_price span.money",
        name: "p.grid-link__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

//https://tomorrowstuff.com/collections/all?page=1&sort_by=best-selling
    "tomorrowstuff.com": {
        domain: "tomorrowstuff.com",
        url: "https://www.tomorrowstuff.com/collections/all",
        node: "div.grid-link__container div.grid__item",
        img: "span.grid-link__image-centered img",
        click_url: "a.grid-link",
        price: "s.grid-link__sale_price span.money",
        name: "p.grid-link__title",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


//https://www.2ubest.com/collections/all?page=1&sort_by=best-selling
    "2ubest.com": {
        domain: "2ubest.com",
        url: "https://www.2ubest.com/collections/all",
        node: "#CollectionSection div.grid-product__wrapper",
        img: "img.product--image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template-new").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div#CollectionSection div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },
//https://www.2ubest.com/collections/all?page=1&sort_by=best-selling
    "farertop.com": {
        domain: "farertop.com",
        url: "https://farertop.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "a.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            //if(!match) throw new Error("There was an error loading product details for " + _site);
            if(!match) { return {};}
            else
                json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div#CollectionSection div.pagination span.page a:last").text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },



//https://www.expressden.com/collections/all?page=1&sort_by=best-selling
    "expressden.com": {
        domain: "expressden.com",
        url: "https://expressden.com/collections/all",
        node: "div.products-grid div.product-item",
        img: "a.product-grid-image img",
        click_url: "a.product-grid-image",
        price: "span.special-price span.money",
        name: "a.product-title",
        did_load: false,
        get_product_details:function(data){
            //] = {"id":

            var match = /(?:bold_product_json\[[0-9]{1,15}] =)(.*)(?=};)/g.exec(data);
            //console.log(match);

            if(!match) {
                match = /(?:product: )(.*)(?=},)/g.exec(data);
                if(!match) throw new Error("There was an error loading product details for " + _site);
                json = ("["  +match[1] + "}]");
                data = JSON.parse(json)[0];

            }// throw new Error("There was an error loading product details for " + _site);
            else {
                var json = ("["  +match[1] + "}]");

                data = JSON.parse(json)[0];}

            return data;
        },
        get_product_count: function (data) {
            page_count = 44;
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://icoolgadgets.com/collections/all?page=1&sort_by=best-selling
    "icoolgadgets": {
        domain: "icoolgadgets.com",
        url: "http://www.icoolgadgets.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "a.grid__image img",
        click_url: "a.grid__image",
        price: "p.sale span.money",
        name: "p.nav-bar a",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text());
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },


    //http://www.happygocoupon.com/collections/all?page=1&sort_by=best-selling
    "happygocoupon":{
        domain:"www.happygocoupon.com",
        url:"http://www.happygocoupon.com/collections/all",
        node:".thumbnail",
        img:".product_image img",
        click_url:"a",
        price:"span.price span.money",
        name:"span.title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:product = )(.*)(?=};)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.paginate span.page").last().text().replace(/\"\'/g, ""));
            products_per_page = $(data).find(site_list[_site].node).length;

            if(!page_count) throw new Error("There was an error loading page count for " + _site);
            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }

    },

    //http://zestoc.com/collections/all?page=1&sort_by=best-selling
    "zestoc.com": {
        domain: "zestoc.com",
        url: "https://zestoc.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__meta",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://gadgetniac.com/collections/all?page=1&sort_by=best-selling
    "gadgetniac.com": {
        domain: "gadgetniac.com",
        url: "http://gadgetniac.com/collections/all",
        node: "div.grid-uniform:first .grid-item",
        img: "div.product-grid-image--centered img",
        click_url: "a.product-grid-item",
        price: "small span.money",
        name: "p",
        did_load: false,
        get_product_details:function(data){
            match = /(?:var product = )(.*)(?=};)/g.exec(data);
            console.log("GET PRODUCT DETAILS!!!!!!!!!");
            console.log(match);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  + match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://dudegadgets.us/collections/all?page=1&sort_by=best-selling
    "dudegadgets.us": {
        domain: "dudegadgets.us",
        url: "https://dudegadgets.us/collections/all",
        node: "div.product_c div.main_box",
        img: "div.product-image a img",
        click_url: "div.desc h5 a",
        price: "div.price",
        name: "div.desc h5 a",
        did_load: false,
        get_product_details:function(data){
            //] = {"id":

            var match = /(?:bold_product_json\[[0-9]{1,15}] =)(.*)(?=};)/g.exec(data);
            //console.log(match);

            if(!match) {
                match = /(?:product: )(.*)(?=},)/g.exec(data);
                if(!match) throw new Error("There was an error loading product details for " + _site);
                json = ("["  +match[1] + "}]");
                data = JSON.parse(json)[0];

            }// throw new Error("There was an error loading product details for " + _site);
            else {
                var json = ("["  +match[1] + "}]");

                data = JSON.parse(json)[0];}

            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.page_c ul li").last().text());
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.fidgetstuff.com/collections/all?page=1&sort_by=best-selling
    "fidgetstuff": {
        domain: "www.fidgetstuff.com",
        url: "http://www.fidgetstuff.com/collections/all",
        node: "div.grid--uniform:first .grid__item",
        img: "img.grid-view-item__image",
        click_url: "a.grid-view-item__link",
        price: "span.product-price__price product-price__sale span.money",
        name: "div.grid-view-item__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            var match = /(\d{1,2})+/gim.exec($(data).find("li.pagination__text").text());
            console.log(match);
            page_count = match[0];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.creativeitemshop.com/collections/all?page=1&sort_by=best-selling
    "creativeitemshop": {
        domain: "www.creativeitemshop.com",
        url: "https://www.creativeitemshop.com/collections/all",
        node: "div.grid:first div.grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.hazelharper.com/collections/all?page=1&sort_by=best-selling
    "hazelharper": {
        domain: "www.hazelharper.com",
        url: "http://www.hazelharper.com/collections/all",
        node: "div.grid--uniform:first .grid__item",
        img: "div.product-card__image-wrapper img",
        click_url: "a.product-card",
        price: "div.product-card__price",
        name: "div.product-card__name",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.dipeedeals.com/collections/all?page=1&sort_by=best-selling
    "dipeedeals": {
        domain: "www.dipeedeals.com",
        url: "http://www.dipeedeals.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "a.grid-product__image-link img",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.supershopstop.com/collections/all?page=1&sort_by=best-selling
    "supershopstop": {
        domain: "www.supershopstop.com",
        url: "http://www.supershopstop.com/collections/all",
        node: "div.grid-uniform:first .grid__item",
        img: "a.grid__image img",
        click_url: "a.grid__image",
        price: "p.sale",
        name: "p.h5 a",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.dtcreativestore.com/collections/all?page=1&sort_by=best-selling
    "dtcreativestore": {
        domain: "dtcreativestore.com",
        url: "https://dtcreativestore.com/collections/all",
        node: "div.product_c div.main_box",
        img: "div.product-image a img",
        click_url: "div.product-image a",
        price: "div.price span.money",
        name: "div.desc h5 a",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product = )(.*)(?=};)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.page_c ul li").last().text());
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://shopparoo.com/collections/all?page=1&sort_by=best-selling
    "shopparoo": {
        domain: "shopparoo.com",
        url: "https://shopparoo.com/collections/all",
        node: "div.grid-uniform:first div.grid-item",
        img: "div.product-grid-image--centered img",
        click_url: "a.product-grid-item",
        price: "span.visually-hidden span.money",
        name: "a p:first",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product = )(.*)(?=};)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.nextdealshop.com/collections/all?page=1&sort_by=best-selling
    "nextdealshop": {
        domain: "nextdealshop.com",
        url: "https://nextdealshop.com/collections/all",
        node: "div.product-container",
        img: "a.product_img_link img",
        click_url: "a.product_img_link",
        price: "div.content_price span.price span.money",
        name: "a.product-name",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = 30;//parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://readysetdeals.com/collections/all?page=1&sort_by=best-selling
    "readysetdeals": {
        domain: "readysetdeals.com",
        url: "https://readysetdeals.com/collections/all",
        node: "div.grid-uniform:first div.grid-item",
        img: "div.product-grid-image--centered img",
        click_url: "a.product-grid-item",
        price: "span.visually-hidden",
        name: "a p:first",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product = )(.*)(?=};)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.familyfervor.com/collections/all?page=1&sort_by=best-selling
    "familyfervor": {
        domain: "familyfervor.com",
        url: "https://familyfervor.com/collections/all",
        node: "div.grid-link__container div.grid__item",
        img: "span.grid-link__image-centered img",
        click_url: "a.grid-link",
        price: "s.grid-link__sale_price span.money",
        name: "span.money:nth-child(2)",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.monavy.com/collections/all?page=1&sort_by=best-selling
    "monavy": {
        domain: "monavy.com",
        url: "https://monavy.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://ramadeals.com/collections/all?page=1&sort_by=best-selling
    "ramadeals.com": {
        domain: "ramadeals.com",
        url: "https://ramadeals.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page").last().text())
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://luxtek.net/collections/all?page=1&sort_by=best-selling
    "luxtek": {
        domain: "luxtek.net",
        url: "https://luxtek.net/collections/all",
        node: "div.grid-view-item",
        img: "img.grid-view-item__image",
        click_url: "a.grid-view-item__link",
        price: "span.product-price__price span.money",
        name: "div.grid-view-item__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            var match = /(\d{2})+/g.exec($(data).find("li.pagination__text").text());
            page_count = match[0];
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //https://nova-stuff.com/collections/all?page=1&sort_by=best-selling
    "nova-stuff.com": {
        domain: "nova-stuff.com",
        url: "https://nova-stuff.com/collections/all",
        node: "div.grid-link__container div.grid__item",
        img: "span.grid-link__image-centered img",
        click_url: "a",
        price: "s.grid-link__sale_price",
        name: "p.grid-link__title",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://sugarandcotton.com/collections/all?page=1&sort_by=best-selling
    "sugarandcotton": {
        domain: "sugarandcotton.com",
        url: "https://sugarandcotton.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details:function(data){
            match = /(?:product: )(.*)(?=},)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page a").last().text().replace(/\"\'/g, ""));
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://zootzi.com/collections/all?page=1&sort_by=best-selling
    "zootzi": {
        domain: "zootzi.com",
        url: "https://zootzi.com/collections/all",
        node: "div.grid-uniform:first div.grid__item",
        img: "img.grid-product__image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money:nth-child(2)",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("div.pagination span.page a").last().text().replace(/\"\'/g, ""));
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://bodeaz.com/collections/all?page=1&sort_by=best-selling
    "bodeaz": {
        domain: "bodeaz.com",
        url: "http://bodeaz.com/collections/all",
        node: ".product-wrap",
        img: ".product_image img",
        click_url: ".product_image a",
        price: "span.price span.money",
        name: "div.thumbnail-overlay a",
        did_load: false,
        get_product_details: function (data) {
            json = $(data).find("form.product_form").attr("data-product");
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {

            page_count = 38;
            products_per_page = $(data).find(site_list[_site].node).length;

            console.log("products_per_page: " + products_per_page);

            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }
    },

    //http:///badassbaby.co/collections/all?page=1&sort_by=best-selling
    "badassbaby.co": {
        domain: "badassbaby.co",
        url: "http://badassbaby.co/collections/all",
        node: "#shopify-section-collection-template .grid__item",
        img: "img.product--image",
        click_url: "a.grid-product__image-link",
        price: "span.grid-product__price span.money",
        name: "span.grid-product__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div#CollectionSection div.pagination span.page a:last").replace(/\"\'/g, ""));
            if (!page_count) throw new Error("There was an error loading page count for " + _site);

            products_per_page = $(data).find(site_list[_site].node).length;
            if(!page_count) throw new Error("There was an error loading page count for " + _site);
            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://trendyshack.com/collections/all?page=1&sort_by=best-selling
    "TrendyShack": {
        domain: "trendyshack.com",
        url: "http://www.trendyshack.com/collections/all",
        node: "#shopify-section-collection-template .grid__item",
        img: ".grid-link__image-centered img",
        click_url: "a.grid-link",
        price: "p.grid-link__meta span.money",
        name: "p.grid-link__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;
            console.log("products_per_page: " + products_per_page);
            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://dudesgadget.com/collections/all?page=1&sort_by=best-selling
    "DudesGadget": {
        domain: "www.dudesgadget.com",
        url: "http://www.dudesgadget.com/collections/all",
        node: "#shopify-section-collection-template .grid__item",
        img: ".grid-link__image-centered img",
        click_url: "a.grid-link",
        price: "p.grid-link__meta span.money",
        name: "p.grid-link__title",
        did_load: false,
        get_product_details: function (data) {
            var json = $(data).find("#ProductJson-product-template").html();
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            page_count = parseInt($(data).find("ul.pagination-custom li").last().prev().text().replace(/ /g, "").replace(/\n/g, ""));
            console.log(page_count);
            if (!page_count) throw new Error("There was an error loading page count for " + _site);
            products_per_page = $(data).find(site_list[_site].node).length;

            console.log("products_per_page: " + products_per_page);

            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }
    },

    //http://dudegadgets.com/collections/all?page=1&sort_by=best-selling
    "DudeGadgets": {
        domain: "dudegadgets.com",
        url: "http://dudegadgets.com/collections/all",
        node: ".product-wrap",
        img: ".product_image img",
        click_url: ".product_image a",
        price: "span.price span.money",
        name: "div.thumbnail-overlay a",
        did_load: false,
        get_product_details: function (data) {
            json = $(data).find("form.product_form").attr("data-product");
            if (!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count: function (data) {
            var _count = $(data).find("div.breadcrumb_text").text();
            var match = /([0-9]+)$/g.exec(_count);
            if (!match) throw new Error("There was an error loading page count for " + _site);
            page_count = parseInt(match[0]);
            products_per_page = $(data).find(site_list[_site].node).length;

            console.log("products_per_page: " + products_per_page);

            if (!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }
    },

    //http://theviralgadgets.com/collections/all?page=1&sort_by=best-selling
    "theviralgadgets":{
        domain:"theviralgadgets.com",
        url:"http://theviralgadgets.com/collections/all",
        node:".grid-product__wrapper",
        img:".grid-product__image-link img",
        click_url:"a.grid-product__image-link",
        price:".grid-product__price span.money",
        name:"span.grid-product__title",
        did_load:false,
        get_product_details:function(data){

            //match = /(?:<script type="application\/json" id="ProductJson-product-template">)((.|\n)*)(?=<\/script>)/g.exec(data);
            var match = $(data).find("#ProductJson-product-template").html();
            json = "[" + match + "]";
            if(!match) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;

        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.pagination span.page a").last().text().replace(/\"\'/g, ""));
            products_per_page = $(data).find(site_list[_site].node).length;
            if(!page_count) throw new Error("There was an error loading page count for " + _site);
            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

    //http://www.stuffnice.com/collections/all?page=1&sort_by=best-selling
    "stuffnice":{
        domain:"www.stuffnice.com",
        url:"http://www.stuffnice.com/collections/all",
        node:".thumbnail",
        img:".product_image img",
        click_url:" a",
        price:"span.price span.money",
        name:"span.title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:SUBParams = )((.|\n)*)(?=};\n<\/script>)/g.exec(data);

            if(!match) throw new Error("There was an error loading product details for " + _site);

            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0].product;
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.paginate span.page").last().text().replace(/\"\'/g, ""));
            products_per_page = $(data).find(site_list[_site].node).length;

            if(!page_count) throw new Error("There was an error loading page count for " + _site);
            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }

    },
    //http://phonebibi.com/collections/all?page=1&sort_by=best-selling

    "phonebibi":{
        domain:"phonebibi.com",
        url:"http://phonebibi.com/collections/all",
        node:".product-wrap",
        img:".product_image img",
        click_url:".product_image a",
        price:"span.price span.money",
        name:"div.thumbnail-overlay a",
        did_load:false,
        get_product_details:function(data){
            json = $(data).find("form.product_form").attr("data-product");
            if(!json) throw new Error("There was an error loading product details for " + _site);

            data = JSON.parse(json);
            return data;
        },
        get_product_count:function(data){
            var _count = $(data).find("div.breadcrumb_text").text();
            var match = /([0-9]+)$/g.exec(_count);
            if(!match) throw new Error("There was an error loading page count for " + _site);
            page_count = parseInt(match[0]);
            products_per_page = $(data).find(site_list[_site].node).length;

            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }

    },

    "omgtrue":{
        domain:"omgtrue.com",
        url:"http://omgtrue.com/collections/all",
        node:".grid-product__wrapper",
        img:".grid-product__image-link img",
        click_url:"a.grid-product__image-link",
        price:".grid-product__price span.money",
        name:"span.grid-product__title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:cart_products = )(.*)(?=}];)/g.exec(data);
            if(!match) throw new Error("There was an error loading product details for " + _site);

            json = (match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.pagination span.page a").last().text().replace(/\"\'/g, ""));
            products_per_page = $(data).find(site_list[_site].node).length;
            if(!page_count) throw new Error("There was an error loading page count for " + _site);
            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }
    },
    //http://choicest1.com/collections/all?page=1&sort_by=best-selling

    "choicest1":{
        domain:"choicest1.com",
        url:"http://www.choicest1.com/collections/women-beauty",
        node:".thumbnail",
        img:".product_image img",
        click_url:" a",
        price:"span.price span.money",
        name:"span.title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:Spurit.tieredPricing.snippet.product = )(.*)(?=};)/g.exec(data);
            if(!match) throw new Error("There was an error loading product details for " + _site);

            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.paginate span.page").last().text().replace(/\"\'/g, ""));
            products_per_page = $(data).find(site_list[_site].node).length;

            if(!page_count) throw new Error("There was an error loading page count for " + _site);
            console.log("products_per_page: " + products_per_page);
            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);

        }
    },
    //http://choicest1.com/collections/women-beauty?page=1&sort_by=best-selling

    "choicest1-women":{
        domain:"choicest1.com",
        url:"http://www.choicest1.com/collections/women-beauty",
        node:".thumbnail",
        img:".product_image img",
        click_url:" a",
        price:"span.price span.money",
        name:"span.title",
        did_load:false,
        get_product_details:function(data){
            match = /(?:Spurit.tieredPricing.snippet.product = )(.*)(?=};)/g.exec(data);
            if(!match) throw new Error("There was an error loading product details for " + _site);
            json = ("["  +match[1] + "}]");
            data = JSON.parse(json)[0];
            return data;
        },
        get_product_count:function(data){
            page_count = parseInt($(data).find("div.paginate span.page").last().text().replace(/\"\'/g, ""));
            products_per_page = $(data).find(site_list[_site].node).length;
            if(!page_count) console.log("There was an error loading page count for " + site);
            console.log("products_per_page: " + products_per_page);

            if(!products_per_page) throw new Error("There was an error loading page count for " + _site);
        }
    },

};