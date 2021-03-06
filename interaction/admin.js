"use strict";
var _a = {
  load: function () {
    if (_c.select("#list").size()) {
      _c.select("#list").html("<div class='button'><a id='addSong' title='Ajouter une chanson'>Ajouter une chanson</a></div><ul id='songList'></ul>");
      this.loadSong();
      _c.select("#callEditSong").click(function (event) {
        _c.select("#list").html("<div class='button'><a id='addSong' title='Ajouter une chanson'>Ajouter une chanson</a></div><ul id='songList'></ul>");
        _a.loadSong();
      });
      _c.select("#callEditArtist").click(function (event) {
        _c.select("#list").html("<div class='button'><a id='addArtist' title='Ajouter un artiste'>Ajouter un artiste</a></div><ul id='artistList'></ul>");
        _a.loadArtist();
      });
      _c.select("#callEditAlbum").click(function (event) {
        _c.select("#list").html("<div class='button'><a id='addAlbum' title='Ajouter un album'>Ajouter un album</a></div><ul id='albumList'></ul>");
        _a.loadAlbum();
      });
      _c.select("#callEditTheme").click(function (event) {
        _c.select("#list").html("<div class='button'><a id='addTheme' title='Ajouter un thème'>Ajouter un thème</a></div><ul id='themeList'></ul>");
        _a.loadTheme();
      });
      _c.select("#callEditDocument").click(function (event) {
        _c.select("#list").html("<div class='button'><a id='addDocument' title='Ajouter un document'>Ajouter un document</a></div><ul id='documentList'></ul>");
        _a.loadDocument();
      });
    }
  },
  loadSong: function () {
    var addSong = $("#addSong");
    addSong.click(function (event) {
      return _c.callAjax([{
        folder: "template",
        name: "editSongDetail"
      }], function (html) {
        _c.eachItem([/{songId}/g, /{songName}/g, /{versionId}/g, /{versionName}/g, /{text}/g, /{cheat}/g, /{composerList}/g, /{interpreterList}/g], function (replaceItem) {
          html = html.replace(replaceItem, "");
          return false;
        });
        _c.select("#detail").html(html.replace(/{head}/g, "Ajout d'une chanson"));
        $("#newVersion").click(function (event) {
          $("#mode").val("add");
        });
        return _c.eachItem(["Composer", "Interpreter"], function (context) {
          $("#choose" + context).click(_a["choose" + context + "Click"]);
          return false;
        });
      });
    });
    return _c.callAjax([{
      folder: "procedure",
      name: "getSongList"
    }, {
      folder: "interaction",
      name: "song"
    }], function (ajaxItem) {
      var ulSongList = $("#songList");
      ajaxItem.buildSongList(_c.ajaxList.procedure.getSongList, ulSongList, function () {
        ulSongList.removeClass("empty").click(_a.clickSongList);
        return false;
      });
      return false;
    });
  },
  loadArtist: function () {
    var addArtist = $("#addArtist");
    addArtist.click(function (event) {
      return _c.callAjax([{
        folder: "template",
        name: "editArtistDetail"
      }], function (ajaxItem) {
        var html = ajaxItem;
        _c.eachItem([/{artistId}/g, /{artistName}/g, /{memberList}/g, /{groupList}/g, /{compositionList}/g, /{interpretationList}/g], function (replaceItem) {
          html = html.replace(replaceItem, "");
          return false;
        });
        _c.select("#detail").html(html.replace(/{head}/g, "Ajout d'un artiste"));
        _c.eachItem(["Member", "Group", "Composition", "Interpretation"], function (context) {
          $("#choose" + context).click(_a["choose" + context + "Click"]);
          return false;
        });
        return false;
      });
    });
    return _c.callAjax([{
      folder: "procedure",
      name: "getArtistList",
      params: {
        mode: "all"
      }
    }], function (ajaxItem) {
      var ulArtistList = $("#artistList"),
          artistList = [];
      _c.eachItem(ajaxItem, function (artistItem) {
        artistList.push(artistItem.id + "' class='artist'><a name='" + artistItem.id + "' class='documentTitle'>" + artistItem.name + "</a>");
      });
      ulArtistList.html("<li id='" + artistList.join("</li><li id='") + "</li>");
      ulArtistList.removeClass("empty").click(_a.clickArtistList);
      return false;
    });
  },
  loadAlbum: function () {
    var addAlbum = $("#addAlbum");
    addAlbum.click(function (event) {
      return _c.callAjax([{
        folder: "template",
        name: "editAlbumDetail"
      }], function (ajaxItem) {
        var html = ajaxItem;
        _c.eachItem([/{albumId}/g, /{albumName}/g, /{year}/g], function (replaceItem) {
          html = html.replace(replaceItem, "");
          return false;
        });
        _c.select("#detail").html(html.replace(/{head}/g, "Ajout d'un album"));
        return false;
      });
    });
    return _c.callAjax([{
      folder: "procedure",
      name: "getAlbumList"
    }], function (ajaxItem) {
      var ulAlbumList = $("#albumList"),
          albumList = [];
      _c.eachItem(ajaxItem, function (albumItem) {
        albumList.push(albumItem.id + "' class='album'><a name='" + albumItem.id + "' class='documentTitle'>" + albumItem.name + "</a>");
      });
      ulAlbumList.html("<li id='" + albumList.join("</li><li id='") + "</li>");
      ulAlbumList.removeClass("empty").click(_a.clickAlbumList);
      return false;
    });
  },
  loadDocument: function () {
    var addDocument = $("#addDocument");
    addDocument.click(function (event) {
      return _c.callAjax([{
        folder: "template",
        name: "editDocumentDetail"
      }], function (html) {
        _c.eachItem([/{documentId}/g, /{documentTitle}/g, /{content}/g], function (replaceItem) {
          html = html.replace(replaceItem, "");
          return false;
        });
        _c.select("#detail").html(html.replace(/{head}/g, "Ajout d'un document"));
        _a.applyWysiwyg("#content");
        return false;
      });
    });
    return _c.callAjax([{
      folder: "procedure",
      name: "getDocumentList"
    }, {
      folder: "interaction",
      name: "document"
    }], function (ajaxItem) {
      return ajaxItem.buildDocumentList(_c.ajaxList.procedure.getDocumentList, $("#documentList"), _a.clickDocumentList);
    });
  },
  loadTheme: function () {
    var addTheme = $("#addTheme");
    addTheme.click(function (event) {
      return _c.callAjax([{
        folder: "template",
        name: "editThemeDetail"
      }], function (ajaxItem) {
        var html = ajaxItem;
        _c.eachItem([/{themeId}/g, /{themeName}/g, /{categoryList}/g], function (replaceItem) {
          html = html.replace(replaceItem, "");
          return false;
        });
        _c.select("#detail").html(html.replace(/{head}/g, "Ajout d'un thème"));
        _c.eachItem(["Category"], function (context) {
          $("#choose" + context).click(_a["choose" + context + "Click"]);
          return false;
        });
        return false;
      });
    });
    return _c.callAjax([{
      folder: "procedure",
      name: "getThemeList"
    }], function (ajaxItem) {
      var ulThemeList = $("#themeList"),
          themeList = [];
      _c.eachItem(ajaxItem, function (themeItem) {
        themeList.push(themeItem.id + "' class='theme'><a name='" + themeItem.id + "' class='documentTitle'>" + themeItem.name + "</a>");
      });
      ulThemeList.html("<li id='" + themeList.join("</li><li id='") + "</li>");
      ulThemeList.removeClass("empty").click(_a.clickThemeList);
      return false;
    });
  },
  applyWysiwyg: function (id) {
    $(id).wysiwyg({
      controls: {
        strikeThrough: {
          visible: false
        },
        underline: {
          visible: false
        },
        separator00: {
          visible: true
        },
        justifyLeft: {
          visible: true
        },
        justifyCenter: {
          visible: true
        },
        justifyRight: {
          visible: true
        },
        justifyFull: {
          visible: true
        },
        separator01: {
          visible: true
        },
        indent: {
          visible: false
        },
        outdent: {
          visible: false
        },
        separator02: {
          visible: false
        },
        subscript: {
          visible: true
        },
        superscript: {
          visible: true
        },
        separator03: {
          visible: true
        },
        undo: {
          visible: true
        },
        redo: {
          visible: true
        },
        separator04: {
          visible: true
        },
        insertOrderedList: {
          visible: true
        },
        insertUnorderedList: {
          visible: true
        },
        insertHorizontalRule: {
          visible: true
        },
        h4mozilla: {
          visible: true && $.browser.mozilla,
          className: 'h4',
          command: 'heading',
          arguments: ['h4'],
          tags: ['h4'],
          tooltip: "Header 4"
        },
        h5mozilla: {
          visible: true && $.browser.mozilla,
          className: 'h5',
          command: 'heading',
          arguments: ['h5'],
          tags: ['h5'],
          tooltip: "Header 5"
        },
        h6mozilla: {
          visible: true && $.browser.mozilla,
          className: 'h6',
          command: 'heading',
          arguments: ['h6'],
          tags: ['h6'],
          tooltip: "Header 6"
        },
        h4: {
          visible: true && !($.browser.mozilla),
          className: 'h4',
          command: 'formatBlock',
          arguments: ['<H4>'],
          tags: ['h4'],
          tooltip: "Header 4"
        },
        h5: {
          visible: true && !($.browser.mozilla),
          className: 'h5',
          command: 'formatBlock',
          arguments: ['<H5>'],
          tags: ['h5'],
          tooltip: "Header 5"
        },
        h6: {
          visible: true && !($.browser.mozilla),
          className: 'h6',
          command: 'formatBlock',
          arguments: ['<H6>'],
          tags: ['h6'],
          tooltip: "Header 6"
        },
        separator07: {
          visible: true
        },
        cut: {
          visible: true
        },
        copy: {
          visible: true
        },
        paste: {
          visible: true
        }
      }
    });
    return false;
  },
  clickSongList: function (event) {
    var target = $(event.target),
        song = target.parents("li.song:first"),
        documentName, documentTitle, parentSong;
    if (song.size()) {
      documentName = song.attr("id");
      if (!song.hasClass("versionItem") && documentName.indexOf("_")) {
        parentSong = $("#" + documentName.split(/[_]/g)[0]);
        if (parentSong.length) {
          song = parentSong;
        }
      }
      documentTitle = song.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "template",
        name: "editSongDetail"
      }, {
        folder: "procedure",
        name: "getSong",
        params: {
          id: documentName
        }
      }], function (ajaxItem) {
        var html = _c.ajaxList.template.editSongDetail,
            songId = documentName.split("_")[0];
        html = html.replace(/{head}/g, "Édition d'une chanson");
        html = html.replace(/{songId}/g, songId);
        html = html.replace(/{songName}/g, documentTitle);
        html = html.replace(/{versionId}/g, ajaxItem.versionId);
        html = html.replace(/{versionName}/g, ajaxItem.versionName);
        html = html.replace(/{text}/g, ajaxItem.text);
        html = html.replace(/{cheat}/g, ajaxItem.cheat);
        _c.eachItem(["composer", "interpreter"], function (context) {
          var listHtml = "",
              list;
          if (ajaxItem[context]) {
            list = [];
            _c.eachItem(ajaxItem[context], function (item) {
              list.push(_a["buildItem_" + context](item));
              return false;
            });
            listHtml = list.join("");
          }
          html = html.replace(new RegExp("{" + context + "List}", "g"), listHtml);
          return false;
        });
        _c.select("#detail").html(html);
        $("#newVersion").click(function (event) {
          $("#mode").val("add");
        });
        $("#language").val(ajaxItem.language);
        _c.eachItem(["Composer", "Interpreter"], function (context) {
          $("#choose" + context).click(_a["choose" + context + "Click"]);
          return false;
        });
        $("div.albumList").find("a.chooseAlbum:first").click(_a.chooseAlbumClick);
        return false;
      });
    }
    return false;
  },
  clickArtistList: function (event) {
    var target = $(event.target),
        artist = target.parents("li.artist:first"),
        artistId, artistName;
    if (artist.size()) {
      artistId = artist.attr("id");
      artistName = artist.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "template",
        name: "editArtistDetail"
      }, {
        folder: "procedure",
        name: "getArtist",
        params: {
          id: artistId
        }
      }], function (ajaxItem) {
        var html = _c.ajaxList.template.editArtistDetail;
        html = html.replace(/{head}/g, "Édition d'un artiste");
        html = html.replace(/{artistId}/g, artistId);
        html = html.replace(/{artistName}/g, artistName);
        _c.eachItem(["member", "group", "composition", "interpretation"], function (context) {
          var listHtml = "",
              list;
          if (ajaxItem[context]) {
            list = [];
            _c.eachItem(ajaxItem[context], function (item) {
              list.push(_a["buildItem_" + context](item));
              return false;
            });
            listHtml = list.join("");
          }
          html = html.replace(new RegExp("{" + context + "List}", "g"), listHtml);
          return false;
        });
        _c.select("#detail").html(html);
        $("#origin").val(ajaxItem.origin);
        _c.eachItem(["Member", "Group", "Composition", "Interpretation"], function (context) {
          $("#choose" + context).click(_a["choose" + context + "Click"]);
          return false;
        });
        $("div.albumList").find("a.chooseAlbum:first").click(_a.chooseAlbumClick);
        return false;
      });
    } else {}
    return false;
  },
  clickAlbumList: function (event) {
    var target = $(event.target),
        album = target.parents("li.album:first"),
        albumId, albumName;
    if (album.size()) {
      albumId = album.attr("id");
      albumName = album.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "template",
        name: "editAlbumDetail"
      }, {
        folder: "procedure",
        name: "getAlbum",
        params: {
          id: albumId
        }
      }], function (ajaxItem) {
        var html = _c.ajaxList.template.editAlbumDetail;
        html = html.replace(/{head}/g, "Édition d'un album");
        html = html.replace(/{albumId}/g, albumId);
        html = html.replace(/{albumName}/g, albumName);
        html = html.replace(/{year}/g, ajaxItem.year);
        _c.select("#detail").html(html);
        return false;
      });
    }
    return false;
  },
  clickDocumentList: function (event) {
    var target = $(event.target),
        documentLi = target.parents("li.document:first"),
        documentId, documentTitle;
    if (documentLi.size()) {
      documentId = documentLi.attr("id");
      documentTitle = documentLi.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "template",
        name: "editDocumentDetail"
      }, {
        folder: "procedure",
        name: "getDocument",
        params: {
          id: documentId
        }
      }], function (ajaxItem) {
        var html = _c.ajaxList.template.editDocumentDetail;
        html = html.replace(/{head}/g, "Édition d'un document");
        html = html.replace(/{documentId}/g, documentId);
        html = html.replace(/{documentTitle}/g, documentTitle);
        html = html.replace(/{content}/g, ajaxItem.content);
        _c.select("#detail").html(html);
        _a.applyWysiwyg("#content");
        return false;
      });
    }
    return false;
  },
  clickThemeList: function (event) {
    var target = $(event.target),
        theme = target.parents("li.theme:first"),
        themeId, themeName;
    if (theme.size()) {
      themeId = theme.attr("id");
      themeName = theme.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "template",
        name: "editThemeDetail"
      }, {
        folder: "procedure",
        name: "getTheme",
        params: {
          id: themeId
        }
      }], function (ajaxItem) {
        var html = _c.ajaxList.template.editThemeDetail;
        html = html.replace(/{head}/g, "Édition d'un thème");
        html = html.replace(/{themeId}/g, themeId);
        html = html.replace(/{themeName}/g, themeName);
        _c.eachItem(["category"], function (context) {
          var listHtml = "",
              list;
          if (ajaxItem[context]) {
            list = [];
            _c.eachItem(ajaxItem[context], function (item) {
              list.push(_a["buildItem_" + context](item));
              return false;
            });
            listHtml = list.join("");
          }
          html = html.replace(new RegExp("{" + context + "List}", "g"), listHtml);
          return false;
        });
        _c.select("#detail").html(html);
        _c.eachItem(["Category"], function (context) {
          $("#choose" + context).click(_a["choose" + context + "Click"]);
          return false;
        });
        return false;
      });
    } else {}
    return false;
  },
  chooseAlbumClick: function (event) {
    var object = $(this);
    return _c.callAjax([{
      folder: "template",
      name: "choose"
    }, {
      folder: "procedure",
      name: "getAlbumList"
    }], function (ajaxItem) {
      var list = [],
          template, interpreterId = object.attr("id").split("_")[1];
      _c.eachItem(ajaxItem, function (albumItem) {
        var className = "";
        if ($("#album_" + interpreterId + "_" + albumItem.id).size()) {
          className = " class='selected'";
        }
        list.push(interpreterId + "_" + albumItem.id + "'" + className + ">" + albumItem.name);
        return false;
      });
      template = _c.ajaxList.template.choose.replace(/{list}/g, "<li id='album_" + list.join("</li><li id='album_") + "</li>");
      template = template.replace(/{title}/g, "Liste d'albums");
      modalWindow.content = template;
      modalWindow.open();
      $("#chooseList > li").click(_a.albumItemClick);
      return false;
    });
  },
  displayList: function (params) {
    return _c.callAjax([{
      folder: "template",
      name: "choose"
    },
    params.list], function (ajaxItem) {
      var list = [],
          template;
      _c.eachItem(ajaxItem, function (item) {
        var className = "";
        if ($("#" + params.context + "_" + params.preId + item.id).size()) {
          className = " class='selected'";
        }
        list.push(params.id + "_" + params.preId + item.id + "'" + className + ">" + item.name);
        return false;
      });
      template = _c.ajaxList.template.choose.replace(/{list}/g, "<li id='" + list.join("</li><li id='") + "</li>");
      template = template.replace(/{title}/g, params.title);
      modalWindow.content = template;
      modalWindow.open();
      $("#chooseList > li").click(function (event) {
        return _a["append_" + params.id](this, params.context);
      });
      return false;
    });
  },
  chooseComposerClick: function (event) {
    return _a.displayList({
      context: "composer",
      list: {
        folder: "procedure",
        name: "getArtistList",
        params: {
          mode: "all"
        }
      },
      title: "Liste d'artistes",
      preId: "",
      id: "artist"
    });
  },
  chooseInterpreterClick: function (event) {
    return _a.displayList({
      context: "interpreter",
      list: {
        folder: "procedure",
        name: "getArtistList",
        params: {
          mode: "all"
        }
      },
      title: "Liste d'artistes",
      preId: "",
      id: "artist"
    });
  },
  chooseMemberClick: function (event) {
    return _a.displayList({
      context: "member",
      list: {
        folder: "procedure",
        name: "getArtistList",
        params: {
          mode: "all"
        }
      },
      title: "Liste d'artistes",
      preId: "",
      id: "artist"
    });
  },
  chooseGroupClick: function (event) {
    return _a.displayList({
      context: "group",
      list: {
        folder: "procedure",
        name: "getArtistList",
        params: {
          mode: "all"
        }
      },
      title: "Liste d'artistes",
      preId: "",
      id: "artist"
    });
  },
  chooseCompositionClick: function (event) {
    return _c.callAjax([{
      folder: "template",
      name: "choose"
    }, {
      folder: "procedure",
      name: "getSongList"
    }], function (ajaxItem) {
      var list = [],
          template;
      _c.eachItem(ajaxItem, function (songItem) {
        var className = "";
        if ($("#composition_" + songItem.id).size()) {
          className = " class='selected'";
        }
        list.push(songItem.id + "'" + className + ">" + songItem.name);
        return false;
      });
      template = _c.ajaxList.template.choose.replace(/{list}/g, "<li id='song_" + list.join("</li><li id='song_") + "</li>");
      template = template.replace(/{title}/g, "Liste de chansons");
      modalWindow.content = template;
      modalWindow.open();
      $("#chooseList > li").click(_a.compositionItemClick);
      return false;
    });
  },
  chooseInterpretationClick: function (event) {
    return _c.callAjax([{
      folder: "template",
      name: "choose"
    }, {
      folder: "procedure",
      name: "getVersionList"
    }], function (ajaxItem) {
      var list = [],
          template;
      _c.eachItem(ajaxItem, function (versionItem) {
        var className = "";
        if ($("#interpretation_" + versionItem.id).size()) {
          className = " class='selected'";
        }
        list.push(versionItem.id + "'" + className + ">" + versionItem.name);
        return false;
      });
      template = _c.ajaxList.template.choose.replace(/{list}/g, "<li id='version_" + list.join("</li><li id='version_") + "</li>");
      template = template.replace(/{title}/g, "Liste de chansons");
      modalWindow.content = template;
      modalWindow.open();
      $("#chooseList > li").click(_a.interpretationItemClick);
      return false;
    });
  },
  chooseCategoryClick: function (event) {
    return _c.callAjax([{
      folder: "template",
      name: "choose"
    }, {
      folder: "procedure",
      name: "getSongList"
    }], function (ajaxItem) {
      var list = [],
          template;
      _c.eachItem(ajaxItem, function (songItem) {
        var className = "";
        if ($("#category_" + songItem.id).size()) {
          className = " class='selected'";
        }
        list.push(songItem.id + "'" + className + ">" + songItem.name);
        return false;
      });
      template = _c.ajaxList.template.choose.replace(/{list}/g, "<li id='song_" + list.join("</li><li id='song_") + "</li>");
      template = template.replace(/{title}/g, "Liste de chansons");
      modalWindow.content = template;
      modalWindow.open();
      $("#chooseList > li").click(_a.categoryItemClick);
      return false;
    });
  },
  albumItemClick: function (event) {
    var li = $(this),
        ids = li.attr("id").split("_"),
        interpreterId = ids[1],
        albumId = ids[2],
        name = li.html();
    li.toggleClass("selected");
    if (li.hasClass("selected")) {
      $("#albumList_" + interpreterId).append(_a.buildItem_album({
        id: albumId,
        name: name
      }, interpreterId));
    } else {
      $("#album_" + interpreterId + "_" + albumId).remove();
    }
    return false;
  },
  compositionItemClick: function (event) {
    var li = $(this),
        id = li.attr("id").split("_")[1],
        name = li.html();
    li.toggleClass("selected");
    if (li.hasClass("selected")) {
      $("#compositionList").append(_a.buildItem_composition({
        id: id,
        name: name,
        type: ""
      }));
    } else {
      $("#composition_" + id).remove();
    }
    return false;
  },
  interpretationItemClick: function (event) {
    var li = $(this),
        ids = li.attr("id").split("_"),
        name = li.html();
    id = ids[1];
    if (ids[2]) {
      id += "_" + ids[2];
    }
    li.toggleClass("selected");
    if (li.hasClass("selected")) {
      $("#interpretationList").append(_a.buildItem_interpretation({
        id: id,
        name: name
      }));
      $("#interpretation_" + id + " > div.albumList").find("a.chooseAlbum:first").click(_a.chooseAlbumClick);
    } else {
      $("#interpretation_" + id).remove();
    }
    return false;
  },
  categoryItemClick: function (event) {
    var li = $(this),
        id = li.attr("id").split("_")[1],
        name = li.html();
    li.toggleClass("selected");
    if (li.hasClass("selected")) {
      $("#categoryList").append(_a.buildItem_category({
        id: id,
        name: name
      }));
    } else {
      $("#category_" + id).remove();
    }
    return false;
  },
  append_artist: function (object, context) {
    var li = $(object),
        id = li.attr("id").split("_")[1],
        name = li.html();
    li.toggleClass("selected");
    if (li.hasClass("selected")) {
      $("#" + context + "List").append(_a["buildItem_" + context]({
        id: id,
        name: name,
        type: ""
      }));
      if (context == "interpreter") {
        $("#interpreter_" + id + " > div.albumList").find("a.chooseAlbum:first").click(_a.chooseAlbumClick);
      }
    } else {
      $("#" + context + "_" + id).remove();
    }
    return false;
  },
  artistItemClick_composer: function (event) {
    return _a.append_artist(this, "composer");
  },
  artistItemClick_interpreter: function (event) {
    return _a.append_artist(this, "interpreter");
  },
  artistItemClick_member: function (event) {
    return _a.append_artist(this, "member");
  },
  artistItemClick_group: function (event) {
    return _a.append_artist(this, "group");
  },
  buildItem_composer: function (composer) {
    var html = "",
        typeList = [{
        value: "",
        name: "Auteur-compositeur"
      }, {
        value: "music",
        name: "Compositeur"
      }, {
        value: "lyric",
        name: "Auteur"
      }];
    _c.eachItem(typeList, function (typeItem) {
      var selected = (typeItem.value == composer.type) ? " selected='selected'" : "";
      html += "<option value='" + typeItem.value + "'" + selected + ">" + typeItem.name + "</option>";
      return false;
    });
    return "<li id='composer_" + composer.id + "'><input type='hidden' name='composer[]' value='" + composer.id + "'/><div>" + composer.name + "</div><select name='type[]'>" + html + "</select></li>";
  },
  buildItem_interpreter: function (interpreter) {
    var html = "";
    if (interpreter.album) {
      _c.eachItem(interpreter.album, function (album) {
        html += _a.buildItem_album(album, interpreter.id);
        return false;
      });
    }
    return "<li id='interpreter_" + interpreter.id + "'><input type='hidden' name='interpreter[]' value='" + interpreter.id + "'/><div>" + interpreter.name + "</div><div class='albumList'><ul id='albumList_" + interpreter.id + "'>" + html + "</ul><span class='button'><a class='chooseAlbum' id='link_" + interpreter.id + "' title='Choisir'>Choisir dans la liste d'album</a></span></div></li>";
  },
  buildItem_album: function (album, interpreterId) {
    return "<li id='album_" + interpreterId + "_" + album.id + "'><input type='hidden' name='album_" + interpreterId + "[]' value='" + album.id + "'/><div>" + album.name + "</div></li>";
  },
  buildItem_member: function (member) {
    return "<li id='member_" + member.id + "'><input type='hidden' name='member[]' value='" + member.id + "'/><div>" + member.name + "</div></li>";
  },
  buildItem_group: function (group) {
    return "<li id='group_" + group.id + "'><input type='hidden' name='group[]' value='" + group.id + "'/><div>" + group.name + "</div></li>";
  },
  buildItem_composition: function (composition) {
    var html = "",
        typeList = [{
        value: "",
        name: ""
      }, {
        value: "music",
        name: "Musique"
      }, {
        value: "lyric",
        name: "Texte"
      }];
    _c.eachItem(typeList, function (typeItem) {
      var selected = (typeItem.value == composition.type) ? " selected='selected'" : "";
      html += "<option value='" + typeItem.value + "'" + selected + ">" + typeItem.name + "</option>";
      return false;
    });
    return "<li id='composition_" + composition.id + "'><input type='hidden' name='composition[]' value='" + composition.id + "'/><div>" + composition.name + "</div><select name='type[]'>" + html + "</select></li>";
  },
  buildItem_interpretation: function (interpretation) {
    var html = "";
    if (interpretation.album) {
      _c.eachItem(interpretation.album, function (album) {
        html += _a.buildItem_album(album, interpretation.id);
        return false;
      });
    }
    return "<li id='interpretation_" + interpretation.id + "'><input type='hidden' name='interpretation[]' value='" + interpretation.id + "'/><div>" + interpretation.name + "</div><div class='albumList'><ul id='albumList_" + interpretation.id + "'>" + html + "</ul><span class='button'><a class='chooseAlbum' id='link_" + interpretation.id + "' title='Choisir'>Choisir dans la liste d'album</a></span></div></li>";
  },
  buildItem_category: function (category) {
    return "<li id='category_" + category.id + "'><input type='hidden' name='category[]' value='" + category.id + "'/><div>" + category.name + "</div></li>";
  }
};
$(document).ready(function () {
  _a.load();
});
