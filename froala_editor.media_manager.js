(function ($) {
    $.Editable.DEFAULTS = $.extend($.Editable.DEFAULTS, {
        mediaManager: true,
        imagesLoadURL: "http://i.froala.com/images",
        imagesLoadParams: {},
        imageLoadPage: 1,
        imageLoadLimit: 20
    });
    $.Editable.prototype.showMediaManager = function () {
        this.$image_modal.show();
        this.$overlay.show();
        this.loadImages();
        this.$document.find("body").css("overflow", "hidden");
    };
    $.Editable.prototype.hideMediaManager = function () {
        this.$image_modal.hide();
        this.$overlay.hide();
        this.$document.find("body").css("overflow", "");
    };
    $.Editable.prototype.mediaModalHTML = function () {
        return '<div class="froala-modal"><div class="f-modal-wrapper">' +
            '<h4>' +
            '<span data-text="true">Manage images</span>' +
            '<i title="Cancel" class="fa fa-times" id="f-modal-close-' + this._id + '"></i>' +
            '</h4>' +
            '<img class="f-preloader" id="f-preloader-' + this._id + '" alt="Loading..." src="' + this.options.preloaderSrc + '" style="display: none;">' +
            '<div class="f-image-list' + (WYSIWYGModernizr.touch ? ' f-touch' : '') + '" id="f-image-list-' + this._id + '"></div>' +
            '<div class="f-image-pagination" id="f-image-pagination-' + this._id + '"></div>' +
            '</div></div>';
    };
    $.Editable.prototype.buildMediaManager = function () {
        this.$image_modal = $(this.mediaModalHTML()).appendTo("body");
        this.$preloader = this.$image_modal.find("#f-preloader-" + this._id);
        this.$media_images = this.$image_modal.find("#f-image-list-" + this._id);
        this.$media_pagination = this.$image_modal.find("#f-image-pagination-" + this._id);
        this.$overlay = $('<div class="froala-overlay">').appendTo("body");
        this.$overlay.on("mouseup", $.proxy(function (a) {
            this.isResizing() || a.stopPropagation()
        }, this));
        this.$image_modal.on("mouseup", $.proxy(function (a) {
            this.isResizing() || a.stopPropagation()
        }, this));
        this.$image_modal.find("i#f-modal-close-" + this._id).click($.proxy(function () {
            this.hideMediaManager()
        }, this));
        this.$media_images.on(this.mouseup, "img", $.proxy(function (e) {
            e.stopPropagation();
            var img = e.currentTarget;
            this.writeImage($(img).data("src"));
            this.hideMediaManager();
        }, this));
        this.$media_images.on(this.mouseup, ".f-delete-img", $.proxy(function (b) {
            b.stopPropagation();
            var c = $(b.currentTarget).prev(),
                d = "Are you sure? Image will be deleted.";
            if ($.Editable.LANGS[this.options.language]) {
                d = $.Editable.LANGS[this.options.language].translation[d];
            }
            if (confirm(d) && this.triggerEvent("beforeDeleteImage", [$(c)], false)) {
                $(c).parent().addClass("f-img-deleting");
                this.deleteImage($(c));
            }
        }, this));

        this.$media_pagination.on('click', "a", $.proxy(function (b) {
            b.preventDefault();
            var page = $(b.currentTarget).data('page');
            if (page) {
                this.options.imageLoadPage = page;
                this.loadImages();
            }
        }, this));

        if (this.options.mediaManager) {
            this.$image_wrapper.on("click", "#f-browser-" + this._id, $.proxy(function () {
                this.showMediaManager()
            }, this)).on("click", "#f-browser-" + this._id + " i", $.proxy(function () {
                this.showMediaManager()
            }, this));
            this.$image_wrapper.find("#f-browser-" + this._id).show();
        }
        this.hideMediaManager();
    };
    $.Editable.prototype.destroyMediaManager = function () {
        this.hideMediaManager();
        this.$overlay.html("").removeData().remove();
        this.$image_modal.html("").removeData().remove();
    };
    $.Editable.prototype.initMediaManager = function () {
        if (this.options.mediaManager) {
            this.buildMediaManager();
            this.addListener("destroy", this.destroyMediaManager);
        }
    };

    $.Editable.prototype.throwImagesLoadErrorWithMessage = function (a) {
        this.triggerEvent("imagesLoadError", [{message: a, code: 0}], !1);
        this.hideImageLoader();
    };
    $.Editable.prototype.loadImages = function () {
        this.$media_images.empty();
        this.$preloader.show();
        if (this.options.imagesLoadURL) {
            var url = this.options.imagesLoadURL.replace('_PAGE_', this.options.imageLoadPage)
                .replace('_LIMIT_', this.options.imageLoadLimit);
            $.support.cors = true;
            $.getJSON(url, this.options.imagesLoadParams, $.proxy(function (result) {
                this.triggerEvent("imagesLoaded", [result], false);
                this.processLoadedImages(result);
                this.$preloader.hide();
            }, this)).fail($.proxy(function () {
                this.throwLoadImagesError(2)
            }, this));
        } else {
            this.throwLoadImagesError(3);
        }
    };
    $.Editable.prototype.throwLoadImagesError = function (code) {
        var message = "Unknown image upload error.";
        switch (code) {
            case 1:
                message = "Bad link.";
                break;
            case 2:
                message = "Error during request.";
                break;
            case 3:
                message = "Missing imagesLoadURL option.";
                break;
            case 4:
                message = "Parsing response failed.";
                break;
        }
        this.triggerEvent("imagesLoadError", [{code: code, message: message}], false);
        this.$preloader.hide();
    };
    $.Editable.prototype.processLoadedImages = function (result) {
        try {
            if (result.error) {
                this.throwImagesLoadErrorWithMessage(result.error);
            } else {
                this.$media_images.empty();
                this.$media_pagination.empty();
                var images = result.images;
                for (var i = 0; i < images.length; i++) {
                    if (images[i].src) {
                        this.loadImage(images[i].src, images[i].info);
                    } else {
                        this.loadImage(images[i]);
                    }
                }
                // pagination
                if (result.pages > 1) {
                    var pagination = '<nav><ul class="pagination pagination-sm">';
                    pagination += '<li class="' + (result.page == this.options.imageLoadPage ? 'disabled' : '') + '"><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
                    for (var p = 1; p <= result.pages; p++) {
                        if (p == result.page) {
                            pagination += '<li class="active"><a href="#">' + p + '<span class="sr-only">(current)</span></a></li>';
                        } else {
                            pagination += '<li><a href="#" data-page="' + p + '">' + p + '</a></li>';
                        }
                    }
                    pagination += '<li class="' + (result.page == result.pages ? 'disabled' : '') + '"><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
                    pagination += '</ul></nav>';
                    this.$media_pagination.append(pagination);
                }
            }
        } catch (c) {
            this.throwLoadImagesError(4);
        }
    };
    $.Editable.prototype.loadImage = function (src, info) {
        var d = new Image,
            e = $("<div>").addClass("f-empty");
        d.onload = $.proxy(function () {
            var strDelete = "Delete";
            if ($.Editable.LANGS[this.options.language]) {
                strDelete = $.Editable.LANGS[this.options.language].translation[strDelete];
            }
            var img = $('<img src="' + src + '"/>');
            if (info) {
                $.each(info, function (key, value) {
                    img.attr("data-" + key, value);
                });
            }
            e.append(img).append('<a class="f-delete-img"><i class="fa fa-trash-o"></i></a>');
            e.removeClass("f-empty");
            this.$media_images.hide();
            this.$media_images.show();
            this.triggerEvent("imageLoaded", [src], false);
        }, this);
        d.onerror = $.proxy(function () {
            e.remove();
            this.throwLoadImagesError(1);
        }, this);
        d.src = src;
        this.$media_images.append(e);
    };
    $.Editable.initializers.push($.Editable.prototype.initMediaManager);
})(jQuery);