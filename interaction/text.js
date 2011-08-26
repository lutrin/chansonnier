{
  Cls_text: function (contentSelected, documentName, text) {
    this.text = text;
    this.url = documentName;
    this.documentName = documentName.split(/[_]/g);
    this.contentSelected = contentSelected;
    this.firstFindChord = "60000";
    this.firstNoteId = null;
    this.firstNoteHalfton = null;
    this.firstChordCode = null;
    this.composerList = null;
    this.composerText = null;
    this.artistList = null;
    this.artistText = null;
    this.observeList = [];
    this.optionList = "";
    this.lyricsOnlyOption = false;
    this.setSongDetail = function (songItem) {
      this.text = songItem.text;
      if (songItem.composer) {
        this.composerList = songItem.composer;
        lyrics = "";
        music = "";
        _c.eachItem(this.composerList, function (composer) {
          if (!composer.type || composer.type == "lyric") {
            if (lyrics) {
              lyrics += ", ";
            }
            lyrics += composer.name;
          }
          if (!composer.type || composer.type == "music") {
            if (music) {
              music += ", ";
            }
            music += composer.name;
          }
          return false;
        });
        if (lyrics == music) {
          this.composerText = "Paroles et musique: " + lyrics;
        } else {
          if (lyrics) {
            this.composerText = "Paroles: " + lyrics;
          }
          if (music) {
            if (this.composerText) {
              this.composerText += "<br />";
            } else {
              this.composerText = "";
            }
            this.composerText += "Musique: " + music;
          }
        }
      }
      if (songItem.interpreter) {
        this.artistList = songItem.interpreter;
        _c.eachItem(this.artistList, function (artistItem) {
          if (artistItem.album) {
            _c.eachItem(artistItem.album, function (albumItem) {
              albumItem = albumItem.name + ", " + albumItem.year;
              return false;
            });
          }
          return false;
        });
      }
      this.callSetEntity();
      return false;
    };
    this.callSetEntity = function () {
      return this.setEntity("file");
    };
    this.setEntity = function (from) {
      var replaceList = [
        [new RegExp("&amp;", "g"),  String.fromCharCode(38)],
        [new RegExp("[<]", "g"), "&lt;"],
        [new RegExp("[>]", "g"), "&gt;"],
        [/\n\r/g, "</p><p>"],
        [/\n/g, "</p><p>"]
      ],
          replacing = function (replaceItem) {
          objectText.text = objectText.text.replace(replaceItem[0], replaceItem[1]);
          return false;
          },
          objectText = this,
          composerText, endPos, artistText, iPos, artistList, makeAlbumTextList, utftext, c, lineText;
      _c.eachItem(replaceList, replacing);
      this.text += "</p>";
      replaceList = [
        [/\s/g, "&nbsp;"],
        [/[<]p[>][\s|&nbsp;]+[<][\/]p[>]/g, "<p class='break'>&nbsp;</p>"],
        [/[<]p[>][<][\/]p[>]/g, "<p class='break'>&nbsp;</p>"]
      ];
      _c.eachItem(replaceList, replacing);
      composerText = "";
      if (this.composerText) {
        composerText = "<p class='composer'>" + this.composerText + "</p>";
      }
      endPos = this.text.indexOf("</p><p>");
      if (endPos > 0) {
        this.text = "<h1>" + this.text.substring(0, endPos) + "</h1>" + composerText + "<p>" + this.text.substring(endPos + 7);
      }
      replaceList = [
        [new RegExp("[{]", "gi"), "<span class='comment'>{"],
        [new RegExp("[}]", "gi"), "}</span>"],
        [new RegExp("(intro|solo|refrain|pont|outro|chorus|bridge|strum|coda)([:])", "gi"), "<span class='comment'>$1$2</span>"]
      ];
      _c.eachItem(replaceList, replacing);
      artistList = [];
      if (this.artistList) {
        makeAlbumTextList = function (albumList) {
          var albumTextList = [];
          _c.eachItem(albumList, function (albumItem) {
            albumTextList.push(albumItem.name + ", " + albumItem.year);
            return false;
          });
          return albumTextList;
        };
        _c.eachItem(this.artistList, function (artistItem) {
          artistText = artistItem.name;
          if (artistItem.album) {
            artistText += "<ul class='albumList'><li class='albumItem'>" + makeAlbumTextList(artistItem.album).join("</li><li class='albumItem'>") + "</li></ul>";
          }
          artistList.push(artistText);
          return false;
        });
        artistText = "<ul class='performList'>Chanson interprétée par:<li class='performItem'>" + artistList.join("</li><li class='performItem'>") + "</li></ul>";
        this.text += artistText;
      }
      iPos = this.text.indexOf("<p>", 0);
      while (iPos >= 0) {
        endPos = this.text.indexOf("</p>", iPos);
        lineText = this.text.substring(iPos, endPos);
        if (lineText.indexOf("--", 0) >= 0) {
          this.text = this.text.replace(lineText, "<p class='tablature'>" + this.text.substring(iPos + 3, endPos));
          endPos += 3;
          this.lyricsOnlyOption = true;
        }
        endPos += 4;
        iPos = this.text.indexOf("<p>", endPos);
      }
      objectText = this;
      return _c.callAjax([{
        folder: "data",
        name: "chord"
      }, {
        folder: "data",
        name: "note"
      }, {
        folder: "interaction",
        name: "chord"
      }], function (ajaxItem) {
        return ajaxItem.set(objectText);
      });
    };
    var objectText = this;
    if (this.text == null) {
      _c.callAjax([{
        folder: "procedure",
        name: "getSong",
        params: {
          id: this.url,
          mark: 1
        }
      }], function (ajaxItem) {
        return objectText.setSongDetail(ajaxItem);
      });
    } else {
      this.setEntity("editor");
    }
    return false;
  }
}
