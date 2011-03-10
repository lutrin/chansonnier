<?php

class artist extends data {
  protected $members;
  protected $groups;
  protected $compositions;
  protected $interpretations;

  /****************************************************************************/
  public static function getList( $mode = "interpreter" ) {
    $data = false;

    # set cache
    $cacheFile = "getArtistList";
    if( $mode ) {
      $cacheFile .= "#mode_" . $mode;
    }
    $cacheDocument = new cache( $cacheFile . "js" );
    if( !$cacheDocument->loaded() ) {

      # Get artist list
      $condition = "";
      if( $mode == "interpreter" ) {
        $condition = "WHERE k IN ( SELECT DISTINCT artistK FROM interpreter ) ";
      }
      $sql = "SELECT id, name, IF( NOT ISNULL( origin ), origin, IF( NOT origin = '', origin, 'qc' ) ) as origin FROM artist $condition ORDER BY name;";
      $result = DB::runSql( $sql );
      if( !$result ) {
        return "Problème de connection à la base de données.";
      }
      if( mysql_num_rows( $result ) < 1 ) {
        return "Aucun item trouvé.";
      }

      # build artist list
      $artistList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        array_push( $artistList, array( id     => $item["id"],
                                        name   => $item["name"],
                                        origin => $item["origin"] ) );
      }

      $data = json_encode( $artistList );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }

  /****************************************************************************/
  public static function getDetail( $id ) {

    # get artist
    $sql = "SELECT k, origin FROM artist WHERE id = '$id';";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{artist}";
    }
    if( $item = mysql_fetch_assoc( $result ) ) {
      $artistItem = array( origin => $item["origin"] );
      $artistK = $item["k"];
    } else {
      return "Enregistrement non trouvé.";
    }

