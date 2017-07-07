/**
 * Quản lý Cart
 */
;
(function ($, window) {
    'use strict';
    var defaults = {
        wishlist_count_url: '/wishlist/count',
        update_quantity_url: '/cart/quantity/__ID__',
        token: window.Laravel.csrfToken,
        trans: {
            "cart.add": "Chọn mua",
            "cart.add.success": "Thêm vào giỏ hàng thành công",
            "cart.remove": "Bỏ khỏi giỏ hàng",
            "cart.remove_confirm": "Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng không?",
            "ok": "Đồng ý",
            "cancel": "Bỏ qua"
        }
    };

    function MbCart(element, options) {
        this.element = $(element);
        this.options = $.extend(true, defaults, options);
        this.cart_count = $('.cart-count');
        this.cart_total = $('.cart-total');
        this.cart_subtotal = $('.cart-subtotal');
        this.cart_vat = $('.cart-vat');
        this.cart_items = $('.table-items tbody', this.element);
        this.cart_form = $('form.form-cart');
        this.wrapper_items = $('.cart-items');
        this.wrapper_price = $('.cart-price');
        this.wrapper_empty = $('.cart-empty');
        this.wishlist_empty = $('#wishlist-empty');
        this.wishlist_menu = $('#wishlist-menu');
        this.wishlist_count = null;
        // template
        this.cart_template = $('#cart-template');
        this.template_item = $('.item tr', this.cart_template).html();
        this.template_form = $('.form', this.cart_template).html();
        this.init();
    }

    MbCart.prototype = {
        init: function () {
            var _this = this;
            if (_this.wishlist_menu.length) {
                _this.wishlist_count = $('<span class="label label-danger">');
                _this.wishlist_menu.find('a').append(_this.wishlist_count);
                $.get(_this.options.wishlist_count_url, function (count) {
                    _this.updateWishlistInfo(count);
                });
            }
            $(document).on('click', '[data-action="wishlist-update"]', function (e) {
                e.preventDefault();
                _this.updateWishlist($(this));
            });
            $(document).on('click', '[data-action="cart-add"]', function (e) {
                e.preventDefault();
                _this.addCart($(this));
            });
            $(document).on('click', '[data-action="cart-remove"]', function (e) {
                e.preventDefault();
                _this.removeCart($(this));
            });
            $(_this.wrapper_items).on('click', '.quantity a.quick-update', function (e) {
                e.preventDefault();
                _this.updateQuantity($(this));
            });
            $('.btn-cart', _this.cart_form).click(function (e) {
                e.preventDefault();
                _this.postQuantity($(this).attr('href'), $(this).parents('form').find('#quantity').val());
            });
        },
        updateWishlistInfo: function (count) {
            if (this.wishlist_count) {
                this.wishlist_count.html(count || '');
                this.wishlist_empty.css('display', count ? 'none' : 'block');
            }
        },
        updateWishlist: function (element) {
            var _this = this;
            $.post(element.attr('href'), {_token: _this.options.token}, function (results) {
                _this.updateWishlistInfo(results.count);
                if (element.hasClass('btn-wishlist')) {
                    if (results.remove) {
                        element.removeClass('added');
                    } else {
                        element.addClass('added');
                    }
                } else {
                    element.tooltip('hide');
                    element.parents('tr').remove();
                }
            });
        },
        updateCartInfo: function (data) {
            var _this = this;
            _this.cart_count.html(data.count);
            _this.cart_total.html(data.total);
            _this.cart_subtotal.html(data.subtotal);
            _this.cart_vat.html(data.vat);
            if (data.items.length > 0) {
                var html_items = '';
                $.each(data.items, function (i, item) {
                    html_items += '<tr>' + _this.template_item
                            .replace(/__URL__/g, item.attributes.url)
                            .replace(/__NAME__/g, item.name)
                            .replace(/data-src="#__IMG_SM__"/g, 'src="'+item.attributes.image_small_url+'"')
                            .replace(/__QUANTITY__/g, item.quantity)
                            .replace(/__PRICE__/g, numeral(item.price).format(0.0))
                            .replace(/__ID__/g, item.id) + '</tr>';
                });
                _this.cart_items.html(html_items);
                _this.wrapper_items.show();
                _this.wrapper_price.show();
                _this.wrapper_empty.hide();
            } else {
                _this.wrapper_items.hide();
                _this.wrapper_price.hide();
                _this.wrapper_empty.show();
            }
        },
        addCart: function (element) {
            var _this = this,
                cart_item = element.parents('.cart-item');
            if (cart_item.length) {
                var url = element.attr('href'),
                    item_id = cart_item.data('id'),
                    item_name = $('.name', cart_item).text(),
                    item_image = $('.image img', cart_item).attr('src'),
                    item_price_old = $('.price-old', cart_item).text(),
                    item_price_new = $('.price-new', cart_item).text(),
                    form = _this.template_form
                        .replace(/data-src="#__IMG__"/g, 'src="'+item_image+'"')
                        .replace(/__NAME__/g, item_name)
                        .replace(/__PRICE_NEW__/g, item_price_new)
                        .replace(/__PRICE_OLD__/g, item_price_old)
                        .replace(/__ID__/g, item_id);
                bootbox.dialog({
                    message: form,
                    title: _this.options.trans["cart.add"],
                    buttons: {
                        cancel: {
                            label: _this.options.trans["cancel"],
                            className: "btn-default"
                        },
                        success: {
                            label: _this.options.trans["ok"],
                            className: "btn-success",
                            callback: function () {
                                _this.postQuantity(url, $('#cart-form-' + item_id + ' input.quantity').val());
                            }
                        }
                    }
                });
            }
        },
        removeCart: function (element) {
            var _this = this;
            bootbox.dialog({
                message: '<div class="alert-bootbox">' + _this.options.trans["cart.remove_confirm"] + '</div>',
                title: _this.options.trans["cart.remove"],
                buttons: {
                    cancel: {
                        label: _this.options.trans["cancel"],
                        className: "btn-default"
                    },
                    success: {
                        label: _this.options.trans["ok"],
                        className: "btn-success",
                        callback: function () {
                            $.post(element.attr('href'), {
                                _method: 'delete',
                                _token: _this.options.token
                            }, function (results) {
                                var ref = element.data('ref');
                                if (ref == 'cart-show') {
                                    element.parents('tr').remove();
                                }
                                if (ref == 'cart-dropdown') {
                                    $('table tr.item-row-' + element.data('id')).remove();
                                }
                                _this.updateCartInfo(results);
                            });
                        }
                    }
                }
            });
        },
        updateQuantity: function (element) {
            var _this = this;
            element.quickUpdate({
                immediate: true,
                url: _this.options.update_quantity_url,
                container: element.parents('.cart-items'),
                processResult: function (e, results, new_quantity) {
                    element.data('qu_value', new_quantity).html(new_quantity);
                    $('.calculated', element.parents('tr')).html(results.calculated);
                    _this.updateCartInfo(results);
                }
            });
        },
        postQuantity: function (url, quantity) {
            var _this = this;
            $.post(url, {quantity: quantity, _token: _this.options.token}, function (results) {
                _this.updateCartInfo(results);
                $.fn.mbHelpers.showMessage('success', _this.options.trans["cart.add.success"]);
            });
        }
    };

    $.fn.mbCart = function (options) {
        var lists = this,
            retval = this;
        lists.each(function () {
            var plugin = $(this).data("mbCart");

            if (!plugin) {
                $(this).data("mbCart", new MbCart(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    retval = plugin[options]();
                }
            }
        });

        return retval || lists;
    };
})(jQuery, window);