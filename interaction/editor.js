{
  load: function () {
    var App_editor = this;
    return _c.callAjax([{
      folder: "interaction",
      name: "document"
    }], function (ajaxItem) {
      if (ajaxItem.load("editor", "[éditeur]")) {
        App_editor.getTemplate(_m.getSelectedItem("content"), "");
      }
      return false;
    });
  },
  applyObserve: function (contentSelected) {
    var observeList = [],
        contentEditor;
    observeList.push({
      "class": "newButton",
      callback: function () {
        var txtPartition = _m.getSelectedItem("content").find("textarea.txtPartition:first");
        txtPartition.val("").attr("rows", 24).focus();
        return false;
      }
    });
    observeList.push({
      "class": "viewButton",
      callback: function () {
        var contentSelected = _m.getSelectedItem("content"),
            documentName, text;
        contentSelected.hide();
        _c.callAjax([  {
          folder: "interaction",
          name: "text"
        }], function (ajaxItem) {
          _c.ajaxList.interaction.editor.dieObserve(contentSelected);
          text = contentSelected.find("textarea.txtPartition:first").val();
          documentName = text.split("\n")[0];
          documentName = _c.replaceAccents(documentName).replace(/[^A-Za-z0-9]/g, "").toLowerCase();
          documentName = _c.ajaxList.interaction.editor.rename(documentName, contentSelected);
          _c.ajaxList.interaction.text.Cls_text(contentSelected, documentName, text);
          return _c.ajaxList.interaction.document.select(documentName);
        });
      }
    });
    contentSelected.find("textarea.txtPartition:first").change(function (event) {
      var text = $(this).val(),
          oldLength = $(this).attr("rows"),
          split, newLength;
      text = text.replace(/\s+$/g, "");
      split = text.split("\n");
      newLength = (split.length > 24) ? split.length : 24;
      if (newLength != oldLength) {
        $(this).attr("rows", newLength);
      }
      return false;
    });
    contentEditor = contentSelected.children("div.contentEditor:first");
    _c.eachItem(observeList, function (observeItem) {
      return _c.ajaxList.interaction.form.reloadObserve(contentEditor, observeItem);
    });
    return false;
  },
  dieObserve: function (contentSelected) {
    return _c.eachItem([
      ["img.btnNew:first", "click"],
      ["img.btnView:first", "click"],
      ["textarea.txtPartition:first", "change"]
    ], function (item) {
      contentSelected.find(item[0]).die(item[1]);
      return false;
    });
  },
  edit: function () {
    var contentSelected = _m.getSelectedItem("content"),
        App_editor = this,
        contentBody, html, text, documentName;
    documentName = contentSelected.attr("name");
    if (documentName.substring(0, 6) != "editor") {
      documentName = this.rename(contentSelected.attr("name"), contentSelected);
    }
    contentBody = contentSelected.find(".contentBody:first");
    contentBody.find("p.composer, ul.performList").remove();
    contentBody.hide();
    html = contentBody.html();
    contentBody.html(html.replace(/[<]p/g, "{newline}<p"));
    text = contentBody.text();
    text = text.replace(/{newline}/g, "\n");
    contentSelected.find("div, a").die("click");
    this.getTemplate(contentSelected, text);
    return _c.ajaxList.interaction.document.select(documentName);
  },
  getTemplate: function (contentSelected, text) {
    var App_editor = this;
    return _c.callAjax([{
      folder: "interaction",
      name: "form"
    }, {
      folder: "template",
      name: "editor"
    }], function (ajaxItem) {
      var html = ajaxItem,
          option;
      option = {
        "class": "newButton",
        display: "Nouveau"
      };
      html = html.replace(/{newButton}/g, _c.ajaxList.interaction.form.makeButton(option));
      option = {
        "class": "viewButton",
        display: "Visualiser"
      };
      html = html.replace(/{viewButton}/g, _c.ajaxList.interaction.form.makeButton(option));
      contentSelected.html(html);
      var txtPartition = contentSelected.find("textarea.txtPartition:first")
      txtPartition.val(text)
      App_editor.applyObserve(contentSelected);
      txtPartition.focus();
      return false;
    }, {});
  },
  rename: function (name, contentSelected) {
    var documentName = "editor_" + name,
        documentSerie = _c.select("#documentSerie"),
        docSerie = _c.select("#docSerie"),
        newDocumentName, counter;
    if (documentSerie.children("div.document[name='" + documentName + "']").lenght > 0) {
      counter = 0;
      do {
        newDocumentName = documentName + "_" + counter++;
      } while (documentSerie.children("div.document[name='" + documentName + "']").length && counter < 10);
      documentName = newDocumentName;
    }
    contentSelected.attr("name", documentName).parent().attr("name", documentName);
    docSerie.children("div.docSelected:first").attr("name", documentName);
    return documentName;
  }
}
