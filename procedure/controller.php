<?php
if( substr_count( $_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip' ) ) {
  ob_start("ob_gzhandler");
} else {
  ob_start();
}
session_start();

include "config.php";
include "../../library/procedure/typeValidator.php";

$msg = "Mauvaise entrée";
$connected = isSessionConnected();
if( $action = isset( $_GET["action"] )? typeValidator::isAlphaNumeric( $_GET["action"] ): false ) {
  if( $action == "getHomeInfo" ) {
    $msg = getHomeInfo();
  } elseif( $action == "getSongList" ) {
    $msg = getSongList();
  } elseif( $action == "getSong" ) {
    $msg = getSong();
  } elseif( $action == "getVersionList" ) {
    $msg = getVersionList();
  } elseif( $action == "getArtistList" ) {
    $msg = getArtistList();
  } elseif( $action == "getArtist" ) {
    $msg = getArtist();
  } elseif( $action == "getAlbumList" ) {
    $msg = getAlbumList();
  } elseif( $action == "getAlbum" ) {
    $msg = getAlbum();
  } elseif( $action == "getCheatList" ) {
    $msg = getCheatList();
  } elseif( $action == "getDocumentList" ) {
    $msg = getDocumentList();
  } elseif( $action == "getDocument" ) {
    $msg = getDocument();
  } elseif( $action == "getThemeList" ) {
    $msg = getThemeList();
  } elseif( $action == "getTheme" ) {
    $msg = getTheme();
  }
} elseif( ( $action = isset( $_POST["action"] )? typeValidator::isAlphaNumeric( $_POST["action"] ): false ) ||
          $connected || $adminMode ) {
  if( $connected ) {
    if( $action == "logout" ) {
      $msg = logout( "Vous êtes maintenant déconnecté" );
    } elseif( $action == "cleanAll" ) {
      $msg = callCleanAll();
    } elseif( $action == "setSong" ) {
      $msg = setSong();
    } elseif( $action == "setArtist" ) {
      $msg = setArtist();
    } elseif( $action == "setAlbum" ) {
      $msg = setAlbum();
    } elseif( $action == "setDocument" ) {
      $msg = setDocument();
    } elseif( $action == "setTheme" ) {
      $msg = setTheme();
    } elseif( !$action || $action == "login" ) {
      $msg = displayForm();
    } else {
      $msg = logout( $msg );
    }
  } elseif( $adminMode ) {
    if( $action == "login" ) {
      $msg = login();
    } elseif( !$action ) {
      $msg = logout();
    } else {
      $msg = logout( $msg );
    }
  }
}

# show result
if( $msg ) {
  print $msg;
}
exit;

/******************************************************************************/
function login() {
  global $ADMDATA;
  $_SESSION["connected"] = "connected";
  if( ( $user = isset( $_POST["user"] )? typeValidator::isAlphaNumeric( $_POST["user"] ): false ) &&
      ( $user == $ADMDATA["user"] ) &&
      ( $password = isset( $_POST["password"] )? typeValidator::isAlphaNumeric( $_POST["password"] ): false ) &&
      ( $password == $ADMDATA["user"] ) ) {
    return displayForm();
  } else {
    return logout( "L'usager ou le mot de passe est incorrect." );
  }
}

/******************************************************************************/
function displayForm() {
  return str_replace( "###body###",
                      file_get_contents( "../template/editBody.html" ),
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function logout( $msg = "" ) {
  if( isset( $_SESSION["connected"] ) ) {
    $_SESSION["connected"] = false;
  }
  return str_replace( "###body###",
                      file_get_contents( "../../library/template/login.html" ) . $msg,
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function callCleanAll() {
  $includeList = array( "../../external/procedure/htmlmin.php",
                        "../../external/procedure/cssmin.php",
                        "../../external/procedure/jsmin.php",
                        "../../library/procedure/clean.php" );
  foreach( $includeList as $include ) {
    include $include;
  }
  return str_replace( "###body###",
                      cleanAll() . "<div class='button'><a href='admin.php'>Retour</a></div>",
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function setSong() {
  include "../../library/procedure/dbConnect.php";

  # get post
  $params = array();

  # songId, versionId
  foreach( array( "songId", "versionId" ) as $post ) {
    $clean = "";
    if( isset( $_POST[$post] ) &&
        ( typeValidator::isEmpty( $_POST[$post] ) ||
          $clean = typeValidator::isSingleId( $_POST[$post] ) ) ) {
      $params[$post] = $clean;
    } else {
      return "Mauvaise entrée $post";
    }
  }

  # newSongId
  $clean = "";
  if( isset( $_POST["newSongId"] ) &&
      strlen( $_POST["newSongId"] ) <= 255 &&
      $clean = typeValidator::isSingleId( $_POST["newSongId"] ) ) {
    $params["newSongId"] = $clean;
  } else {
    return "Champ Id de chanson vide ou non valide";
  }

  # songName
  $clean = "";
  if( isset( $_POST["songName"] ) &&
      strlen( $_POST["songName"] ) <= 255 &&
      $clean = trim( $_POST["songName"] ) ) {
    $params["songName"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Titre de chanson vide ou non valide";
  }

  # language, mode
  foreach( array( "language", "mode" ) as $post ) {
    $clean = "";
    if( isset( $_POST[$post] ) &&
        $clean = typeValidator::isSingleId( $_POST[$post] ) ) {
      $params[$post] = $clean;
    } else {
      return "Mauvaise entrée $post";
    }
  }

  # newVersionId
  $clean = "";
  if( isset( $_POST["newVersionId"] ) &&
      strlen( $_POST["newVersionId"] ) <= 255 &&
      ( typeValidator::isEmpty( $_POST["newVersionId"] ) ||
        $clean = typeValidator::isSingleId( $_POST["newVersionId"] ) ) ) {
    $params["newVersionId"] = $clean;
  } else {
    return "Champ Id de version vide ou non valide";
  }

  # versionName
  $clean = "";
  if( isset( $_POST["versionName"] ) &&
      strlen( $_POST["versionName"] ) <= 255 &&
      ( typeValidator::isEmpty( $_POST["versionName"] ) ||
        $clean = trim( $_POST["versionName"] ) ) ) {
    $params["versionName"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Titre de version non valide";
  }

  # text
  $clean = "";
  if( isset( $_POST["text"] ) && $clean = $_POST["text"] ) {
    $params["text"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Texte vide";
  }

  # cheat
  if( isset( $_POST["cheat"] ) ) {
    $params["cheat"] = ( $_POST["cheat"]? DB::mysql_prep( $_POST["cheat"] ): "" );
  } else {
    return "Mauvaise entrée cheat";
  }

  # composerList, #typeList
  foreach( array( "composer", "type" ) as $post ) {
    $params[$post . "List"] = ( isset( $_POST[$post] ) && is_array( $_POST[$post] ) )? $_POST[$post]: false;  
  }

  # interpreterList
  if( isset( $_POST["interpreter"] ) && is_array( $_POST["interpreter"] ) ) {
    $interpreterList = array();
    foreach( $_POST["interpreter"] as $interpreterId ) {
      $interpreterItem = array( id => $interpreterId );
      $album = "album_" . $interpreterId;
      if( isset( $_POST[$album] ) && is_array( $_POST[$album] ) ) {
        $trackList = array();
        foreach( $_POST[$album] as $trackId ) {
          array_push( $trackList, $trackId );
        }
        $interpreterItem["trackList"] = $trackList;
      } else {
        $interpreterItem["trackList"] = false;
      }
      array_push( $interpreterList, $interpreterItem );
    }
    $params["interpreterList"] = $interpreterList;
  } else {
    $params["interpreterList"] = false;
  }

  # get include
  $includeList = array( "data.php",
                        "song.php",
                        "version.php",
                        "artist.php",
                        "composer.php",
                        "interpreter.php",
                        "album.php",
                        "track.php",
                        "../../library/procedure/clean.php" );
  foreach( $includeList as $include ) {
    include $include;
  }

  # setting
  $song = new song( $params["songId"] );
  if( $params["songId"] != $params["newSongId"] ) {
    # id already exists
    if( $song->exists( $params["newSongId"] ) ) {
      return "Id de chanson déjà utilisé.";
    }
    $song->set( array( id => $params["newSongId"] ) );
  }
  $song->set( array( name => $params["songName"], language => $params["language"] ) );

  # valid version id
  $version = $song->addVersion( $params["versionId"] );
  if( ( $params["versionId"] != $params["newVersionId"] ) && $song->get( "k" ) ) {
    # id already exists
    if( $version->exists( $params["newVersionId"] ) ) {
      return "Id de version déjà utilisé pour cette chanson.";
    }
    $version->set( array( id => $params["newVersionId"] ) );
  }
  $version->set( array( name => $params["versionName"], text => $params["text"], cheat => $params["cheat"] ) );

  # set version mode
  if( $params["mode"] == "add" ) {
    $version->set( array( k => false ) );
  }

  # composer list
  if( $params["composerList"] ) {
    foreach( $params["composerList"] as $key => $composerId ) {
      $composer = $song->addComposer( $composerId );
      $composer->set( array( type => $params["typeList"][$key] ) );
    }
  }

  # interpreter list
  if( $params["interpreterList"] ) {
    foreach( $params["interpreterList"] as $interpreterItem ) {
      $interpreter = $version->addInterpreter( $interpreterItem["id"] );

      # track list
      if( $interpreterItem["trackList"] ) {
        foreach( $interpreterItem["trackList"] as $trackId ) {
          $interpreter->addTrack( $trackId );
        }
      }
    }
  }

  return str_replace( "###body###",
                      $song->save()
                      . "<br />" . clearCache() . "<div class='button'><a href='admin.php'>Retour</a></div>",
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function setArtist() {
  include "../../library/procedure/dbConnect.php";

  # get post
  $params = array();

  # artistId
  $clean = "";
  if( isset( $_POST["artistId"] ) &&
      ( typeValidator::isEmpty( $_POST["artistId"] ) ||
        $clean = typeValidator::isSingleId( $_POST["artistId"] ) ) ) {
    $params["artistId"] = $clean;
  } else {
    return "Mauvaise entrée artistId";
  }

  # newArtistId
  $clean = "";
  if( isset( $_POST["newArtistId"] ) &&
      strlen( $_POST["newArtistId"] ) <= 255 &&
      $clean = typeValidator::isSingleId( $_POST["newArtistId"] ) ) {
    $params["newArtistId"] = $clean;
  } else {
    return "Champ Id d'artiste vide ou non valide";
  }

  # artistName
  $clean = "";
  if( isset( $_POST["artistName"] ) &&
      strlen( $_POST["artistName"] ) <= 255 &&
      $clean = trim( $_POST["artistName"] ) ) {
    $params["artistName"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Nom d'artiste vide ou non valide";
  }

  # origin
  $clean = "";
  if( isset( $_POST["origin"] ) &&
      $clean = typeValidator::isSingleId( $_POST["origin"] ) ) {
    $params["origin"] = $clean;
  } else {
    return "Mauvaise entrée origin";
  }

  # memberList, groupList, compositionList, #typeList
  foreach( array( "member", "group", "composition", "type" ) as $post ) {
    $params[$post . "List"] = ( isset( $_POST[$post] ) && is_array( $_POST[$post] ) )? $_POST[$post]: false;  
  }

  # interpretationList
  if( isset( $_POST["interpretation"] ) && is_array( $_POST["interpretation"] ) ) {
    $interpretationList = array();
    foreach( $_POST["interpretation"] as $interpretationId ) {
      $interpretationItem = array( id => $interpretationId );
      $album = "album_" . $interpretationId;
      if( isset( $_POST[$album] ) && is_array( $_POST[$album] ) ) {
        $trackList = array();
        foreach( $_POST[$album] as $trackId ) {
          array_push( $trackList, $trackId );
        }
        $interpretationItem["trackList"] = $trackList;
      } else {
        $interpretationItem["trackList"] = false;
      }
      array_push( $interpretationList, $interpretationItem );
    }
    $params["interpretationList"] = $interpretationList;
  } else {
    $params["interpretationList"] = false;
  }

  # get include
  $includeList = array( "data.php",
                        "artist.php",
                        "member.php",
                        "song.php",
                        "composer.php",
                        "version.php",
                        "interpreter.php",
                        "album.php",
                        "track.php",
                        "../../library/procedure/clean.php" );
  foreach( $includeList as $include ) {
    include $include;
  }

  # setting
  $artist = new artist( $params["artistId"] );
  if( $params["artistId"] != $params["newArtistId"] ) {
    # id already exists
    if( $artist->exists( $params["newArtistId"] ) ) {
      return "Id d'artiste déjà utilisé.";
    }
    $artist->set( array( id => $params["newArtistId"] ) );
  }
  $artist->set( array( name => $params["artistName"], origin => $params["origin"] ) );

  # member list
  if( $params["memberList"] ) {
    foreach( $params["memberList"] as $memberId ) {
      $member = $artist->addMember( $memberId );
    }
  }

  # group list
  if( $params["groupList"] ) {
    foreach( $params["groupList"] as $groupId ) {
      $group = $artist->addGroup( $groupId );
    }
  }

  # composition list
  if( $params["compositionList"] ) {
    foreach( $params["compositionList"] as $key => $compositionId ) {
      $composition = $artist->addComposition( $compositionId );
      $composition->set( array( type => $params["typeList"][$key] ) );
    }
  }

  # interpretation list
  if( $params["interpretationList"] ) {
    foreach( $params["interpretationList"] as $interpretationItem ) {
      $interpretation = $artist->addinterpretation( $interpretationItem["id"] );

      # track list
      if( $interpretationItem["trackList"] ) {
        foreach( $interpretationItem["trackList"] as $trackId ) {
          $interpretation->addTrack( $trackId );
        }
      }
    }
  }

  return str_replace( "###body###",
                      $artist->save() . "<br />" . clearCache() . "<div class='button'><a href='admin.php'>Retour</a></div>",
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function setAlbum() {
  include "../../library/procedure/dbConnect.php";

  # get post
  $params = array();

  # albumId
  $clean = "";
  if( isset( $_POST["albumId"] ) &&
      ( typeValidator::isEmpty( $_POST["albumId"] ) ||
        $clean = typeValidator::isSingleId( $_POST["albumId"] ) ) ) {
    $params["albumId"] = $clean;
  } else {
    return "Mauvaise entrée albumId";
  }

  # newAlbumId
  $clean = "";
  if( isset( $_POST["newAlbumId"] ) &&
      strlen( $_POST["newAlbumId"] ) <= 255 &&
      $clean = typeValidator::isSingleId( $_POST["newAlbumId"] ) ) {
    $params["newAlbumId"] = $clean;
  } else {
    return "Champ Id d'album vide ou non valide";
  }

  # albumName
  $clean = "";
  if( isset( $_POST["albumName"] ) &&
      strlen( $_POST["albumName"] ) <= 255 &&
      $clean = trim( $_POST["albumName"] ) ) {
    $params["albumName"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Nom d'album vide ou non valide";
  }

  # year
  $clean = "";
  if( isset( $_POST["year"] ) &&
      $clean = typeValidator::isYear( $_POST["year"] ) ) {
    $params["year"] = $clean;
  } else {
    return "Mauvaise entrée year";
  }

  # get include
  $includeList = array( "data.php",
                        "album.php",
                        "../../library/procedure/clean.php" );
  foreach( $includeList as $include ) {
    include $include;
  }

  # setting
  $album = new album( $params["albumId"] );
  if( $params["albumId"] != $params["newAlbumId"] ) {
    # id already exists
    if( $album->exists( $params["newAlbumId"] ) ) {
      return "Id d'album déjà utilisé.";
    }
    $album->set( array( id => $params["newAlbumId"] ) );
  }
  $album->set( array( name => $params["albumName"], year => $params["year"] ) );

  return str_replace( "###body###",
                      $album->save() . "<br />" . clearCache() . "<div class='button'><a href='admin.php'>Retour</a></div>",
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function setDocument() {
  include "../../library/procedure/dbConnect.php";

  # get post
  $params = array();

  # documentId
  $clean = "";
  if( isset( $_POST["documentId"] ) &&
      ( typeValidator::isEmpty( $_POST["documentId"] ) ||
        $clean = typeValidator::isSingleId( $_POST["documentId"] ) ) ) {
    $params["documentId"] = $clean;
  } else {
    return "Mauvaise entrée documentId";
  }

  # newDocumentId
  $clean = "";
  if( isset( $_POST["newDocumentId"] ) &&
      strlen( $_POST["newDocumentId"] ) <= 255 &&
      $clean = typeValidator::isSingleId( $_POST["newDocumentId"] ) ) {
    $params["newDocumentId"] = $clean;
  } else {
    return "Champ Id de document vide ou non valide";
  }

  # documentTitle
  $clean = "";
  if( isset( $_POST["documentTitle"] ) &&
      strlen( $_POST["documentTitle"] ) <= 255 &&
      $clean = trim( $_POST["documentTitle"] ) ) {
    $params["documentTitle"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Titre de document vide ou non valide";
  }

  # content
  $clean = "";
  if( isset( $_POST["content"] ) && $clean = $_POST["content"] ) {
    $params["content"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Contenu vide";
  }

  # get include
  $includeList = array( "data.php",
                        "document.php",
                        "../../library/procedure/clean.php" );
  foreach( $includeList as $include ) {
    include $include;
  }

  # setting
  $document = new document( $params["documentId"] );
  if( $params["documentId"] != $params["newDocumentId"] ) {
    # id already exists
    if( $document->exists( $params["newDocumentId"] ) ) {
      return "Id de document déjà utilisé.";
    }
    $document->set( array( id => $params["newDocumentId"] ) );
  }
  $document->set( array( title => $params["documentTitle"], content => $params["content"] ) );

  return str_replace( "###body###",
                      $document->save() . "<br />" . clearCache() . "<div class='button'><a href='admin.php'>Retour</a></div>",
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function setTheme() {
  include "../../library/procedure/dbConnect.php";

  # get post
  $params = array();

  # themeId
  $clean = "";
  if( isset( $_POST["themeId"] ) &&
      ( typeValidator::isEmpty( $_POST["themeId"] ) ||
        $clean = typeValidator::isSingleId( $_POST["themeId"] ) ) ) {
    $params["themeId"] = $clean;
  } else {
    return "Mauvaise entrée themeId";
  }

  # newThemeId
  $clean = "";
  if( isset( $_POST["newThemeId"] ) &&
      strlen( $_POST["newThemeId"] ) <= 255 &&
      $clean = typeValidator::isSingleId( $_POST["newThemeId"] ) ) {
    $params["newThemeId"] = $clean;
  } else {
    return "Champ Id de thème vide ou non valide";
  }

  # themeName
  $clean = "";
  if( isset( $_POST["themeName"] ) &&
      strlen( $_POST["themeName"] ) <= 255 &&
      $clean = trim( $_POST["themeName"] ) ) {
    $params["themeName"] = ( $clean? DB::mysql_prep( $clean ): "" );
  } else {
    return "Champ Nom de thème vide ou non valide";
  }

  # category
  $params["categoryList"] = ( isset( $_POST["category"] ) && is_array( $_POST["category"] ) )? $_POST["category"]: false;  

  # get include
  $includeList = array( "data.php",
                        "theme.php",
                        "category.php",
                        "song.php",
                        "../../library/procedure/clean.php" );
  foreach( $includeList as $include ) {
    include $include;
  }

  # setting
  $theme = new theme( $params["themeId"] );
  if( $params["themeId"] != $params["newThemeId"] ) {
    # id already exists
    if( $theme->exists( $params["newThemeId"] ) ) {
      return "Id de thème déjà utilisé.";
    }
    $theme->set( array( id => $params["newThemeId"] ) );
  }
  $theme->set( array( name => $params["themeName"] ) );

  # category list
  if( $params["categoryList"] ) {
    foreach( $params["categoryList"] as $key => $categoryId ) {
      $category = $theme->addCategory( $categoryId );
    }
  }
  return str_replace( "###body###",
                      $theme->save() . "<br />" . clearCache() . "<div class='button'><a href='admin.php'>Retour</a></div>",
                      file_get_contents( "../../library/template/admin.html" ) );
}

/******************************************************************************/
function getSongList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "song.php" );
  if( isset( $_GET["artistId"] ) ) {
    if( $artistId = typeValidator::isAlphaNumeric( $_GET["artistId"] ) ) {
      foreach( $includeList as $include ) {
        include $include;
      }
      return song::getList( $artistId, "artist" );
    }
    return "Mauvaise entrée";
  } elseif( isset( $_GET["themeId"] ) ) {
    if( $themeId = typeValidator::isAlphaNumeric( $_GET["themeId"] ) ) {
      foreach( $includeList as $include ) {
        include $include;
      }
      return song::getList( $themeId, "theme" );
    }
    return "Mauvaise entrée";
  }
  foreach( $includeList as $include ) {
    include $include;
  }
  return song::getList();
}

/******************************************************************************/
function getVersionList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "version.php" );
    foreach( $includeList as $include ) {
      include $include;
    }
    return version::getList();
}

/******************************************************************************/
function getHomeInfo() {
  $includeList = array( "../../library/procedure/dbConnect.php",
                        "data.php",
                        "song.php" );
  foreach( $includeList as $include ) {
    include $include;
  }
  return song::getHome();
}

/******************************************************************************/
function getSong() {
  if( $id = isset( $_GET["id"] )? typeValidator::isId( $_GET["id"] ): false ) {
    $mark = isset( $_GET['mark'] )? $_GET['mark']: false;
    if( !typeValidator::isBoolean( $mark ) ) {
      return "Mauvaise entrée";
    }
    $includeList = array( "../../library/procedure/cache.php",
                          "../../library/procedure/dbConnect.php",
                          "data.php",
                          "song.php" );
    foreach( $includeList as $include ) {
      include $include;
    }
    return song::getDetail( $id, $mark );
  }
  return "Mauvais identifiant";
}

/******************************************************************************/
function getArtist() {
  if( $id = isset( $_GET["id"] )? typeValidator::isSingleId( $_GET["id"] ): false ) {
    $includeList = array( "../../library/procedure/dbConnect.php",
                          "data.php",
                          "artist.php" );
    foreach( $includeList as $include ) {
      include $include;
    }
    return artist::getDetail( $id );
  }
  return "Mauvais identifiant";
}

/******************************************************************************/
function getArtistList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "artist.php" );
  if( isset( $_GET["mode"] ) ) {
    if( $mode = typeValidator::isAlphaNumeric( $_GET["mode"] ) ) {
      foreach( $includeList as $include ) {
        include $include;
      }
      return artist::getList( $mode );
    }
    return "Mauvaise entrée";
  }
  foreach( $includeList as $include ) {
    include $include;
  }
  return artist::getList();
}

/******************************************************************************/
function getAlbum() {
  if( $id = isset( $_GET["id"] )? typeValidator::isSingleId( $_GET["id"] ): false ) {
    $includeList = array( "../../library/procedure/dbConnect.php",
                          "data.php",
                          "album.php" );
    foreach( $includeList as $include ) {
      include $include;
    }
    return album::getDetail( $id );
  }
  return "Mauvais identifiant";
}

/******************************************************************************/
function getAlbumList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "album.php" );
  foreach( $includeList as $include ) {
    include $include;
  }
  return album::getList();
}

/******************************************************************************/
function getCheatList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "version.php" );
  foreach( $includeList as $include ) {
    include $include;
  }

  $params = array();

  # keyword
  if( isset( $_GET["keyword"] ) ) {
    $params["keyword"] = ( $_GET["keyword"]? DB::mysql_prep( $_GET["keyword"] ): "" );
  }

  # language
  $clean = "";
  if( isset( $_GET["language"] ) ) {
    if( $clean = typeValidator::isSingleId( $_GET["language"] ) ) {
      $params["language"] = $clean;
    } else {
      return "Mauvaise entrée language";
    }
  }

  # with chords
  if( isset( $_GET["withChords"] ) ) {
    if( typeValidator::isBoolean( $_GET["withChords"] ) ) {
      $params["withChords"] = $_GET["withChords"];
    } else {
      return "Mauvaise entrée withChords";
    }
  }

  return version::getCheatList( $params );
}

/******************************************************************************/
function getDocumentList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "document.php" );
  foreach( $includeList as $include ) {
    include $include;
  }
  return document::getList();
}

/******************************************************************************/
function getDocument() {
  if( $id = isset( $_GET["id"] )? typeValidator::isSingleId( $_GET["id"] ): false ) {
    $includeList = array( "../../library/procedure/cache.php",
                          "../../library/procedure/dbConnect.php",
                          "data.php",
                          "document.php" );
    foreach( $includeList as $include ) {
      include $include;
    }
    return document::getDetail( $id );
  }
  return "Mauvais identifiant";
}

/******************************************************************************/
function getThemeList() {
  $includeList = array( "../../library/procedure/cache.php",
                        "../../library/procedure/dbConnect.php",
                        "data.php",
                        "theme.php" );
  foreach( $includeList as $include ) {
    include $include;
  }
  return theme::getList();
}

/******************************************************************************/
function getTheme() {
  if( $id = isset( $_GET["id"] )? typeValidator::isSingleId( $_GET["id"] ): false ) {
    $includeList = array( "../../library/procedure/dbConnect.php",
                          "data.php",
                          "theme.php" );
    foreach( $includeList as $include ) {
      include $include;
    }
    return theme::getDetail( $id );
  }
  return "Mauvais identifiant";
}

/****************************************************************************/
function isSessionConnected() {
  if( isset( $_SESSION["connected"] )? $_SESSION["connected"]: false ) {
    setcookie( "connected", true, time() + 3600 );
    return true;
  }
  if( isset( $_COOKIE["connected"] )? $_COOKIE["connected"]: false ) {
    $_SESSION["connected"] = true;
    setcookie( "connected", true, time() + 3600 );
    return true;
  }
  return false;
}
