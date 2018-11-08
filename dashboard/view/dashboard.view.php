<?php
 include_once('header.view.php');?>
<nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
    <a class="navbar-brand" href="#"><span class="logo"></span></a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <style>
        div.fb-login-button span { width:100px !important;}
    </style>
    <div class="collapse navbar-collapse" id="navbarsExampleDefault" style="display:none;">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item  active">
                <a class="nav-link main-menu" id="global-ranking" data-page="page-global-ranking" href="#">Global Ranking</a>
            </li>

            <li class="nav-item" style="display:none;">
                <a class="nav-link main-menu" data-page="page-livespy" href="#">Live Spy</a>

            </li>
            <li class="nav-item">
                <a class="nav-link main-menu" data-page="page-ranking" href="#">Store Ranking <strong style="color:deepskyblue;display:none;">(NEW)</strong></a>
            </li>

            <li class="nav-item" style="display:none;">
                <a class="nav-link main-menu" data-page="page-googlesearch" href="#">Google Search</a>
            </li>

            <li class="nav-item">
                <a class="nav-link main-menu" target="_blank" href="https://www.dropbox.com/s/q7qbnjcdkmti731/SIQ%20-%20Instructional%20Video%203-22.webm?dl=0">
                   <img src="/view/assets/img/video.png" style="max-width:30px;"> Tutorial <strong style="color:deepskyblue">(NEW)</strong>
                </a>
            </li>

            <li class="nav-item" style="margin-left:30px;">
                <div scope="public_profile,email"  data-auto-logout-link="true"  class="fb-login-button" data-width="100" data-max-rows="1" data-size="large" data-button-type="login_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true""></div>

            </li>

        </ul>

    </div>
</nav>


