//Froala is conflict with X-Editable with name 'editable'
$.fn.froala_editor = $.fn.editable.noConflict();
/**
 * Init Froala Editor
 * @author: Minh Bang <contact@minhbang.com>
 */
(function ($) {
    var editors = {
            mini: {
                buttons: [
                    'undo', 'redo', 'selectAll', 'sep',
                    'bold', 'italic', 'underline'
                ],
                allowedTags: ['p', 'b', 'strong', 'i', 'em', 'u'],
                allowedAttrs: [],
                imageUpload: false,
                mediaManager: false,
                pasteImage: false
            },
            simple: {
                buttons: [
                    'undo', 'redo', 'selectAll', 'sep',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'sep',
                    'align', 'outdent', 'indent', 'insertOrderedList', 'insertUnorderedList'
                ],
                allowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br'],
                allowedAttrs: ['style'],
                imageUpload: false,
                mediaManager: false,
                pasteImage: false
            },
            basic_no_image: {
                buttons: [
                    'undo', 'redo', 'selectAll', 'sep',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'sep',
                    'fontSize', 'color', 'formatBlock', 'blockStyle', 'removeFormat', 'sep',
                    'align', 'outdent', 'indent', 'insertOrderedList', 'insertUnorderedList', 'sep',
                    'createLink', 'table', 'insertHorizontalRule', 'fullscreen'
                ],
                allowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br', 'hr', 'table', 'tbody', 'tr', 'td'],
                allowedAttrs: ['style', 'class', 'colspan', 'rowspan', 'href', 'title', 'alt'],
                imageUpload: false,
                mediaManager: false,
                pasteImage: false
            },
            basic: {
                buttons: [
                    'undo', 'redo', 'selectAll', 'sep',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'sep',
                    'fontSize', 'color', 'formatBlock', 'blockStyle', 'removeFormat', 'sep',
                    'align', 'outdent', 'indent', 'insertOrderedList', 'insertUnorderedList', 'sep',
                    'createLink', 'insertImage', 'table', 'insertHorizontalRule', 'fullscreen'
                ],
                allowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br', 'hr', 'table', 'tbody', 'tr', 'td', 'img'],
                allowedAttrs: ['style', 'class', 'colspan', 'rowspan', 'href', 'title', 'alt', 'src']
            },
            full: {
                buttons: [
                    'undo', 'redo', 'selectAll', 'sep',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'sep',
                    'fontFamily', 'fontSize', 'color', 'formatBlock', 'blockStyle', 'inlineStyle', 'removeFormat', 'sep',
                    'align', 'outdent', 'indent', 'insertOrderedList', 'insertUnorderedList', 'sep',
                    'createLink', 'insertImage', 'insertVideo', 'table', 'insertHorizontalRule', 'uploadFile', 'sep',
                    'html', 'fullscreen'
                ]
            }
        },
        defaults = {
            inlineMode: false,
            theme: 'mb',
            placeholder: "",
            height: 300,
            language: 'vi',
            countCharacters: false,
            imageUploadParam: 'image',
            defaultImageWidth: 600,
            imageDeleteConfirmation: false
        };

    function MbEditor(element, options) {
        this.element = $(element);
        var editor = this.element.data('editor') || 'basic';
        if (typeof editors[editor] === 'undefined') {
            editor = 'basic';
        }
        options = options || {};
        if (this.element.data('height') && !options['height']) {
            options['height'] = this.element.data('height');
        }
        this.options = $.extend(true, defaults, editors[editor], options);
        this.init();
    }

    MbEditor.prototype = {
        init: function () {
            var _element = this.element;
            _element.froala_editor(this.options)
                .on('editable.imageError', function (e, editor, error) {
                    $.fn.mbHelpers.showMessage('error', error.message);
                })
                .on('editable.imageAltSet', function (e, editor, img) {
                    var alt = img.attr('alt');
                    console.log(alt);
                })
                .on('editable.afterRemoveImage', function (e, editor, img) {
                    if (editor.triggerEvent("beforeDeleteImage", [img])) {
                        editor.deleteImage(img);
                    }
                })
                .on('editable.beforeDeleteImage', function (e, editor, img) {
                    var html = editor.getHTML(),
                        src = img.attr('src');
                    if (img.data('src')) {
                        src = img.data('src');
                    }
                    if (html.indexOf(src) === -1) {
                        editor.options.imageDeleteParams = $.extend(true, editor.options.imageDeleteParams, {
                            file: src,
                            attribute: _element.data('attribute'),
                            resource: _element.data('resource'),
                            id: _element.data('id')
                        });
                        return true;
                    } else {
                        return false;
                    }
                })
                .on('editable.imageDeleteSuccess', function (e, editor, data) {
                    if ($.type(data) === 'string') {
                        data = $.parseJSON(data);
                    }
                    if (data.error) {
                        console.log('error:' + data.error);
                    } else {
                        console.log('success:' + data.success);
                    }
                })
                .on('editable.imageDeleteError', function (e, editor, error) {
                    $.fn.mbHelpers.showMessage('error', error.message);
                });
            $('.froala-box div[style="position: absolute; bottom: 0px; left: 0px; border: solid 1px #000;"]').hide();
        }
    };
    $.fn.mbEditor = function (params) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("mbEditor");
            if (!plugin) {
                $(this).data("mbEditor", new MbEditor(this, params));
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery);