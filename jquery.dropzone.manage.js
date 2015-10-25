/**
 * Quản lý Dropzone Js
 * Sử dụng:
 * $(selector).mbDropzone(options);
 *
 * Thay đổi các giá trị mặc định:
 * 1. Url:
 * url_store:  '{!!route('image.store')!!}',
 * url_delete: '{!!route('backend.image.destroy', ['image' => '__ID__'])!!}',
 * url_update: '{!!route('backend.image.quick_update', ['image' => '__ID__'])!!}',
 * 2. Thumbnail width
 * thumb_width: '{{config('image.thumbnail.width')*4}}',
 * thumb_height: '{{config('image.thumbnail.height')*4}}',
 * 3. Ngôn ngữ:
 * trans:{
 *     title: '{{trans('image::common.title')}}',
 *     null_title: '{{trans('image::common.null_title')}}',
 *     delete_title: '{{trans('image::common.delete_title')}}',
 *     delete_confirm: '{{trans('image::common.delete_confirm')}}',
 *     ok: '{{trans('common.ok')}}',
 *     cancel: '{{trans('common.cancel')}}',
 *     delete: '{{trans('common.delete')}}',
 *     upload: '{{trans('common.upload')}}',
 *     add_files: '{{trans('common.add_files')}}',
 *     tags: '{{trans('image::common.tags')}}'
 * },
 */
;
(function ($) {
    'use strict';
    var defaults = {
        all_tags: "",
        url_store: "/image/store",
        url_delete: "/backend/image/__ID__",
        url_update: "/backend/image/__ID__/quick_update",
        thumb_width: 480,
        thumb_height: 360,
        token: window.csrf_token,
        trans: {
            title: "Tiêu đề",
            null_title: "— Không tiêu đề —",
            delete_title: "Xóa Hình ảnh",
            delete_confirm: "Bạn có chắc chắn muốn xóa Hình ảnh này?",
            ok: "Đồng ý",
            cancel: "Bỏ qua",
            delete: "Xóa",
            upload: "Tải lên",
            add_files: "Thêm File",
            tags: "Tags"
        },
        preview_grid: "col-lg-3 col-md-4 col-sm-6 col-xs-6"
    };

    function templateQuickUpdate(attr, cls, title, plt, label) {
        var data = {attr: attr, title: title, class: "w-md", placement: plt, value: ""},
            data_qu = '';
        $.each(data, function (name, value) {
            data_qu += ' data-qu_' + name + '="' + value + '"';
        });
        return '<a href="#" class="' + cls + ' quick-update text-gray"' + data_qu + 'title="' + title + '" data-toggle="tooltip">' + label + '</a>';
    }

    function templateButton(type, name, title, icon) {
        return '<a href="#" class="btn btn-' + type + ' btn-xs ' + name + '" data-toggle="tooltip" title="' + title + '">' +
            '<i class="fa fa-' + icon + '"></i>' +
            '</a>';
    }

    function templatePreview(trans, preview_grid) {
        return '<div class="'+preview_grid+'">' +
            '<div class="inner">' +
            '<div class="status-mark" style="display: none">' +
            '<span class="dz-error-mark fa fa-remove error"></span>' +
            '<span class="dz-error-mark fa fa-check success"></span>' +
            '<div class="bg"></div>' +
            '</div>' +
            '<div class="alert alert-danger" data-dz-errormessage style="display: none"></div>' +
            '<div class="preview"><img data-dz-thumbnail/><div class="sending"></div></div>' +
            '<div class="form">' +
            '<div class="input-group">' +
            templateQuickUpdate('title', 'a-title form-control input-sm img-title', trans.title, 'top', trans.null_title) +
            '<span class="input-group-addon">' +
            templateQuickUpdate('tags', 'a-tags', trans.tags, 'bottom', '<i class="fa fa-tags"></i> <span class="badge badge-danger"></span>') +
            '</span>' +
            '</div>' +
            '<input type="hidden" class="img-title" value=""/>' +
            '<input type="hidden" class="img-tags" value=""/>' +
            '</div>' +
            '<div class="actions">' +
            '<div class="left">' +
            templateButton('primary', 'start', trans.upload, 'upload') +
            templateButton('warning', 'cancel', trans.cancel, 'remove') +
            templateButton('danger', 'delete', trans.delete, 'trash') +
            '</div>' +
            '<div class="right">' +
            '<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
            '<div class="progress-bar progress-bar-success" style="width:0;" data-dz-uploadprogress></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function templateContainer(trans) {
        return '<div class="ibox">' +
            '<div class="ibox-title">' +
            '<div class="row buttons">' +
            '<div class="col-sm-7">' +
            '<a href="#" class="btn btn-success btn-xs fileinput-button"><i class="fa fa-plus"></i> ' + trans.add_files + '</a>' +
            '<a href="#" class="btn btn-primary btn-xs start"><i class="fa fa-upload"></i> ' + trans.upload + '</a>' +
            '<a href="#" class="btn btn-warning btn-xs cancel"><i class="fa fa-remove"></i> ' + trans.cancel + '</a>' +
            '</div>' +
            '<div class="col-sm-5">' +
            '<span class="fileupload-process">' +
            '<div class="dropzone-total-progress progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
            '<div class="progress-bar progress-bar-success" style="width:0;" data-dz-uploadprogress></div>' +
            '</div>' +
            '</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ibox-content"><div class="row dropzone-previews"></div></div>' +
            '</div>';
    }

    function MbDropzone(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.init();
    }

    MbDropzone.prototype = {
        init: function () {
            this.element.html(templateContainer(this.options.trans));
            
            this.totalBytes = 0;
            this.totalBytesSent = 0;
            this.totalProgress = $('.dropzone-total-progress', this.element);
            this.startAll = false;

            this.Dropzone = new Dropzone('body', {
                url: this.options.url_store,
                thumbnailWidth: this.options.thumb_width,
                thumbnailHeight: this.options.thumb_height,
                parallelUploads: 1,
                previewTemplate: templatePreview(this.options.trans, this.options.preview_grid),
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