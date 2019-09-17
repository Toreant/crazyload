/**
 * Created by toreant on 2017/7/26.
 */
; (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.Crazyload = factory(root);
    }
})(window, function (root) {

    function _inView(obj, view, direct = 'all') {
        if (!obj.offsetParent) {
            return false;
        }

        let offset = obj.getBoundingClientRect();
        let r = false;
        if (direct == 'all') {
            r = offset.top <= view.b && offset.bottom >= view.t && offset.left <= view.r && offset.right >= view.l;
        } else if (direct === 'vertical') {
            r = offset.top <= view.b && offset.bottom >= view.t;
        } else if (direct == 'horizontal') {
            r = offset.left <= view.r && offset.right >= view.l;
        }
        return r;
    }

    function _extend(target, source) {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }

        return target;
    }

    function throttle(fn, delay, duration) {
        let timer = null;
        let previous = null;

        return function () {
            let now = +new Date();

            if (!previous) previous = now;
            if (duration && now - previous > duration) {
                fn();
                // 重置上一次开始时间为本次结束时间
                previous = now;
                clearTimeout(timer);
            } else {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn();
                    previous = null;
                }, delay);
            }
        };
    }

    function addEventListener(target, event, func) {
        if (document.addEventListener) {
            target.addEventListener(event, func, false);
        } else if (document.documentElement.attachEvent) {
            target.attachEvent('on' + event, func, false);
        } else {
            target['on' + event] = func;
        }
    }

    function removeEventListener(target, event, func) {
        if (document.removeEventListener) {
            target.removeEventListener(event, func);
        } else if (target.detachEvent) {
            target.detach(event, func);
        }
    }

    function Crazyload() {
        this.option = {
            offsetTop: 0,
            offsetBottom: 0,
            offsetLeft: 0,
            offsetRight: 0,
            offset: 0,
            delay: 150,
            duration: 300,
            target: root,
            event: null,
            direct: 'all',
            callback: function () { }
        };

        
    }

    Crazyload.prototype.init = function (option, callback) {
        console.log('crazyload init');
        try {
            // console.log(this.option);
            this.option = _extend(this.option, option);
            this.render();
            let options = this.option;
            this.option.render = throttle(_initRender(options), options.delay, options.duration)
            addEventListener(options.target, 'scroll', this.option.render);
            addEventListener(options.target, 'load', this.option.render);
            callback && callback(null);
        } catch (exp) {
            console.error(exp);
            callback && callback(exp);
        }
    };

    function _initRender(options) {
        return function () {
            render(options);
        };
    }

    function render(options) {
        let nodes = document.querySelectorAll('[data-crazy], [data-crazy-back]');
        let view = {
            l: 0 - options.offsetLeft,
            t: 0 - options.offsetTop,
            b: (root.innerHeight || document.documentElement.clientHeight) + options.offsetBottom,
            r: (root.innerWidth || document.documentElement.clientWidth) + options.offsetRight
        };
        let ele = null;
        let src = '';
        for (let i = 0, num = nodes.length; i < num; i++) {
            ele = nodes[i];
            if (_inView(ele, view, options.direct)) {
                if (ele.getAttribute('data-crazy-back')) {
                    let errorBack = ele.getAttribute('data-crazy-error');
                    let backgroundImage = 'url(' + ele.getAttribute('data-crazy-back') + ')';
                    if (errorBack) {
                        backgroundImage += `,url(${errorBack})`;
                    }
                    ele.style.backgroundImage = backgroundImage;
                } else if ((src = ele.getAttribute('data-crazy')) !== ele.src) {
                    ele.src = src;
                }

                ele.removeAttribute('data-crazy-back');
                ele.removeAttribute('data-crazy');
                options.callback(ele);
            } 
        }
    }

    Crazyload.prototype.render = function () {
        let options = this.option;
        render(options);
    };

    Crazyload.prototype.destroy = function () {
        let options = this.option;
        console.log('crazyload destroy', options);
        removeEventListener(options.target, 'scroll', this.option.render);
        removeEventListener(options.target, 'load', this.option.render);
    };

    return Crazyload;
});