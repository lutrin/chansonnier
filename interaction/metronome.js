{
  load: function () {
    var metronome = _c.select("#metronome"),
        pauseBlink = function (event) {
        _c.select("#metronomeLight").removeClass("lightBlue").removeClass("lightRed");
        _m.global["blink"] = function () {};
        _c.select("#metronome").find("div.metronomeContent:first").removeClass("playing").addClass("paused");
        return false;
        };
    metronome.hide().html(_c.ajaxList.template.metronome).fadeIn();
    _c.select("#bpm").keydown(pauseBlink);
    _c.select("#bpm").change(function (event) {
      var val = $(this).val(),
          min = 5,
          max = 250;
      $(this).val((!_c.isNumeric(val) || val < min) ? min : max);
      return false;
    });
    metronome.find("img.play:first").click(function (event) {
      _m.global["blink"] = function () {
        var bpm = _c.select("#bpm").val(),
            metronomeLight = _c.select("#metronomeLight");
        if (!metronomeLight.hasClass("lightRed")) {
          metronomeLight.removeClass("lightBlue").addClass("lightRed");
        } else {
          metronomeLight.removeClass("lightRed").addClass("lightBlue");
        }
        if (!_c.select("#noSound")) {
          _c.select("#highhat").get(0).play();
        }
        setTimeout("_m.global.blink()", (60000 / bpm));
        return false;
      };
      _c.select("#metronome").find("div.metronomeContent:first").removeClass("paused").addClass("playing");
      return _m.global.blink();
    });
    metronome.find("img.pause:first").click(pauseBlink);
    return false;
  }
}