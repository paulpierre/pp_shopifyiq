<?php

$is_authenticated = true;
include_once('header.view.php');
?>
    <style>
        body { background-color:#2e3d50;}
    </style>
<div style="text-align:center; width:100%;padding-bottom:50px;">
    <img src="/assets/img/siq_main_logo.png"  style="width:300px;"/>

</div>
    <div class="text-center" style="min-width:300px;width:50%;border-radius:5px;padding:50px;margin:0 auto;background-color:#fff;">
<!-- under construction
            <img src="https://media2.giphy.com/media/v2DzOLUJESyUU/giphy.gif" style="width:300px;" align="center"/>
            <h3 style="padding:30px;">Don't panic...<br/><br/> ShopifyIQ is under maintenance.<br><br> BRB bros.</h3>

     -->

        <!-- <img style="width:300px;" src="/assets/img/siq_login.gif" align="center"/>-->
        <h3 style="padding:30px;">Welcome <span class="user-fn">mate</span>.</h3>
        <span class="whitelist" style="display:none;margin-bottom:50px !important;color:#ccc;">Your email is whitelisted as: <strong style="color:#333;"></strong>, redirecting you in 3s..</span>
        <br/><br/><br/>
        <!-- Main Form -->
        <div class="login-form-1">
            <form id="login-form" class="text-left" method="POST" action="/dashboard/">
                <div class="login-form-main-message"></div>
                <div class="main-login-form">
                    <div class="login-group">

                        <div class="form-group" style="text-align:center;">


                            <div scope="public_profile,email" onlogin="checkLoginState();" data-auto-logout-link="true"  class="fb-login-button" data-width="200" data-max-rows="1" data-size="large" data-button-type="login_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>
                        </div>

                        <div style="color:#555;padding-top:50px;">
                            <p><strong>ShopifyIQ</strong> is a big-data product sourcing intelligence tool lovingly created in Silicon Valley.
                                It collects product performance meta-data data from the top performing
                            stores with the most traffic, based on IP/DNS traffic meta-data as well as stores known to be owned
                            by the top-performing dropshipping masterminds.
                            </p>
                            <p>
                                This is irrefutably the best "spytool" in the market and getting better as we add more algorithms
                                and analytical heuristics.
                                If you wish to be whitelisted, please contact
                                <strong><u><a href="https://telegram.me/paulpierre" target="_blank">paulpierre</a></u></strong> on telegram.</p>
                            </p>
                            <p style="color:#ccc;">
                                <u style="color:red;">Disclaimer:</u> <strong>ShopifyIQ</strong> is currently in ALPHA stage and sharing accounts is strictly
                                prohibited. All data is confidential and for internal purposes only. This is not a commercial
                                tool and we do not make money from this. This is exclusive to Paul & Freddie's mastermind group.
                                We track IP's and browser + device fingerprints. Any violation will be an autoban and removal
                                from any associated masterminds.
                            </p>
                        </div>

                    </div>
                </div>
            </form>
        </div>

        <!-- end:Main Form -->
    </div>

<?
include_once('footer.view.php');
exit();

