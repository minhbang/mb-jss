/**
 * Quản lý DataTables
 * @author: Minh Bang <contact@minhbang.com>
 */
(function (window, $) {
    const defaults = {
        trans: {
            name: "Nội dung",
            delete: "Xóa",
            delete_confirm: "Bạn có chắc chắn muốn xóa",
            cancel: "Bỏ qua",
            ok: "Đồng ý"
        },
    };

    function MbDatatables(element, options) {
        window.settings.mbDatatables = window.settings.mbDatatables || {};
        this.options = $.extend(true, defaults, window.settings.mbDatatables, options);

        this.element = $(element);
        this.table = this.element.DataTable();
        this.url = this.table.ajax.url();
        this.init();
    }

    MbDatatables.prototype = {
        init: function () {
            let _element = this.element;
            let _tableApi = this.table;
            let _url = this.url;
            let _options = this.options;
            this.element.on('draw.dt', function () {
                _element.find('[data-toggle=tooltip]').tooltip({'container': 'body'});
                _element.find('a.delete-link').click(function (e) {
                    e.preventDefault();
                    let data = $(this).data(),
                        url = $(this).attr('href'),
                        message = '';
                    if (_options.delete_confirm) {
                        message = "<div class=\"confirm\">" + _options.delete_confirm + "</div>";
                    } else {
                        message = "<div class=\"confirm\">" + _options.trans.delete_confirm + ' ' + _options.trans.name + ":</div><div class=\"title\">" + data['title'] + "</div>";
                    }
                    window.bootbox.confirm({
                        message: "<div class=\"message-delete\">" + message + "</div>",
                        title: _options.trans.delete + ' ' + _options.trans.name + '?',
                        buttons: {
                            cancel: {label: _options.trans.cancel, className: "btn-default btn-white"},
                            confirm: {label: _options.trans.ok, className: "btn-danger"}
                        },
                        callback: function (ok) {
                            if (ok) {
                                $.ajax({
                                    url: url,
                                    type: 'DELETE',
                                    dataType: 'json',
                                    data: {_token: window.Laravel.csrfToken},
                                    success: function (message) {
                                        _tableApi.ajax.reload();
                                        $.fn.mbHelpers.showMessage(message.type, message.content);
                                    }
                                });
                            }
                        }
                    });

                });

                _element.find('a.post-link').click(function (e) {
                    e.preventDefault();
                    $.post($(this).attr('href'), {_token: window.Laravel.csrfToken}, function (data) {
                        _tableApi.ajax.reload();
                        $.fn.mbHelpers.showMessage(data.type, data.content);
                    }, 'json');
                });

                _element.find('a.post-link-normal').click(function (e) {
                    e.preventDefault();
                    //$.fn.dataTableExt.oApi._fnProcessingDisplay(oSettings, true);
                    $.post($(this).attr('href'), {_token: window.Laravel.csrfToken, 'reload': 1}, function () {
                        document.location.reload(true);
                    }, 'json');
                });

                if (typeof window.datatableDrawCallback != 'undefined') {
                    window.datatableDrawCallback(_tableApi);
                }
            });

            // Advanced filter
            let _ibox = this.element.closest('.ibox');
            let _advanced_filter = $('.dataTables_advanced_filter', _ibox);
            let _buttons = $('.ibox-title .buttons', _ibox);
            let _form = $('form', _advanced_filter);
            if (_advanced_filter.length) {
                $('.advanced_filter_collapse', _buttons).click(function (e) {
                    e.preventDefault();
                    _advanced_filter.toggleClass('hidden');
                });
                $('.advanced_filter_clear', _buttons).click(function (e) {
                    e.preventDefault();
                    _tableApi.ajax.url(_url);
                    _tableApi.search('').columns().search('').draw();
                    _form[0].reset();
                    _advanced_filter.addClass('hidden');
                });
                $('select, input', _form).on('change', function () {
                    _tableApi.ajax.url(_url + '?' + _form.serialize()).load();
                });
            }
        }
    };
    $.fn.mbDatatables = function (params) {
        let lists = this,
            retval = this;
        lists.each(function () {
            let plugin = $(this).data("mbDatatables");

            if (!plugin) {
                $(this).data("mbDatatables", new MbDatatables(this, params));
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };
})(window, jQuery);