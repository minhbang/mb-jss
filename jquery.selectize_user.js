/**
 * Selectize chọn user
 * Sử dụng:
 * $(select).selectize_user(options)
 */
;(function ($) {
    'use strict';
    var defaults = {
        url: '',
        users: [],
        idField: 'id',
        nameField: 'name',
        usernameField: 'username',
        groupnameField: 'group_name',
        onChange: null
    };

    function SelectizeUser(element, options) {
        this.options = $.extend(true, defaults, options);
        this.element = $(element);
        this.init();
    }

    SelectizeUser.prototype = {
        init: function () {
            var _this = this,
                selected_user = _this.element.find('option:selected').text(),
                select_user_init = true;
            _this.element.selectize({
                valueField: _this.options.idField,
                labelField: _this.options.usernameField,
                searchField: _this.options.usernameField,
                create: false,
                preload: true,
                render: {
                    option: function (item, escape) {
                        return '<div>' +
                            '<span class="title">' +
                            '<span class="user_name"><i class="fa fa-user"></i> ' + escape(item[_this.options.usernameField]) + '</span>' +
                            '<span class="user_group text-warning"> (' + escape(item[_this.options.nameField]) + ')</span>' +
                            '</span>' +
                            '<ul class="meta">' +
                            '<li>' + escape(item[_this.options.groupnameField]) + '</li>' +
                            '</ul>' +
                            '</div>';
                    }
                },
                load: function (query, callback) {
                    var selectize = this;
                    if (select_user_init && selected_user) {
                        query = selected_user;
                    }
                    if (!query.length) return callback();
                    $.ajax({
                        url:  _this.options.url.replace('__QUERY__', encodeURIComponent(query)),
                        type: 'GET',
                        error: function () {
                            callback();
                        },
                        success: function (data) {
                            callback(data);
                            if (select_user_init && selected_user) {
                                select_user_init = false;
                                $(selectize).data('select_user_init', false);
                                if (data.length) {
                                    selectize.updateOption(_this.element.val(), data[0]);
                                }
                            }
                        }
                    });
                },
                onChange: function (value) {
                    if (_this.options.onChange) {
                        _this.options.onChange(value);
                    }
                }
            });
            var selectize = _this.element.selectize()[0].selectize;
            if (_this.options.users.length) {
                selectize.addOption(_this.options.users);
            }
        }
    };

    $.fn.selectize_user = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("selectize_user");

            if (!plugin) {
                $(this).data("selectize_user", new SelectizeUser(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);
