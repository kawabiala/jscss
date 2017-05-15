/*jslint node: true */

'use strict';

/*
    var Style = require('./Style');
    
    Style.defineGlobalConstant(name, constant);
    Style.defineGlobalStyle(name, style);
    
    var stylesheet = Style.stylesheet(stylesheetName);
    
    stylesheet.defineConstant(name, constant);
    stylesheet.defineStyle(name, style);
    stylesheet.get(name);
    
*/

var stylesheets = {};
var globalStyles = {};
var globalConstants = {};

var cloneStyleObject = function (obj) {

    var newObj = {};
    
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            newObj[prop] = obj[prop];
        }
    }
    
    return newObj;
};

var mergeStyles = function (style_1, style_2) {

    var prop;
    for (prop in style_2) {
        if (style_2.hasOwnProperty(prop)) {
            style_1[prop] = style_2[prop];
        }
    }
    
    return style_1;
};

var defineGlobalConstant = function (name, constant) {
    
    if (globalConstants[name]) {
        console.warn('Re-defining global constants is not allowed. Use a local constant instead.');
        return;
    }
        
    globalConstants[name] = constant;
};
/*
var defineGlobalStyle = function (name, style) {
    
    if (globalStyles[name]) {
        console.warn('Re-defining global styles is not allowed. Use a local style instead.');
        return;
    }
        
    globalStyles[name] = style;
};
*/
var defineGlobalStyle = function (name, style, inherit) {
    
    if (globalStyles[name]) {
        console.warn('Re-defining global styles is not allowed. Use a local style instead.');
        return;
    }
    
    var parent = globalStyles[inherit];
    var child;
        
    if (parent) {
        globalStyles[name] = mergeStyles(cloneStyleObject(parent), style);
    } else {
        globalStyles[name] = style;
    }
    
};

var Stylesheet = function () {
    
    var localStyles = {};
    var localConstants = {};
    
    var replaceGlobalConstants = function (styleDef) {
        
        var styleDefs = styleDef.split(' ');
        styleDefs.forEach(function (def, index, styleDefs) {
            var replace = globalConstants[def];
            if (replace !== undefined) {
                styleDefs[index] = replace;
            }
        });
        
        return styleDefs.join(' ');
    };
    
    var replaceLocalConstants = function (styleDef) {
        
        var styleDefs = styleDef.split(' ');
        styleDefs.forEach(function (def, index, styleDefs) {
            var replace = localConstants[def];
            if (replace !== undefined) {
                styleDefs[index] = replace;
            }
        });
        
        styleDef = styleDefs.join(' ');
        
        return replaceGlobalConstants(styleDef);
    };
    
    var getGlobal = function (name) {
        
        var style = globalStyles[name];
        var key;
        
        for (key in style) {
            if (style.hasOwnProperty(key)) {
                style[key] = replaceGlobalConstants(style[key]);
            }
        }
        
        return style;
    };
    
    var getLocal = function (name) {
        
        var style = localStyles[name];
        var key;
        
        for (key in style) {
            if (style.hasOwnProperty(key)) {
                style[key] = replaceLocalConstants(style[key]);
            }
        }
        
        return style;
    };
    
    this.defineConstant = function (name, constant) {
        
        if (localConstants[name]) {
            console.warn('Re-defining local constants is not allowed.');
            return;
        }
        
        localConstants[name] = constant;
    };
    
    this.defineStyle = function (name, style) {
        
        if (localStyles[name]) {
            console.warn('Re-defining local styles is not allowed.');
            return;
        }
        
        localStyles[name] = style;
    };
    
    var getStyle = function (name) {
        
        var localStyle = getLocal(name);
        var globalStyle = getGlobal(name);
        
        if (localStyle === undefined) { return globalStyle; }
        if (globalStyle === undefined) { return localStyle; }
        /*
        for (var key in localStyle) {
            globalStyle[key] = localStyle[key];
        }
        */
        return mergeStyles(cloneStyleObject(globalStyle), localStyle);
    };
    
    this.get = function () {
        
        var i;
        var style = {};
        
        for (i = 0; i < arguments.length; i++) {
            style = mergeStyles(style, getStyle(arguments[i]));
        }
        
        return style;
    };
};

var Style = {
    
    stylesheet: function (name) {
    
        var stylesheet = stylesheets[name];
    
        if (stylesheet === undefined) {
            stylesheet = new Stylesheet();
            stylesheets[name] = stylesheet;
        }
    
        return stylesheet;
    },
    
    defineGlobalConstant: defineGlobalConstant,
    
    defineGlobalStyle: defineGlobalStyle
    
};


module.exports = Style;