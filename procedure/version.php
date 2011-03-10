<?php

class version extends data {
  protected $interpreters;

  /****************************************************************************/
  public static function getList() {
    $data = false;

    # set cache
    $cacheDocument = new cache( "getVersionList.js" );
    if( !$cacheDocument->loaded() ) {

      # Get version list
      $sql = "SELECT song.id as songId, version.id as versionId, song.name as songName, version.name as versionName FROM song, version WHERE version.songK = song.k ORDER BY songId, versionId;";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      if( mysql_num_rows( $result ) < 1 ) {
        return "Aucun item trouvé.";
      }

      # build version list
      $versionList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        $name = $item["songName"];
        if( $item["versionName"] ) {
          $name .= " - <em>" . $item["versionName"] . "</em>";
        }
        $id = $item["songId"];
        if( $item["versionId"] ) {
          $id .= "_" . $item["versionId"];
        }
        array_push( $versionList, array( id => $id, name => $name ) );
      }
      $data = json_encode( $versionList );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }


  /****************************************************************************/
  public static function getCheatList( $params = array() ) {
    $data = false;

    # build conditions
    $conditions = "";
    if( isset( $params["keyword"] ) && $params["keyword"] ) {
      $conditions .= "AND ( ( song.name LIKE '%" . $params["keyword"] . "%' ) "
                  .    "OR ( version.name LIKE '%" . $params["keyword"] . "%' ) "
                  .    "OR ( version.text LIKE '%" . $params["keyword"] . "%' ) ) ";
    }
    if( isset( $params["language"] ) && $params["language"] && ( $params["language"] != "all" ) ) {
      $conditions .= "AND song.language = '" . $params["language"] . "' ";
    }
    if( isset( $params["withChords"] ) && $params["withChords"] == "true" ) {
      $conditions .= "AND NOT ISNULL( version.cheat ) "
                   . "AND NOT version.cheat = '' ";
    }

    # get cheat list
    $sql = "SELECT song.id as songId,"
         .        "version.id as versionId,"
         .        "song.name as songName,"
         .        "version.name as versionName,"
         .        "version.cheat,"
         .        "song.language "
         . "FROM song, version "
         . "WHERE version.songK = song.k "
         . $conditions
         . "ORDER BY songId, versionId;";
    $result = DB::runSql( $sql );

    # build cheat list
    $cheatList = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      $name = $item["songName"];
      if( $item["versionName"] ) {
        $name .= " - <em>" . $item["versionName"] . "</em>";
      }
      $id = $item["songId"];
      if( $item["versionId"] ) {
        $id .= "_" . $item["versionId"];
      }
      array_push( $cheatList, array( id => $id, name => $name, cheat => $item["cheat"], language => $item["language"] ) );
    }
    $data = json_encode( $cheatList );
    return $data;
  }

  /****************************************************************************/
  public function __construct( $songK = false, $id = false ) {
    $this->resetInfo();
    if( $songK ) {
      $this->fields["songK"] = $songK;
    }
    if( $id !== false ) {
      $this->fields["id"] = $id;
      if( $songK ) {
        $this->loadInfo();
      }
    }
  }

  /****************************************************************************/
  public function exists( $id ) {
    $sql = "SELECT k FROM version WHERE id = '$id' AND songK = " . $this->fields["songK"] . ";";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function addInterpreter( $artistId ) {
    array_push( $this->interpreters, new interpreter( $this->fields["k"], $artistId, "version" ) );
    return $this->interpreters[count( $this->interpreters ) - 1];
  }

  /****************************************************************************/
  public function save() {
    $log = array();
    $date = date( "Y-m-d H:i:s" );
    if( isset( $this->fields["k"] ) && $this->fields["k"] ) {
      # update mode
      $setting = array( "modified = '$date'" );
      foreach( $this->fields as $key=>$field ) {
        if( $key != "k" ) {
          if( $key == "songK" ) {
            array_push( $setting, $key . " = $field" );
          } else {
            array_push( $setting, $key . " = '$field'" );
          }
        }
      }
      $sql = "UPDATE version SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
      $result = DB::runSql( $sql );
      array_push( $log, "Mise à jour de la version " . $this->fields["id"] );
    } else {
      # insert mode
      $sql = "INSERT INTO version ( id, name, songK, text, cheat, created, modified ) VALUES ( '" . $this->fields["id"] . "', '" . $this->fields["name"] . "', " . $this->fields["songK"] . ", '" . $this->fields["text"] . "', '" . $this->fields["cheat"] . "', '$date', '$date' );";
      $result = DB::runSql( $sql );
      array_push( $log, "Ajout de la version " . $this->fields["id"] );
      $this->loadInfo();
    }

    # interpreters
    $interpretersK = array();
    foreach( $this->interpreters as $interpreter ) {
      $interpreter->set( array( versionK=>$this->fields["k"] ) );
      array_push( $log, $interpreter->save() );
      array_push( $interpretersK, $interpreter->get( "k" ) );
    }
    $sql = "";
    if( count( $interpretersK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $interpretersK ) . " ) ";
    }
    $sql = "SELECT k FROM interpreter WHERE versionK=" . $this->fields["k"] . $sql . ";"; 
    $result = DB::runSql( $sql );
    while( $item = mysql_fetch_assoc( $result ) ) {
      $interpreter = new interpreter();
      $interpreter->load( $item["k"] );
      array_push( $log, $interpreter->delete() );
    }
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function resetInfo() {
    parent::resetInfo();
    $this->interpreters = array();
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $songK = $this->fields["songK"];
    $sql = "SELECT * FROM version WHERE id='$id' AND songK=$songK;";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "name", "songK", "text" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
      $this->fields["songK"] = $songK;
    }
  }
}
