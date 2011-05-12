{
  load: function (documentName, documentTitle, type) {
    var alreadyLoaded = false,
        contentSelected, documentSelected, App_document;
    $("#documentSerie > div.document[name='" + documentName + "']:first").each(function () {
      alreadyLoaded = true;
      return false;
    });
    if (alreadyLoaded)  {
      this.select(documentName);
      return false;
    }
    contentSelected = _m.getSelectedItem("content");
    documentSelected = _m.getSelectedItem("document");
    if (!contentSelected.length) {
      this.add(documentName, documentTitle);
      contentSelected = _m.getSelectedItem("content");
      documentSelected = _m.getSelectedItem("document");
    } else if (contentSelected.attr("name") == documentName) {
      return false;
    } else {
      this.change(documentName, documentTitle);
    }
    App_document = this;
    contentSelected.html("<div class='contentBody' style=''><img src='./image/processing.gif'/></div>");
    contentSelected.attr("name", documentName);
    documentSelected.attr("name", documentName);
    if (type && type == "document")  {
      _c.callAjax([{ folder: "procedure",
        name: "getDocument",
        params: {
          id: documentName
        }
      }], function (ajaxItem) {
        contentSelected.html("<div class='contentBody'>" + ajaxItem.content + "</div>");
        contentSelected.find("a").attr("target", "_blank");
        return App_document.select(documentName);
      });
    } else if (documentName != "editor" && documentName != "chord" && documentName != "advanceSearch") {
      _c.callAjax([  {
        folder: "interaction",
        name: "text"
      }], function (ajaxItem) {
        ajaxItem.Cls_text(contentSelected, documentName, null);
        return App_document.select(documentName);
      });
    }
    return true;
  },
  goHome: function () {
    this.select("home");
  },
  add: function (documentName, documentTitle) {
    var divTagDoc, divTagDocument, divTagClose;
    if (!documentName) {
      documentName = "empty";
      if ($("#main").find("[name='" + documentName + "']").length > 1) {
        return null;
      }
    }
    divTagClose = "";
    divTagDoc = $("<div class='docSelected' name='" + documentName + "'><div class='docTitle'>" + (documentName == "empty" ? "[vide]" : documentTitle) + "</div><div class='docClose'><img src='./image/close.png' alt='Fermer' width='16' heigth='16' /></div></div>");
    divTagDoc.find(".docTitle:first").click(this.titleClick);
    divTagDoc.find(".docClose:first").click(this.closeClick);
    $("#docSerie").append(divTagDoc);
    divTagDocument = $("<div class='documentSelected' name='" + documentName + "'><div class='contentSelected' name='" + documentName + "' >Il faut choisir un document dans la liste.</div></div>");
    $("#documentSerie").append(divTagDocument);
    return this.select(documentName);
  },
  change: function (documentName, documentTitle) {
    _m.getSelectedItem("content").find("div, a").die("click");
    var App_document = this;
    $("#docSerie > div.docSelected:first").each(function () {
      var docTitle, docClose;
      $(this).attr("name", documentName);
      docTitle = $(this).children("div.docTitle:first");
      docTitle.text(documentName == "empty" ? "[vide]" : documentTitle);
      docTitle.die("click");
      docTitle.click(App_document.titleClick);
      docClose = $(this).children("div.docClose:first");
      docClose.die("click");
      docClose.click(App_document.closeClick);
      return false;
    });
    return false;
  },
  select: function (documentName) {
    var criteria = "[name='" + documentName + "']";
    var objectHTML;
    objectHTML = $("#docSerie > div.docSelected:first").not(criteria);
    objectHTML.removeClass("docSelected");
    objectHTML.addClass("doc");
    objectHTML = $("#docSerie > div.doc" + criteria);
    objectHTML.removeClass("doc");
    objectHTML.addClass("docSelected");
    objectHTML = $("#documentSerie > div.documentSelected:first").not(criteria);
    objectHTML.removeClass("documentSelected");
    objectHTML.addClass("document");
    objectHTML = $("#documentSerie > div.document" + criteria);
    objectHTML.removeClass("document");
    objectHTML.addClass("documentSelected");
    objectHTML = $("#documentSerie").find("div.contentSelected").not(criteria);
    objectHTML.removeClass("contentSelected");
    objectHTML.addClass("content");
    objectHTML = $("#documentSerie").find(".content" + criteria);
    objectHTML.removeClass("content");
    objectHTML.addClass("contentSelected");
    objectHTML = $("#itemList").find("div.documentTitleSelected").not(criteria);
    objectHTML.removeClass("documentTitleSelected");
    objectHTML.addClass("documentTitle");
    objectHTML = $("#itemList").find("div.documentTitle" + criteria);
    objectHTML.removeClass("documentTitle");
    objectHTML.addClass("documentTitleSelected");
    return false;
  },
  close: function (documentName) {
    $("#docSerie").find(".docTitle[name='" + documentName + "'], div.docSelected[name='" + documentName + "']").each(function () {
      $(this).die("click");
      $(this).find(".docClose").die("click");
      return;
    });
    $("#documentSerie > div[name='" + documentName + "']").find("div, a").die("click");
    $("#itemList").find("div.documentTitleSelected[name='" + documentName + "']").each(function () {
      $(this).removeClass("documentTitleSelected");
      $(this).addClass("documentTitle");
      return;
    });
    $("#documentSerie > [name='" + documentName + "'], #docSerie > .doc[name='" + documentName + "']").fadeOut("fast", function () {
      $(this).remove();
      return false;
    });
    var list = [],
        selected = -1,
        newSelected = -1;
    $("#docSerie > div").each(function () {
      if ($(this).hasClass("docSelected") && $(this).attr("name") == documentName) {
        selected = list.length;
      }
      list[list.length] = $(this).attr("name");
      return;
    });
    if (selected >= 0) {
      if (list.length > 1) {
        if (selected > 0) {
          newSelected = selected - 1;
        } else {
          newSelected = selected + 1;
        }
      }
    }
    $("#docSerie:first > div.docSelected[name='" + documentName + "']").fadeOut("fast", function () {
      $(this).remove();
      return false;
    });
    if (newSelected >= 0) {
      this.select(list[newSelected]);
    }
    return false;
  },
  titleClick: function (event) {
    $("#popup").hide();
    return _c.ajaxList.interaction.document.select($(this).parent().attr("name"));
  },
  closeClick: function (event) {
    $("#popup").hide();
    return _c.ajaxList.interaction.document.close($(this).parent().attr("name"));
  },
  buildDocumentList: function (list, ul, click) {
    var documentList = [];
    _c.eachItem(list, function (documentItem) {
      documentList.push(documentItem.id + "' class='document'><a name='" + documentItem.id + "' class='documentTitle'>" + documentItem.title + "</a>");
    });
    ul.html("<li id='" + documentList.join("</li><li id='") + "</li>").removeClass("empty").click(click);
    return false;
  },
  documentClick: function (event) {
    var target = $(event.target),
        liDocument = target.parents("li.document:first"),
        version, documentName, parentSong, documentTitle;
    if (liDocument.size()) {
      liDocument.effect("highlight", {}, 500, null);
      documentName = liDocument.attr("id");
      documentTitle = liDocument.find("a.documentTitle:first").text();
      _c.callAjax([{
        folder: "interaction",
        name: "document"
      }], function (ajaxItem) {
        return ajaxItem.load(documentName, documentTitle, "document");
      });
    }
    return false;
  }
}