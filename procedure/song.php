<?php

class song extends data {
  protected $versions;
  protected $composers;

  /****************************************************************************/
  public static function getList( $id = "", $mode = "" ) {
    header( 'Content-Type: application/json; charset=UTF-8' );
    $data = false;

    # set cache
    $cacheFile = "getSongList";
    if( $id ) {
      if( $mode ) {
        $cacheFile .= "#" . $mode . "_" . $id;
      }
    }
    $cacheDocument = new cache( $cacheFile . ".js" );
    if( !$cacheDocument->loaded() ) {

      # get main song list
      $fieldCommon = "song.k, song.id, song.name, IF( NOT ISNULL( language ), language, IF( NOT language = '', language, 'fr' ) ) as language, COUNT( version.id ) AS qtyVersion";
      $tableCommon = "song, version";
      $conditionCommon = "version.songK = song.k";
      if( $id && $mode ) {
          if( $mode == "artist" ) {
            $sql = "SELECT $fieldCommon FROM $tableCommon, interpreter, artist WHERE $conditionCommon AND interpreter.versionK = version.k AND artist.k = interpreter.artistK AND artist.id = '$id' GROUP BY song.id;";
          } elseif( $mode == "theme" ) {
            $sql = "SELECT $fieldCommon FROM $tableCommon, category, theme WHERE $conditionCommon AND category.songK = song.k AND theme.k = category.themeK AND theme.id = '$id' GROUP BY song.id;";
          }
      } else {
          $sql = "SELECT $fieldCommon FROM $tableCommon WHERE $conditionCommon GROUP BY song.id;";
      }
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      if( mysql_num_rows( $result ) < 1 ) {
        return "Aucun item trouvé.";
      }

      # build song list
      $songList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        $songItem = array( id       => $item["id"],
                           name     => $item["name"],
                           language => $item["language"] );
        if( $item["qtyVersion"] > 1 ) {
          $sql = "SELECT id, name FROM version WHERE songK = " . $item["k"] . " ORDER BY id";
          if( !$subResult = DB::runSql( $sql ) ) {
            return "Problème de connection à la base de donnée.";
          }
          $versionList = array();
          while( $subItem = mysql_fetch_assoc( $subResult ) ) {
            $versionItem = array( id => $subItem["id"],
                                  name => $subItem["name"] );
            array_push( $versionList, $versionItem );
          }
          $songItem["version"] = $versionList;
        }
        array_push( $songList, $songItem );
      }
      $data = json_encode( $songList );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }

  /****************************************************************************/
  public static function buildList( $id = "", $mode = "" ) {
    return self::prepareList( json_decode( self::getList( $id, $mode ), 1 ) );
  }

  /****************************************************************************/
  protected static function prepareList( $list ) {
    $songList = array();
    foreach( $list as $song ) {
      $html = $song["id"] . "' class='";
      $songList[] =
      $html . ( isset( $song["version"] )?
                self::buildVersionList( $song ):
                self::buildSong( $song ) );
    }
    return "<li id='" . join( "</li><li id='", $songList ) . "</li>";
  }
  
  /****************************************************************************/
  protected static function buildVersionList( $song ) {
    $itemId = $song["id"];
    $html = "versionList plus"
          . ( is_numeric( substr( $itemId, 0, 1 ) )? " numeric": "" )
          . "'><a name='$itemId' class='documentTitle'>{$song['name']}</a><ul id='version_$itemId' class='collapsed'><li id='";
    $versionList = array();
    $versions = is_array( $song["version"] )? $song["version"]: array( $song["version"] );
    foreach( $versions as $version ) {
      $versionList[] = self::buildVersion( $version, $song );
    }
    $html .= join( "</li><li id='", $versionList );
    return $html . "</li></ul>";
  }

  /****************************************************************************/
  protected static function buildSong( $song ) {
    $itemId = $song["id"];
    return "song {$song['language']}"
         . ( is_numeric( substr( $itemId, 0, 1 ) ) ? " numeric" : "" )
         . "'><a name='{$song['id']}' class='documentTitle'>{$song['name']}</a>";
  }

  /****************************************************************************/
  protected static function buildVersion( $version, $song ) {
    $documentName = $song["id"] . "_" . $version["id"];
    return $documentName . "' class='" . self::buildSong( array(
      "id" => $documentName,
      "name" => $version["name"],
      "artist" => $version["artist"],
      "language" => $song["language"]
    ) );
  }
  
  /****************************************************************************/
  public static function getHome() {
    header( 'Content-Type: application/json; charset=UTF-8' );
    return json_encode( self::prepareHome() );
  }

  /****************************************************************************/
  public static function buildHome() {
    $home = self::prepareHome();
    $homeList = array();
    foreach( $home as $key => $list ) {
      $homeList[$key] = self::prepareList( $list );
    }
    return $homeList;
  }
  
