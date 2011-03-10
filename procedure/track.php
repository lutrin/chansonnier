<?php

class track extends data {

  /****************************************************************************/
  public function __construct( $interpreterK = false, $albumId = false ) {
    $this->resetInfo();
    if( $interpreterK ) {
      $this->fields["interpreterK"] = $interpreterK;
    }
    if( $albumId ) {
      $album = new album( $albumId );
      $this->fields["albumK"] = $album->get( "k" );
      if( $this->fields["albumK"] && $interpreterK ) {
        $this->loadInfo();
      }
    }
  }

  /****************************************************************************/
  public function exists( $interpreterK, $albumK ) {
    $sql = "SELECT k FROM track WHERE interpreterK = $interpreterK AND albumK = $albumK;";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function save() {
    $log = array();
    if( isset( $this->fields["k"] ) && $this->fields["k"] ) {
      # update mode
      $setting = array();
      foreach( $this->fields as $key=>$field ) {
        if( $key != "k" ) {
          array_push( $setting, $key . " = $field" );
        }
      }
      $sql = "UPDATE track SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Mise à jour de la piste" );
    } else {
      # insert mode
      $sql = "INSERT INTO track ( interpreterK, albumK ) VALUES ( " . $this->fields["interpreterK"] . ", " . $this->fields["albumK"] . " );";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Ajout de la piste" );
      $this->loadInfo();
    }
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function loadInfo() {
    $interpreterK = $this->fields["interpreterK"];
    $albumK = $this->fields["albumK"];
    $sql = "SELECT * FROM track WHERE interpreterK=$interpreterK AND albumK=$albumK;";
    $result = DB::runSql( $sql );
    if( !$result ) {
      print "Problème de connection à la base de données.$sql<br />";
      exit;
    }
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "interpreterK", "albumK" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["interpreterK"] = $interpreterK;
      $this->fields["albumK"] = $albumK;
    }
  }
}
