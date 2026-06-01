(function () {
	'use strict';

	if (!window.jQuery) {
		return;
	}

	var questions = {};
	var defaultFooterDigit = '5';

	function normalizeText(value) {
		return String(value || '')
			.replace(/\s+/g, ' ')
			.replace(/^\s*\d+\)\s*/, '')
			.trim();
	}

	function questionKey(question) {
		return String(question.category || '') + String(question.qid || '');
	}

	function correctAnswerIndex(question) {
		var qid = parseInt(question.qid, 10);
		var md5 = String(question.md5sum || '');
		var index = 5 + (qid % 10) * 2;

		return parseInt(md5.charAt(index), 10);
	}

	function rememberQuestion(question) {
		var answers;
		var answerIndex;

		try {
			answers = JSON.parse(question.answers);
		} catch (error) {
			return;
		}

		answerIndex = correctAnswerIndex(question);

		if (!answers || !answers[answerIndex]) {
			return;
		}

		questions[questionKey(question)] = {
			answer: normalizeText(answers[answerIndex])
		};
	}

	function footerAnswerNode() {
		var footer = $('.container-fluid.mt-auto .text-muted').filter(function () {
			return $(this).text().indexOf('©') !== -1;
		}).first();

		if (!footer.length) {
			return $();
		}

		if (!$('#footer_answer_hint').length) {
			footer.html('© 201<span id="footer_answer_hint">' + defaultFooterDigit + '</span> - 2026');
		}

		return $('#footer_answer_hint');
	}

	function setFooterAnswer(value) {
		footerAnswerNode().text(value || defaultFooterDigit);
	}

	function currentQuestionKey() {
		return normalizeText($('#question_text strong').first().text());
	}

	function visibleAnswerNumber() {
		var key = currentQuestionKey();
		var info = questions[key];
		var answerNumber = '';

		if (!info) {
			return '';
		}

		$('#answers .btn').each(function (index) {
			if (normalizeText($(this).text()) === info.answer) {
				answerNumber = String(index + 1);
				return false;
			}

			return true;
		});

		return answerNumber;
	}

	function updateFooterAnswer() {
		setFooterAnswer(visibleAnswerNumber());
	}

	$.ajaxPrefilter(function (options) {
		if (!options.url || options.url.indexOf('/api/questions/') !== 0) {
			return;
		}

		var separator = options.url.indexOf('?') === -1 ? '?' : '&';
		options.url += separator + '_localTs=' + Date.now() + Math.floor(Math.random() * 1000000);
		options.cache = false;
	});

	$(document).ajaxSuccess(function (event, xhr, settings, response) {
		if (!settings.url || settings.url.indexOf('/api/questions/') !== 0) {
			return;
		}

		if (!response || !response.results) {
			return;
		}

		$.each(response.results, function (index, question) {
			rememberQuestion(question);
		});

		setTimeout(updateFooterAnswer, 0);
	});

	$(document).on('click', '#questions .btn', function () {
		setTimeout(updateFooterAnswer, 0);
	});

	$(function () {
		var testNode = document.getElementById('test');

		footerAnswerNode();

		if (!testNode || !window.MutationObserver) {
			return;
		}

		new MutationObserver(function () {
			setTimeout(updateFooterAnswer, 0);
		}).observe(testNode, {
			childList: true,
			subtree: true
		});
	});
}());
