
{makeOption:function(option){return"<div class='"+
option["class"]+" optionItemList'><span class='choiceListValue'>false</span><span class='optionItem unselectable'>"+
option.display+"</span></div>";},makeChoiceList:function(choiceList){return"<div class='"+
choiceList["class"]+" choiceList'><span class='choiceListTitle'>"+
choiceList.title+":</span><span class='choiceListDisplay'>"+
choiceList.display+"</span><span class='choiceListValue'>"+
choiceList.value+"</span><div class='choiceSubList'><ul class='optionItemList vertical'>"+
this.makeChoiceSubList(choiceList)+"</ul></div></div>";},makeTextInput:function(option){return"<div class='"+
option["class"]+" textInput'><input type='text' maxlength='"+
option.maxlength+"' title='"+
option.title+"' value='"+
option.value+"'/></div>";},makeButton:function(option) {return"<div class='"+
option["class"]+" button'><span>"+
option.display+"</span></div>";},makeChoiceSubList:function(choiceList) {var subList=[];_c.eachItem(choiceList.list,function(choiceItem){subList.push(((choiceItem.value==choiceList.value)?" checked'":"")+"'><span class='hiddenValue'>"+
choiceItem.value+"</span><span class='display"+
(choiceItem["class"]?" "+choiceItem["class"]:"")+"'>"+
choiceItem.display);return false;});return"<li class='optionItem"+
subList.join("</span></li><li class='optionItem")+"</span></li>";},setList:function(choiceList,objectHTML,observeItem){var App_form=this;objectHTML.find("div."+observeItem["class"]+":first").each(function(){$(this).find(".choiceListDisplay:first").text(choiceList.display);$(this).find(".choiceListValue:first").text(choiceList.value);var optionItemList=$(this).find(".choiceSubList:first > .optionItemList:first");optionItemList.html(App_form.makeChoiceSubList(choiceList));return false;});return this.reloadObserve(objectHTML,observeItem);},reloadObserve:function(objectHTML,observeItem){var App_form=this;objectHTML.find("div."+observeItem["class"]+":first").each(function(){var optionItem=$(this).find(".optionItem");optionItem.die("click").click(function(event){_c.select("#popup").hide();var optionItemList,objectChoiceList,choiceListDisplay;if($(this).hasClass("unselectable")){optionItemList=$(this).parents(".optionItemList").children(".choiceListValue:first");$(this).toggleClass("checked");optionItemList.text($(this).hasClass("checked")?"true":"false");}else{objectChoiceList=$(this).parents(".choiceList");choiceListDisplay=objectChoiceList.children(".choiceListDisplay:first");choiceListDisplay.text($(this).children(".display").text());choiceListDisplay.effect("highlight",{},500,null);objectChoiceList.children(".choiceListValue:first").text($(this).children(".hiddenValue").text());$(this).parent().children(".optionItem").removeClass("checked");$(this).addClass("checked");}
return observeItem.callback();});if($(this).hasClass("button")){$(this).die("click").click(function(event){_c.select("#popup").hide();$(this).effect("highlight",{},500,null);return observeItem.callback();});}
return false;});return false;},getValue:function(objectHTML){return objectHTML.children(".choiceListValue:first").text();},setValue:function(objectHTML,value){var display=null;objectHTML.find(".optionItem").removeClass("checked");objectHTML.find(".optionItem > .hiddenValue").each(function(){if($(this).text()==value){var parent=$(this).parent();display=parent.children(".display").text();parent.addClass("checked");}
return;});if(!display){return false;}
objectHTML.find(".choiceListDisplay:first").text(display);objectHTML.find(".choiceListValue:first").text(value);return false;}}