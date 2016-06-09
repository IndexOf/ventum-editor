/**
* Created by kemal on 08.03.15.
*/
angular.module('editor').directive('colorPicker', function($parse, config) {

    function ColorPicker(options) {
        /**
         * @required
         * @type {angular.element}
         */
        this.el = null;

        /**
         * @type {Array}
         */
        this.colors = config.allowedColors;

        /**
         * @type {Function}
         */
        this.onSelect = null;

        /**
         * @type {number}
         */
        this.perLine = 16;

        /**
         * @type {string}
         */
        this.template = '<div class="color-picker"></div>';

        angular.extend(this, options);
        this.initialize();
    }

    ColorPicker.id = 1;

    ColorPicker.prototype = {
        initialize: function() {
            this.el.on('click', function(e) {
                if (this.__isOpen) {
                    this.close();
                } else {
                    this.open();
                }
            }.bind(this));

            this.__eventId = '.colorpicker' + ColorPicker.id++;
        },

        close: function() {
            this.__isOpen = false;
            this.__bubble.css('display', 'none');

            angular.element(document).off(this.__eventId);
        },

        open: function() {
            if (this.__isOpen) {
                return;
            }
            this.__isOpen = true;

            if (!this.__bubble) {
                this.__bubble = this.__createBubble().on('click', function(e) {
                    e.stopPropagation();
                });
            }


            this.setPosition();
            this.__bubble.css('display', '');

            angular.element(document).on('click.' + this.__eventId, this.__closeOnHtmlClick.bind(this));
        },

        setPosition: function() {
            var offset = this.el.offset();

            this.__bubble.css({
                left: offset.left,
                top: offset.top + this.el.outerHeight()
            });
        },

        /**
         * @private
         */
        __closeOnHtmlClick: function(e) {
            if (angular.element(e.target).closest(this.el).length === 0) {
                this.close();
            }
        },

        /**
         * @private
         */
        __createBubble: function() {
            var bubble = angular.element(this.template);
            var ul;

            this.colors.forEach(function(color, i) {
                if (i % this.perLine === 0) {
                    ul = angular.element('<div class="list"></div>');
                    bubble.append(ul);
                }

                var li = angular.element('<div class="item" style="background: ' + color + '"></div>')
                    .on('click', function() {
                        if (_.isFunction(this.onSelect)) {
                            this.onSelect(color);
                        }
                        this.close();
                    }.bind(this));
                ul.append(li);
            }, this);

            angular.element(document).find('body').append(bubble);
            return bubble;
        }
    };

    return {
        restrict: 'A',

        link: function($scope, element, attrs) {
            var onSelectHandler = $parse(attrs.colorPicker);
            var colorPicker = new ColorPicker({
                el: element,
                onSelect: function(color) {
                    onSelectHandler($scope, {color: color});
                }
            });
        }
    };
});