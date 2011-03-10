<?php

class interpreter extends data {
  protected $tracks;

  /****************************************************************************/
  public function __construct( $k = false, $id = false, $mode = "version" ) {
    $this->resetInfo();
    if( $mode == "version" ) {
      if( $k ) {
        $this->fields["versionK"] = $k;
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
        $ids = explode( "_", $id );
        $song = new song( $ids[0] );
        $version = new version( $song->get( "k" ), isset( $ids[1] )? $ids[1]: "" );
        $this->fields["versionK"] = $version->get( "k" );
        if( $this->fields["versionK"] && $k ) {
          $this->loadInfo();
        }
      }
    }
  }

  /****************************************************************************/
  public function exists( $versionK, $artistK ) {
    $sql = "SELECT k FROM interpreter WHERE versionK = $versionK AND artistK = $artistK;";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function addTrack( $albumId ) {
    array_push( $this->tracks, new track( $this->fields["k"], $albumId ) );
    return $this->tracks[count( $this->tracks ) - 1];
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
      $sql = "UPDATE interpreter SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Mise à jour de l'interprète" );
    } else {
      # insert mode
      $sql = "INSERT INTO interpreter ( versionK, artistK ) VALUES ( " . $this->fields["versionK"] . ", " . $this->fields["artistK"] . " );";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.$sql";
      }
      array_push( $log, "Ajout de l'interprète" );
      $this->loadInfo();
    }

    # tracks
    $tracksK = array();
    foreach( $this->tracks as $track ) {
      $track->set( array( interpreterK=>$this->fields["k"] ) );
      array_push( $log, $track->save() );
      array_push( $tracksK, $track->get( "k" ) );
    }
    $sql = "";
    if( count( $tracksK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $tracksK ) . " ) ";
    }
    $sql = "DELETE FROM track WHERE interpreterK=" . $this->fields["k"] . $sql . ";"; 
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connection à la base de données.$sql";
    }
    array_push( $log, "Suppression des pistes n'étant plus dans la liste" );
    return join( "<br />", $log );
  }

  /****************************************************************************/
  public function load( $k ) {
    $sql = "SELECT * FROM interpreter WHERE k = $k;";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "versionK", "artistK" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
      $this->tracks = array();
    } else {
      $this->resetInfo();
    }
  }

  /****************************************************************************/
  public function delete() {
    $sql = "DELETE FROM track WHERE interpreterK = " . $this->fields["k"] . ";";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connection à la base de données.$sql<br />";
    }
    $sql = "DELETE FROM interpreter WHERE k = " . $this->fields["k"] . ";";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connection à la base de données.$sql<br />";
    }
    return "Suppression de l'interprète";
  }

  /****************************************************************************/
  protected function resetInfo() {
    parent::resetInfo();
    $this->tracks = array();
  }

  /****************************************************************************/
  protected function loadInfo() {
    $versionK = $this->fields["versionK"];
    $artistK = $this->fields["artistK"];
    $sql = "SELECT * FROM interpreter WHERE versionK=$versionK AND artistK=$artistK;";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "versionK", "artistK" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["versionK"] = $versionK;
      $this->fields["artistK"] = $artistK;
    }
  }
}
