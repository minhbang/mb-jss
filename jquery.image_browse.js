/**
 * Quản lý Image Browser
 * Sử dụng:
 * $(selector).imageBrowser(options);
 *
 * Thay đổi các giá trị mặc định:
 * 1. Url:
 * url_store:  '{!!route('image.data', ['page' => '__PAGE__'])!!}',
 * 3. Ngôn ngữ:
 * trans:{
 *     first: "{{trans('common.first')}}",
 *     prev: "{{trans('common.previous')}}",
 *     next: "{{trans('common.next')}}",
 *     last: "{{trans('common.last')}}"
 * },
 */
;
(function ($) {
    'use strict';
    var defaults = {
        url_data: "/image/data/?page=__PAGE__",
        page: 1,
        trans: {
            first: "Đầu",
            prev: "Trước",
            next: "Sau",
            last: "Cuối"
        },
        cell_grid: "col-sm-3 col-xs-4",
        onSuccess: null,
        onDeleted: null
    };

    function ImageBrowser(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.init();
    }

    ImageBrowser.prototype = {
        init: function () {
            this.initialized = false;
            this.page = null;
            this.image_list = $('<div class="row image-list">');
            this.pagination = $('<ul class="pagination-sm">');
            this.element.append($('<div class="image-pagination">').append(this.pagination)).append(this.image_list);
            this.load(this.options.page);
            this.image_list.on('click', '.image', function () {
                $(this).toggleClass('selected');
            });
        },
        load: function (page) {
            if (page == this.page) {
                return;
            }
            var _this = this;
            _this.image_list.empty();
            $.get(_this.options.url_data.replace('__PAGE__', page), function (data) {
                if (data["error"]) {
                    _this.image_list.html('<div class="alert alert-danger">' + data["error"] + '</div>');
                } else {
                    if (!_this.initialized) {
                        _this.pagination.twbsPagination({
                            totalPages: data["pages"],
                            visiblePages: 5,
                            first: _this.options.trans.first,
                            prev: _this.options.trans.prev,
                            next: _this.options.trans.next,
                            last: _this.options.trans.last,
                            onPageClick: function (event, _page) {
                                _this.load(_page);
                            }
                        });
                        _this.initialized = true;
                    }
                    var images = '';
                    $.each(data["images"], function (i, image) {
                        _this.add(image);
                    });
                    _this.image_list.waitForImages(function () {
                        $.fn.mbHelpers.updateModalHeight();
                    });
                }
            }, "json");
            this.page = page;
        },
        add: function (image) {
            var cell = $('<div class="' + this.options.cell_grid + '">'),
                item = $('<div class="image">'),
                img = $('<img />').attr('src', image["thumb"]),
                title = $('<div class="title">').html(image["title"]),
                selected_mark = $('<div class="selected-mark">')
                    .append($('<span class="fa fa-check">'))
                    .append($('<div class="bg">'));
            item.append(img).append(selected_mark);
            if (image["title"]) {
                title.html(image["title"]);
                item.append(title);
            }
            this.image_list.append(cell.append(item));
            item.data('image', image);
        }
    };

    $.fn.imageBrowser = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("imageBrowser");

            if (!plugin) {
                $(this).data("imageBrowser", new ImageBrowser(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);