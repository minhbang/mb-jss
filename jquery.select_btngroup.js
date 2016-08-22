/*
 * Chuyển select thành Boostrap button group
 */
(function ($, window) {
    'use strict';
    var defaults = {
        wrapper: 'select-btngroup',
        ajax: true,
        dataTable: null
    };

    function htmlBtnGroup(select, wrapper) {
        var html = '',
            selected = select.find('option:selected'),
            selected_type = selected.data('type') || 'default',
            size = select.data('size') || '';
        select.find('option').each(function () {
            var data = $(this).data(),
                type = data.type || 'default',
                text = $(this).text();
            if (type === 'separator') {
                html += '<li role="separator" class="divider"></li>';
            } else if (type === 'group') {
                html += '<li role="separator" class="group">' + text + '</li>';
            } else {
                var value = $(this).attr('value'),
                    url = data.url || '#',
                    badge = data.badge ? ' <span class="badge">' + data.badge + '</span>' : '',
                    item_class = value !== selected.val() ? '' : ' class="hidden"';
                html += '<li' + item_class + '><a href="' + url + '" data-type="' + type + '" data-value="' + value + '">' + text + badge + '</a></li>';
            }
        });
        return '<div class="' + wrapper + '"><div class="btn-group btn-group-' + size + '">\
  <button type="button" class="btn btn-' + selected_type + ' select-btngroup-button">' + selected.text() + '</button>\
  <button type="button" class="btn btn-' + selected_type + ' dropdown-toggle" data-toggle="dropdown">\
    <span class="caret"></span>\
    <span class="sr-only">Toggle Dropdown</span>\
  </button>\
  <ul class="dropdown-menu" role="menu">' + html + '</ul></div></div>'
    }

    function SelectBtnGroup(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        if (this.element.data('ajax') !== undefined) {
            this.options.ajax = this.element.data('ajax');
        }
        this.init();
    }

    SelectBtnGroup.prototype = {
        init: function () {
            var that = this;
            that.element.hide();
            var btngroup = $(htmlBtnGroup(that.element, that.options.wrapper));
            that.element.after(btngroup);
            if (that.options.ajax) {
                btngroup.find('a').click(function (e) {
                    e.preventDefault();
                    var current = btngroup.find('li:hidden');
                    var current_type = current.find('a').data('type');
                    var new_type = $(this).data('type');
                    btngroup.find('button').removeClass('btn-' + current_type).addClass('btn-' + new_type);
                    btngroup.find('.select-btngroup-button').text($(this).text());
                    current.removeClass('hidden');
                    $(this).parent().addClass('hidden');
                    that.element.val($(this).data('value'));
                    var url = $(this).attr('href');
                    if (url !== '#') {
                        $.post(url, {_token: window.csrf_token}, function (data) {
                            $.fn.mbHelpers.showMessage(data.type, data.content);
                            if (that.options.dataTable) {
                                that.options.dataTable.dataTable().fnReloadAjax();
                            }
                        }, 'json');
                    }
                });
            }
        }
    };

    $.fn.select_btngroup = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("select_btngroup");

            if (!plugin) {
                $(this).data("select_btngroup", new SelectBtnGroup(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                } else {
                    retval = plugin[plugin.options.default_method]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window);
