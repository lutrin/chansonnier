<?php

class composer extends data {

  /****************************************************************************/
  public function __construct( $k = false, $id = false, $mode = "song" ) {
    $this->resetInfo();
    if( $mode == "song" ) {
      if( $k ) {
        $this->fields["songK"] = $k;
      }
      if( $id ) {
        $artist = new artist( $id );
        $this->fields["artistK"] = $artist->get( "k" );
        if( $this->fields["artistK"] && $k ) {
          $this->loadInfo();
        }
      }
    } elseif( $mode == "artist" ) {
      if( $k ) {
        $this->fields["artistK"] = $k;
      }
      if( $id ) {
        $song = new song( $id );
        $this->fields["songK"] = $song->get( "k" );
        if( $this->fields["songK"] && $k ) {
          $this->loadInfo();
        }
      }
    }
  }

  /****************************************************************************/
  public function exists( $songK, $artistK ) {
    $sql = "SELECT k FROM composer WHERE songK = $songK AND artistK = $artistK;";
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
          if( $key == "type" ) {
            array_push( $setting, $key . " = '$field'" );
          } else {
            array_push( $setting, $key . " = $field" );
          }
        }
      }
      $sql = "UPDATE composer SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Mise à jour du compositeur" );
    } else {
      # insert mode
      $sql = "INSERT INTO composer ( songK, artistK, type ) VALUES ( " . $this->fields["songK"] . ", " . $this->fields["artistK"] . ", '" . $this->fields["type"] . "' );";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Ajout du compositeur" );
      $this->loadInfo();
    }
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function loadInfo() {
    $songK = $this->fields["songK"];
    $artistK = $this->fields["artistK"];
    $sql = "SELECT * FROM composer WHERE songK=$songK AND artistK=$artistK;";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "songK", "artistK", "type" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["songK"] = $songK;
      $this->fields["artistK"] = $artistK;
    }
  }
}
