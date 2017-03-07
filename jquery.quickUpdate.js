/*
 * Quick update
 */
(function ($, window) {
    'use strict';
    var default_element = '<input class="form-control _value" type="text" value="" name="_value">',
        defaults = {
        default_method: "show",
        immediate: false,
        url: null,
        container: 'body',
        placement: 'right',
        title: 'Quick Update',
        attribute: 'attribute',
        elementTemplate: default_element,
        elementClass: null,
        dataTableApi: null,
        updateParams: {_token: window.Laravel.csrfToken},
        updateSuccess: function (e, data, oTableApi, processResult, new_val) {
            if (data.type == 'success') {
                if (processResult) {
                    processResult(e, data.result || null, new_val);
                }
                if (oTableApi) {
                    oTableApi.ajax.reload();
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

    function getElementTemplate(element, templates) {
        var template = default_element;
        if (typeof templates === 'string') {
            template = templates;
        } else {
            $.each(templates, function (selector, templ) {
                if(element.is(selector)){
                    template = templ;
                }
            });
        }
        return template
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
                    getElementTemplate(that.element, that.options.elementTemplate),
                    that.element.data('qu_class') || that.options.elementClass
                )
            });
            if (that.options.immediate) {
                that.show();
            } else {
                that.element.click(function (e) {
                    e.preventDefault();
                    that.show();
                });
            }
        },
        isShowed: function () {
            return this.element.hasClass('popover-showed');
        },

        show: function () {
            if (this.isShowed()) {
                return;
            }
            var that = this,
                old_val = that.element.data('qu_value');
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
                            that.options.updateSuccess(that.element, data, that.options.dataTableApi, that.options.processResult, new_val);
                        }
                    }, 'json');
                } else {
                    that.hideAll();
                }
            });
            if (that.options.afterShow) {
                that.options.afterShow(that.element, form);
            }
            form.find('input[name="_value"]:not(.no-focus)').focus();
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
                } else {
                    retval = plugin[plugin.options.default_method]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window);
