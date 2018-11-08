
/** ==============
 *  Authentication
 *  ============== */


$(document).ready(function() {

    new Fingerprint2().get(function (result, components) {
        console.log("fp: " + result) // a hash, representing your device fingerprint
        siq_fp = result;
        //console.log(components) // an array of FP components
    });


/*
    function statusChangeCallback(response) {
        console.log(response);
    }
*/


});

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function () {
    FB.init({
        appId: '570179880028244',
        cookie: true,
        xfbml: true,
        version: 'v2.12'
    });

    FB.AppEvents.logPageView();

    FB.getLoginStatus(function (response) {
        if (response.status == "not_authorized") {
            console.log("User not facebook logged in!!");
            FB.login();
        } else if(response.status=="connected"){
            checkLoginState(response);
        }
    });

    FB.getLoginStatus(function (response) {
        console.log(response);
        //statusChangeCallback(response);
    });

    //

};


function checkLoginState(response) {
    //var uid = response.authResponse.userID;
    if(typeof response !== "undefined" && typeof response.authResponse !== "undefined")
        var access_token = response.authResponse.accessToken;

    FB.api('/me', {locale: 'en_US', fields: 'name, email'},
        function (response) {
            console.log("stuff:");
            console.log(response);
            var _name = response.name;
            siq_fn = _name.split(' ').slice(0, -1).join(' ');
            siq_ln = _name.split(' ').slice(-1).join(' ');
            siq_em = response.email;

            siq_data = response;
            siq_data["fp"] = siq_fp;
            siq_data["token"] = access_token;

            //wc("siq_fp",siq_fp);
            //wc("siq_em",siq_em);
            console.log("siq_data: " + siq_data);

            $.post("/login/auth",siq_data, function (data) {
                console.log("/login/auth:");
                console.log(data);
                try {
                    var o = data;
                    if(rc("siq_hash")==null || !rc("siq_hash")) wc("siq_hash",o.siq_hash)
                    if(location.href.split("/").slice(-1) != "" && location.href.split("/").slice(-1)  != "dashboard") {
                        setTimeout((function (o) {
                            if(o.code == 0) alert(o.data.message)
                            console.log( o);
                            if(o.code == 1) window.location = o.data.url;
                        })(o), 5000);
                    }
                } catch(e) {
                    alert("There was an error communicating with the server. Please get in touch with Paul via Telegram");
                }
            });


            console.log("fn: " + siq_fn);

            $("span.user-fn").html("back " + siq_fn + "!");
            $("span.whitelist strong").html(siq_em);
            $("span.whitelist").fadeIn("slow");
        }
    );
}
