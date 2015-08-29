/*
 * Chuyển select thành Boostrap button group
 */
(function ($) {
    'use strict';
    $.fn.extend({
        select_btngroup: function (options) {
            var defaults = {
                wrapper: 'select-btngroup'
            };
            options = $.extend(defaults, options);
            return this.each(function () {
                var select_original = $(this);
                select_original.hide();
                var html = '';
                var selected = select_original.find('option:selected');
                var selected_type = selected.data('type') || 'default';
                select_original.find('option').each(function () {
                    var data = $(this).data();
                    var value = $(this).attr('value');
                    var url = data.url || '#';
                    var type = data.type || 'default';
                    var item_class = value !== selected.val() ? '' : ' class="hidden"';
                    html += '<li' + item_class + '><a href="' + url + '" data-type="' + type + '" data-value="' + value + '">' + $(this).text() + '</a></li>';
                });
                var btngroup = '<div class="' + options.wrapper + '"><div class="btn-group">\
  <button type="button" class="btn btn-' + selected_type + ' select-btngroup-button">' + selected.text() + '</button>\
  <button type="button" class="btn btn-' + selected_type + ' dropdown-toggle" data-toggle="dropdown">\
    <span class="caret"></span>\
    <span class="sr-only">Toggle Dropdown</span>\
  </button>\
  <ul class="dropdown-menu" role="menu">' + html + '</ul></div></div>';
                $(this).after(btngroup);
                var select_btngroup = $('.' + options.wrapper);
                select_btngroup.find('a').click(function (e) {
                    e.preventDefault();
                    var current = select_btngroup.find('li:hidden');
                    var current_type = current.find('a').data('type');
                    var new_type = $(this).data('type');
                    select_btngroup.find('button').removeClass('btn-' + current_type).addClass('btn-' + new_type);
                    select_btngroup.find('.select-btngroup-button').text($(this).text());
                    current.removeClass('hidden');
                    $(this).parent().addClass('hidden');
                    select_original.val($(this).data('value'));
                });
            });
        }
    });
})(jQuery);
