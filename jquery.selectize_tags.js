/**
 * Selectize dạng input Tags
 * Sử dụng:
 * $(selector).selectize_tags(options)
 */
(function ($) {
    'use strict';
    var defaults = {
        plugins: ['remove_button'],
        delimiter: ',',
        persist: false,
        options: '',
        createOnBlur: true,
        render: {
            option_create: function (data, escape) {
                return '<div class="create">+<strong>' + escape(data.input) + '</strong>&hellip;</div>';
            }
        },
        create: function (input) {
            return {
                value: input,
                text: input
            }
        }
    };

    function buildOptions(options) {
        var opts = [];
        $.each(options.split(','), function (i, value) {
            opts.push({
                value: value,
                text: value
            });
        });
        return opts;
    }

    function SelectizeTags(element, settings) {
        this.element = $(element);
        this.settings = $.extend(true, defaults, settings);
        this.init();
    }

    SelectizeTags.prototype = {
        init: function () {
            var options = this.element.data('options');
            if (options) {
                this.settings.options = options;
            }
            this.settings.options = buildOptions(this.settings.options);
            this.element.selectize(this.settings);
        }
    };

    $.fn.selectize_tags = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("selectize_tags");

            if (!plugin) {
                $(this).data("selectize_tags", new SelectizeTags(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);
