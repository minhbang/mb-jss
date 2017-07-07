/**
 * V2.3.3
 * Init Froala Editor
 * @author: Minh Bang <contact@minhbang.com>
 */
(function ($, window) {
    var //SX
        toolbarXS = [
            'undo', 'redo', '|',
            'bold', 'italic', 'underline'
        ],
        tagsXS = ['p', 'b', 'strong', 'i', 'em', 'u'],

    //SM
        toolbarSM = toolbarXS.concat(['strikeThrough', 'subscript', 'superscript', '|',
            'align', 'outdent', 'indent', 'formatOL', 'formatUL'
        ]),
        pluginsSM = ['align', 'lists'],
        tagsSM = tagsXS.concat(['sub', 'sup', 'strike', 'ol', 'ul', 'li', 'br', 'span']),
        attrsSM = ['style'],

    //MD
        toolbarMD = toolbarSM.concat([
            '|', 'fontSize', 'color', 'paragraphFormat', 'paragraphStyle', 'clearFormatting', '|',
            'insertLink', 'insertImage', 'insertTable', 'insertHR', 'fullscreen'
        ]),
        pluginsMD = pluginsSM.concat(['fontSize', 'colors', 'paragraphFormat', 'paragraphStyle', 'link', 'table', 'fullscreen']),
        tagsMD = tagsSM.concat(['hr', 'table', 'tbody', 'tr', 'td', 'th', 'a']),
        attrsMD = attrsSM.concat(['class', 'colspan', 'rowspan', 'href', 'target', 'title', 'alt']),

    //FULL
        toolbarFULL = toolbarSM.concat([
            '|', 'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'paragraphStyle', 'inlineStyle', 'clearFormatting', '|',
            'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'insertHR', 'insertFile', '|',
            '-', 'emoticons', 'quote', 'html', 'fullscreen'
        ]),

        editors = {
            mini: {
                pluginsEnabled: [],
                toolbarButtons: toolbarXS,
                toolbarButtonsMD: toolbarXS,
                toolbarButtonsSM: toolbarXS,
                htmlAllowedTags: tagsXS,
                htmlAllowedAttrs: [],
                imagePaste: false
            },
            simple: {
                pluginsEnabled: pluginsSM,
                toolbarButtons: toolbarSM,
                toolbarButtonsMD: toolbarSM,
                toolbarButtonsSM: toolbarSM,
                htmlAllowedTags: tagsSM,
                htmlAllowedAttrs: attrsSM,
                imagePaste: false
            },
            simple_html: {
                pluginsEnabled: pluginsSM.concat(['codeView', 'codeBeautifier']),
                toolbarButtons: toolbarSM.concat(['html']),
                toolbarButtonsMD: toolbarSM.concat(['html']),
                toolbarButtonsSM: toolbarSM.concat(['html']),
                imagePaste: false
            },
            basic_no_image: {
                pluginsEnabled: pluginsMD,
                toolbarButtons: toolbarMD,
                toolbarButtonsMD: toolbarMD,
                toolbarButtonsSM: toolbarSM,
                htmlAllowedTags: tagsMD,
                htmlAllowedAttrs: attrsMD,
                imagePaste: false
            },
            basic: {
                pluginsEnabled: pluginsMD.concat['image'],
                toolbarButtons: toolbarMD,
                toolbarButtonsMD: toolbarMD,
                toolbarButtonsSM: toolbarSM,
                htmlAllowedTags: tagsMD.concat(['img']),
                htmlAllowedAttrs: attrsMD.concat(['src'])
            },
            full: {
                toolbarButtons: toolbarFULL,
                toolbarButtonsMD: toolbarMD,
                toolbarButtonsSM: toolbarSM
            }
        },
        defaults = {
            toolbarInline: false,
            toolbarButtonsXS: toolbarXS,
            theme: 'mb',
            placeholderText: "",
            height: 300,
            language: 'vi',
            charCounterCount: false,
            imageUploadParams: {_token: window.Laravel.csrfToken},
            imageDefaultWidth: 600,
            imageManagerPreloader: '/images/loading.gif',
            imageManagerPageSize: 12,
            imageManagerDeleteURL: false,
            // custom options
            imageDeleteURL: null,
            imageDeleteMethod: 'POST',
            imageDeleteParams: {_token: window.Laravel.csrfToken}
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
            _element.froalaEditor(_options)
                .on('froalaEditor.commands.after', function (e, editor, cmd, param1, param2) {
                    console.log(param1);
                    console.log(param2);
                    switch (cmd) {
                        case 'imageSetAlt':
                            var img = $(e.target);
                            console.log(img.attr('alt'));
                            break;
                        default:
                            console.log(cmd);
                    }
                })
                .on('froalaEditor.imageManager.error', function (e, editor, error, response) {
                    console.log(response);
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
                            .fail(function () {
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