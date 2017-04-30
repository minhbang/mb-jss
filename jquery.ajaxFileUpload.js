/**
 * JQuery Ajax File Upload
 * Sử dụng: $(form).ajaxFileUpload(options);
 */
;(function ($, window) {
    'use strict';
    var defaults = {
        url_store: null,
        url_update: null,
        add_new_button: '.add-new',
        trans: {
            add_new: 'Add New File',
            replace: 'Replace File',
            abort_confirm: 'Bạn có chắc chắn muốn dừng upload?',
            ajax_upload: 'Trình duyệt của bạn không hổ trợ HTML5 File Upload!',
            unable_upload: 'Lỗi: không thể upload file'
        },
        csrf_token: window.Laravel.csrfToken,
        datatableApi: null,
        success: null
    };

    function checkFormData(message) {
        let supported = !!window.FormData;
        if (!supported) {
            $.fn.mbHelpers.showMessage('error', message, {"positionClass": "toast-top-center"});
        }
        return supported;
    }

    function AjaxFileUpload(element, options) {
        this.options = $.extend(true, defaults, options);
        this.element = $(element);
        this.submit = $(':submit', this.element);
        this.wrapper = this.element.closest('.ibox');
        this.title = $('h5', this.wrapper);
        this.progress = $('.progress', this.element);
        this.progress_bar = $('.progress-bar', this.element);
        this.percent = $('.sr-only', this.progress_bar);
        this.input_title = $('input[name="title"]', this.element);
        this.input_name = $('input[name="name"]', this.element);
        this.xhr = null;
        this.init();
    }

    AjaxFileUpload.prototype = {
        init: function () {
            let _this = this;
            $(_this.options.add_new_button).click(function (e) {
                e.preventDefault();
                _this.showNew();
            });
            $('.cancel', _this.element).click(function (e) {
                if (_this.xhr) {
                    bootbox.confirm(_this.options.trans.abort_confirm, function (result) {
                        if (result) {
                            _this.hide();
                        } else {
                            e.preventDefault();
                        }
                    });
                } else {
                    _this.hide();
                }
            });
            _this.element.submit(function (e) {
                e.preventDefault();
                let formdata = new FormData(this);
                formdata.append('_token', _this.options.csrf_token);
                _this.xhr = $.ajax({
                    url: $(this).attr('action'),
                    type: "POST",
                    data: formdata,
                    mimeTypes: "multipart/form-data",
                    contentType: false,
                    cache: false,
                    processData: false,
                    // Custom XMLHttpRequest
                    xhr: function () {
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) {
                            // For handling the progress of the upload
                            myXhr.upload.addEventListener('progress', function (e) {
                                if (e.lengthComputable) {
                                    let percentComplete = (e.loaded / e.total) * 100;
                                    _this.progress_bar.width(percentComplete + '%');
                                    _this.percent.html(percentComplete + '%');
                                }
                            }, false);
                        }
                        return myXhr;
                    },
                    beforeSend: function () {
                        _this.submit.addClass('disabled');
                        _this.progress.show();
                        _this.progress_bar.width('0%');
                        _this.percent.html("0%");
                    },
                    complete: function (response) {
                        if (response.status == 200) {
                            if (response.responseJSON != undefined) {
                                let data = response.responseJSON;
                                if (data.type == 'success') {
                                    if (_this.options.datatableApi) {
                                        _this.options.datatableApi.ajax.reload();
                                    }
                                    if (_this.options.success) {
                                        _this.options.success(data.file);
                                    } else{
                                        $.fn.mbHelpers.showMessage(data.type, data.content);
                                    }
                                } else{
                                    $.fn.mbHelpers.showMessage(data.type, data.content);
                                }
                            } else {
                                $.fn.mbHelpers.showMessage('error', _this.options.trans.unable_upload);
                            }
                        }
                        _this.hide();
                        _this.xhr = null;
                    },
                    error: function (jqXHR, textStatus) {
                        if (textStatus != "abort") {
                            $.fn.mbHelpers.showMessage('error', _this.options.trans.unable_upload);
                        }
                        _this.xhr = null;
                    }
                }, "json");
            });
        },
        showReplace: function (element) {
            if (checkFormData(this.options.trans.ajax_upload)) {
                this.title.html(this.options.trans.replace + ': ' + $(element).closest('tr').find('.file-title a').text());
                this.input_title.prop('required', false).closest('.form-group').hide();
                this.input_name.prop('required', true);
                this.element.attr('action', this.options.url_update.replace('__ID__', $(element).data('id')));
                this.show();
            }
        },
        showNew: function () {
            if (checkFormData(this.options.trans.ajax_upload)) {
                this.title.html(this.options.trans.add_new);
                this.input_title.prop('required', true).closest('.form-group').show();
                this.input_name.prop('required', true);
                this.element.attr('action', this.options.url_store);
                this.show();
            }
        },
        hide: function () {
            if (this.xhr) {
                this.xhr.abort();
            }
            this.element[0].reset();
            this.element.validator('destroy');
            this.progress.hide();
            this.wrapper.hide();
        },
        show: function () {
            this.submit.removeClass('disabled');
            this.element.validator();
            this.wrapper.show();
        }
    };

    $.fn.ajaxFileUpload = function (options) {
        let lists = this,
            retval = this;
        lists.each(function () {
            let plugin = $(this).data("ajaxFileUpload");
            if (!plugin) {
                $(this).data("ajaxFileUpload", new AjaxFileUpload(this, options));
            } else {
                retval = plugin;
            }
        });

        return retval || lists;
    };
})(jQuery, window);
