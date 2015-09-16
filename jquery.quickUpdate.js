/*
 * Quick update
 */
(function ($, window) {
    'use strict';
    $.fn.extend({
        quickUpdate: function (options) {
            var defaults = {
                url: null,
                container: 'body',
                placement: 'right',
                title: 'Quick Update',
                attribute: 'attribute',
                element: '<input class="form-control" type="text" value="" name="_value">',
                class: null,
                dataTable: null,
                updateSuccess: function (data, oTable) {
                    if (data.type == 'success' && oTable) {
                        oTable.dataTable().fnReloadAjax();
                    }
                    $.fn.mbHelpers.showMessage(data.type, data.message);
                },
                afterShow: null
            };
            options = $.extend(defaults, options);

            function formHtml(attribute, elementClass) {
                var element = options.element;
                if (elementClass) {
                    element = element.replace('class="', 'class="' + elementClass + ' ');
                }
                return '<form class="form-inline form-quick-update form-update-' + attribute + '">' +
                    '<input type="hidden" value="' + attribute + '" name="_attr">' +
                    '<div class="form-group">' +
                    element +
                    '<button class="btn btn-success btn-update-' + attribute + '-ok" type="button"><span class="glyphicon glyphicon-ok"></span></button>' +
                    '<button class="btn btn-white btn-update-' + attribute + '-cancel" type="button"><span class="glyphicon glyphicon-remove"></span></button>' +
                    '</div>' +
                    '</form>';
            }

            var popover;
            var container = $(options.container);

            function hidePopover() {
                if (popover) {
                    popover.popover('hide');
                    popover = null;
                }
            }

            return this.each(function () {
                var attribute = $(this).data('qu_attr') || options.attribute;

                $(this).popover({
                    container: options.container,
                    placement: $(this).data('qu_placement') || options.placement,
                    trigger: 'manual',
                    html: true,
                    title: $(this).data('qu_title') || options.title,
                    content: formHtml(attribute, $(this).data('qu_class') || options.class)
                }).click(function (e) {
                    e.preventDefault();
                    var old_val = $(this).text().trim();
                    hidePopover();
                    $(this).popover('show');
                    popover = $(this);
                    var form = container.find('.popover-content form');
                    form.find('[name="_value"]').val(old_val);
                    form.on('click', '.btn-update-' + attribute + '-cancel', function () {
                        hidePopover();
                    });
                    form.on('click', '.btn-update-' + attribute + '-ok', function () {
                        if (form.find('[name="_value"]').val() != old_val) {
                            var url = popover.attr('href');
                            if (options.url) {
                                url = options.url.replace('__ID__', url.replace('#', ''));
                            }
                            var params = container.find('.popover-content form').serialize();
                            $.post(url + '?' + params, {
                                _token: window.csrf_token
                            }, function (data) {
                                hidePopover();
                                if (options.updateSuccess) {
                                    options.updateSuccess(data, options.dataTable);
                                }
                            }, 'json');
                        } else {
                            hidePopover();
                        }
                    });
                    if (options.afterShow) {
                        options.afterShow(form);
                    }
                });
            });
        }
    });
})(jQuery, window);
