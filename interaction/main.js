"use strict";
var _m = {
  global: {},
  getSelectedItem: function (itemName) {
    return _c.select("#documentSerie").find("div." + itemName + "Selected");
  },
  
  /****************************************************************************/
  displayResult: function (word) {
    var hiddenWordObj = _c.select("#hiddenWord"),
        hiddenWord = hiddenWordObj.val(),
        stringWord = !word.val() ? "" : word.val().replace(/^\s\s*/, "").replace(/\s\s*$/, "").replace(/\'/, ""),
        firstLetter = _c.select("#hiddenLetter").val(),
        filter, mode, hideQuery, showQuery;
    if (firstLetter == "all") {
      filter = "";
    } else if (firstLetter == "num") {
      filter = "[class*='numeric']";
    } else {
      filter = "[id^=" + firstLetter + "]";
    }
    if (stringWord == hiddenWord) {
      return null;
    }
    if (hiddenWord == "!") {
      mode = "both";
    } else if (stringWord.indexOf(hiddenWord) >= 0) {
      mode = "hide";
    } else if (hiddenWord.indexOf(stringWord) >= 0) {
      mode = "show";
    } else {
      mode = "both";
    }
    hiddenWordObj.val(stringWord);
    filter += "[id*='" + _c.replaceAccents(stringWord).toLowerCase().split(new RegExp("[ ,;+&]+", "g")).join("'][id*='") + "']";
    if (_c.select("#searchType").val() == "song") {
      hideQuery = "#songList > li.song[id]:visible, #songList > li.versionList[id]:visible";
      showQuery = "#songList > li.song[id]" + filter + ":hidden, #songList > li.versionList[id]" + filter + ":hidden";
    } else {
      hideQuery = "#artistList > li.hiddenSection[id]:visible, #artistList > li.section[id]:visible";
      showQuery = "#artistList > li.hiddenSection[id]" + filter + ":hidden, #artistList > li.section[id]" + filter + ":hidden";
    }
    if (mode == "hide" || mode == "both") {
      $(hideQuery).not(filter).hide();
    }
    if (mode == "show" || mode == "both") {
      $(showQuery).show();
    }
    return false;
  },
  
  /****************************************************************************/
  setDisplay: function (objectHTML)  {
    var ul = objectHTML.find("ul");
    if (objectHTML.hasClass("plus")) {
      objectHTML.removeClass("plus").addClass("minus");
      ul.removeClass("collapsed").addClass("expanded");
    } else {
      objectHTML.removeClass("minus").addClass("plus");
      ul.removeClass("expanded").addClass("collapsed");
    }
    return false;
  },
  
  /****************************************************************************/
  writeQty: function () {
    var qtyObject = _c.select("#itemQty"),
        qty = $("#songList > li:visible, #artistList > li:visible").size();
    if (_c.select("#searchType").val() == "song") {
      if (qty == 0) {
        qtyObject.html("Aucune chanson trouvée");
      } else if (qty == 1) {
        qtyObject.html("1 chanson trouvée");
      } else {
        qtyObject.html(qty + " chansons trouvées");
      }
    } else {
      if (qty == 0) {
        qtyObject.html("Aucun artiste trouvé");
      } else if (qty == 1) {
        qtyObject.html("1 artiste trouvé");
      } else {
        qtyObject.html(qty + " artistes trouvés");
      }
    }
    return false;
  },

  /****************************************************************************/
  callBuildSongList: function (ajaxItem) {
    ajaxItem.prepareSongResult( _c.select( "#songList" ) );
    _c.eachItem(["lastAdded", "lastModified", "lastViewed", "mostVisited"], function (songListItem) {
      ajaxItem.prepareSongResult( _c.select( "#" + songListItem ) );
      return _m.writeQty();
    });
  },
  
  /****************************************************************************/
  load: function () {
    var tabList = ["search", "tool", "document"],
        word, loadLeftContent, resetValue;
        
    // debug mode
    //$( "html" ).addClass( "holmes-debug" );
        
    _c.callAjax([/*{
      folder: "procedure",
      name: "getSongList"
    }, {
      folder: "procedure",
      name: "getHomeInfo"
    },*/ {
      folder: "interaction",
      name: "song"
    }], _m.callBuildSongList );
    _c.select("#popup").hide().draggable();
    loadLeftContent = function (id) {
      var setSelectedById = function (id, className) {
          var classNameSelected = className + "Selected";
          _c.select("#left").find("." + classNameSelected).removeClass(classNameSelected).addClass(className);
          _c.select("#" + id).removeClass(className).addClass(classNameSelected);
          if (id == "tool") {
            if (_c.select("#tool").hasClass("notInitialized")) {
              _c.select("#autoscroll a:first").click(function (event) {
                return _c.callAjax([{
                  folder: "template",
                  name: "autoscroll"
                }, {
                  folder: "interaction",
                  name: "autoscroll"
                }], function (ajaxItem) {
                  return ajaxItem.load();
                });
              });
              _c.select("#metronome a:first").click(function (event) {
                return _c.callAjax([  {
                  folder: "template",
                  name: "metronome"
                }, {
                  folder: "interaction",
                  name: "metronome"
                }], function (ajaxItem) {
                  return ajaxItem.load();
                });
              });
              _c.select("#advanceSearch").click(function (event) {
                _c.select("#popup").hide();
                return _c.callAjax([  {
                  folder: "procedure",
                  name: "getCheatList"
                }, {
                  folder: "template",
                  name: "advanceSearch"
                }, {
                  folder: "data",
                  name: "note"
                }, {
                  folder: "data",
                  name: "chord"
                }, {
                  folder: "data",
                  name: "instrument"
                }, {
                  folder: "interaction",
                  name: "form"
                }, {
                  folder: "interaction",
                  name: "document"
                }, {
                  folder: "interaction",
                  name: "chord"
                }, {
                  folder: "interaction",
                  name: "advanceSearch"
                }], function (ajaxItem) {
                  return ajaxItem.load();
                });
              });
              _c.select("#editor").click(function (event) {
                _c.select("#popup").hide();
                return _c.callAjax([  {
                  folder: "interaction",
                  name: "editor"
                }], function (ajaxItem) {
                  return ajaxItem.load();
                });
              });
              _c.select("#chordGenerator").click(function (event) {
                _c.select("#popup").hide();
                return _c.callAjax([  {
                  folder: "data",
                  name: "note"
                }, {
                  folder: "data",
                  name: "chord"
                }, {
                  folder: "data",
                  name: "instrument"
                }, {
                  folder: "template",
                  name: "chordGenerator"
                }, {
                  folder: "interaction",
                  name: "form"
                }, {
                  folder: "interaction",
                  name: "document"
                }, {
                  folder: "interaction",
                  name: "chord"
                }], function (ajaxItem) {
                  return ajaxItem.load();
                });
              });
              _c.select("#tool").removeClass("notInitialized");
            }
          } else if (id == "document") {
            var ul = _c.select("#documentList");
            if (ul.hasClass("empty")) {
              _c.callAjax([{
                folder: "procedure",
                name: "getDocumentList"
              }, {
                folder: "interaction",
                name: "document"
              }], function (ajaxItem) {
                return ajaxItem.buildDocumentList(_c.ajaxList.procedure.getDocumentList, ul, ajaxItem.documentClick);
              });
            }
          }
          return false;
          };
      setSelectedById(id + "Tab", "tab");
      setSelectedById(id, "leftContent");
      return false;
    };
    _c.eachItem(tabList, function (tabItem) {
      _c.select("#" + tabItem + "Tab").click(function (event) {
        return loadLeftContent(tabItem);
      });
      return false;
    });
    word = _c.select("#word");
    word.bind("keyup change", function (event) {
      _m.displayResult($(this));
      return _m.writeQty();
    });
    _c.select("#letter").click(function (event) {
      var target = $(event.target);
      $(this).children("li.checked:first").removeClass("checked");
      target.addClass("checked");
      _c.select("#hiddenLetter").val(target.attr("name"));
      _c.select("#hiddenWord").val("!");
      _m.displayResult(_c.select("#word"));
      return _m.writeQty();
    });
    resetValue = function (formInput) {
      var ul = _c.select("#letter");
      ul.children("li.checked:first").removeClass("checked");
      ul.children("li.optionItem[name='all']:first").addClass("checked");
      _c.select("#hiddenLetter").val("all");
      _c.select("#hiddenWord").val("!");
      formInput.val("");
      _m.displayResult(formInput);
      return false;
    };
    _c.select("#searchType").val("song");
    _c.select("#searchBySong").click(function (event) {
      if (!$(this).hasClass("checked")) {
        _c.select("#artistList, #themeList").hide();
        _c.select("#wordInput").show();
        resetValue(word);
        _c.select("#searchType").val("song");
        _c.select("#songList").show();
        $(this).addClass("checked");
        _c.select("#searchByArtist, #searchByTheme").removeClass("checked");
        _m.writeQty();
      }
      return false;
    });
    _c.select("#searchByArtist").click(function (event) {
      var switchToArtist = function (object) {
          if (!object.hasClass("checked")) {
            _c.select("#songList, #themeList").hide();
            _c.select("#wordInput").show();
            resetValue(word);
            _c.select("#searchType").val("artist");
            artistList.show();
            object.addClass("checked");
            _c.select("#searchBySong, #searchByTheme").removeClass("checked");
            _m.writeQty();
          }
          return false;
          },
          artistList = _c.select("#artistList"),
          mySelf = $(this);
      if (artistList.hasClass("empty")) {
        _c.callAjax([{
          folder: "procedure",
          name: "getArtistList"
        }, {
          folder: "interaction",
          name: "artist"
        }], function (ajaxItem) {
          ajaxItem.buildArtistList(_c.ajaxList.procedure.getArtistList);
          return switchToArtist(mySelf);
        });
      } else {
        switchToArtist(mySelf);
      }
      return false;
    });
    _c.select("#searchByTheme").click(function (event) {
      var switchToTheme = function (object) {
          if (!object.hasClass("checked")) {
            _c.select("#songList, #artistList, #wordInput").hide();
            resetValue(word);
            _c.select("#searchType").val("theme");
            themeList.show();
            object.addClass("checked");
            _c.select("#searchBySong, #searchByArtist").removeClass("checked");
            _m.writeQty();
          }
          return false;
          },
          themeList = _c.select("#themeList"),
          mySelf = $(this);
      if (themeList.hasClass("empty")) {
        _c.callAjax([{
          folder: "procedure",
          name: "getThemeList"
        }, {
          folder: "interaction",
          name: "theme"
        }], function (ajaxItem) {
          ajaxItem.buildThemeList(_c.ajaxList.procedure.getThemeList);
          return switchToTheme(mySelf);
        });
      } else {
        switchToTheme(mySelf);
      }
      return false;
    });
    $("div.docTitle").click(function (event) {
      _c.select("#popup").hide();
      return _c.callAjax([{
        folder: "interaction",
        name: "document"
      }], function (ajaxItem) {
        return ajaxItem.select("home");
      });
    });
    _c.select("#docAdd").click(function (event) {
      _c.select("#popup").hide();
      return _c.callAjax([  {
        folder: "interaction",
        name: "document"
      }], function (ajaxItem) {
        return ajaxItem.add();
      });
    });
    return false;
  }
};
_m.load();
