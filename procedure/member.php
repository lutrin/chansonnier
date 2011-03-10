<?php

class member extends data {

  /****************************************************************************/
  public function __construct( $k = false, $id = false, $mode = "member" ) {
    $this->resetInfo();
    if( $mode == "member" ) {
      if( $k ) {
        $this->fields["groupK"] = $k;
      }
      if( $id ) {
        $artist = new artist( $id );
        $this->fields["artistK"] = $artist->get( "k" );
        if( $this->fields["artistK"] && $k ) {
          $this->loadInfo();
        }
      }
    } elseif( $mode == "group" ) {
      if( $k ) {
        $this->fields["artistK"] = $k;
      }
      if( $id ) {
        $artist = new artist( $id );
        $this->fields["groupK"] = $artist->get( "k" );
        if( $this->fields["groupK"] && $k ) {
          $this->loadInfo();
        }
      }
    }
  }

  /****************************************************************************/
  public function exists( $groupK, $artistK ) {
    $sql = "SELECT k FROM member WHERE groupK = $groupK AND artistK = $artistK;";
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
      $sql = "UPDATE member SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
      $result = DB::runSql( $sql );
      if( !$result ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Mise à jour du membre" );
    } else {
      # insert mode
      $sql = "INSERT INTO member ( groupK, artistK ) VALUES ( " . $this->fields["groupK"] . ", " . $this->fields["artistK"] . " );";
      $result = DB::runSql( $sql );
      if( !$result ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Ajout du membre" );
      $this->loadInfo();
    }
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function loadInfo() {
    $groupK = $this->fields["groupK"];
    $artistK = $this->fields["artistK"];
    $sql = "SELECT * FROM member WHERE groupK=$groupK AND artistK=$artistK;";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "groupK", "artistK" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["groupK"] = $groupK;
      $this->fields["artistK"] = $artistK;
    }
  }
}
