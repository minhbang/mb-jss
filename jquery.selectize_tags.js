/**
 * Selectize dạng input Tags
 * Sử dụng:
 * $(selector).selectize_tags(options)
 */
(function ($) {
    'use strict';
    $.fn.extend({
        selectize_tags: function (settings) {
            var defaults = {
                plugins: ['remove_button'],
                delimiter: ',',
                persist: false,
                options: '',
                create: function (input) {
                    return {
                        value: input,
                        text: input
                    }
                }
            };

            /**
             * @param string opts
             * @return Array
             */
            function buildOptions(opts) {
                var options = [];
                $.each(opts.split(','), function (i, value) {
                    options.push({
                        value: value,
                        text: value
                    });
                });
                return options;
            }

            settings = $.extend(defaults, settings);
            return this.each(function () {
                var options = $(this).data('options'),
                    _settings = {};
                if (typeof options !== "undefined") {
                    _settings.options = options;
                }
                _settings = $.extend(settings, _settings);
                _settings.options = buildOptions(_settings.options);
                $(this).selectize($.extend(settings, _settings));
            });
        }
    });
})(jQuery);
