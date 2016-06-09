/**
 * Created by kemal on 03.03.15.
 *
 * Canvas class
 */
angular.module('editor').factory('Canvas', function($rootScope, $q, config, CanvasProps, Utils) {

    var Canvas = function(options) {
        this.canvas = new fabric.Canvas(options.el, {
            renderOnAddRemove: false,
            stateful: false
        });
        this.__initHist(options.data);
        return this;
    };

    /**
     * Add image
     * @param {string} url
     * @param {string} type
     */
    Canvas.prototype.addImage = function(url, type) {
        this.__loadImage(url, type).then(function(object) {
            this.__needSaveState = false;

            object.set({
                top: 0,
                left: 0,
                lockUniScaling: type !== 'svg'
            });

            this.__setImageScale(object);
            this.canvas.add(object.setCoords());

            this.__needSaveState = true;
            this.setSelected(object);
            this.__saveToHist();
        }.bind(this));
    };

    /**
     * Add state to history
     * @param state
     */
    Canvas.prototype.addState = function(state) {
        var states = this.__states,
            stateLength = states.length;

        if (new Date().getTime() - (this.__lastHistoryStateTime || 0) < 200) {
            states.splice(stateLength - 1, 0, state);
        } else {
            if (stateLength !== this.__stateIndex) {
                states.length = this.__stateIndex;
            }

            if (stateLength === config.maxHistoryLength) {
                states.shift();
            }

            this.__stateIndex++;
            states.push(state);
        }

        this.__lastHistoryStateTime = new Date().getTime();
    };

    /**
     * Adding text
     * @param {string} text
     * @param {object} [options]
     * @returns {fabric.IText}
     */
    Canvas.prototype.addText = function(text, options) {
        this.__needSaveState = false;
        var object = new fabric.IText(text, angular.extend({
            fontFamily: 'Arial',
            fontSize: 40,
            lineHeight: 1.1,
            padding: 5,
            fill: config.font.defaultFillColor
        }, options));
        object.set(this.__getRandomPosition(object)).setCoords();
        this.canvas.add(object);
        this.__needSaveState = true;
        this.setSelected(object);
        this.__saveToHist();
        return object;
    };

    /**
     * @param {string} direction
     */
    Canvas.prototype.alignGroup = function(direction) {
        var axis = this.__getAlignAxis(direction);
        var group = this.canvas.getActiveGroup();
        var groupCenter = group.get(axis.side) / 2;

        group.getObjects().forEach(function(o) {
            var sideValue = axis.dir === 'left' ? o.getWidth() : o.getHeight();
            var center = o.padding !== undefined ? groupCenter - (o.padding + 0.5) : groupCenter;
            switch (direction) {
                case 'left':
                case 'top':
                    o.set(axis.dir, - center);
                    break;
                case 'right':
                case 'bottom':
                    o.set(axis.dir, center - sideValue);
                    break;
                case 'vertical':
                case 'horizontal':
                    o.set(axis.dir, - sideValue / 2);
                    break;
                default:
            }
        }, this);

        this.canvas.renderAll();
        this.__saveToHist();
    };

    /**
     * Bring to front the selected object
     */
    Canvas.prototype.bringToFront = function() {
        var object = this.canvas.getActiveObject();
        if (object) {
            this.canvas.bringToFront(object);
        }
    };

    Canvas.prototype.canUseUndo = function() {
        return this.__stateIndex > 1;
    };

    Canvas.prototype.canUseRedo = function() {
        return this.__states.length > this.__stateIndex;
    };

    /**
     * Discard the active object or group
     */
    Canvas.prototype.discardSelected = function() {
        this.canvas.deactivateAll().renderAll();
    };

    /**
     * @returns {fabric.Canvas}
     */
    Canvas.prototype.getInstance = function() {
        return this.canvas;
    };

    /**
     * Get the value of property
     * @param {string} name
     * @returns {Array}
     */
    Canvas.prototype.getProp = function(name) {
        return this.getSelectedAsArray().reduce(function(propValues, object) {
            propValues.push(CanvasProps.getValue(name, object));
            return propValues;
        }, []);
    };

    /**
     * Get selected objects as array
     * @returns {Array}
     */
    Canvas.prototype.getSelectedAsArray = function() {
        var active = this.canvas.getActiveObject() || this.canvas.getActiveGroup();
        return active ?
            active.type === 'group' ?
                active.getObjects() :
                [active] :
            [];
    };

    /**
     * Getting history state by state index
     * @param index number
     * @returns {*}
     */
    Canvas.prototype.getState = function(index) {
        var states = this.__states,
            newState = this.__stateIndex + index;

        if (states.length < newState || newState < 0) {
            return undefined;
        }

        this.__stateIndex = newState;

        return states[this.__stateIndex - 1];
    };

    /**
     * Get selected object or group
     * @param {string|array} [type]
     * @returns {*}
     */
    Canvas.prototype.hasSelected = function(type) {
        if (type) {
            var selected = this.getSelectedAsArray();
            return selected.length && selected.every(function(object) {
                return angular.isArray(type) ? type.indexOf(object.type) !== -1 : object.type === type;
            });
        } else {
            return this.canvas.getActiveObject() || this.canvas.getActiveGroup();
        }
    };

    Canvas.prototype.isSelected = function(object) {
        var selected = this.canvas.getActiveObject();
        return selected ? angular.equals(selected, object) : false;
    };

    /**
     * Check exist value of property for the objects
     * @param {string} name
     * @param {*} value
     * @returns {boolean}
     */
    Canvas.prototype.isProp = function(name, value) {
        var propValues = this.getProp.apply(this, arguments);
        return propValues.length !== 0 && propValues.every(function(propValue) {
            return propValue === value;
        });
    };

    /**
     * Redo changes
     * @param changesCount
     */
    Canvas.prototype.redo = function(changesCount) {
        changesCount = changesCount || 1;
        this.__loadHist(this.getState(changesCount));
    };

    /**
     * Remove object
     * @param {object} object
     */
    Canvas.prototype.removeObject = function(object) {
        this.canvas.discardActiveGroup().remove(object).renderAll();
    };

    /**
     * Remove the active object or group
     */
    Canvas.prototype.removeSelected = function() {
        var selected = this.getSelectedAsArray();
        if (selected.length) {
            selected.forEach(function(object) {
                this.canvas.remove(object);
            }, this);
            this.canvas.discardActiveGroup().renderAll();
        }
    };

    /**
     * Send to back the selected object
     */
    Canvas.prototype.sendToBack = function() {
        var object = this.canvas.getActiveObject();
        if (object) {
            this.canvas.sendToBack(object);
        }
    };

    /**
     * @param {string} color
     */
    Canvas.prototype.setBackgroundColor = function(color) {
        var canvas = this.canvas;
        canvas.setBackgroundImage(null);
        canvas.setBackgroundColor(color, function() {
            canvas.renderAll();
            this.__saveToHist();
        }.bind(this));
    };

    Canvas.prototype.setBackgroundImage = function(url) {
        var defer = $q.defer();
        var canvas = this.canvas;

        fabric.Image.fromURL(url, function(object) {
            object.set({
                width: canvas.getWidth(),
                height: canvas.getHeight()
            });

            canvas.setBackgroundImage(object, function() {
                canvas.renderAll();
                this.__saveToHist();
                defer.resolve();
            }.bind(this));
        }.bind(this));

        return defer.promise;
    };

    /**
     * Set property of canvas objects
     * @param {string} name
     * @param {*} value
     */
    Canvas.prototype.setProp = function(name, value) {
        var setter = this['__setProp' + Utils.capitalize(name)];

        if (typeof setter !== 'function') {
            var canvas = this.canvas;
            var needTriggerEvent = false;

            this.getSelectedAsArray().forEach(function(object) {
                if (angular.isFunction(object['set' + $rootScope.Utils.capitalize(name)])) {
                    if (object.type === 'path-group' && name === 'fill') {
                        CanvasProps.setPathGroupFill(object, value);
                    } else {
                        var oldValue = object.get(name);
                        value = typeof oldValue === 'number' ? parseFloat(value) : value;
                        object.set(name, value);
                    }
                    needTriggerEvent = oldValue !== value;
                }
            });

            needTriggerEvent && canvas.trigger('object:modified');
            canvas.renderAll();
        } else {
            setter.call(this, value);
        }
    };

    /**
     * Set active object
     * @param {object} selected
     */
    Canvas.prototype.setSelected = function(selected) {
        this.canvas.discardActiveGroup().setActiveObject(selected);
    };

    /**
     * Toggle the property of objects
     * @param {string} name
     * @param {*} value
     */
    Canvas.prototype.toggleProp = function(name, value) {
        this.setProp(name, this.isProp.apply(this, arguments) ? '' : value);
    };

    /**
     * Undo changes
     * @param changesCount
     */
    Canvas.prototype.undo = function(changesCount) {
        changesCount = changesCount || -1;
        this.__loadHist(this.getState(changesCount));
    };

    /**
     * @private Initialize save state on canvas change
     */
    Canvas.prototype.__initHist = function(defaultState) {
        var self = this;

        function saveState() {
            self.__saveToHist();
        }

        this.__states = []; // History state
        this.__stateIndex = 0; // Current state Index in history
        this.__needSaveState = true; // flag that allows save state

        this.canvas
            .on('text:changed', saveState)
            .on('object:modified', saveState)
            .on('object:added', saveState)
            .on('object:removed', saveState)
            .on('path:created', saveState)
            .loadFromJSON(defaultState, saveState);
    };

    /**
     * @private
     */
    Canvas.prototype.__getAlignAxis = function(direction) {
        switch (direction) {
            case 'left':
            case 'vertical':
            case 'right':
                return {
                    dir: 'left',
                    side: 'width'
                };
            case 'top':
            case 'horizontal':
            case 'bottom':
                return {
                    dir: 'top',
                    side: 'height'
                };
            default:
        }
    };

    /**
     * @param {object} o
     * @returns {{top: number, left: number}}
     * @private
     */
    Canvas.prototype.__getRandomPosition = function(o) {
        var indent = 15;
        return {
            top: _.random(indent, this.canvas.getHeight() - o.getHeight() - indent),
            left: _.random(indent, this.canvas.getWidth() - o.getWidth() - indent)
        };
    };

    /**
     * @private Load current state from JSON object
     * @param {JSON} state
     * @private
     */
    Canvas.prototype.__loadHist = function(state) {
        if (!state) {
            return;
        }

        var canvas = this.canvas;
        this.__needSaveState = false;
        canvas.clear().setBackgroundImage(null);
        canvas.loadFromJSON(state, function() {
            // After new canvas from JSON, fabric doesn't save
            // active objects. That's why we add them manually
            var activeObjects = canvas._objects.filter(function(obj) {
                return obj.active;
            });

            if (activeObjects.length > 0) {
                if (activeObjects.length === 1) {
                    canvas.setActiveObject(activeObjects[0]);
                } else {
                    canvas.setActiveGroup(new fabric.Group(activeObjects));
                }
            }

            canvas.renderAll();
            this.__needSaveState = true;
        }.bind(this));
    };

    /**
     * @private
     */
    Canvas.prototype.__loadImage = function(url, type) {
        var defer = $q.defer();

        if (type === 'svg') {
            fabric.loadSVGFromURL(url, function(objects, options) {
                defer.resolve(fabric.util.groupSVGElements(objects, options));
            });
        } else {
            fabric.Image.fromURL(url, function(object) {
                defer.resolve(object);
            });
        }

        return defer.promise;
    };

    /**
     * @private Preserves the history of changes to the Editor
     */
    Canvas.prototype.__saveToHist = function() {
        if (this.__needSaveState) {
            // TODO: разобраться почему я использую JSON.stringify
            this.addState(JSON.stringify(this.canvas.toJSON(
                ['active', 'gaussianBlur', 'originalImage', 'lockUniScaling']
            )));
        }
    };

    /**
     * @private
     */
    Canvas.prototype.__setPropGaussianBlur = function(value) {
        var canvas = this.canvas;
        var defers = [];

        this.getSelectedAsArray().forEach(function(object) {
            if (!object.originalImage) {
                object.originalImage = object.getSrc();
            }

            var defer = $q.defer();
            var img = $('<img>').attr('src', object.originalImage).get(0);

            object.setSrc(CanvasProps.gaussianBlur(img, value), function() {
                object.set('gaussianBlur', value);
                defer.resolve();
            });

            defers.push(defer.promise);
        });

        $q.when.apply($q, defers).then(function() {
            canvas.trigger('object:modified');
            canvas.renderAll();
        });
    };

    /**
     * @private
     */
    Canvas.prototype.__setImageScale = function(o) {
        var maxW = this.canvas.getWidth() / 2;
        var maxH = this.canvas.getHeight();

        if (o.getWidth() > maxW) {
            o.scaleToWidth(maxW);
        }

        if (o.getHeight() > maxH) {
            o.scaleToHeight(maxH);
        }
    };

    return Canvas;
});