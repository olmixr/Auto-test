$(document).ready(function() {
	function set_menu_active() {
		var link = $('#menu a[href="' + window.location.pathname + '"]');

		if ($(link).length) {
			$(link).addClass('active');
		}
	}

	function set_menu_click() {
		$('#menu a').click(function() {
			if ($(this).hasClass('navbar-brand')) {
				location.reload();
				return false;
			}

			window.location.href = $(this).attr('href') + window.location.search;

			return false;
		});
	}

	function create_select_coutry() {
		var html = '';
		var country = url_get('country');

		$.each(Object.keys(g_cl), function(index, value) {
			html += '<option value="' + value + '">' + g_country_name[value] + '&ensp;</option>';
		});

		$('#country').html(html).val(country);

		$('#country').change(function() {
			var country = $(this).val();
			var language = url_get('language');

			if (g_cl[country].indexOf(language) == -1) {
				language = g_cl[country][0];
			}

			ls_set('country', country);
			ls_set('language', language);

			url_set({
				'country': country,
				'language': language,
			});
		});
	}

	function create_select_language() {
		var html = '';
		var country = url_get('country');
		var language = url_get('language');

		$.each(g_cl[country], function(index, value) {
			html += '<option value="' + value + '">' + g_language_name[value] + '&ensp;</option>';
		});

		$('#language').html(html).val(language);

		$('#language').change(function() {
			var language = $(this).val();

			ls_set('language', language);
			url_set({'language': language});
		});
	}

	function get_browser_language() {
		var language = navigator.languages && navigator.languages[0] || // Chrome / Firefox
						navigator.language ||   // All browsers
						navigator.userLanguage; // IE <= 10

		if (language.indexOf('-') !== -1) {
			language = language.split('-')[0];
		}

		return language;
	}

	function set_country_language() {
		var reload = false;
		var country = url_get('country');
		var language = url_get('language');

		if (!country || Object.keys(g_cl).indexOf(country) == -1) {
			reload = true;

			country = Object.keys(g_cl)[0];

			var browser_language = get_browser_language();

			if (Object.keys(g_cl).indexOf(browser_language) != -1) {
				country = browser_language;
			}

			var ls_country = ls_get('country');

			if (Object.keys(g_cl).indexOf(ls_country) != -1) {
				country = ls_country;
			}
		}

		if (!language || g_cl[country].indexOf(language) == -1) {
			reload = true;

			language = g_cl[country][0];

			var ls_language = ls_get('language');

			if (g_cl[country].indexOf(ls_language) != -1) {
				language = ls_language;
			}
		}

		if (reload) {
			ls_set('country', country);
			ls_set('language', language);

			url_set({
				'country': country,
				'language': language,
			});
		}
	}

	function favicon_changer() {
		var time_red = 10000;
		var time_red_yellow = 1500;
		var time_green = 10000;
		var time_yellow = 1500;

		var time = 0;

		setTimeout(function() { $('link[rel="icon"]').attr('href', $('#favicon_g').attr('href')); }, time);
		time += time_green;
		setTimeout(function() { $('link[rel="icon"]').attr('href', $('#favicon_y').attr('href')); }, time);
		time += time_yellow;
		setTimeout(function() { $('link[rel="icon"]').attr('href', $('#favicon_r').attr('href')); }, time);
		time += time_red;
		setTimeout(function() { $('link[rel="icon"]').attr('href', $('#favicon_ry').attr('href')); }, time);
		time += time_red_yellow;

		return time;
	}

	$(function init() {
		set_menu_active();
		set_menu_click();

		create_select_coutry();
		create_select_language();
		set_country_language();

		var time_total = favicon_changer();

		setInterval(function() {
			favicon_changer();
		}, time_total);
	});
});