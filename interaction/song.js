{
  buildSongList: function (Dat_song, ulSongList, callback) {
    var songList = [],
        App_song = this;
    _c.eachItem(Dat_song, function (songItem) {
      var songHtml = songItem.id + "' class='";
      songList.push(songHtml + (songItem.version ? App_song.buildVersionList(songItem) : App_song.buildSong(songItem)));
      return false;
    });
    ulSongList.html("<li id='" + songList.join("</li><li id='") + "</li>");
    if (!callback) {
      this.prepareSongResult(ulSongList);
    } else {
      callback();
    }
    return Dat_song.length;
  },
  buildVersionList: function (songItem) {
    var html = "versionList plus" + (_c.isNumeric(songItem.id.substr(0, 1)) ? " numeric" : "") + "'><a href='#" + songItem.id + "' name='" + songItem.id + "' class='documentTitle'>" + songItem.name + "</a><ul id='version_" + songItem.id + "' class='collapsed'><li id='",
        versionList = [],
        iVersion = 0,
        l;
    songItem.version = _c.makeArray(songItem.version);
    l = songItem.version.length;
    while (iVersion < l) {
      versionList.push(this.buildVersion(songItem.version[iVersion++], songItem));
    }
    html += versionList.join("</li><li id='");
    return html + "</li></ul>";
  },
  buildVersion: function (versionItem, songItem) {
    var documentName = songItem.id + "_" + versionItem.id;
    return documentName + "' class='" + this.buildSong({
      id: documentName,
      name: versionItem.name,
      artist: versionItem.artist,
      language: songItem.language
    });
  },
  buildSong: function (songItem) {
    return "song " + songItem.language + (_c.isNumeric(songItem.id.substr(0, 1)) ? " numeric" : "") + "'><a href='#" + songItem.id + "' name='" + songItem.id + "' class='documentTitle'>" + songItem.name + "</a>";
  },
  prepareSongResult: function (ulSongList)  {
    ulSongList.removeClass("empty").click(function (event) {
      var target = $(event.target),
          song = target.parents("li.song:first"),
          version, documentName, parentSong, documentTitle;
      if (song.size()) {
        song.effect("highlight", {}, 500, null);
        documentName = song.attr("id");
        if (!song.hasClass("versionItem") && documentName.indexOf("_")) {
          parentSong = song.parents("#" + documentName.split(/[_]/g)[0] + ".versionList");
          if (parentSong.length) {
            song = parentSong;
          }
        }
        documentTitle = song.find("a.documentTitle:first").text();
        _c.callAjax([{
          folder: "interaction",
          name: "document"
        }], function (ajaxItem) {
          return ajaxItem.load(documentName, documentTitle);
        });
        $( document ).scrollTop( 0 );
      } else {
        version = target.parents("li.versionList:first");
        if (version.size()) {
          _m.setDisplay(version);
        }
      }
      return false;
    });
    return false;
  },
  showSection: function (htmlObject) {
    var id = htmlObject.attr("id"),
        groupList = htmlObject.find("div.groupList:first"),
        App_song = this;
    htmlObject.parent().find("li.section").removeClass("section").addClass("hiddenSection");
    if (groupList.hasClass("empty")) {
      if (groupList.hasClass("artist")) {
        _c.callAjax([{
          folder: "procedure",
          name: "getSongList",
          params: {
            artistId: id
          }
        }], function (ajaxItem) {
          App_song.buildSongList(ajaxItem, groupList.find("ul:first"));
          groupList.removeClass("empty");
          return false;
        });
      } else if (groupList.hasClass("theme")) {
        _c.callAjax([{
          folder: "procedure",
          name: "getSongList",
          params: {
            themeId: id
          }
        }], function (ajaxItem) {
          App_song.buildSongList(ajaxItem, groupList.find("ul:first"));
          groupList.removeClass("empty");
          return false;
        });
      }
    }
    if (htmlObject.hasClass("hiddenSection")) {
      htmlObject.removeClass("hiddenSection").addClass("section");
    } else {
      htmlObject.removeClass("section").addClass("hiddenSection");
    }
    return false;
  }
}