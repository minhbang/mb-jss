/*
 * Quick update
 */
(function ($, window) {
	'use strict';
	$.fn.extend({
		quickUpdate: function (options) {
			var defaults = {
				container: 'body',
				placement: 'left',
				title: 'Quick Update',
				element: '<input class="form-control" type="text" value="" name="_value">',
				elementClass: null,
				updateSuccess: null,
				afterShow: null
			};
			options = $.extend(defaults, options);
			if (options.elementClass) {
				options.element = options.element.replace('class="', 'class="' + options.elementClass + ' ');
			}
			var formHtml = '<form class="form-inline form-quick-update form-update-' + options.attribute + '">' +
				'<input type="hidden" value="' + options.attribute + '" name="_name">' +
				'<div class="form-group">' +
				options.element +
				'<button class="btn btn-success btn-update-' + options.attribute + '-ok" type="button"><span class="glyphicon glyphicon-ok"></span></button>' +
				'<button class="btn btn-white btn-update-' + options.attribute + '-cancel" type="button"><span class="glyphicon glyphicon-remove"></span></button>' +
				'</div>' +
				'</form>';
			var popover;
			var container = $(options.container);

			function hidePopover() {
				if (popover) {
					popover.popover('hide');
					popover = null;
				}
			}

			return this.each(function () {
				$(this).popover({
					container: options.container,
					placement: options.placement,
					trigger: 'manual',
					html: true,
					title: options.title,
					content: formHtml
				}).click(function (e) {
					e.preventDefault();
					hidePopover();
					$(this).popover('show');
					popover = $(this);
					var form = container.find('.popover-content form');
					form.find('[name="value"]').val($(this).text().trim());
					form.on('click', '.btn-update-' + options.attribute + '-cancel', function () {
						hidePopover();
					});
					form.on('click', '.btn-update-' + options.attribute + '-ok', function () {
						var params = container.find('.popover-content form').serialize();
						$.post(popover.attr('href') + '?' + params, {
							_token: window.csrf_token
						}, function (data) {
							hidePopover();
							if (options.updateSuccess) {
								options.updateSuccess(data);
							}
						}, 'json');
					});
					if (options.afterShow) {
						options.afterShow(form);
					}
				});
			});
		}
	});
})(jQuery, window);
