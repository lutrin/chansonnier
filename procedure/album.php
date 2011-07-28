<?php

class album extends data {
  protected static $table = "album";
  protected static $field = array( "k", "id", "name", "year" );

  /****************************************************************************/
  public static function getList() {
    $data = false;

    # set cache
    $cacheDocument = new cache( "getAlbumList.js" );
    if( !$cacheDocument->loaded() ) {

      # Get album list
      if( !$albumList = DB::select( array(
          "field" => "id,name",
          "table" => self::$table,
          "order" => "id"
        ) ) ) {
        return "Aucun item trouvé.";
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
    if( !$result = DB::select( array(
        "field" => "year",
        "table" => self::$table,
        "where" => "id='$id'"
      ) ) ) {
      return "Enregistrement non trouvé.";
    }
    header( 'Content-Type: application/json; charset=UTF-8' );
    return json_encode( $result[0] );
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
    return DB::count( array(
      "field" => "k",
      "table" => self::$table,
      "where" => "id='$id'"
    ) );
  }

  /****************************************************************************/
  public function save() {
    if( isset( $this->fields["k"] ) && $this->fields["k"] ) {
    
      # update mode
      DB::update( array(
        "table" => self::$table,
        "set"   => $this->fields,
        "where" => "k='{$this->fields["k"]}'"
      ) );
      print "Mise à jour de l'album " . $this->fields["id"] . "<br />";
    } else {
    
      # insert mode
      DB::insert( array(
        "table"  => self::$table,
        "field"  => array_keys( $this->fields ),
        "values" => array_values( $this->fields )
      ) );
      print "Insertion de l'album " . $this->fields["id"] . "<br />";
      $this->loadInfo();
    }
  }

  /****************************************************************************/
  protected function loadInfo() {
    $id = $this->fields["id"];
    $result = DB::select( array(
      "field" => self::$field,
      "table" => self::$table,
      "where" => "id='" . $this->fields["id"] . "'"
    ) );
    if( $result ) {
      $this->fields = $result[0];
    } else {
      $this->resetInfo();
      $this->fields["id"] = $id;
    }
  }
}