<div class="container-fluid page-content" id="page-global-ranking" style="display:none;">
    <div class="row">

        <main role="main" id="global-ranking-container" class="col-sm-9 ml-sm-auto col-md-12 pt-3">
            <div class="page-header">
                <h1>Top Products 30d
                    <div class="tooltip-container" style="display:inline-block;">
                        <span id="store-count" ></span>

                        <div class="tooltip"> <!-- This class should hide the element, change it if needed -->
                            <p>This number shows the total # of Shopify Stores we are tracking</p>
                        </div>
                    </div>
                    <div class="dropdown show" style="display:none;">
                        <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="page-limit-selector-display" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            List Filter
                        </a>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuLink"  id="ranking-filter">
                            <ul style="list-style:none !important;font-size:20px; list-style-position: inside;padding-left:0 !important;">
                                <li><a href="#" class="small dropdown-item" data-value="option1" tabIndex="-1"><input type="checkbox"/>&nbsp;Show products with no gain</a></li>
                                <li><a href="#" class="small dropdown-item" data-value="option2" tabIndex="-1"><input type="checkbox"/>&nbsp;Show products with LOSS </a> <input/> </li>
                                <li><a href="#" class="small dropdown-item" data-value="option3" tabIndex="-1"><input type="checkbox"/>&nbsp;Show products with GAIN</a></li>
                                <li><a href="#" class="small dropdown-item" data-value="option4" tabIndex="-1"><input type="checkbox"/>&nbsp;Show products with QUANTITY</a></li>
                                <li><a href="#" class="small dropdown-item" data-value="option5" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 5</a></li>
                                <li><a href="#" class="small dropdown-item" data-value="option6" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 6</a></li>
                            </ul>
                        </div>
                    </div>
                    <span class="date-container"><img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/calendar-256.png"/><input type="text" class="datepicker" id="global-ranking-datepicker"></span>


                </h1>
            </div>

            <div class="table-responsive" style="width:100%;">
                <table class="table table-striped" id="global-ranking-list" style="width:100%;">
                    <thead>
                    <tr>
                        <th><div class="tooltip-container">Rank

                            <div class="tooltip">
                                <p>
                                    RANK is the best-seller rank position RELATIVE to that store.<br/><br/>Below is the total
                                    number of products in that store.
                                </p>
                            </div>
                            </div>
                        </th>
                        <th><div class="tooltip-container">D1

                            <div class="tooltip">
                                <p>
                                    D1 means 1 Day before TODAY.<br/></br/>
                                    The number represents the # of positions changed
                                    since a day ago, either in up or down trend.
                                    <br/><br/>
                                    The number beneath is the RANK POSITION 1 Day ago.
                                </p>
                            </div></div>
                        </th>
                        <th><div class="tooltip-container">D1%

                            <div class="tooltip">
                                <p>This is rate of ranking velocity, e.g. how much does this change compare with all the other products from 1 Day ago.
                                    <br/><br/>
                                    D1% represents the change in ranking from 1 Day ago relative to the total # of products
                                    <br/><br/>
                                    The % is the # of ranks increased / by the total # of products
                                </p></div></div>
                        </th>
                        <th><div class="tooltip-container">D3

                            <div class="tooltip">
                                <p>
                                    D3 means 3 days before TODAY or 3 days ago.<br/></br/>
                                    The number represents the # of positions the product rank
                                    changed since 3 days ago, either trending up or down.
                                    <br/><br/>
                                    The number beneath is the RANK POSITION 3 days ago.
                                </p>
                            </div>
                            </div>
                        </th>
                        <th><div class="tooltip-container">D3%

                            <div class="tooltip">
                                <p>This is rate of ranking velocity, e.g. how much does this change compare with all the other products from 3 Days ago.
                                    <br/><br/>
                                    D3% represents the change in ranking from 3 Days ago relative to the total # of products
                                    <br/><br/>
                                    The % is the # of ranks increased / by the total # of products
                                </p>
                            </div></div>
                        </th>
                        <th><div class="tooltip-container">D7
                            <div class="tooltip">
                                <p>
                                    D7 means 7 days before TODAY or 7 days ago.<br/></br/>
                                    The number represents the # of positions the product rank
                                    changed since 7 days ago, either trending up or down.
                                    <br/><br/>
                                    The number beneath is the RANK POSITION 7 days ago.

                                </p>
                            </div>
                            </div>

                        </th>
                        <th><div class="tooltip-container">D7%

                            <div class="tooltip">
                                <p>This is rate of ranking velocity, e.g. how much does this change compare with all the other products from 7 Days ago.
                                    <br/><br/>
                                    D7% represents the change in ranking from 7 Days ago relative to the total # of products
                                    <br/><br/>
                                    The % is the # of ranks increased / by the total # of products
                                </p>
                            </div></div>
                        </th>
                        <th><div class="tooltip-container">Chart (30 day)

                            <div class="tooltip">
                                <p>Global rank is the global ranking for total internet traffic for that particular shop. The lower
                                    the number, the more traffic  it gets, and the more we can assume they spend on Facebook marketing.
                                </p>
                            </div></div>
                        </th>
                        <th><div class="tooltip-container">Global Rank

                            <div class="tooltip">
                                <p>Global rank is the global ranking for total internet traffic for that particular shop. The lower
                                the number, the more traffic  it gets, and the more we can assume they spend on Facebook marketing.
                                </p>
                            </div></div>
                        </th>
                        <th><div class="tooltip-container">Image

                            <div class="tooltip">
                                <p>Click on this image to view the Shop's product page</p
                                ></div></div>
                        </th>
                        <th>Store</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th><div class="tooltip-container">Preview

                            <div class="tooltip">
                                <p>
                                    Eye icon - Will over lay a preview of the page<br/>
                                    Facebook - Will launch a window searching for Facebook videos of this product<br/>
                                    Youtube - Will search for youtube videos of this product<br/>
                                    Google - Will search Google for this and similar products
                                </p>
                            </div></div>
                        </th>
                        <!--<th>Available</th>-->
                        <!--
                        <th>QTY D1</th>
                        <th>QTY D3</th>
                        <th>QTY D7</th>-->

                        <th><div class="tooltip-container">Published

                            <div class="tooltip">
                                <p>
                                   This is when the store made their product publically available on their store
                                </p>
                            </div></div>
                        </th>
                        <th><div class="tooltip-container">Updated

                            <div class="tooltip">
                                <p>
                                    This is when the store modified their product listing whether it was to change a description
                                    or update the product's pricing, etc.
                                </p>
                            </div>  </div>
                        </th>

                    </tr>
                    </thead>
                    <tbody id="global-rankings">

                    </tbody>
                </table>
            </div>

        </main>
    </div>
