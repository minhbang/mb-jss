/**
 * V2.2.0
 * Init Froala Editor
 * @author: Minh Bang <contact@minhbang.com>
 */
(function ($, window) {
    var editors = {
            mini: {
                toolbarButtons: [
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline'
                ],
                htmlAllowedTags: ['p', 'b', 'strong', 'i', 'em', 'u'],
                htmlAllowedAttrs: [],
                imagePaste: false
            },
            simple: {
                toolbarButtons: [
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|',
                    'align', 'outdent', 'indent', 'formatOL', 'formatUL'
                ],
                htmlAllowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br'],
                htmlAllowedAttrs: ['style'],
                imagePaste: false
            },
            basic_no_image: {
                toolbarButtons: [
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|',
                    'fontSize', 'color', 'paragraphFormat', 'paragraphStyle', 'clearFormatting', '|',
                    'align', 'outdent', 'indent', 'formatOL', 'formatUL', '|',
                    'insertLink', 'insertTable', 'insertHR', 'fullscreen'
                ],
                htmlAllowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br', 'hr', 'insertTable', 'tbody', 'tr', 'td'],
                htmlAllowedAttrs: ['style', 'class', 'colspan', 'rowspan', 'href', 'title', 'alt'],
                imagePaste: false
            },
            basic: {
                toolbarButtons: [
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|',
                    'fontSize', 'color', 'paragraphFormat', 'paragraphStyle', 'clearFormatting', '|',
                    'align', 'outdent', 'indent', 'formatOL', 'formatUL', '|',
                    'insertLink', 'insertImage', 'insertTable', 'insertHR', 'fullscreen'
                ],
                htmlAllowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br', 'hr', 'insertTable', 'tbody', 'tr', 'td', 'img'],
                htmlAllowedAttrs: ['style', 'class', 'colspan', 'rowspan', 'href', 'title', 'alt', 'src']
            },
            full: {
                toolbarButtons: [
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|',
                    'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'paragraphStyle', 'inlineStyle', 'clearFormatting', '|',
                    'align', 'outdent', 'indent', 'formatOL', 'formatUL', '|',
                    'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'insertHR', 'insertFile', '|',
                    '-', 'emoticons', 'quote', 'html', 'fullscreen'
                ]
            }
        },
        defaults = {
            toolbarInline: false,
            theme: 'mb',
            placeholderText: "",
            height: 300,
            language: 'vi',
            charCounterCount: false,
            imageUploadParams: {_token: window.csrf_token},
            imageDefaultWidth: 600,
            imageManagerPreloader: '/build/img/loading.gif',
            imageManagerPageSize: 12,
            imageManagerDeleteURL: false,
            // custom options
            imageDeleteMethod: 'POST',
            imageDeleteParams: {_token: window.csrf_token}
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
            var _element = this.element,
                _options = this.options;
            _element.froalaEditor(this.options)
                .on('froalaEditor.commands.after', function (e, editor, cmd, param1, param2) {
                    switch (cmd) {
                        case 'imageSetAlt':
                            var img = $(e.target);
                            console.log(img.attr('alt'));
                            break;
                        default:
                        //console.log(cmd);
                    }
                })
                .on('froalaEditor.imageManager.error', function (e, editor, error, response) {
                    $.fn.mbHelpers.showMessage('error', error.message);
                })
                .on('froalaEditor.image.error', function (e, editor, error) {
                    $.fn.mbHelpers.showMessage('error', error.message);
                })
                .on('froalaEditor.image.removed', function (e, editor, $img) {
                    var html = _element.froalaEditor('html.get', true),
                        src = $($img).attr('src');
                    if (html.indexOf(src) === -1) {
                        $.ajax({
                                method: _options.imageDeleteMethod,
                                url: _options.imageDeleteURL,
                                data: $.extend(true, _options.imageDeleteParams, {src: src})
                            })
                            /*.done (function (data) {
                                if ($.type(data) === 'string') {
                                    data = $.parseJSON(data);
                                }
                                if (data.error) {
                                    console.log('error:' + data.error);
                                } else {
                                    console.log('success:' + data.success);
                                }
                            })*/
                            .fail (function () {
                                $.fn.mbHelpers.showMessage('error', 'Image delete problem');
                            });
                    }
                });
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
})(jQuery, window);