<?php

class document extends data {
  /****************************************************************************/
  public static function getList() {
    header( 'Content-Type: application/json; charset=UTF-8' );
    $data = false;

    # set cache
    $cacheDocument = new cache( "getDocumentList.js" );
    if( !$cacheDocument->loaded() ) {

      # get document list
      $sql = "SELECT id, title, content FROM document ORDER BY id;";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      if( mysql_num_rows( $result ) < 1 ) {
        return "Aucun item trouvé.";
      }

      # build document list
      $documentList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        array_push( $documentList, array(
          id      => $item["id"],
          title   => $item["title"],
          content => $item["content"] ) );
      }
      $data = json_encode( $documentList );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }

  /****************************************************************************/
  public static function getDetail( $id ) {
    # set cache
    $cacheFile = "getDocument";
    if( $id ) {
      $cacheFile .= "#id_" . $id;
    }
    $cacheDocument = new cache( $cacheFile . ".js" );
    if( !$cacheDocument->loaded() ) {

      # get content
      $sql = "SELECT id, title, content "
           . "FROM document "
           . "WHERE id = '$id';";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.";
      }
      if( $item = mysql_fetch_assoc( $result ) ) {
        $documentItem = array( content => $item["content"] );
      } else {
        return "Enregistrement non trouvé.";
      }

      $data = json_encode( $documentItem );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
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
    $sql = "SELECT k FROM document WHERE id='$id';";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
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
        $sql = "UPDATE document SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
        if( !$result = DB::runSql( $sql ) ) {
          return "Problème de connexion à la base de données.$sql";
        }
        array_push( $log, "Mise à jour du document " . $this->fields["id"] );
      }
    } else {
      # insert mode
      $sql = "INSERT INTO document ( id, title, content ) VALUES ( '" . $this->fields["id"] . "', '" . $this->fields["title"] . "', '" . $this->fields["content"] . "' );";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.$sql";
      }
      array_push( $log, "Insertion du document " . $this->fields["id"] );
      $this->loadInfo();
    }

    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $sql = "SELECT * FROM document WHERE id='$id';";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "title", "content" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
    }
  }
}
