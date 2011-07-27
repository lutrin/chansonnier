{
  set: function (objectText) {
    var App_chord;
    objectText = this.convert(objectText);
    App_chord = this;
    return _c.callAjax([  {
      folder: "interaction",
      name: "form"
    }], function (ajaxItem) {
      if (objectText.firstFindChord < 60000) {
        App_chord.buildHeaderTonality(objectText, ajaxItem, _c.ajaxList.data.note);
      } else {
        App_chord.finalizeHeader(objectText, ajaxItem);
      }
    });
  },
  convert: function (paramObjectText) {
    var objectText = paramObjectText;
    _c.eachItem(_c.ajaxList.data.chord, function (chordItem) {
      var startEnd = "([&]nbsp[;]|[<][/]p[>]|[<]p[>])",
          chordId = chordItem.id,
          chordCode = "(" + _c.makeArray(chordItem.code).join("|").replace(new RegExp("X", "g"), "").replace(new RegExp("([+]|[-])", "g"), "[$1]") + ")";
      if (objectText.text.match(new RegExp(chordCode, "g"))) {
        _c.eachItem(_c.ajaxList.data.note, function (noteItem) {
          var noteId = noteItem.id,
              noteHalfton = noteItem.halfton,
              noteCode, code, findChord, longId, regExpToFind;
          noteItem.code = _c.makeArray(noteItem.code);
          noteCode = "(" + noteItem.code.join("|") + ")";
          if (objectText.text.match(new RegExp(noteCode, "g"))) {
            longId = noteId + "_" + chordId;
            code = noteCode + chordCode;
            regExpToFind = new RegExp(startEnd + code + startEnd, "g");
            findChord = objectText.text.search(regExpToFind);
            if (findChord >= 0) {
              if (findChord < objectText.firstFindChord) {
                objectText.firstFindChord = findChord;
                objectText.firstNoteId = noteId;
                objectText.firstNoteHalfton = noteHalfton;
                objectText.firstChordCode = objectText.text.match(regExpToFind)[0].replace(regExpToFind, "$3").replace(new RegExp(chordCode, "g"), "$1");
              }
              objectText.text = objectText.text.replace(regExpToFind, "$1<a class='callChord' name='" + longId + "'>$2$3</a>$4");
            }
            if (objectText.text.match(new RegExp(code + "[/]", "g"))) {
              _c.eachItem(_c.ajaxList.data.note, function (bassItem) {
                var bassId = bassItem.id,
                    bassCode;
                bassItem.code = _c.makeArray(bassItem.code);
                bassCode = "(" + bassItem.code.join("|") + ")";
                objectText.text = objectText.text.replace(new RegExp(startEnd + code + "[/]" + bassCode.slice(0, -1) + ")" + startEnd, "g"), "$1<a class='callChord' name='" + longId + "_" + bassId + "'>$2$3/$4</a>$5");
                return false;
              });
            }
          }
          return false;
        });
      }
      return false;
    });
    return objectText;
  },
  buildHeaderTonality: function (objectText, App_form, noteList) {
    var observeItem, option, choiceList, App_chord;
    option = {
      "class": "lyricsOnlyOption",
      display: "Paroles seulement"
    };
    objectText.optionList += App_form.makeOption(option) + " ";
    observeItem = {
      "class": "lyricsOnlyOption",
      callback: function () {
        return _c.ajaxList.interaction.chord.setLyricsOnly(_m.getSelectedItem("content").find("div.lyricsOnlyOption:first"));
      }
    };
    objectText.observeList.push(observeItem);
    choiceList = {
      "class": "tonalityList",
      vertical: true,
      title: "Tonalité",
      value: objectText.firstNoteHalfton,
      list: []
    };
    noteItem = _c.findItem("id", objectText.firstNoteId, noteList);
    choiceList.display = _c.makeArray(noteItem.code)[0] + objectText.firstChordCode + " (0)";
    choiceList.value = objectText.firstNoteHalfton;
    choiceList.list = [];
    _c.eachItem(noteList, function (noteItem) {
      var choiceItem, difference, halftonDifference, halftonReverse, noteHalfton, iChoice;
      if (noteItem.id == objectText.firstNoteId) {
        choiceList.display = _c.makeArray(noteItem.code)[0] + objectText.firstChordCode + " (0)";
      }
      noteHalfton = noteItem.halfton;
      halftonDifference = parseInt(noteHalfton, "") - parseInt(objectText.firstNoteHalfton, "");
      halftonReverse = halftonDifference - (halftonDifference > 0 ? 12 : (halftonDifference == 0 ? 0 : (-12)));
      difference = ((Math.abs(halftonDifference) < Math.abs(halftonReverse)) ? halftonDifference : halftonReverse) / 2;
      if (difference > 0) {
        difference = "+" + difference.toString();
      }
      difference = difference.toString().replace(/0.5/, "½").replace(/.5/, "½");
      choiceItem = {
        display: _c.makeArray(noteItem.code)[0] + objectText.firstChordCode + " (" + difference + ")",
        value: noteHalfton
      };
      choiceList.list.push(choiceItem);
      return false;
    });
    objectText.optionList += "<input type='hidden' class='tonalityStart' value='" + objectText.firstNoteHalfton + "' />" + App_form.makeChoiceList(choiceList);
    observeItem = {
      "class": "tonalityList",
      callback: function () {
        return _c.ajaxList.interaction.chord.transpose(_m.getSelectedItem("content").find("div.tonalityList:first"));
      }
    };
    objectText.observeList.push(observeItem);
    App_chord = this;
    return _c.callAjax([{
      folder: "data",
      name: "instrument"
    }], function (ajaxItem) {
      return App_chord.buildHeaderInstrument(objectText, App_form, ajaxItem);
    });
  },
  buildHeaderInstrument: function (objectText, App_form, instrumentList) {
    var choiceList = {
      "class": "instrumentList",
      vertical: true,
      title: "Instrument",
      display: "Guitare",
      value: "guitar"
    },
        App_chord = this,
        observeItem, tuningList;
    choiceList.list = [];
    _c.eachItem(instrumentList, function (instrumentItem) {
      if (instrumentItem.id == "guitar") {
        tuningList = App_chord.getTuning(instrumentItem);
      }
      choiceList.list.push({
        display: instrumentItem.name,
        value: instrumentItem.id
      });
      return false;
    });
    objectText.optionList += App_form.makeChoiceList(choiceList);
    observeItem = {
      "class": "instrumentList",
      "callback": function () {
        return _c.ajaxList.interaction.chord.reloadTuning(_m.getSelectedItem("content").find("div.instrumentList:first"));
      }
    };
    objectText.observeList.push(observeItem);
    choiceList = {
      "class": "tuningList",
      vertical: true,
      title: "Accordage",
      display: "Standard",
      value: 1,
      list: tuningList
    };
    objectText.optionList += App_form.makeChoiceList(choiceList);
    observeItem = {
      "class": "tuningList",
      callback: function () {
        _c.select("#popup").hide();
        return false;
      }
    };
    objectText.observeList.push(observeItem);
    return this.finalizeHeader(objectText, App_form);
  },
  finalizeHeader: function (objectText, App_form) {
    var choiceList = {
      "class": "sizeList",
      vertical: true,
      title: "Taille",
      display: "12 px",
      value: "12px"
    },
        iChoice, observeItem, buttonList, contentHeader, option;
    choiceList.list = [];
    /*for (iChoice = 10; iChoice < 16; iChoice++) {
      choiceList.list.push({
        display: iChoice + " px",
        value: iChoice + "px"
      });
    }
    objectText.optionList += App_form.makeChoiceList(choiceList);
    observeItem = {
      "class": "sizeList",
      callback: function () {
        return _c.ajaxList.interaction.chord.resize(_m.getSelectedItem("content").find("div.sizeList:first"));
      }
    };
    objectText.observeList.push(observeItem);*/
    option = {
      "class": "closeButton",
      display: "Fermer"
    };
    objectText.optionList += App_form.makeButton(option);
    objectText.observeList.push({
      "class": "closeButton",
      callback: function () {
        $( ".documentSelected:first,.docSelected:first" ).remove();
      }
    });
    /*
    option = {
      "class": "printButton",
      display: "Optimiser"
    };
    objectText.optionList += App_form.makeButton(option);
    objectText.observeList.push({
      "class": "printButton",
      callback: function () {
        $( "body" ).addClass( "fullScreen" );
      }
    });*/
    option = {
      "class": "editButton",
      display: "Éditer"
    };
    objectText.optionList += App_form.makeButton(option);
    objectText.observeList.push({
      "class": "editButton",
      callback: function () {
        return _c.callAjax([  {
          folder: "interaction",
          name: "editor"
        }], function (ajaxItem) {
          return ajaxItem.edit();
        });
      }
    });
    objectText.contentSelected.hide().html("<div class='contentHeader'>" + objectText.optionList + "</div><div class='contentBody'>" + objectText.text + "</div>").slideDown("normal", function () {
      $(this).focus();
      return false;
    });
    contentHeader = objectText.contentSelected.children("div.contentHeader:first");
    _c.eachItem(objectText.observeList, function (observeItem) {
      return App_form.reloadObserve(contentHeader, observeItem);
    });
    if (objectText.observeList.length) {
      objectText.contentSelected.children("div.contentBody:first").find("a").click(function (event) {
        var objectHTML = $(this);
        return _c.callAjax([{
          folder: "data",
          name: "instrument"
        }, {
          folder: "template",
          name: "chordDisplay"
        }], function (ajaxItem) {
          return _c.ajaxList.interaction.chord.display(objectHTML);
        });
      });
    }
    return false;
  },
  transpose: function (objectHTML) {
    var App_chord = this,
        contentSelected = objectHTML.parents("div.contentSelected:first"),
        tonalityDifference = App_chord.getDifference(contentSelected, _c.ajaxList.interaction.form);
    contentSelected.children("div.contentBody:first > p").find("a").each(function () {
      var idStruct = $(this).attr("name").split("_"),
          codeNote = App_chord.getTransposedCode(_c.ajaxList.data.note, idStruct[0], tonalityDifference),
          codeBass = "",
          codeChord, chordItem, code;
      if (idStruct.length > 2 && idStruct[2] != null && idStruct[2] != "") {
        codeBass = "/" + App_chord.getTransposedCode(_c.ajaxList.data.note, idStruct[2], tonalityDifference);
      }
      chordItem = _c.findItem("id", idStruct[1], _c.ajaxList.data.chord);
      codeChord = _c.makeArray(chordItem.code)[0];
      if (codeChord == "X") {
        codeChord = "";
      }
      code = codeNote + codeChord + codeBass;
      $(this).text(code);
      return;
    });
    return false;
  },
  getTransposedCode: function (noteList, noteId, tonalityDifference) {
    return _c.makeArray(_c.findItem("halfton", this.setHalftonRange(parseInt(_c.findItem("id", noteId, noteList).halfton, "") + tonalityDifference), noteList).code)[0];
  },
  reloadTuning: function (objectHTML) {
    var App_chord = this,
        popupHide = function () {
        _c.select("popup").hide();
        return false;
        },
        observeItem = {
        "class": "tuningList",
        callback: popupHide
        }
        
    instrumentItem = _c.findItem("id", _c.ajaxList.interaction.form.getValue(objectHTML), _c.ajaxList.data.instrument), tuningDefault = _c.makeArray(instrumentItem.tuning)[0], choiceList = {
      display: tuningDefault.name,
      value: tuningDefault.id,
      list: App_chord.getTuning(instrumentItem)
    }, contentHeader = _m.getSelectedItem("content").children("div.contentHeader:first");
    popupHide();
    return _c.ajaxList.interaction.form.setList(choiceList, contentHeader, observeItem);
  },
  getTuning: function (instrumentItem) {
    var tuningList = [];
    _c.eachItem(instrumentItem.tuning, function (tuningItem) {
      tuningList.push({
        display: tuningItem.name,
        value: tuningItem.id
      });
      return false;
    });
    return tuningList;
  },
  display: function (objectChord) {
    var contentSelected = _m.getSelectedItem("content"),
        tonalityDifference = this.getDifference(contentSelected, _c.ajaxList.interaction.form),
        idStruct = $(objectChord).attr("name").split("_"),
        instrumentId = _c.ajaxList.interaction.form.getValue(contentSelected.find("div.contentHeader:first > div.instrumentList:first")),
        noteItem = null,
        bassItem = null,
        App_chord = this,
        instrumentItem, tuningId, pos, left, top, popup, html, params, chordItem, minimum, halfton;
    _c.eachItem(_c.ajaxList.data.note, function (item) {
      if (noteItem == null && item.id == idStruct[0]) {
        noteItem = _c.findItem("halfton", App_chord.setHalftonRange((item.halfton + tonalityDifference)), _c.ajaxList.data.note);
      }
      if (bassItem == null && idStruct.length > 2 && item.id == idStruct[2]) {
        bassItem = _c.findItem("halfton", App_chord.setHalftonRange((item.halfton + tonalityDifference)), _c.ajaxList.data.note);
      }
      return (noteItem != null && bassItem != null);
    });
    instrumentItem = _c.findItem("id", instrumentId, _c.ajaxList.data.instrument);
    tuningId = _c.ajaxList.interaction.form.getValue(_m.getSelectedItem("content").find("div.contentHeader:first > div.tuningList:first"));
    chordItem = _c.findItem("id", idStruct[1], _c.ajaxList.data.chord);
    params = {
      tuningItem: _c.findItem("id", tuningId, instrumentItem.tuning),
      chordItem: chordItem,
      noteList: _c.ajaxList.data.note,
      noteItem: noteItem,
      bassItem: bassItem,
      maxFret: 5,
      index: 0
    };
    html = _c.ajaxList.template.chordDisplay.replace(/{chordName}/g, this.buildChordName(params));
    html = html.replace(/{neck}/g, this.buildNeck(params));
    html = html.replace(/{noteId}/g, noteItem.id);
    html = html.replace(/{chordId}/g, chordItem.id);
    html = html.replace(/{bassId}/g, (bassItem != null) ? bassItem.id : "");
    html = html.replace(/{instrumentId}/g, instrumentId);
    html = html.replace(/{tuningId}/g, tuningId);
    pos = $(objectChord).offset();
    minimum = contentSelected.offset().left;
    left = (pos.left < minimum ? minimum : pos.left) + 10 + "px";
    top = pos.top + 10 + "px";
    popup = _c.select("#popup");
    popup.hide();
    popup.die("click");
    popup.css({
      left: left,
      top: top
    });
    popup.html(html);
    popup.find("div.chordClose:first").click(function (event) {
      _c.select("#popup").fadeOut("normal");
      return false;
    });
    popup.find("td.navigateFingering > a").click(function (event) {
      return _c.ajaxList.interaction.chord.changeFingeringIndex($(this).attr("name"), "#popup", 5);
    });
    popup.fadeIn("normal");
    return false;
  },
  changeFingeringIndex: function (index, element, maxFret) {
    var App_chord = this,
        popup = $(element),
        info = popup.children("div.hiddenInfo:first"),
        instrumentId = info.children("span.instrumentId:first").html(),
        instrumentItem = _c.findItem("id", instrumentId, _c.ajaxList.data.instrument),
        bassId = info.children("span.bassId:first").html();
    popup.find("td.navigateFingering > a").die("click");
    popup.find("table.stringList:first").html(this.buildNeck({
      tuningItem: _c.findItem("id", info.children("span.tuningId:first").html(), instrumentItem.tuning),
      chordItem: _c.findItem("id", info.children("span.chordId:first").html(), _c.ajaxList.data.chord),
      noteList: _c.ajaxList.data.note,
      noteItem: _c.findItem("id", info.children("span.noteId:first").html(), _c.ajaxList.data.note),
      bassItem: (bassId == "") ? null : _c.findItem("id", bassId, _c.ajaxList.data.note),
      maxFret: maxFret,
      index: index
    }));
    popup.find("td.navigateFingering > a").click(function (event) {
      return _c.ajaxList.interaction.chord.changeFingeringIndex($(this).attr("name"), element, maxFret);
    });
    return false;
  },
  isDoted: function (bassHalfton, fretHalfton, chordItem) {
    var doted = false;
    if (bassHalfton) {
      if (bassHalfton == fretHalfton) {
        return true;
      }
    }
    _c.eachItem(chordItem.halfton, function (halftonItem) {
      doted = halftonItem == fretHalfton;
      return doted;
    });
    return doted;
  },
  getDifference: function (contentSelected, App_form) {
    var tonalityDifference = 0;
    contentSelected.find("div.contentHeader:first").each(function ()  {
      var tonalityList = $(this).find("div.tonalityList:first"),
          capoList = $(this).find("div.capoList:first"),
          tonalityStart = $(this).find("input.tonalityStart:first");
      if (tonalityList.size()) {
        tonalityDifference = App_form.getValue(tonalityList);
      }
      if (capoList.size()) {
        tonalityDifference -= App_form.getValue(capoList);
      }
      if (tonalityStart.size()) {
        tonalityDifference -= tonalityStart.val();
      }
      return false;
    });
    return tonalityDifference;
  },
  setHalftonRange: function (value) {
    while (value < 0) {
      value += 12;
    }
    while (value >= 12) {
      value -= 12;
    }
    return value;
  },
  setLyricsOnly: function (objectHTML) {
    var contentBody = objectHTML.parents("div.contentSelected:first").children("div.contentBody:first"),
        rowToHide;
    if (_c.ajaxList.interaction.form.getValue(objectHTML) == "true") {
      contentBody.children("p.tablature:visible").hide();
      contentBody.children("p:visible").each(function () {
        rowToHide = false;
        $(this).find("a, span").each(function () {
          rowToHide = true;
          return;
        });
        if (rowToHide) {
          $(this).hide();
        }
        return;
      });
    } else {
      contentBody.children("p:hidden").show();
    }
    return false;
  },
  resize: function (objectHTML) {
    objectHTML.parents("div.contentSelected:first").children("div.contentBody:first").css({
      "font-size": _c.ajaxList.interaction.form.getValue(objectHTML)
    });
    return false;
  },
  buildChordName: function (params) {
    var chordName = params.noteItem.name + " " + params.chordItem.name;
    if (params.bassItem) {
      chordName += " basse " + params.bassItem.name;
    }
    return chordName;
  },
  buildCodeList: function (params) {
    var codeList = "";
    _c.eachItem(params.noteItem.code, function (noteItemCode) {
      if (params.bassItem) {
        _c.eachItem(params.bassItem.code, function (bassItemCode) {
          codeList += "<div class='tableRow'>";
          _c.eachItem(params.chordItem.code, function (chordItemCode) {
            codeList += "<div class='tableCell'>" + noteItemCode + chordItemCode + "/" + bassItemCode + "</div>";
            return false;
          });
          codeList += "</div>";
          return false;
        });
      } else {
        codeList += "<div class='tableRow'>";
        _c.eachItem(params.chordItem.code, function (chordItemCode) {
          codeList += "<div class='tableCell'>" + noteItemCode + chordItemCode + "</div>";
          return false;
        });
        codeList += "</div>";
      }
      return false;
    });
    codeList = codeList.replace(/X/g, "");
    return codeList;
  },
  buildNeck: function (params) {
    var bassHalfton = null,
        App_chord = this,
        fingeringItem = this.getFingeringList(params),
        fretNumber = "<tr class='fretNumber'><td>&nbsp;</td>",
        i = 1,
        stringList, iString, html;
    while (i <= params.maxFret) {
      fretNumber += "<td>" + (i++) + "</td>";
    }
    fretNumber += "</tr>";
    if (params.bassItem != null) {
      bassHalfton = parseInt(params.bassItem.halfton, "");
    }
    stringList = [];
    iString = 0;
    _c.eachItem(params.tuningItem.string, function (stringNote) {
      var stringNoteItem = _c.findItem("id", stringNote, params.noteList),
          firstHalfton, noteClass, fretList, i, fretHalfton, dot;
      firstHalfton = App_chord.setHalftonRange(parseInt(stringNoteItem.halfton, "") - params.noteItem.halfton);
      noteClass = "note";
      if (App_chord.isDoted(bassHalfton, firstHalfton, params.chordItem)) {
        noteClass += " dot";
        if (fingeringItem != null) {
          if (fingeringItem.fingering[iString] != 0) {
            noteClass += "Not";
          }
          noteClass += "Finger";
        }
      }
      stringNoteItem.code = _c.makeArray(stringNoteItem.code);
      fretList = [];
      for (i = 1; i <= params.maxFret; i++) {
        fretHalfton = App_chord.setHalftonRange(firstHalfton + i);
        dot = "";
        if (App_chord.isDoted(bassHalfton, fretHalfton, params.chordItem)) {
          dot += "dot";
          if (fingeringItem != null) {
            if (fingeringItem.fingering[iString] != i) {
              dot += "Not";
            }
            dot += "Finger";
          }
        } else {
          dot += "empty";
        }
        fretList.push(i + "'><div class='string'><div class='" + dot + "'>&nbsp;</div>");
      }
      stringList.push(noteClass + "'>" + stringNoteItem.code[0] + "</td><td class='fret pos" + fretList.join("</div></td><td class='fret pos"));
      iString++;
      return false;
    });
    html = fretNumber + "<tr class='row'><td class='" + stringList.join("</div></td></tr><tr class='row'><td class='") + "</div></td></tr>";
    if (fingeringItem) {
      fingeringItem.index = parseInt(fingeringItem.index);
      html += "<tr class='fingeringControl'><td class='navigateFingering' colspan='" + (params.maxFret + 1) + "'>";
      if (fingeringItem.index > 0) {
        html += "<a name='" + (fingeringItem.index - 1) + "'><img src='image/previous.png'/></a>";
      } else {
        html += "<img class='hidden' src='image/previous.png'/>";
      }
      for (i = 0; i < fingeringItem.quantity; i++) {
        html += "<a name='" + i + "'><img src='image/item";
        if (i == fingeringItem.index) {
          html += "Check";
        }
        html += ".png'/></a>";
      }
      if (fingeringItem.index < (fingeringItem.quantity - 1)) {
        html += "<a name='" + (fingeringItem.index + 1) + "'><img src='image/next.png'/></a>";
      } else {
        html += "<img class='hidden' src='image/next.png'/>";
      }
      html += "</td></tr>";
    }
    return html;
  },
  buildKeyboard: function (params) {
    var html = "<tr>",
        eachHalftonItem = function (halftonItem) {
        return (i == (halftonItem + params.noteItem.halfton));
        },
        i, iNote, hasDot;
    for (i = 0; i < params.maxKey; i++) {
      iNote = i;
      while (iNote >= params.noteList.length) {
        iNote -= params.noteList.length;
      }
      html += "<td class='key_" + params.noteList[iNote].id + "'>";
      hasDot = false;
      if (params.bassItem != null) {
        hasDot = i == params.bassItem.halfton;
      }
      if (!hasDot) {
        hasDot = _c.eachItem(params.chordItem.halfton, eachHalftonItem);
      }
      html += hasDot ? "<img src='image/dot_red.png' />" : "&nbsp;";
      html += "</td>";
    }
    html += "</tr>";
    return html;
  },
  rebuildChord: function (instrumentItem) {
    var App_chord = this;
    var contentSelected = _m.getSelectedItem("content"),
        noteItem, noteValue, bassItem, bassValue, tuningItem, params, chordId;
    instrumentItem = instrumentItem || _c.findItem("id", _c.ajaxList.interaction.form.getValue(contentSelected.find("div.instrumentList:first")), _c.ajaxList.data.instrument);
    noteItem = null;
    bassItem = null;
    noteValue = _c.ajaxList.interaction.form.getValue(contentSelected.find("div.noteList:first"));
    bassValue = _c.ajaxList.interaction.form.getValue(contentSelected.find("div.bassList:first"));
    _c.eachItem(_c.ajaxList.data.note, function (item) {
      if (noteValue == item.id) {
        noteItem = item;
      } else if (bassValue == item.id) {
        bassItem = item;
      }
      return (noteItem && bassItem);
    });
    tuningItem = _c.findItem("id", _c.ajaxList.interaction.form.getValue(contentSelected.find("div.tuningList:first")), instrumentItem.tuning);
    chordId = _c.ajaxList.interaction.form.getValue(contentSelected.find("div.chordList:first"));
    params = {
      tuningItem: tuningItem,
      chordItem: _c.findItem("id", chordId, _c.ajaxList.data.chord),
      noteList: _c.ajaxList.data.note,
      noteItem: noteItem,
      bassItem: bassItem,
      maxFret: 20,
      maxKey: 30,
      index: 0
    };
    contentSelected.find("span.chordName:first").text(this.buildChordName(params));
    contentSelected.find("span.codeList:first").html(this.buildCodeList(params));
    contentSelected.find("table.stringList:first").html(this.buildNeck(params));
    contentSelected.find("table.keyList:first").html(this.buildKeyboard(params));
    contentSelected.find("span.noteId:first").html(noteItem.id);
    contentSelected.find("span.chordId:first").html(chordId);
    contentSelected.find("span.bassId:first").html((bassItem != null) ? bassItem.id : "");
    contentSelected.find("span.instrumentId:first").html(instrumentItem.id);
    contentSelected.find("span.tuningId:first").html(tuningItem.id);
    chordGenerator = contentSelected.find("div.chordGenerator:first");
    chordGenerator.find("td.navigateFingering:first > a").click(function (event) {
      return _c.ajaxList.interaction.chord.changeFingeringIndex($(this).attr("name"), "div.chordGenerator:first", 20);
    });
    return false;
  },
  getFingeringList: function (params) {
    var findList = [],
        chordItem, newFingeringItem, result, index;
    if (!params.tuningItem.chord) {
      return null;
    }
    chordItem = _c.findItem("id", params.chordItem.id, params.tuningItem.chord);
    if (!chordItem) {
      return null;
    }
    if (chordItem.fingering) {
      _c.eachItem(chordItem.fingering, function (fingeringItem) {
        return _c.eachItem([0, -12, 12 ], function (interval) {
          var toInclude = true,
              stringCount = 0,
              stringSum = 0,
              newFingeringItem = [];
          _c.eachItem(fingeringItem, function (fingeringItemValue) {
            var stringValue = (fingeringItemValue + params.noteItem.halfton) + interval;
            if (stringValue > params.maxFret || stringValue < 0) {
              toInclude = false;
            } else {
              if (fingeringItemValue != "x") {
                newFingeringItem.push(stringValue);
                stringCount++;
                stringSum += stringValue;
              } else {
                newFingeringItem.push("x");
              }
            }
            return !toInclude;
          });
          if (toInclude) {
            findList.push({
              fingering: newFingeringItem,
              value: stringSum / stringCount
            });
          }
          return false;
        });
      });
    }
    if (chordItem.note) {
      noteItem = _c.findItem("id", params.noteItem.id, chordItem.note);
      if (noteItem.fingering) {
        _c.eachItem(noteItem.fingering, function (fingeringItem) {
          var stringCount = 0,
              stringSum = 0;
          _c.eachItem(fingeringItem, function (fingeringItemString) {
            if (fingeringItemString != "x") {
              stringCount++;
              stringSum += fingeringItemString;
            }
            return false;
          });
          findList.push({
            fingering: fingeringItem,
            value: stringSum / stringCount
          });
          return false;
        });
      }
    }
    findList.sort(function (a, b) {
      if (a.value == b.value) {
        return 0;
      }
      return a.value > b.value ? 1 : -1;
    });
    index = parseInt(params.index);
    result = findList[index];
    result.hasPrevious = (index > 0) ? index - 1 : "";
    result.hasNext = (index < (findList.length - 1)) ? index + 1 : "";
    result.quantity = findList.length;
    result.index = index;
    return result;
  },
  load: function () {
    _c.ajaxList.interaction.document.load("chord", "[accords]");
    var observeList = [],
        choiceList, html, contentSelected, contentChord, instrumentItem, iBass, params, chordGenerator;
    html = _c.ajaxList.template.chordGenerator;
    choiceList = {
      "class": "noteList",
      vertical: true,
      title: "Note",
      value: _c.ajaxList.data.note[0].id,
      display: _c.ajaxList.data.note[0].code,
      list: []
    };
    _c.eachItem(_c.ajaxList.data.note, function (noteItem) {
      choiceList.list.push({
        display: noteItem.code,
        value: noteItem.id
      });
      return false;
    });
    html = html.replace(/{noteList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "noteList",
      callback: function () {
        return _c.callAjax([{
          folder: "interaction",
          name: "form"
        }], function (ajaxItem) {
          var contentSelected = _m.getSelectedItem("content");
          _c.ajaxList.interaction.form.setValue(contentSelected.find(".bassList:first"), _c.ajaxList.interaction.form.getValue(contentSelected.find("div.noteList:first")));
          return _c.ajaxList.interaction.chord.rebuildChord(null);
        });
      }
    });
    choiceList = {
      "class": "chordList",
      vertical: true,
      title: "Accord",
      list: [],
      value: _c.ajaxList.data.chord[0].id
    };
    _c.eachItem(_c.ajaxList.data.chord, function (chordItem) {
      choiceList.list.push({
        display: chordItem.menu,
        value: chordItem.id
      });
      return false;
    });
    choiceList.display = _c.ajaxList.data.chord[0].menu;
    html = html.replace(/{chordList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "chordList",
      callback: function () {
        return _c.ajaxList.interaction.chord.rebuildChord(null);
      }
    });
    choiceList = {
      "class": "bassList",
      vertical: true,
      title: "Basse",
      value: _c.ajaxList.data.note[0].id,
      display: _c.ajaxList.data.note[0].code,
      list: []
    };
    _c.eachItem(_c.ajaxList.data.note, function (noteItem) {
      choiceList.list.push({
        display: noteItem.code,
        value: noteItem.id
      });
      return false;
    });
    html = html.replace(/{bassList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "bassList",
      callback: function () {
        return _c.ajaxList.interaction.chord.rebuildChord(null);
      }
    });
    instrumentItem = _c.ajaxList.data.instrument[0];
    choiceList = {
      "class": "instrumentList",
      vertical: true,
      title: "Instrument",
      value: instrumentItem.id,
      display: instrumentItem.name,
      list: []
    };
    _c.eachItem(_c.ajaxList.data.instrument, function (item) {
      choiceList.list.push({
        display: item.name,
        value: item.id
      });
      return false;
    });
    html = html.replace(/{instrumentList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "instrumentList",
      callback: function () {
        var contentHeader = _m.getSelectedItem("content").find("div.contentSection:first"),
            instrumentItem = null,
            instrumentValue, observeItem, tuningDefault;
        instrumentValue = _c.ajaxList.interaction.form.getValue(contentHeader.find("div.instrumentList:first"));
        instrumentItem = _c.findItem("id", instrumentValue, _c.ajaxList.data.instrument);
        tuningDefault = _c.makeArray(instrumentItem.tuning)[0];
        choiceList = {
          display: tuningDefault.name,
          value: tuningDefault.id,
          list: _c.ajaxList.getTuning(instrumentItem)
        };
        _c.ajaxList.interaction.form.setList(choiceList, contentHeader, {
          "class": "tuningList",
          callback: function () {
            return _c.ajaxList.interaction.chord.rebuildChord(null);
          }
        });
        return _c.ajaxList.interaction.chord.rebuildChord(instrumentItem);
      }
    });
    choiceList = {
      "class": "tuningList",
      vertical: true,
      title: "Accordage",
      value: instrumentItem.tuning[0].id,
      display: instrumentItem.tuning[0].name,
      list: []
    };
    _c.eachItem(instrumentItem.tuning, function (item) {
      choiceList.list.push({
        display: item.name,
        value: item.id
      });
      return false;
    });
    html = html.replace(/{tuningList}/g, _c.ajaxList.interaction.form.makeChoiceList(choiceList));
    observeList.push({
      "class": "tuningList",
      callback: function () {
        return _c.ajaxList.interaction.chord.rebuildChord(null);
      }
    });
    params = {
      tuningItem: instrumentItem.tuning[0],
      chordItem: _c.ajaxList.data.chord[0],
      noteList: _c.ajaxList.data.note,
      noteItem: _c.ajaxList.data.note[0],
      bassItem: null,
      maxFret: 20,
      maxKey: 30,
      index: 0
    };
    html = html.replace(/{chordName}/g, this.buildChordName(params));
    html = html.replace(/{codeList}/g, this.buildCodeList(params));
    html = html.replace(/{neck}/g, this.buildNeck(params));
    html = html.replace(/{keyboard}/g, this.buildKeyboard(params));
    html = html.replace(/{noteId}/g, _c.ajaxList.data.note[0].id);
    html = html.replace(/{chordId}/g, _c.ajaxList.data.chord[0].id);
    html = html.replace(/{bassId}/g, "");
    html = html.replace(/{instrumentId}/g, instrumentItem.id);
    html = html.replace(/{tuningId}/g, instrumentItem.tuning[0].id);
    contentSelected = _m.getSelectedItem("content");
    contentSelected.html(html);
    contentChord = contentSelected.children("div.contentEditor:first");
    _c.eachItem(observeList, function (observeItem) {
      return _c.ajaxList.interaction.form.reloadObserve(contentChord, observeItem);
    });
    chordGenerator = contentSelected.find("div.chordGenerator:first");
    chordGenerator.find("td.navigateFingering:first > a").click(function (event) {
      return _c.ajaxList.interaction.chord.changeFingeringIndex($(this).attr("name"), "div.chordGenerator:first", 20);
    });
    return false;
  }
}
