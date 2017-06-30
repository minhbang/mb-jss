/**
 * Animated Header
 * Sử dụng:
 * $(select).animated_header(options)
 */
;(function ($, window, document) {
    'use strict';
    var defaults = {
        className: 'navbar-scroll',
        changeHeaderOn: 300,
        scrollTimeout: 250
    };

    function AnimatedHeader(element, options) {
        this.options = $.extend(true, defaults, options);
        this.element = $(element);
        this.init();
    }

    AnimatedHeader.prototype = {
        init: function () {
            var _this = this,
                didScroll = false;
            $(window).scroll(function () {
                if (!didScroll) {
                    didScroll = true;
                    setTimeout(scrollPage, _this.options.scrollTimeout);
                }
            });

            function scrollPage() {
                var sy = window.pageYOffset || document.scrollTop;
                if (sy >= _this.options.changeHeaderOn) {
                    _this.element.addClass(_this.options.className);
                }
                else {
                    _this.element.removeClass(_this.options.className);
                }
                didScroll = false;
            }
        }
    };

    $.fn.animated_header = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("animated_header");

            if (!plugin) {
                $(this).data("animated_header", new AnimatedHeader(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window, document);
