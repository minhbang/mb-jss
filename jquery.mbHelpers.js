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
            var regex = /{(:[a-z0-9_]+)(?:}|\|([a-z0-9\-_\s]+)})/g;
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
                if(button === false){
                    delete _buttons[name];
                } else {
                    _buttons[name].callback = function(e) {
                        if($(e.target).hasClass('disabled')){
                            return false;
                        } else if($.isFunction(_options.buttons[name].callback)){
                            return _options.buttons[name].callback.call(this, e);
                        }
                    }
                }
            });
            return _container.bootbox.dialog({
                title: (_options.icon ? '<i class="fa fa-'+_options.icon+'"></i> ':'') +_options.title,
                message: '<iframe width="100%" height="'+_options.height+'" src="'+_options.src+'" frameborder="0"></iframe>',
                size: _options.width,
                className: _options.className,
                buttons: _buttons,
                onEscape: true
            });
        },
        /**
         * Show modal, tham số cung cấp qua tag <a>
         * vd: <a data-title="Test modla" data-icon="floppy-disk" data-label="OK" href="/index.html">Show</a>
         * Các tham số cơ bản lấy qua data-* attributes, truyền cho showBootbox()
         * Riêng:
         * - href: là src của frame
         * - data-label: label của nút submit, bỏ qua => chế độ show message
         * - data-callback: khi submit sẽ gọi hàm window[<callback>] thay vì submit form
         */
        showModal: function (element) {
            var options = $(element).data();
            options.src = $(element).attr('href');
            if(options.label){
                options.buttons = {
                    confirm: {
                        label: options.label,
                        className: 'btn-success',
                    },
                    cancel: {
                        label: window.trans.cancel
                    }
                }
                if(options.callback){
                    options.buttons.confirm.callback = window[options.callback] ? window[options.callback] : null
                } else{
                    options.buttons.confirm.callback = function() {
                        $('form', $('iframe', this).contents()).submit();
                        return false;
                    }
                }
            } else{
                options.buttons = {
                    confirm: {
                        label: window.trans.close,
                        className: 'btn-success'
                    },
                    cancel: false
                }
            }
            this.showBootbox(options);
        },
        showModalMessage: function (title, message, icon, type, size) {
            return window.bootbox.dialog({
                title: (icon ? '<i class="fa fa-'+icon+'"></i> ':'') +title,
                message: '<h4 class="text-center'+(type ? ' text-'+type:'')+'">'+message+'</h4>',
                size: size,
                buttons: {
                    confirm: {
                        label: window.trans.close,
                        className: 'btn-success'
                    }
                },
                onEscape: true
            });
        },
        updateModalHeight: function () {
            var iframe = this.getParentIframe();
            if(iframe){
                $(iframe).height($(document).height());
            }
        },
        getParentIframe: function(container, win) {
            container = container || window.parent;
            win = win || window;
            var result;
            $.each(container.$('iframe'), function(i, iframe) {
                if($(iframe.contentWindow).is($(win))){
                    result = iframe;
                }
            });
            return result;
        },
        getParentModal: function(container, win){
            var iframe = this.getParentIframe(container, win);
            if(iframe){
                return $(iframe).closest('.modal');
            }
        }
    };

    $(document).on('click', '.modal-link', function (e) {
        e.preventDefault();
        $.fn.mbHelpers.showModal($(this));
    });
})(jQuery, window);