</div>

<div class="container-fluid page-content" id="page-ranking" style="display:none;">
    <div class="row">

        <main role="main" id="ranking-container"  class="col-sm-9 ml-sm-auto col-md-12 pt-3">

            <div class="page-header">
                <!--<span class="rank-domain"></span>-->

                <div class="dropdown show" style="display:inline-block;">
                    <a class="btn btn-primary dropdown-toggle" href="#" role="button" id="store-selector-display" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Select a Domain
                    </a>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuLink"  id="store-selector">
                    </div>
                </div>
                - <a class="fb_page" href="#" target="_blank"><img src="https://www.shareicon.net/download/2015/08/29/92522_media_512x512.png" width="30" height="30"/></a><a href='' class='site_info' target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Simpleicons_Interface_magnifier-on-a-user.svg/1000px-Simpleicons_Interface_magnifier-on-a-user.svg.png' width='30px' height='30px'></a>
                <span class="site-meta">US Rank: <b class="us-rank">-</b> | Global Rank: <b class="global-rank">-</b> | Crawled: <b class="tcrawl">-</b> | pages: <b class="page-count"></b></span>

                    <span class="date-container"><img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/calendar-256.png"/><input type="text" class="datepicker" id="ranking-datepicker"></span>

            </div>

                <div class="table-responsive" style="width:100%;">
                    <table class="table table-striped" id="ranking-list" style="width:100%;">
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>D1</th>
                            <th>D1%</th>
                            <th>D3</th>
                            <th>D3%</th>
                            <th>D7</th>
                            <th>D7%</th>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Preview</th>
                            <th>Published</th>
                            <th>Updated</th>

                        </tr>
                        </thead>
                        <tbody id="rankings">

                        </tbody>
                    </table>
                </div>

        </main>
    </div>
</div>

<div class="container-fluid page-content" id="page-livespy" style="display:none;">
    <div class="row">


        <main role="main" class="col-sm-9 ml-sm-auto col-md-12 pt-3">

            <div id="product-container">

                <h2> <div class="dropdown show" style="display:inline-block;">
                        <a class="btn btn-primary dropdown-toggle" href="#" role="button" id="store-selector-display-livespy" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Select a Domain
                        </a>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuLink"  id="store-selector-livespy">
                        </div>
                    </div> - Best Sellers - <a class="fb_page" href="#" target="_blank"><img src="https://www.shareicon.net/download/2015/08/29/92522_media_512x512.png" width="30" height="30"/></a><a href='' class='site_info' target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Simpleicons_Interface_magnifier-on-a-user.svg/1000px-Simpleicons_Interface_magnifier-on-a-user.svg.png' width='30px' height='30px'></a>
                    <div class="dropdown show" style="display:inline-block;">
                        <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="page-limit-selector-display" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Page Limit
                        </a>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuLink"  id="page-limit-selector">
                            <a class="dropdown-item" data-limit="0" href="#">ALL</a>
                            <a class="dropdown-item" data-limit="1" href="#">1</a>
                            <a class="dropdown-item" data-limit="2" href="#">2</a>
                            <a class="dropdown-item" data-limit="3" href="#">3</a>
                            <a class="dropdown-item" data-limit="4" href="#">4</a>
                            <a class="dropdown-item" data-limit="5" href="#">5</a>
                            <a class="dropdown-item" data-limit="10" href="#">10</a>
                            <a class="dropdown-item" data-limit="25" href="#">25</a>
                            <a class="dropdown-item" data-limit="50" href="#">50</a>
                        </div>
                    </div>
                </h2>

                <div class="table-responsive">
                    <table class="table table-striped" id="product-list">
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Preview</th>
                            <th>Variations</th>
                            <th>Tags</th>
                            <th>Created</th>
                            <th>Published</th>
                        </tr>
                        </thead>
                        <tbody id="products">

                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</div>

