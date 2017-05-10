/**
 * Selectize dạng input statuses
 * Sử dụng:
 * $(selector).selectize_status(options)
 */
(function ($) {
    'use strict';
    var defaults = {
        persist: false,
        create: false,
        createOnBlur: false,
        searchField: ['text', 'value'],
        render: {
            option: function (item) {
                return '<div><strong>' + item.value + '</strong><span class="text-danger"> — ' + item.text + '</span>' + '</div>';
            },
            item: function (item) {
                return '<div><strong>' + item.value + '</strong><span class="text-danger"> — ' + item.text + '</span>' + '</div>';
            }
        },
    };

    function SelectizeStatus(element, settings) {
        this.element = $(element);
        this.settings = $.extend(true, defaults, settings);
        this.init();
    }

    SelectizeStatus.prototype = {
        init: function () {
            this.element.selectize(this.settings);
        }
    };

    $.fn.selectize_status = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("selectize_status");

            if (!plugin) {
                $(this).data("selectize_status", new SelectizeStatus(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);
