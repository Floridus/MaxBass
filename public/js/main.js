// Level Slider + Birthday Picker
(function($) {
    'use strict';

	$("#level").slider({
		value: 1,
		tooltip: 'hide',
		id: 'levelSlider',
		ticks: [1, 2, 3, 4, 5],
		ticks_labels: ["Starter", "Rookie", "Advanced", "Pro", "Expert"],
		ticks_snap_bounds: 1
	});
	
	$("#birthday").birthdayPicker({
		"maxAge": 80,
		"monthFormat":"long"
	});
	
	var url = window.location.pathname;
	// if url shows the main page (/) [index page]
	if (url == "/") {
		url += "page/welcome.html";
	} else {
		url = url.replace("/de", "");
		url = url.replace("/en", "");
	}
	$("#lang_en").attr("href", "/en" + url);
	$("#lang_de").attr("href", "/de" + url);

})(jQuery);