;
(function ($) {
    'use strict';
    var defaults = {
        all_tags: '',
        url_store: null,
        url_delete: null,
        url_update: null,
        thumb_width: 480,
        thumb_height: 360,
        token: null,
        trans: {
            null_title: '— Không tiêu đề —',
            delete_title: 'Xóa Hình ảnh',
            delete_confirm: 'Bạn có chắc chắn muốn xóa Hình ảnh này?',
            ok: 'Đồng ý',
            cancel: 'Bỏ qua'
        }
    };

    function MbDropzone(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.init();
    }

    MbDropzone.prototype = {
        init: function () {
            var previewNode = $(".template", this.element);
            previewNode.removeClass('template');
            previewNode.attr('id', null);
            previewNode.attr('style', null);
            var previewTemplate = previewNode.parent().html();
            previewNode.remove();

            this.totalBytes = 0;
            this.totalBytesSent = 0;
            this.totalProgress = $('.dropzone-total-progress', this.element);
            this.startAll = false;

            this.Dropzone = new Dropzone('body', {
                url: this.options.url_store,
                thumbnailWidth: this.options.thumb_width,
                thumbnailHeight: this.options.thumb_height,
                parallelUploads: 1,
                previewTemplate: previewTemplate,
                autoQueue: false,
                previewsContainer: ".dropzone-previews",
                clickable: ".fileinput-button"
            });
            var that = this;
            that.Dropzone.on("addedfile", function (file) {
                var element = file.previewElement;

                that.totalBytes += file.upload.total;
                $('[data-toggle=tooltip]', element).tooltip({'container': 'body'}).click(function () {
                    $(this).tooltip('hide')
                });
                $('.start', element).click(function (e) {
                    e.preventDefault();
                    that.Dropzone.enqueueFile(file);
                });
                $('.cancel', element).click(function (e) {
                    e.preventDefault();
                    that.totalBytes -= file.upload.total;
                    that.Dropzone.removeFile(file);
                });
                $('a.quick-update', element).quickUpdate({
                    url: that.options.url_update,
                    container: '.dropzone-previews',
                    afterShow: function (e, form) {
                        if ($(e).hasClass('a-tags')) {
                            $('input._value', form).selectize_tags({options: that.options.all_tags});
                        }
                    },
                    processResult: function (e, result) {
                        that.hideProcessing(file);
                        if ($(e).hasClass('a-tags')) {
                            that.options.all_tags = result;
                        }
                    },
                    beforeSubmit: function (e, new_value) {
                        if ($(e).hasClass('a-tags')) {
                            $('.badge', e).html(new_value ? new_value.split(',').length : '');
                            $(e).parents('.form').find('input.img-tags').val(new_value);
                        }
                        if ($(e).hasClass('a-title')) {
                            if (new_value) {
                                $(e).removeClass('text-gray').addClass('text-primary').html(new_value);
                            } else {
                                $(e).removeClass('text-primary').addClass('text-gray').html(that.options.trans.null_title);
                            }
                            $(e).parents('.form').find('input.img-title').val(new_value);
                        }
                        $(e).data('qu_value', new_value);

                        var submit = $(e).attr('href') != '#';
                        if (submit) {
                            that.showProcessing(file);
                        }
                        return submit;
                    }
                });
            });

            that.Dropzone.on("complete", function (file) {
                $('.status-mark, .alert', file.previewElement).attr('style', null);
            });

            that.Dropzone.on("success", function (file, result) {

                if (that.startAll) {
                    that.totalBytesSent += file.upload.total;
                    if (that.totalBytesSent >= that.totalBytes) {
                        that.reset();
                    }
                } else {
                    that.totalBytes -= file.upload.total;
                }

                $('a.quick-update', file.previewElement).attr('href', '#' + result.id);
                $('.delete', file.previewElement)
                    .attr('href', that.options.url_delete.replace('__ID__', result.id))
                    .click(function (e) {
                        e.preventDefault();
                        var url = $(this).attr('href');
                        window.bootbox.confirm({
                            message: "<div class=\"message-delete\"><div class=\"confirm\">" + that.options.trans.delete_confirm + "</div></div>",
                            title: that.options.trans.delete_title + '?',
                            buttons: {
                                cancel: {label: that.options.trans.cancel, className: "btn-default btn-white"},
                                confirm: {label: that.options.trans.ok, className: "btn-danger"}
                            },
                            callback: function (ok) {
                                if (ok) {
                                    that.showProcessing(file);
                                    $.ajax({
                                        url: url,
                                        type: 'DELETE',
                                        dataType: 'json',
                                        data: {_token: that.options.token},
                                        success: function (message) {
                                            that.Dropzone.removeFile(file);
                                            $.fn.mbHelpers.showMessage(message.type, message.content);
                                        }
                                    });
                                }
                            }
                        });
                    });
            });

            that.Dropzone.on("sending", function (file, xhr, formData) {
                var title = $('.form input.img-title', file.previewElement).val(),
                    tags = $('.form input.img-tags', file.previewElement).val();
                if (title) {
                    formData.append('title', title);
                }
                if (tags) {
                    formData.append('tags', tags);
                }
                formData.append('_token', that.options.token);
                $('.start', file.previewElement).attr("disabled", "disabled");
            });

            that.Dropzone.on("uploadprogress", function (file, progress, bytesSent) {
                if (that.startAll) {
                    var p = 100 * (that.totalBytesSent + bytesSent) / that.totalBytes;
                    that.totalProgress.find('.progress-bar').width(p + "%");
                }
            });

            $('.ibox-title .start', that.element).click(function (e) {
                e.preventDefault();
                that.start();
            });

            $('.ibox-title .cancel', that.element).click(function (e) {
                e.preventDefault();
                that.Dropzone.removeAllFiles(true);
                that.reset();
            });
        },
        start: function () {
            var files = this.Dropzone.getFilesWithStatus(Dropzone.ADDED);
            if (files.length) {
                this.startAll = true;
                this.totalProgress
                    .css({'filter': 'alpha(opacity=100)', 'zoom': '1', 'opacity': '1'})
                    .find('.progress-bar').width("0%");
                this.Dropzone.enqueueFiles(files);
            }
        },
        reset: function () {
            this.totalProgress
                .css({'filter': 'alpha(opacity=0)', 'zoom': '1', 'opacity': '0'})
                .find('.progress-bar').width("0%");
            this.totalBytes = 0;
            this.totalBytesSent = 0;
            this.startAll = false;
        },
        showProcessing: function (file) {
            $(file.previewElement).addClass('dz-my-processing');
        },
        hideProcessing: function (file) {
            $(file.previewElement).removeClass('dz-my-processing');
        }
    };

    $.fn.mbDropzone = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("mbDropzone");

            if (!plugin) {
                $(this).data("mbDropzone", new MbDropzone(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);