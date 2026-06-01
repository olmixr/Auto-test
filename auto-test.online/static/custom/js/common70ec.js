var g_cl = {
	'md': ['ro', 'ru'],
	'ua': ['ua', 'ru'],
	'ru': ['ru'],
};

var g_country_name = {
	'md': 'Moldova',
	'ua': 'Україна',
	'ru': 'Россия',
};

var g_language_name = {
	'ro': 'Romanian',
	'ru': 'Русский',
	'ua': 'Український',
};

function url_set(arr) {
	var url_params = new URLSearchParams(window.location.search);

	$.each(arr, function(key, value) {
		url_params.set(key, value);
	});

	document.location.search = url_params;
}

function url_get(key) {
	var url_params = new URLSearchParams(window.location.search);

	return url_params.get(key);
}

function ls_set(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function ls_get(key) {
	var obj = localStorage.getItem(key);

	if (!obj) {
		return null;
	}

	return JSON.parse(obj);
}

function ls_remove(key) {
	localStorage.removeItem(key);
}