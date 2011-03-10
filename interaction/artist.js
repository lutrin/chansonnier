
{buildArtistList:function(Dat_artist){var artistList=[],ulArtistList;_c.eachItem(Dat_artist,function(artistItem){artistList.push(artistItem.id+"' class='hiddenSection"+
(_c.isNumeric(artistItem.id.substr(0,1))?" numeric":"")+"'><div class='groupTitle o"+
artistItem.origin+"'>"+
artistItem.name);return false;});ulArtistList=_c.select("#artistList");ulArtistList.html("<li id='"+
artistList.join("</div><div class='groupList empty artist'><ul class='empty'><img src='image/loading.gif' /></ul></div></li><li id='")+"</div><div class='groupList empty artist'><ul><img src='image/loading.gif' /></ul></div></li>");ulArtistList.removeClass("empty").click(function(event){var target=$(event.target),section=target.parents("li.hiddenSection:first");if(section.size()){_c.select("#popup").hide();_c.callAjax([{folder:"interaction",name:"song"}],function(ajaxItem){return ajaxItem.showSection(section);});}
return false;});return Dat_artist.length;}}