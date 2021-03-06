{
  load: function () {
    var autoscroll = _c.select("#autoscroll"),
        interval = (-200),
        maximum = 200;
    _m.global["speed"] = (0.5 * interval) + maximum;
    autoscroll.hide().html(_c.ajaxList.template.autoscroll).fadeIn();
    autoscroll.find("img.play:first").click(function (event) {
      _m.global["scroll"] = function () {
        var body = $("body:first"),
            s = body.attr("scrollTop") + 1;
        body.attr("scrollTop", s);
        if (s < body.attr("scrollHeight")) {
          setTimeout(m.global.scroll, _m.global.speed);
        }
      };
      var content = _c.select("#autoscroll").find("div.autoscrollContent:first");
      content.removeClass("paused").addClass("playing");
      _m.global.scroll();
    });
    autoscroll.find("img.pause:first").click(function (event) {
      var content = _c.select("#autoscroll").find("div.autoscrollContent:first");
      _m.global.scroll = function () {
        return false;
      };
      content.removeClass("playing").addClass("paused");
      return false;
    });
    autoscroll.find("div.percent:first").click(function (event) {
      var left = $(this).offset().left,
          width = $(this).width(),
          x = event.pageX,
          distance = x - left,
          percent;
      if (distance >= 0 && distance <= width) {
        percent = Math.round((distance / width) * 100);
        $(this).children(".bar:first").css("width", percent + "%");
        _m.global["speed"] = ((percent / 100) * interval) + maximum;
      }
      return false;
    });
    return false;
  }
}