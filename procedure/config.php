<?php
error_reporting (E_ALL ^ E_NOTICE);
$DBDATA = array(
  host => "localhost",
  user => "root",
  password => "admin",
  database => "chansonnier"
);

$ADMDATA = array(
  user => "admin",
  password => "admin"
);

$CACHE_PERIOD = 365;

$CACHEPATH = "../cache/";
$TEMPPATH = "../template/";
$MERGEPATH = "../merge/";

$COMPRESS_LIST = array(
  "html" => array( $TEMPPATH ),
  "css"  => array( "../style/" ),
  "js"   => array( "../data/", "../interaction/" )
);

$MERGE_LIST = array(
    "index"=>array( 
        "css" => array( "../../external/style/boilerplate.style.css",
                        "../../external/style/holmes.min.css",
                        "../style/new_main.css",
                        /*"../style/base.css",
                        "../style/main.css",
                        "../style/color.css",
                        "../style/form.css",
                        "../style/text.css",
                        "../style/rounded.css"*/ ),
        "js" => array( "../../external/interaction/jquery-1.6.1.min.js",
                       "../../external/interaction/jquery-ui-1.8.11.custom.min.js",
                       "../../library/interaction/common.js",
                       "../interaction/main.js" )
    ),
    "admin"=>array( 
        "css" => array( "../style/base.css",
                        "../style/admin.css",
                        "../style/modal.css",
                        "../../external/style/jquery.wysiwyg.css" ),
        "js" => array( "../../external/interaction/jquery-1.3.2.min.js",
                       "../../external/interaction/jquery.wysiwyg.js",
                       "../../library/interaction/common.js",
                       "../interaction/modalWindow.js",
                       "../interaction/admin.js" )
    ),
    "preview"=>array( 
        "css" => array( "../style/text.css",
                        "../style/preview.css" )
    )
);