<div class="container-fluid page-content" id="page-googlesearch" style="display:none;">
    <div class="container theme-showcase" role="main">

        <!-- Main jumbotron for a primary marketing message or call to action -->
        <div class="jumbotron">
            <h1>Product Search</h1>
            <p>This is a template showcasing the optional theme stylesheet included in Bootstrap. Use it as a starting point to create something more unique by building on or modifying it.</p>
        </div>


        <div class="page-header">
            <h1>Exclude</h1>
        </div>
        <p>
          <input id="tag-exclusion" data-role="tagsinput" style="color:#333;"/>
            <input type="text" value="Amsterdam,Washington,Sydney,Beijing,Cairo" data-role="tagsinput" />

        </p>
        <p>
            <button type="button" class="btn btn-default">Default</button>
            <button type="button" class="btn btn-primary">Primary</button>
            <button type="button" class="btn btn-success">Success</button>
            <button type="button" class="btn btn-info">Info</button>
            <button type="button" class="btn btn-warning">Warning</button>
            <button type="button" class="btn btn-danger">Danger</button>
            <button type="button" class="btn btn-link">Link</button>
        </p>
        <p>
            <button type="button" class="btn btn-sm btn-default">Default</button>
            <button type="button" class="btn btn-sm btn-primary">Primary</button>
            <button type="button" class="btn btn-sm btn-success">Success</button>
            <button type="button" class="btn btn-sm btn-info">Info</button>
            <button type="button" class="btn btn-sm btn-warning">Warning</button>
            <button type="button" class="btn btn-sm btn-danger">Danger</button>
            <button type="button" class="btn btn-sm btn-link">Link</button>
        </p>
        <p>
            <button type="button" class="btn btn-xs btn-default">Default</button>
            <button type="button" class="btn btn-xs btn-primary">Primary</button>
            <button type="button" class="btn btn-xs btn-success">Success</button>
            <button type="button" class="btn btn-xs btn-info">Info</button>
            <button type="button" class="btn btn-xs btn-warning">Warning</button>
            <button type="button" class="btn btn-xs btn-danger">Danger</button>
            <button type="button" class="btn btn-xs btn-link">Link</button>
        </p>
    </div>
</div>

<div class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Product Page</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            </div>
            <div class="modal-body">
                <p>One fine body&hellip;</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
        </div>
        <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
</div>
<!-- /.modal -->
<div class="modal fade" id="chart-modal-container">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Product Stats</h4>

                <span class="date-container" style="float:right;"><img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/calendar-256.png"/>
                    <div id="reportrange" style="min-width:400px;background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc;display:inline;">
                        <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>&nbsp;
                        <span></span> <b class="caret"></b>
                    </div>
                </span>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

            </div>
            <div class="modal-body">
                <ul class="nav nav-pills">
                    <li class="nav-item">
                        <a class="nav-link active" id="chart-product-tab" data-toggle="tab" href="#chart-product" role="tab" aria-controls="chart-product"  aria-selected="true">Product Ranking</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="chart-store-comparison-tab" data-toggle="tab" href="#chart-store-comparison" role="tab" aria-controls="chart-store-comparison"  aria-selected="false">Compare with Store's Products</a>
                    </li>
                </ul>
                <div class="tab-content" id="chart-product-content">
                    <div class="tab-pane fade show active" id="chart-product" role="tabpanel" aria-labelledby="chart-product-tab">
                        <canvas id="product-ranking-chart"></canvas>

                    </div>

                    <div class="tab-pane fade" id="chart-store-comparison" role="tabpanel" aria-labelledby="chart-store-comparison-tab">
                        <canvas id="store-comparison-ranking-chart"></canvas>
                    </div>


                </div>
            </div>
            <div class="modal-footer">
            </div>
        </div>
        <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
</div>



<? include_once('footer.view.php');?>
