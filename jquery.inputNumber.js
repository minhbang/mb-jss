/**
 * Format input number
 * @author: Minh Bang <contact@minhbang.com>
 */
(function ($) {
    var defaults = {
        mDec: 0,
        aDec: ',',
        aSep: '.'
    };

    function getOption(element, $name) {
        var option = element.data($name);
        if (option == undefined) {
            option = defaults[$name];
        }
        return option;
    }

    function InputNumber(element, options) {
        this.element = $(element);
        this.options = $.extend(true,
            {
                mDec: getOption(this.element, 'mdec'),
                aDec: getOption(this.element, 'adec'),
                aSep: getOption(this.element, 'asep')
            },
            options
        );
        this.init();
    }

    InputNumber.prototype = {
        init: function () {
            var input_original = this.element,
                input_fake = input_original.clone();
            input_original.hide();
            input_fake.attr('name', null);
            input_fake.attr('id', null);
            input_original.after(input_fake);
            input_fake.autoNumeric('init', this.options);
            input_fake.bind('blur focusout keypress keyup', function () {
                input_original.val(input_fake.autoNumeric('get'));
            });
        }
    };
    $.fn.inputNumber = function (params) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("inputNumber");

            if (!plugin) {
                $(this).data("inputNumber", new InputNumber(this, params));
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);
