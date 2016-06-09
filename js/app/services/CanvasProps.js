angular.module('editor').service('CanvasProps', function(Utils) {
    /**
     * @param {HTMLElement} img
     * @param {Number} value
     * @returns {string}
     */
    this.gaussianBlur = function(img, value) {
        var temp_canvas = document.createElement('canvas');
        var ctx = temp_canvas.getContext('2d');

        // set buffer dimensions to image dimensions
        ctx.width = temp_canvas.width = img.width;
        ctx.height = temp_canvas.height = img.height;

        ctx.clearRect(0, 0, ctx.width, ctx.height);
        ctx.drawImage(img, 0, 0, ctx.width, ctx.height);
        var pixels = ctx.getImageData(0, 0, ctx.width, ctx.height);

        pixels = gaussianBlur(img, pixels, value);
        ctx.putImageData(pixels, 0, 0);

        return temp_canvas.toDataURL();
    };

    /**
     * @param {string} prop
     * @param {object} object
     * @returns {*}
     */
    this.getValue = function(prop, object) {
        var getter = this['__get' + Utils.capitalize(prop)];
        if (typeof getter === 'function') {
            return getter.apply(this, arguments);
        }
        return object.get(prop);
    };

    this.setPathGroupFill = function(object, value) {
        object.getObjects().forEach(function(path, i) {
            console.log(path, i);
            if (path.fillRule !== undefined) {
                if (typeof path.fill === 'string' && path.fill.toLowerCase().replace(/^#f+/g, 'f') !== 'f') {
                    path.fill = value;
                } else if (path.fillRule === 'evenodd') {
                    (_.get(path, 'fill.colorStops') || []).forEach(function(stop, i) {
                        if (i % 2 === 0) {
                            stop.color = value;
                        }
                    });
                }
            } else {
                path.fill = value;
            }
        });
    };

    /**
    * @private
    */
    this.__getAngle = function(prop, object) {
        var groupValue = _.get(object, ['group', prop]) || 0;
        return Math.round((groupValue + object.get(prop)) % 360);
    };
});