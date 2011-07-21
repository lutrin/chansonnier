{
  load: function () {
    _c.ajaxList.interaction.document.load("advanceSearch", "[recherche]");
    var html = _c.ajaxList.template.advanceSearch,
        observeList = [],
        choiceList, option, contentSelected, contentHeader, contentBody, tuningList;
    option = {
      "class": "keywordInput",
      maxlength: 100,
      title: "Mots clé",
      value: ""
    };
    html = html.replace(/{keyword}/g, _c.ajaxList.interaction.form.makeTextInput(option));
    html = html.replace(/{filterList}/g, "");
    choiceList = {
      "class": "languageList",
      vertical: true,
      title: "Langue",
      value: "all",
      display: "Toutes",
      list: [{
        display: "Toutes",
        value: "all"
      }, {
        display: "Français",
        value: "fr",
        "class": "fr"
      }, {
        display: "Anglais",
        value: "en",
        "class": "en"
      }, {
        display: "Espagnol",
        value: "es",
        "class": "es"
      }, {
        display: "Italien",
        value: "it",
        "class": "it"
      }, {
        display: "Latin",
        value: "la",
        "class": "la"
      }, {
        display: "Instrumental",
        value: "no",
        "class": "no"
      }]
    };
    html = html.replace(/{languageList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "languageList",
      callback: function () {
        return false;
      }
    });
    option = {
      "class": "withChordsOption",
      display: "Avec accords"
    };
    html = html.replace(/{withChordsOption}/g, _c.ajaxList.interaction.form.makeOption(option));
    observeList.push({
      "class": "withChordsOption",
      callback: function () {
        return false;
      }
    });
    option = {
      "class": "applyButton",
      display: "Appliquer"
    };
    html = html.replace(/{applyButton}/g, _c.ajaxList.interaction.form.makeButton(option));
    observeList.push({
      "class": "applyButton",
      "callback": function () {
        return _c.callAjax([{
          folder: "interaction",
          name: "form"
        }], function (ajaxItem) {
          var contentSelected = _m.getSelectedItem("content"),
              contentHeader = contentSelected.children("div.contentHeader:first"),
              keyword = contentHeader.find("div.keywordInput:first").children("input:first").val(),
              language = ajaxItem.getValue(contentHeader.children(".languageList:first")),
              withChords = ajaxItem.getValue(contentHeader.children(".withChordsOption:first")),
              params = {
              keyword: keyword,
              language: language,
              withChords: withChords
              };
          return _c.callAjax([{
            folder: "procedure",
            name: "getCheatList",
            params: params
          }, {
            folder: "interaction",
            name: "advanceSearch"
          }], function (ajaxItem) {
            var contentBody = contentSelected.children("div.contentBody:first");
            contentBody.html("<img src='./image/processing.gif'/>");
            contentBody.html(ajaxItem.buildResult());
            return false;
          });
        });
      }
    });
    choiceList = {
      "class": "instrumentList",
      vertical: true,
      title: "Instrument",
      display: "Guitare",
      value: "guitar"
    };
    choiceList.list = [];
    _c.eachItem(_c.ajaxList.data.instrument, function (instrumentItem) {
      if (instrumentItem.id == "guitar") {
        tuningList = _c.ajaxList.interaction.chord.getTuning(instrumentItem);
      }
      choiceList.list.push({
        display: instrumentItem.name,
        value: instrumentItem.id
      });
      return false;
    });
    html = html.replace(/{instrumentList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "instrumentList",
      "callback": function () {
        return _c.ajaxList.interaction.chord.reloadTuning(_m.getSelectedItem("content").find("div.instrumentList:first"));
      }
    });
    choiceList = {
      "class": "tuningList",
      vertical: true,
      title: "Accordage",
      display: "Standard",
      value: 1,
      list: tuningList
    };
    html = html.replace(/{tuningList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "tuningList",
      callback: function () {
        _c.select("#popup").hide();
        return false;
      }
    });
    html = html.replace(/{result}/g, "<img src='./image/processing.gif'/>");
    contentSelected = _m.getSelectedItem("content");
    contentSelected.html(html);
    contentHeader = contentSelected.children("div.contentHeader:first");
    _c.eachItem(observeList, function (observeItem) {
      return _c.ajaxList.interaction.form.reloadObserve(contentHeader, observeItem);
    });
    contentBody = contentSelected.children("div.contentBody:first");
    contentBody.html(this.buildResult());
    contentBody.sortable();
    contentBody.click(this.contentBodyClick);
    return false;
  },
  contentBodyClick: function (event) {
    var target = $(event.target),
        song = target.parents("div.song:first"),
        documentName, parent;
    if (song.size()) {
      documentName = song.attr("name");
      documentTitle = song.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "interaction",
        name: "document"
      }], function (ajaxItem) {
        return ajaxItem.load(documentName, documentTitle);
      });
    } else if (target.hasClass("callChord")) {
      _c.callAjax([{
        folder: "data",
        name: "instrument"
      }, {
        folder: "data",
        name: "note"
      }, {
        folder: "data",
        name: "chord"
      }, {
        folder: "template",
        name: "chordDisplay"
      }, {
        folder: "interaction",
        name: "form"
      }, {
        folder: "interaction",
        name: "chord"
      }], function (ajaxItem) {
        return ajaxItem.display(target);
      });
    } else if (target.hasClass("deleteSong")) {
      target.parents(".songResult:first").fadeOut(200, function () {
        $(this).remove();
      });
    }
  },
  buildResult: function () {
    var html = "Aucun résultat",
        songList = [],
        cheatList = [];
    _c.eachItem(_c.ajaxList.procedure.getCheatList, function (songItem) {
      var songHtml = "<div class='song " + songItem.language + "' name='" + songItem.id + "'><a class='documentTitle'>" + songItem.name + "</a></div><img class='deleteSong' src='image/close.png' /></div>",
          cheat;
      if (songItem.cheat) {
        cheat = songItem.cheat.replace(/\n\r/g, "</p><p>").replace(/\n/g, "</p><p>").replace(/\s/g, "&nbsp;").replace(new RegExp("(intro|solo|refrain|pont|outro|chorus|bridge|strum|coda)([:])", "gi"), "<span class='comment'>$1$2</span>");
        cheat = _c.ajaxList.interaction.chord.convert({
          text: "<p>" + cheat + "</p>",
          firstFindChord: 60000
        }).text;
        songHtml += "<div class='cheat'>" + cheat + "</div>";
      }
      songList.push(songHtml);
    });
    if (songList.length) {
      html = "<div class='songResult'><div class='songHeader'>" + songList.join("</div><div class='songResult'><div class='songHeader'>") + "</div>";
    }
    return html;
  }
}
