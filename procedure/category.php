<?php

class category extends data {

  /****************************************************************************/
  public function __construct( $themeK = false, $songId = false ) {
    $this->resetInfo();
    if( $themeK ) {
      $this->fields["themeK"] = $themeK;
    }
    if( $songId ) {
      $song = new song( $songId );
      $this->fields["songK"] = $song->get( "k" );
      if( $this->fields["songK"] && $themeK ) {
        $this->loadInfo();
      }
    }
  }

  /****************************************************************************/
  public function exists( $themeK, $songK ) {
    $sql = "SELECT k FROM category WHERE themeK = $themeK AND songK = $songK;";
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
      $sql = "UPDATE category SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Mise à jour de la catégorie" );
    } else {
      # insert mode
      $sql = "INSERT INTO category ( themeK, songK ) VALUES ( " . $this->fields["themeK"] . ", " . $this->fields["songK"] . " );";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Ajout de la catégorie" );
      $this->loadInfo();
    }
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function loadInfo() {
    $themeK = $this->fields["themeK"];
    $songK = $this->fields["songK"];
    $sql = "SELECT * FROM category WHERE themeK=$themeK AND songK=$songK;";
    $result = DB::runSql( $sql );
    if( !$result ) {
      print "Problème de connection à la base de données.$sql<br />";
      exit;
    }
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "themeK", "songK" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["themeK"] = $themeK;
      $this->fields["songK"] = $songK;
    }
  }
}
