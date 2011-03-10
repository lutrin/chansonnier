<?php

class album extends data {
  /****************************************************************************/
  public static function getList() {
    $data = false;

    # set cache
    $cacheDocument = new cache( "getAlbumList.js" );
    if( !$cacheDocument->loaded() ) {

      # Get album list
      $sql = "SELECT id, name FROM album ORDER BY id;";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.";
      }
      if( mysql_num_rows( $result ) < 1 ) {
        return "Aucun item trouvé.";
      }

      # build album list
      $albumList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        array_push( $albumList, array( id   => $item["id"],
                                       name => $item["name"] ) );
      }
      $data = json_encode( $albumList );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }

  /****************************************************************************/
  public static function getDetail( $id ) {

    # get album
    $sql = "SELECT year FROM album WHERE id = '$id';";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connection à la base de données.{album}";
    }
    if( $item = mysql_fetch_assoc( $result ) ) {
      $albumItem = array( year => $item["year"] );
    } else {
      return "Enregistrement non trouvé.";
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return json_encode( $albumItem );
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
    $sql = "SELECT k FROM album WHERE id='$id';";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function save() {
    if( isset( $this->fields["k"] ) && $this->fields["k"] ) {
      # update mode
      $setting = array();
      foreach( $this->fields as $key=>$field ) {
        if( $key != "k" ) {
          if( $key == "year" ) {
            array_push( $setting, $key . " = $field" );
          } else {
            array_push( $setting, $key . " = '$field'" );
          }
        }
      }
      if( count( $setting ) ) {
        $sql = "UPDATE album SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
        $result = DB::runSql( $sql );
        if( !$result ) {
          print "Problème de connexion à la base de données.$sql<br />";
          exit;
        }
        print "Mise à jour de l'album " . $this->fields["id"] . "<br />";
      }
    } else {
      # insert mode
      $sql = "INSERT INTO album ( id, name, year ) VALUES ( '" . $this->fields["id"] . "', '" . $this->fields["name"] . "', " . $this->fields["year"] . " );";
      $result = DB::runSql( $sql );
      if( !$result ) {
        return "Problème de connexion à la base de données.$sql";
        exit;
      }
      print "Insertion de l'album " . $this->fields["id"] . "<br />";
      $this->loadInfo();
    }
  }

  /****************************************************************************/
  protected function resetInfo() {
    parent::resetInfo();
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $sql = "SELECT * FROM album WHERE id='$id';";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "name", "year" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
    }
  }
}
