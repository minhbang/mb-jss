/**
 * Selectize chọn user
 * Sử dụng:
 * $(select).selectize_user(options)
 */
(function ($) {
    'use strict';
    $.fn.extend({
        selectize_user: function (options) {
            var defaults = {
                url: '',
                idField: 'id',
                usernameField: 'username',
                groupnameField: 'group_name'
            };
            options = $.extend(defaults, options);
            return this.each(function () {
                var element = $(this);
                var selected_user = $(this).find('option:selected').text();
                var select_user_init = true;
                $(this).selectize({
                    valueField: options.idField,
                    labelField: options.usernameField,
                    searchField: options.usernameField,
                    create: false,
                    preload: true,
                    render: {
                        option: function (item, escape) {
                            return '<div>' +
                                '<span class="title">' +
                                '<span class="user_name"><i class="fa fa-user"></i> ' + escape(item[options.usernameField]) + '</span>' +
                                '<span class="user_group text-warning">— ' + escape(item[options.groupnameField]) + '</span>' +
                                '</span>' +
                                '<ul class="meta">' +
                                '<li><span>10</span> watchers</li>' +
                                '<li><span>20</span> forks</li>' +
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
                            url: options.url + '/' + encodeURIComponent(query),
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
                                        selectize.updateOption(element.val(), data[0]);
                                    }
                                }
                            }
                        });
                    }
                });
            });
        }
    });
})(jQuery);
