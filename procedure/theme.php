<?php

class theme extends data {
  protected $categories;

  /****************************************************************************/
  public static function getList() {
    $data = false;

    # set cache
    $cacheDocument = new cache( "getThemeList.js" );
    if( !$cacheDocument->loaded() ) {

      # Get theme list
      $sql = "SELECT id, name FROM theme ORDER BY id;";
      if( !$result = DB::runSql( $sql ) ) {
        return "Problème de connection à la base de données.";
      }
      if( mysql_num_rows( $result ) < 1 ) {
        return "Aucun item trouvé.";
      }

      # build theme list
      $themeList = array();
      while( $item = mysql_fetch_assoc( $result ) ) {
        array_push( $themeList, array( id   => $item["id"],
                                       name => $item["name"] ) );
      }

      $data = json_encode( $themeList );
      $cacheDocument->save( $data );
    } else {
      $data = $cacheDocument->getContent();
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return $data;
  }

  /****************************************************************************/
  public static function getDetail( $id ) {

    # get category
    $sql = "SELECT k FROM theme WHERE id = '$id';";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{theme}";
    }
    if( $item = mysql_fetch_assoc( $result ) ) {
      $categoryItem = array();
      $themeK = $item["k"];
    } else {
      return "Enregistrement non trouvé.";
    }

    # get category
    $sql = "SELECT song.id, song.name "
         . "FROM song, category "
         . "WHERE song.k = category.songK "
         . "AND category.themeK = $themeK "
         . "ORDER BY song.id;";
    if( !$result = DB::runSql( $sql ) ) {
      return "Problème de connexion à la base de données.{category}".$sql;
    }
    $categoryList = array();
    while( $item = mysql_fetch_assoc( $result ) ) {
      array_push( $categoryList, array( id   => $item["id"],
                                        name => $item["name"] ) );
    }
    if( count( $categoryList ) ) {
      $themeItem["category"] = $categoryList;
    }

    header( 'Content-Type: application/json; charset=UTF-8' );
    return json_encode( $themeItem );
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
    $sql = "SELECT k FROM theme WHERE id='$id';";
    $result = DB::runSql( $sql );
    return mysql_num_rows( $result );
  }

  /****************************************************************************/
  public function addCategory( $songId ) {
    array_push( $this->categories, new category( $this->fields["k"], $songId ) );
    return $this->categories[count( $this->categories ) - 1];
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
        $sql = "UPDATE theme SET " . join( ", ", $setting ) . " WHERE k = " . $this->fields["k"] . ";";
        $result = DB::runSql( $sql );
        if( !$result ) {
          return "Problème de connexion à la base de données.$sql";
        }
        array_push( $log, "Mise à jour du thème " . $this->fields["id"] );
      }
    } else {
      # insert mode
      $sql = "INSERT INTO theme ( id, name ) VALUES ( '" . $this->fields["id"] . "', '" . $this->fields["name"] . "' );";
      $result = DB::runSql( $sql );
      if( !$result ) {
        return "Problème de connexion à la base de données.$sql";
      }
      array_push( $log, "Insertion de du thème " . $this->fields["id"] );
      $this->loadInfo();
    }

    # categories
    $categoriesK = array();
    foreach( $this->categories as $category ) {
      $category->set( array( themeK=>$this->fields["k"] ) );
      $category->save();
      array_push( $categoriesK, $category->get( "k" ) );
    }
    $sql = "";
    if( count( $categoriesK ) ) {
      $sql = " AND NOT k IN ( " . join( ", ", $categoriesK ) . " ) ";
    }
    $sql = "DELETE FROM category WHERE themeK=" . $this->fields["k"] . $sql . ";"; 
    $result = DB::runSql( $sql );
    if( !$result ) {
      return "Problème de connexion à la base de données.$sql<br />";
    }
    array_push( $log, "Suppression des catégories n'étant plus dans la liste" );

    return join( "<br />", $log );
  }

  /****************************************************************************/
  protected function resetInfo() {
    parent::resetInfo();
    $this->categories = array();
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $sql = "SELECT * FROM theme WHERE id='$id';";
    $result = DB::runSql( $sql );
    if( $item = mysql_fetch_assoc( $result ) ) {
      foreach( array( "k", "name" ) as $key ) {
        $this->fields[$key] = $item[$key];
      }
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
    }
  }
}