  /****************************************************************************/
  private static function prepareHome() {
      $infoList = array();

    # get added song list
$sql = self::buildHomeSql( "created" );
    $result = DB::runSql( $sql );
    if( !$result ) {
      return "Problème de connexion à la base de données.$sql";
    }
    $buildedInfo = self::buildSongList( $result, array() );
    $infoList["lastAdded"] = $buildedInfo[0];
    $excludedK = $buildedInfo[1];

    #get modified song list
    $sql = "";
    if( count( $excludedK ) ) {
      $sql = "AND NOT version.k IN ( " . join( ", ", $excludedK ) . " ) ";
    }
$sql = self::buildHomeSql( "modified", $sql );
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.$sql";
    }
    $buildedInfo = self::buildSongList( $result, $excludedK );
    $infoList["lastModified"] = $buildedInfo[0];
    $excludedK = $buildedInfo[1];

    #get viewed song list
    $sql = "";
    if( count( $excludedK ) ) {
      $sql = "AND NOT version.k IN ( " . join( ", ", $excludedK ) . " ) ";
    }
$sql = self::buildHomeSql( "visited", $sql );
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.$sql";
    }
    $buildedInfo = self::buildSongList( $result, $excludedK );
    $infoList["lastViewed"] = $buildedInfo[0];
    $excludedK = $buildedInfo[1];

    #get popular song list
    $sql = "";
    if( count( $excludedK ) ) {
      $sql = "AND NOT version.k IN ( " . join( ", ", $excludedK ) . " ) ";
    }
