/**
 * Table row reorder, js client cho Position action
 * Sử dụng:
 * $(table selector).rowReorder(options)
 */
;(function ($, window) {
    'use strict';
    var defaults = {
            url: null,
            token: window.csrf_token,
            containment: "parent",
            loading: null
        },
        toggleLoading = function (loading) {
            if (loading) {
                loading.toggleClass('hidden');
            }
        },
        fixHelperModified = function (e, tr) {
            var $originals = tr.children();
            var $helper = tr.clone();
            $helper.children().each(function (index) {
                $(this).width($originals.eq(index).width())
            });
            return $helper;
        },
        updateIndex = function (ui) {
            $('td:first-child', ui.item.parent()).each(function (i) {
                $(this).html(i + 1);
            });
        },
        getOrder = function (tbody) {
            var order = [];
            $(tbody).find('tr').each(function () {
                order.push($(this).data('id'));
            });
            return order.join(',');
        };

    function RowReorder(element, options) {
        this.options = $.extend(true, defaults, options);
        this.element = $(element);
        this.tbody = this.element.find('tbody');
        this.order = getOrder(this.tbody);
        if (this.options.loading) {
            this.options.loading = $(this.options.loading);
        }
        this.init();
    }

    RowReorder.prototype = {
        init: function () {
            var _this = this;
            _this.element.addClass('table-sortable');
            _this.tbody.sortable({
                helper: fixHelperModified,
                start: function (e, ui) {
                    ui.placeholder.height(ui.item.height());
                },
                update: function (e, ui) {
                    var newOrder = getOrder(_this.tbody);
                    if (newOrder != this.order) {
                        toggleLoading(_this.options.loading);
                        var row_id = ui.item.context.id,
                            row = $('#' + row_id, _this.element),
                            prev = row.prev('tbody tr'),
                            next = row.next('tbody tr'),
                            params = {
                                _token: _this.options.token,
                                id: row_id,
                                id_prev: prev.length > 0 ? prev.attr('id') : null,
                                id_next: next.length > 0 ? next.attr('id') : null
                            };
                        $.post(_this.options.url, params, function (data) {
                            $.fn.mbHelpers.showMessage(data.type, data.content);
                            updateIndex(ui);
                            toggleLoading(_this.options.loading);
                        }, 'json');
                    }
                },
                containment: this.options.containment,
                cursor: "move",
                axis: "y",
            }).disableSelection();
        }
    };

    $.fn.rowReorder = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("rowReorder");

            if (!plugin) {
                $(this).data("rowReorder", new RowReorder(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window);
