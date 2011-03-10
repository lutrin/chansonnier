
{buildThemeList:function(Dat_theme){var themeList=[],ulThemeList;_c.eachItem(Dat_theme,function(themeItem){themeList.push(themeItem.id+"' class='hiddenSection"+
(_c.isNumeric(themeItem.id.substr(0,1))?" numeric":"")+"'><div class='groupTitle'>"+
themeItem.name);return false;});ulThemeList=_c.select("#themeList");ulThemeList.html("<li id='"+
themeList.join("</div><div class='groupList empty theme'><ul class='empty'><img src='image/loading.gif' /></ul></div></li><li id='")+"</div><div class='groupList empty theme'><ul><img src='image/loading.gif' /></ul></div></li>");ulThemeList.removeClass("empty").click(function(event){var target=$(event.target),section=target.parents("li.hiddenSection:first");if(section.size()){_c.select("#popup").hide();_c.callAjax([{folder:"interaction",name:"song"}],function(ajaxItem){return ajaxItem.showSection(section);});}
return false;});return Dat_theme.length;}}