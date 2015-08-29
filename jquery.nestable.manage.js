/**
 * Quản lý dữ liệu dạng Nestable (ví dụ: category, menu...)
 * @author: Minh Bang <contact@minhbang.com>
 */
;
(function ($, window) {
    var defaults = {
        url: {
            data: null,
            move: null,
            delete: null
        },
        max_depth: 5,
        trans: {
            name: "Mục",
            delete_confirm: "Bạn có chắc chắn muốn xóa",
            delete: "Xóa",
            cancel: "Bỏ qua",
            ok: "Đồng ý"
        },
        afterReload: null,
        csrf_token: null
    };

    function enableBootstrap(element) {
        element.find('[data-toggle=tooltip]').tooltip();
    }

    function toggleLoading(element) {
        element.loading.toggleClass('hidden');
    }

    function MbNestable(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.init();
    }

    MbNestable.prototype = {
        init: function () {
            this.dd = this.element.find('.dd');
            this.loading = this.element.find('.loading');
            var that = this;
            if (that.dd) {
                // start nestable
                that.dd.nestable({
                    maxDepth: that.options.max_depth,
                    expandBtnHTML: '<button data-action="expand"><span class="fa fa-plus-square"></span></button>',
                    collapseBtnHTML: '<button data-action="collapse"><span class="fa fa-minus-square"></span></button>',
                    dropCallback: function (data) {
                        var tree = $.toJSON(that.dd.nestable('serialize'));
                        if (tree != that.dd.data('tree')) {
                            that.dd.data('tree', tree);
                            data._token = that.options.csrf_token;
                            toggleLoading(that);
                            $.post(that.options.url.move, data, function (message) {
                                $.fn.mbHelpers.showMessage(message.type, message.content);
                                toggleLoading(that);
                            }, 'json');
                        }
                    }
                });
                that.dd.data('tree', $.toJSON(that.dd.nestable('serialize')));
                // action button
                that.element.find('.nestable_action').on('click', function (e) {
                    e.preventDefault();
                    var action = $(this).data('action');
                    that.dd.nestable(action);
                });
                // delete button
                that.dd.on('click', '.delete_item', function (e) {
                    e.preventDefault();
                    var data = $(this).data();
                    var _options = that.options;
                    window.bootbox.confirm({
                        message: "<div class=\"message-delete\"><div class=\"confirm\">" + _options.trans.delete_confirm + ' ' + _options.trans.name + ":</div><div class=\"title\">" + data['item_title'] + "</div>",
                        title: _options.trans.delete + ' ' + _options.trans.name + '?',
                        buttons: {
                            cancel: {label: _options.trans.cancel, className: "btn-default btn-white"},
                            confirm: {label: _options.trans.ok, className: "btn-danger"}
                        },
                        callback: function (ok) {
                            if (ok) {
                                $.post(_options.url.delete.replace('__ID__', data['item_id']),
                                    {_token: _options.csrf_token, _method: 'delete'},
                                    function (message) {
                                        $.fn.mbHelpers.showMessage(message.type, message.content);
                                        that.reload();
                                    }, 'json'
                                );
                            }
                        }
                    });
                });
                enableBootstrap(that.dd);
            }
        },
        reload: function () {
            var that = this;
            toggleLoading(that);
            $.get(this.options.url.data, function (data) {
                that.dd.html(data.html);
                if (that.afterReload) {
                    that.afterReload(data);
                }
                enableBootstrap(that.dd);
                toggleLoading(that);
            }, 'json');
        }
    };
    $.fn.mbNestable = function (params) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("mbNestable");

            if (!plugin) {
                $(this).data("mbNestable", new MbNestable(this, params));
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window);
