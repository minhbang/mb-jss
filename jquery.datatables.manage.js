// link: http://datatables.net/plug-ins/api/fnSetFilteringDelay
$.fn.dataTableExt.oApi.fnSetFilteringDelay = function (oSettings, iDelay) {
    var _that = this;

    if (iDelay === undefined) {
        iDelay = 250;
    }

    this.each(function (i) {
        $.fn.dataTableExt.iApiIndex = i;
        var oTimerId = null,
            sPreviousSearch = null,
            anControl = $('input', _that.fnSettings().aanFeatures.f);

        anControl.unbind('keyup search input').bind('keyup search input', function () {
            if (sPreviousSearch === null || sPreviousSearch !== anControl.val()) {
                window.clearTimeout(oTimerId);
                sPreviousSearch = anControl.val();
                oTimerId = window.setTimeout(function () {
                    $.fn.dataTableExt.iApiIndex = i;
                    _that.fnFilter(anControl.val());
                }, iDelay);
            }
        });
        return this;
    });
    return this;
};
/**
 * Quản lý DataTables
 * @author: Minh Bang <contact@minhbang.com>
 */
(function ($) {
    var defaults = {
        row_index: false,
        row_reorder: false,
        row_reorder_url: null,
        config: {
            bServerSide: true,
            sPaginationType: 'bootstrap',
            bProcessing: true,
            bSort: false,
            bStateSave: true
        },
        delete_confirm: null,
        trans: {
            name: "Nội dung",
            delete: "Xóa",
            delete_confirm: "Bạn có chắc chắn muốn xóa",
            cancel: "Bỏ qua",
            ok: "Đồng ý"
        },
        csrf_token: null,
        afterDrawCallback: null
    };

    function MbDatatables(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.init();
    }

    MbDatatables.prototype = {
        init: function () {
            var _options = this.options;
            var _config = this.options.config;
            var _element = this.element;

            _element.data('ajaxUrl', _config.sAjaxSource);

            _config.fnRowCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var numStart = this.fnPagingInfo().iStart,
                    index = numStart + iDisplayIndexFull + 1;
                $(nRow).attr("id", 'row-' + aData[0]);
                if (_options.row_index) {
                    $("td:first", nRow).html(index);
                }
                return nRow;
            };

            _config.fnDrawCallback = function (oSettings) {
                var oTable = $('#' + oSettings.sInstance);
                oTable.find('[data-toggle=tooltip]').tooltip({'container': 'body'});
                oTable.find('a.delete-link').click(function (e) {
                    e.preventDefault();
                    var data = $(this).data(),
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
                                    data: {_token: _options.csrf_token},
                                    success: function (message) {
                                        oTable.dataTable().fnReloadAjax();
                                        $.fn.mbHelpers.showMessage(message.type, message.content);
                                    }
                                });
                            }
                        }
                    });

                });
                oTable.find('a.post-link').click(function (e) {
                    e.preventDefault();
                    $.post($(this).attr('href'), {_token: _options.csrf_token}, function (data) {
                        oTable.dataTable().fnReloadAjax();
                        $.fn.mbHelpers.showMessage(data.type, data.content);
                    }, 'json');
                });
                oTable.find('a.post-link-normal').click(function (e) {
                    e.preventDefault();
                    $.fn.dataTableExt.oApi._fnProcessingDisplay(oSettings, true);
                    $.post($(this).attr('href'), {_token: _options.csrf_token, 'reload': 1}, function () {
                        document.location.reload(true);
                    }, 'json');
                });
                if (_options.afterDrawCallback) {
                    _options.afterDrawCallback(oTable);
                }
            };

            //_config.fnInitComplete = function (oSettings, json) {
            _config.fnInitComplete = function (oSettings) {
                var oTable = $('#' + oSettings.sInstance);
                var wrapper = $('#' + oSettings.sInstance + '_wrapper');
                var panel_heading = $('.panel-heading', wrapper);
                var tools = $('#' + oSettings.sInstance + '-tools');
                if (tools.length) {
                    var table_toolbar = $('.dataTables_toolbar', tools);
                    var advanced_search = $('.dataTables_advanced_search', tools);
                    var advanced_search_form = $('form', advanced_search);
                    table_toolbar.children().appendTo(panel_heading);
                    if (advanced_search.length) {
                        advanced_search.addClass('hidden');
                        advanced_search.insertAfter(panel_heading);
                        $('.advanced_search_collapse', panel_heading).on('click', function (e) {
                            e.preventDefault();
                            advanced_search.toggleClass('hidden');
                        });
                        advanced_search_form.find('select, input').on('change', function () {
                            oTable.dataTable().fnReloadAjax(oTable.data('ajaxUrl') + '?' + advanced_search_form.serialize());
                        });
                    }
                    $('.filter-clear', panel_heading).on('click', function (e) {
                        e.preventDefault();
                        oTable.dataTable().fnFilterClear(oTable.data('ajaxUrl'));
                        if (advanced_search.length) {
                            advanced_search_form[0].reset();
                            advanced_search.addClass('hidden');
                        }
                    });
                    tools.remove();
                }
            };

            // start Datatables
            _element.dataTable(_config).fnSetFilteringDelay();
            // start rowReordering add on
            if (_options.row_reorder) {
                _element.dataTable().rowReordering({
                    oContainment: _element.parents('.panel-table'),
                    sURL: _options.row_reorder_url,
                    sToken: _options.csrf_token,
                    fnSuccess: function (data) {
                        $.fn.mbHelpers.showMessage(data.type, data.content);
                    }
                });
            }
        }
    };
    $.fn.mbDatatables = function (params) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("mbDatatables");

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
})(jQuery);
