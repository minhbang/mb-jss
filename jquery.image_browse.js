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
        multiSelect: false,
        onSuccess: null,
        onDeleted: null,
        change: null
    };

    function ImageBrowser(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.init();
    }

    ImageBrowser.prototype = {
        init: function () {
            var _this = this;
            _this.initialized = false;
            _this.page = null;
            _this.image_list = $('<div class="row image-list">');
            _this.pagination = $('<ul class="pagination-sm">');
            _this.element.append($('<div class="image-pagination">').append(_this.pagination)).append(_this.image_list);
            _this.load(_this.options.page);
            _this.image_list.on('click', '.image', function () {
                if(_this.options.multiSelect){
                    $(this).toggleClass('selected');
                } else{
                    _this.image_list.find('.image').removeClass('selected');
                    $(this).addClass('selected');
                }
                if(_this.options.change){
                    _this.options.change(_this);
                }
            });
        },
        selected: function() {
            return $.map(this.image_list.find('.image.selected'), function(item) {
                return $(item).data('image');
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
                item = $('<div class="image">').data('image', image),
                img = $('<img />').attr('src', image["thumb"]),
                title = $('<div class="title">').html(image["title"]),
                selected_mark = $('<div class="selected-mark">').append($('<span class="fa fa-check">')).append($('<div class="bg">'));
            item.append(img).append(selected_mark);
            if (image["title"]) {
                item.append(title);
            }
            this.image_list.append(cell.append(item));
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