    # get members
    $sql = "SELECT artist.id, artist.name "
         . "FROM artist, member "
         . "WHERE member.groupK = $artistK "
         . "AND artist.k = member.artistK "
         . "ORDER BY artist.name;";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{member}";
    }
    $memberList = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      array_push( $memberList, array( id => $item["id"], name => $item["name"] ) );
    }
    if( count( $memberList ) ) {
      $artistItem["member"] = $memberList;
    }

    # get groups
    $sql = "SELECT artist.id, artist.name "
         . "FROM artist, member "
         . "WHERE member.artistK = $artistK "
         . "AND artist.k = member.groupK "
         . "ORDER BY artist.name;";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{member}";
    }
    $groupList = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      array_push( $groupList, array( id => $item["id"], name => $item["name"] ) );
    }
    if( count( $groupList ) ) {
      $artistItem["group"] = $groupList;
    }

    # get compositions
    $sql = "SELECT song.id, song.name, composer.type "
         . "FROM song, composer "
         . "WHERE song.k = composer.songK "
         . "AND composer.artistK = $artistK "
         . "ORDER BY song.name;";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{composition}";
    }
    $compositionList = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      array_push( $compositionList, array( id   => $item["id"],
                                           name => $item["name"],
                                           type => $item["type"] ) );
    }
    if( count( $compositionList ) ) {
      $artistItem["composition"] = $compositionList;
    }

    # get interpretations
    $sql = "SELECT interpreter.k, song.id as songId, version.id as versionId, song.name as songName, version.name as versionName "
         . "FROM song, version, interpreter "
         . "WHERE version.songK = song.k "
         . "AND interpreter.versionK = version.k "
         . "AND interpreter.artistK = $artistK "
         . "ORDER BY songName, versionName;";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{interpretation}";
    }
    $interpretationList = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      $name = $item["songName"];
      if( $item["versionName"] ) {
        $name .= " - <em>" . $item["versionName"] . "</em>";
      }
      $id = $item["songId"];
      if( $item["versionId"] ) {
        $id .= "_" . $item["versionId"];
      }
      $interpretationItem = array( id   => $id, name => $name );
      $interpreterK = $item["k"];

      # get album
      $sql = "SELECT album.id, album.name, album.year "
           . "FROM album, track "
           . "WHERE track.interpreterK = $interpreterK "
           . "AND album.k = track.albumK "
           . "ORDER BY album.year;";
      if( !$subResult = DB::runSql( $sql ) ) {
        return "Problème de connexion à la base de données.{album}";
      }
      $albumList = array();
      while( $subItem = mysql_fetch_assoc( $subResult ) ) {
        array_push( $albumList, array( id   => $subItem["id"],
                                       name => $subItem["name"],
                                       year => $subItem["year"] ) );
      }
      if( count( $albumList ) ) {
        $interpretationItem["album"] = $albumList;
      }
      array_push( $interpretationList, $interpretationItem );
    }
    if( count( $interpretationList ) ) {
      $artistItem["interpretation"] = $interpretationList;
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return json_encode( $artistItem );
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
    $sql = "SELECT k FROM artist WHERE id='$id';";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function addMember( $artistId ) {
    array_push( $this->members, new member( $this->fields["k"], $artistId, "member" ) );
    return $this->members[count( $this->members ) - 1];
  }

  /****************************************************************************/
  public function addGroup( $artistId ) {
    array_push( $this->groups, new member( $this->fields["k"], $artistId, "group" ) );
    return $this->groups[count( $this->groups ) - 1];
  }

  /****************************************************************************/
  public function addComposition( $songId ) {
    array_push( $this->compositions, new composer(  $this->fields["k"], $songId, "artist" ) );
    return $this->compositions[count( $this->compositions ) - 1];
  }

  /****************************************************************************/
  public function addInterpretation( $versionId ) {
    array_push( $this->interpretations, new interpreter( $this->fields["k"], $versionId, "artist" ) );
    return $this->interpretations[count( $this->interpretations ) - 1];
  }

  /****************************************************************************/
  public function save() {
    $log = array();
    if( isset( $this->fields["k"] ) && $this->fields["k"] ) {
      # update mode
      $setting = array();
      foreach( $this->fields as $key=>$field ) {
        if( $key != "k" ) {
          array_push( $setting, $key . " = '$field'" );
        }
      }
      if( count( $setting ) ) {
        $sql = "UPDATE artist SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
        $result = DB::runSql( $sql );
        if( !$result ) {
          return "Problème de connexion à la base de données.$sql";
        }
        array_push( $log, "Mise à jour de l'artiste " . $this->fields["id"] );
      }
    } else {
      # insert mode
      $sql = "INSERT INTO artist ( id, name, origin ) VALUES ( '" . $this->fields["id"] . "', '" . $this->fields["name"] . "', '" . $this->fields["origin"] . "' );";
      $result = DB::runSql( $sql );
      if( !$result ) {
        return "Problème de connexion à la base de données.$sql";
      }
      array_push( $log, "Insertion de l'ariste " . $this->fields["id"] );
      $this->loadInfo();
    }

    # members
    $membersK = array();
    foreach( $this->members as $member ) {
      $member->set( array( groupK=>$this->fields["k"] ) );
      $member->save();
      array_push( $membersK, $member->get( "k" ) );
    }
    $sql = "";
    if( count( $membersK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $membersK ) . " ) ";
    }
    $sql = "DELETE FROM member WHERE groupK=" . $this->fields["k"] . $sql . ";"; 
    $result = DB::runSql( $sql );
    if( !$result ) {
      return "Problème de connexion à la base de données.$sql";
    }
    array_push( $log, "Suppression des membres n'étant plus dans la liste" );

    # groups
    $groupsK = array();
    foreach( $this->groups as $group ) {
      $group->set( array( artistK=>$this->fields["k"] ) );
      $group->save();
      array_push( $groupsK, $group->get( "k" ) );
    }
    $sql = "";
    if( count( $groupsK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $groupsK ) . " ) ";
    }
    $sql = "DELETE FROM member WHERE artistK=" . $this->fields["k"] . $sql . ";"; 
    $result = DB::runSql( $sql );
    if( !$result ) {
      return "Problème de connexion à la base de données.$sql";
    }
    array_push( $log, "Suppression des groupes n'étant plus dans la liste" );

    # compositions
    $compositionsK = array();
    foreach( $this->compositions as $composition ) {
      $composition->set( array( artistK=>$this->fields["k"] ) );
      $composition->save();
      array_push( $compositionsK, $composition->get( "k" ) );
    }
    $sql = "";
    if( count( $compositionsK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $compositionsK ) . " ) ";
    }
    $sql = "DELETE FROM composer WHERE artistK=" . $this->fields["k"] . $sql . ";"; 
    $result = DB::runSql( $sql );
    if( !$result ) {
      return "Problème de connexion à la base de données.$sql<br />";
    }
    array_push( $log, "Suppression des compositions n'étant plus dans la liste" );

    # interpretations
    $interpretationsK = array();
    foreach( $this->interpretations as $interpretation ) {
      $interpretation->set( array( artistK=>$this->fields["k"] ) );
      $interpretation->save();
      array_push( $interpretationsK, $interpretation->get( "k" ) );
    }
    $sql = "";
    if( count( $interpretationsK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $interpretationsK ) . " ) ";
    }
    $sql = "SELECT k FROM interpreter WHERE artistK=" . $this->fields["k"] . $sql . ";"; 
    $result = DB::runSql( $sql );
    if( !$result ) {
      return "Problème de connexion à la base de données.$sql";
    }
    while( $item = mysql_fetch_assoc( $result ) ) {
      $interpretation = new interpreter( );
      $interpretation->load( $item["k"] );
      $interpretation->delete();
    }
    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function resetInfo() {
    parent::resetInfo();
    $this->members = array();
    $this->groups = array();
    $this->compositions = array();
    $this->interpretations = array();
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $sql = "SELECT * FROM artist WHERE id='$id';";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "name", "origin" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
    }
  }
}
