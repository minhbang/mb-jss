/*
 * mbHelpers
 * @author: Minh Bang <contact@minhbang.com>
 */
(function ($, window) {
    $.fn.mbHelpers = {
        reloadPage: null,
        imageBrowserChange: null,
        showMessage: function (type, message, options) {
            options = options || {};
            switch (type) {
                case 'success':
                    window.toastr.success(message, null, options);
                    break;
                case 'info':
                    window.toastr.info(message, null, options);
                    break;
                case 'warning':
                    window.toastr.warning(message, null, options);
                    break;
                default:
                    window.toastr.error(message, null, options);
            }
        },
        updateTable: function (data, table_selector, row_template, empty_selector) {
            var table = $(table_selector);
            var empty_message = $(empty_selector || '#empty_message');
            var out = '';
            var regex = /\{(:[a-z0-9_]+)(?:\}|\|([a-z0-9\-_\s]+)\})/g;
            var row = '';
            var renderRow = function (key, value) {
                row = row.replace(':' + key, value);
            };
            if ($.isArray(data)) {
                row_template = row_template.replace(regex, '<td class="$2">$1</td>');
                for (var i = 0; i < data.length; i++) {
                    row = row_template;
                    $.each(data[i], renderRow);
                    out += '<tr>' + row + '</tr>';
                }
                table.children('tbody').html(out);
                table.show();
                empty_message.hide();
            }
            else {
                empty_message.html('<div class="alert alert-danger">' + data + '</div>');
                table.hide();
                empty_message.show();
            }
        },
        /**
         * Tham số
         * - src: url trang nội dung modal => src của frame
         * - container: 'this' | 'parent', mặc định 'this' trong cùng cửa sổ, 'parent': trong cửa sổ cha (button trong modal content)
         * - id: id của iframe tag
         * - title: tiêu đề modal
         * - icon: icon phía trước tiêu đề
         * - width: null | 'large' | 'small', chiều rộng modal bootstrap
         * - height: chiều cao iframe, px
         * - className: thêm css class vào modal wrapper
         * - buttons: các buttons, tham số theo bootbox, các callback của button sẻ tự động disable khi button có class 'disabled'
         *
         * Trả về: Jquery obj kết quả của bootbox.dialog()
         */
        showBootbox: function(options) {
            const defaults = {
                src: null,
                container: 'this',
                id: 'bootbox-iframe',
                title: null,
                icon: null,
                width: null,
                height: "auto",
                className: null,
                buttons: {
                    confirm: {
                        label: "Ok",
                        className: "btn-success disabled"
                    },
                    cancel: {
                        label: "Cancel",
                        className: "btn-white"
                    },
                }
            };
            var _options = $.extend(true, defaults, options);
            var _container = _options.container === 'this' ? window : window.parent;
            var _buttons = $.extend(true, {}, _options.buttons);;
            $.each(_buttons, function(name, button) {
                _buttons[name].callback = function(e) {
                    if($(e.target).hasClass('disabled')){
                        return false;
                    } else if($.isFunction(_options.buttons[name].callback)){
                        return _options.buttons[name].callback.call(this, e);
                    }
                }
            });
            return _container.bootbox.dialog({
                title: (_options.icon ? '<i class="fa fa-'+_options.icon+'"></i> ':'') +_options.title,
                message: '<iframe id="'+_options.id+'" width="100%" height="'+_options.height+'" src="'+_options.src+'" frameborder="0"></iframe>',
                size: _options.width,
                className: _options.className,
                buttons: _buttons,
                onEscape: true
            });
        },
        /**
         * Show modal, tham số cung cấp qua tag <a>
         * vd: <a class="modal-link" data-title="Test modla" data-icon="floppy-disk" data-label="OK" href="/index.html">Show</a>
         * Tham số gồm:
         * - href: link đến trang nội dung modal => src của frame
         * - data-container: 'this' | 'parent', mặc định 'this' trong cùng cửa sổ, 'parent': trong cửa sổ cha (button trong modal content)
         * - data-title: tiêu đề modal
         * - data-icon: icon phía trước tiêu đề
         * - data-width: chiều rộng iframe, px
         * - data-height: chiều cao iframe, px
         * - data-submit: label của nút submit, bỏ qua => ẩn nút
         * - data-callback: khi submit sẽ gọi hàm window[<callback>] thay vì submit form
         * Trả về: Jquery obj kết quả của bootbox.dialog()
         */
        showModal: function (el) {
            var dialog_class = {'large': 'modal-lg', 'small': 'modal-sm'};
            var data = $(el).data();
            var modal = $(data.target || '#mbModal');
            var dialog = modal.children('.modal-dialog');
            var content = dialog.children('.modal-content');
            var header = content.children('.modal-header').children('h4');
            var iframe = content.children('.modal-body').children('iframe');
            var footer_form = content.children('.modal-footer.for-form');
            var footer_info = content.children('.modal-footer.for-info');
            var note;
            var submit = footer_form.children('.submit');

            // modal title
            if (data.title)
                header.children('span').html(data.title);
            if (data.icon) {
                if (data.icon.substr(0, 3) === 'fa-') {
                    header.children('i').attr('class', 'fa ' + data.icon);
                } else {
                    header.children('i').attr('class', 'glyphicon glyphicon-' + data.icon);
                }
            }

            // modal height
            if (data.height)
                iframe.height(data.height);
            else
                iframe.height('auto');

            // modal width
            dialog.attr('class', 'modal-dialog');
            if (data.width && dialog_class[data.width]) {
                dialog.addClass(dialog_class[data.width]);
            }

            // modal footer
            if (data.label) {
                note = footer_form.children('.note');

                submit.children('span').html(data.label);
                footer_form.show();
                footer_info.hide();
            } else {
                footer_form.hide();
                footer_info.show();
                note = footer_info.children('.note');
            }

            // footer note
            if (data.note) {
                note.children('span').html($.parseHTML(data.note));
                note.show();
            } else
                note.hide();

            iframe.attr('src', $(el).attr('href'));
            modal.modal('show');

            if (data.hide_callback) {
                modal.on('hide.bs.modal', function () {
                    window[data.hide_callback]();
                });
            }
            else {
                modal.off('hide.bs.modal');
            }

            if (data.callback)
                submit.addClass('callback');
            else
                submit.removeClass('callback');
        },
        showModalMessage: function (title, message, icon, type) {
            var modal = $('#mbModal-message');
            var modal_icon = $('.modal-title i', modal);
            var modal_title = $('.modal-title span', modal);
            var modal_message = $('.modal-body h4', modal);
            modal_title.html(title);
            modal_message.html(message);
            if (type)
                modal_message.attr('class', 'text-' + type);
            else
                modal_message.attr('class', '');
            if (icon) {
                modal_icon.attr('class', 'glyphicon glyphicon-' + icon);
                modal_icon.show();
            }
            else
                modal_icon.hide();
            modal.modal('show');
        },
        updateModalHeight: function (selector) {
            selector = selector || "#mbModal";
            window.parent.$(selector).find('iframe').height($(document).height());
        }
    };

    $(document).on('click', '.modal-link', function (e) {
        e.preventDefault();
        $.fn.mbHelpers.showModal($(this));
    });
})(jQuery, window);
