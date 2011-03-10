<?php

abstract class data {
  protected $fields;

  abstract protected function loadInfo();
  abstract public function save();

  /****************************************************************************/
  public function set( $valueList ) {
    foreach( $valueList as $key=>$value ) {
      $this->fields[$key] = $value;
    }
  }

  /****************************************************************************/
  public function get( $key ) {
    return isset( $this->fields[$key] )? $this->fields[$key]: false;
  }

  /****************************************************************************/
  protected function resetInfo() {
    $this->fields = array();
  }
}