$sql = self::buildHomeSql( "visitQty", $sql );
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.$sql";
    }
    $buildedInfo = self::buildSongList( $result, $excludedK );
    $infoList["mostVisited"] = $buildedInfo[0];
    
    return $infoList;
  }
  
  
  /****************************************************************************/
  private static function buildHomeSql( $field, $excluded = "" ) {
    $sqlInterpreterExists = "SELECT versionK FROM interpreter WHERE versionK = version.k";
    $sqlArtistName = "SELECT artist.name FROM artist, interpreter WHERE artist.k = interpreter.artistK AND interpreter.versionK = version.k LIMIT 0, 1";
    return   "SELECT version.k, song.id as songId, version.id as versionId, song.name as songName, version.name as versionName, song.language, "
           .        "IF( version.k IN ( $sqlInterpreterExists ), ( $sqlArtistName ), '' ) as artistName "
           . "FROM song, version "
           . "WHERE version.songK = song.k "
           . "AND NOT ISNULL( version.$field ) "
           . $excluded
           . "ORDER BY version.$field DESC "
           . "LIMIT 0, 10;";
  }

  /****************************************************************************/
  private static function buildSongList( $result, $excludedK ) {
    $info = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      $name = $item["songName"];
      if( $item["versionName"] ) {
        $name .= " - <em>" . $item["versionName"] . "</em>";
      }
      if( $item["artistName"] ) {
        $name .= " - <strong>" . $item["artistName"] . "</strong>";
      }
      $id = $item["songId"];
      if( $item["versionId"] ) {
        $id .= "_" . $item["versionId"];
      }
      array_push( $info, array( id       => $id,
                                name     => $name,
                                language => $item["language"] ) );
      array_push( $excludedK, $item["k"] );
    }
    return array( $info, $excludedK );
  }

  /****************************************************************************/
  public static function getDetail( $id, $mark ) {
    # set cache
    $cacheFile = "getSong";
    if( $id ) {
      $cacheFile .= "#id_" . $id;
    }
    $cacheFile .= ".js";
    $cacheDocument = new cache( $cacheFile );

    # get id
    $list = explode( "_", $id );
    $songId = $list[0];
    $versionId = isset( $list[1] )? $list[1]: "";

    if( !$cacheDocument->loaded() ) {

      # get text
      $sql = "SELECT version.id, version.name, version.cheat, version.text, version.k as versionK, song.k as songK, song.language "
           . "FROM song, version "
           . "WHERE song.id = '$songId' "
           . "AND song.k = version.songK "
           . "AND version.id = '$versionId';";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      if( $item = mysql_fetch_assoc( $result ) ) {
        $songItem = array( versionId   => $item["id"],
                           versionName => $item["name"],
                           text        => $item["text"],
                           cheat       => ( $item["cheat"] )? $item["cheat"]: "",
                           language    => $item["language"] );
        $versionK = $item["versionK"];
        $songK = $item["songK"];
      } else {
        return "Enregistrement non trouvé.";
      }

      # get interpreter
      $sqlTrack = "SELECT interpreterK FROM track WHERE interpreterK = interpreter.k";
      $sqlYear = "SELECT album.year FROM album, track WHERE album.k = track.albumK AND interpreterK = interpreter.k ORDER BY album.year LIMIT 0, 1";
      $sql = "SELECT artist.id, artist.name, interpreter.k, "
          .         "IF( interpreter.k IN ( $sqlTrack ), ( $sqlYear ), 9999 ) as year "
           . "FROM artist, interpreter "
           . "WHERE interpreter.versionK = $versionK "
           . "AND artist.k = interpreter.artistK "
           . "ORDER BY year, artist.id;";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.$sql";
      }
      $artistList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        $artistItem = array( id   => $item["id"],
                             name => $item["name"] );
        $interpreterK = $item["k"];

        # get album
        $sql = "SELECT album.id, album.name, album.year "
             . "FROM album, track "
             . "WHERE track.interpreterK = $interpreterK "
             . "AND album.k = track.albumK "
             . "ORDER BY album.year;";
        if( !$subResult = DB::runSql( $sql ) ) {
          return "Problème de connexion à la base de données.";
        }
        $albumList = array();
        while( $subItem = mysql_fetch_assoc( $subResult ) ) {
          array_push( $albumList, array( id   => $subItem["id"],
                                         name => $subItem["name"],
                                         year => $subItem["year"] ) );
        }
        if( count( $albumList ) ) {
          $artistItem["album"] = $albumList;
        }
        array_push( $artistList, $artistItem );
      }
      if( count( $artistList ) ) {
        $songItem["interpreter"] = $artistList;
      }

      # get composer
      $sql = "SELECT artist.id, artist.name, composer.type "
           . "FROM artist, composer "
           . "WHERE composer.songK = $songK "
           . "AND artist.k = composer.artistK "
           . "ORDER BY composer.type;";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      $composerList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        array_push( $composerList, array( id   => $item["id"],
                                          name => $item["name"],
                                          type => $item["type"] ) );
      }
      if( count( $composerList ) ) {
        $songItem["composer"] = $composerList;
      }
      $data = json_encode( $songItem );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }

    # mark
    if( $mark ) {
      $sql = "SELECT version.k, visitQty "
           . "FROM song, version "
           . "WHERE song.id = '$songId' "
           . "AND song.k = version.songK "
           . "AND version.id = '$versionId';";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      if( $item = mysql_fetch_assoc( $result ) ) {
        $k = $item["k"];
        $visitQty = $item["visitQty"] + 1;
        $sql = "UPDATE version SET visited='" . date( "Y-m-d H:i:s" ) . "', visitQty=$visitQty WHERE k=$k;";
        if( !$result = DB::runSql( $sql ) ) {
          return "Problème de connexion à la base de données.";
        }
      }
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }

  /****************************************************************************/
  public function __construct( $id = false ) {
    $this->resetInfo();
    if( $id ) {
      $this->fields["id"] = $id;
      $this->loadInfo();
    }
  }

  /****************************************************************************/
  public function exists( $id ) {
    $sql = "SELECT k FROM song WHERE id='$id';";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function addVersion( $versionId ) {
    array_push( $this->versions, new version( $this->fields["k"], $versionId ) );
    return $this->versions[count( $this->versions ) - 1];
  }

  /****************************************************************************/
  public function addComposer( $artistId ) {
    array_push( $this->composers, new composer( $this->fields["k"], $artistId, "song" ) );
    return $this->composers[count( $this->composers ) - 1];
  }

  /****************************************************************************/
  public function save() {
    $log = array();
    if( isset( $this->fields["k"] ) && $this->fields["k"] ) {
      # update mode
      $setting = array();
      foreach( $this->fields as $key => $field ) {
        if( $key != "k" ) {
          array_push( $setting, $key . " = '$field'" );
        }
      }
      if( count( $setting ) ) {
        $sql = "UPDATE song SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
        if( !$result = DB::runSql( $sql ) ) {
          return "Problème de connexion à la base de données.$sql";
        }
        array_push( $log, "Mise à jour de la chanson " . $this->fields["id"] );
      }
    } else {
      # insert mode
      $sql = "INSERT INTO song ( id, name, language ) VALUES ( '" . $this->fields["id"] . "', '" . $this->fields["name"] . "', '" . $this->fields["language"] . "' );";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.$sql";
      }
      array_push( $log, "Insertion de la chanson " . $this->fields["id"] );
      $this->loadInfo();
    }

    # versions
    foreach( $this->versions as $version ) {
      $version->set( array( songK => $this->fields["k"] ) );
      array_push( $log, $version->save() );
    }

    # composers
    $composersK = array();
    foreach( $this->composers as $composer ) {
      $composer->set( array( songK => $this->fields["k"] ) );
      array_push( $log, $composer->save() );
      array_push( $composersK, $composer->get( "k" ) );
    }
    $sql = "";
    if( count( $composersK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $composersK ) . " ) ";
    }
    $sql = "DELETE FROM composer WHERE songK=" . $this->fields["k"] . $sql . ";"; 
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.$sql<br />";
    }
    array_push( $log, "Suppression des compositeurs n'étant plus dans la liste" );
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function resetInfo() {
    parent::resetInfo();
    $this->versions  = array();
    $this->composers = array();
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $sql = "SELECT * FROM song WHERE id='$id';";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "name", "language" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
    }
  }
}
