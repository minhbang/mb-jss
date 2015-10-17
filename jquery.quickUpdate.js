/*
 * Quick update
 */
(function ($, window) {
    'use strict';
    var defaults = {
        url: null,
        container: 'body',
        placement: 'right',
        title: 'Quick Update',
        attribute: 'attribute',
        elementTemplate: '<input class="form-control _value" type="text" value="" name="_value">',
        elementClass: null,
        dataTable: null,
        updateParams: {_token: window.csrf_token},
        updateSuccess: function (e, data, oTable, processResult) {
            if (data.type == 'success') {
                if (processResult && (typeof data.result !== 'undefined')) {
                    processResult(e, data.result);
                }
                if (oTable) {
                    oTable.dataTable().fnReloadAjax();
                }
            }
            $.fn.mbHelpers.showMessage(data.type, data.message);
        },
        processResult: null,
        beforeSubmit: null,
        afterShow: null
    };

    function formHtml(attribute, elementTemplate, elementClass) {
        var element = elementTemplate;
        if (elementClass) {
            element = element.replace('class="', 'class="' + elementClass + ' ');
        }
        return '<form class="form-inline form-quick-update form-update-' + attribute + '">' +
            '<input type="hidden" value="' + attribute + '" name="_attr" class="_attr">' +
            '<div class="form-group">' +
            element +
            '<button class="btn btn-success btn-ok" type="submit"><span class="glyphicon glyphicon-ok"></span></button>' +
            '<button class="btn btn-white btn-cancel" type="button"><span class="glyphicon glyphicon-remove"></span></button>' +
            '</div>' +
            '</form>';
    }

    function QuickUpdate(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.container = $(this.options.container);
        this.attribute = this.element.data('qu_attr') || this.options.attribute;
        this.init();
    }

    QuickUpdate.prototype = {
        init: function () {
            var that = this;

            that.element.popover({
                container: that.options.container,
                placement: that.element.data('qu_placement') || that.options.placement,
                trigger: 'manual',
                html: true,
                title: that.element.data('qu_title') || that.options.title,
                content: formHtml(
                    that.attribute,
                    that.options.elementTemplate,
                    that.element.data('qu_class') || that.options.elementClass
                )
            });

            that.element.click(function (e) {
                if (that.element.hasClass('popover-showed')) {
                    return;
                }
                e.preventDefault();
                var old_val = that.element.data('qu_value');
                that.hideAll();
                that.element.addClass('popover-showed').popover('show');
                var form = that.container.find('.popover-content form');
                form.find('[name="_value"]').val(old_val);
                form.on('click', '.btn-cancel', function () {
                    that.hideAll();
                });

                form.submit(function (e) {
                    e.preventDefault();
                    var new_val = form.find('[name="_value"]').val();
                    if (new_val != old_val) {
                        if (that.options.beforeSubmit && !that.options.beforeSubmit(that.element, new_val)) {
                            that.hideAll();
                            return;
                        }
                        var url = that.element.attr('href');
                        if (that.options.url) {
                            url = that.options.url.replace('__ID__', url.replace('#', ''));
                        }
                        var params = that.container.find('.popover-content form').serialize();
                        $.post(url + '?' + params, that.options.updateParams, function (data) {
                            that.hideAll();
                            if (that.options.updateSuccess) {
                                that.options.updateSuccess(that.element, data, that.options.dataTable, that.options.processResult);
                            }
                        }, 'json');
                    } else {
                        that.hideAll();
                    }
                });
                if (that.options.afterShow) {
                    that.options.afterShow(that.element, form);
                }
                form.find('input[type="text"], select').focus();
            });
        },
        show: function () {
            this.element.popover('show');
        },
        hide: function () {
            this.element.popover('hide');
        },
        hideAll: function () {
            $('.popover-showed', this.container).removeClass('popover-showed').popover('hide');
        }
    };

    $.fn.quickUpdate = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("quickUpdate");

            if (!plugin) {
                $(this).data("quickUpdate", new QuickUpdate(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window);
