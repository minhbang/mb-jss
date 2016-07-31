/**
 * Selectize dạng tree
 * Sử dụng:
 * $(select).selectize_tree(options)
 */
(function ($) {
    'use strict';
    $.fn.extend({
        selectize_tree: function (options) {
            var defaults = {
                persist: false,
                create: false,
                plugins: ['remove_button'],
                render: {
                    option: function (data, escape) {
                        var first = data.first || false;
                        var last = data.last || false;
                        var c = 'selectize-tree-option';
                        if (first) {
                            c = c + ' first';
                        }
                        if (last) {
                            c = c + ' last';
                        }
                        return '<div class="' + c + '" data-level="' + escape(data.level) + '"><span style="margin-left:' + ((data.level - 1) * 25) + 'px">' + escape(data.text) + '</span></div>';
                    }
                }
            };
            options = $.extend(defaults, options);
            return this.each(function () {
                $(this).selectize(options);
            });
        }
    });
})(jQuery);
