/**
 * Từ động điền string slug theo text input
 */
(function ($) {
    'use strict';
    function toSlug(str) {
        str = str.replace(/^\s+|\s+$/g, ''); //trim
        str = str.toLowerCase();
        var from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
        var to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
        return str;
    }

    $.fn.extend({
        mbSlug: function (options) {
            var defaults = {
                target: '.slug'
            };
            options = $.extend(defaults, options);
            return this.each(function () {
                $(this).change(function () {
                    $(options.target).val(toSlug($(this).val()));
                });
            });
        }
    });
})(jQuery);
