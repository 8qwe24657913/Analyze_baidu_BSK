(function() {
    var MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/<$+-%>{:* \\,}[^=_~&](")';

    function n(n) {
        var t = [];
        for (var r = 0; r < n.length; r++) {
            t.push(3 + (5 ^ n.charCodeAt(r)) ^ 6)
        }
        return t
    }

    function t(n) {
        return (6 ^ n) - 3 ^ 5
    }

    function r(n) {
        var t = [];
        for (var r = 0; r < n.length; r++) {
            t.push(n.charCodeAt(r))
        }
        return t
    }

    function o(n) {
        return String.fromCharCode(t(n))
    }

    function e(n) {
        return a(c(n), o).join([])
    }

    function i(n) {
        return String.fromCharCode.apply('null', n)
    }

    function a(n, t) {
        var r = [];
        for (var o = 0; o < n.length; o++) {
            r.push(t(n[o], o))
        }
        return r
    }

    function u(n) {
        return n.push && 0 === n.length || n.length
    }

    function c(n) {
        return u(n) ? [].concat.apply([], a(n, c)) : n
    }

    function l(n, r) {
        for (var o = 0; o < n.length; o++) {
            n[o] = t(n[o]);
            n[o] = n[o] ^ r[o % r.length]
        }
        return n
    }

    function d(n, t) {
        for (var r = 0; r < t.length; r++) {
            n.push(t[r])
        }
        return n
    }

    function f(n, t) {
        var r = [];
        var o = window.Object.prototype.hasOwnProperty;
        var e;
        var i = 0;
        for (e in n) {
            if (o.call(n, e)) r.push(e);
            i++;
            if (i > t) break
        }
        return r
    }

    function w(n) {
        var t = Math.floor(Math.random() * n.length);
        return n.splice(t, 1)[0]
    }

    function s() {
        var n = window.document.createElement(e([111, 97, [104, 112, 97, [127]]]));
        return !(!n.getContext || !n.getContext(e([60, 98])))
    }

    function h() {
        var n = window.document.createElement(e([111, 97, [104, 112, 97, [127]]]));
        n.width = 20;
        n.height = 20;
        n.style.display = e([105, 104, [106, 105, 104, [101]]]);
        var t = n.getContext(e([60, 98]));
        t.rect(0, 0, 10, 10);
        t.rect(2, 2, 6, 6);
        t.textBaseline = e([97, 106, [126, 118, 97, [108, [101, [114, 105, [111]]]]]]);
        t.fillStyle = e([47, 96, [48, 62]]);
        t.fillRect(1, 1, 13, 13);
        t.fillStyle = e([124, 99, [108, 97, 54, [49, [62, [60, 42, [46, 60, 62, [50, [42, [46, 62, [42, 46, 62, [40, [60, [41]]]]]]]]]]]]]);
        t.font = e([49, 70, [126, 114, 46, [65, [124, [105, 97, [106]]]]]]);
        t.fillText(e([79, 115, [109, 46, 96, [116, [107, [98, 98, [98, 98, 124, [98, [108, [97, 104, [119, 46, 99, [106, [121, [126, 118, [127]]]]]]]]]]]]]]), 1, 25);
        t.globalCompositeOperation = e([109, 117, [106, 114, 105, [126, [106, [121]]]]]);
        t.fillStyle = e([124, 99, [108, 54, 60, [53, [53, [42, 62, [42, 60, 53, [53, [41]]]]]]]]);
        t.beginPath();
        t.arc(10, 10, 10, 0, 2 * Math.PI, !0);
        t.closePath();
        t.fill();
        t.fillStyle = e([124, 99, [108, 54, 62, [42, [60, [53, 53, [42, 60, 53, [53, [41]]]]]]]]);
        t.beginPath();
        t.arc(10, 5, 5, 0, 2 * Math.PI, !0);
        t.closePath();
        t.fill();
        t.fillStyle = e([124, 99, [108, 54, 60, [53, [53, [42, 60, [53, 53, 42, [62, [41]]]]]]]]);
        t.beginPath();
        t.arc(8, 10, 5, 0, 2 * Math.PI, !0);
        t.closePath();
        t.fill();
        t.fillStyle = e([124, 99, [108, 54, 60, [53, [53, [42, 62, [42, 60, 53, [53, [41]]]]]]]]);
        t.arc(7, 7, 7, 0, 2 * Math.PI, !0);
        t.arc(6, 6, 2, 0, 2 * Math.PI, !0);
        t.fill(e([101, 112, [101, 104, 107, [98, [98]]]]));
        return (!1 === t.isPointInPath(5, 5, e([101, 112, [101, 104, 107, [98, [98]]]])) ? e([121, 101, [127]]) : e([104, 107])) + n.toDataURL()
    }

    function g() {
        var t = !1;
        try {
            t = !(!global.process && !global.Buffer)
        } catch (n) {
            t = !1
        }
        var o = v.length;
        var a = [];
        for (var u = 0; u < o; u++) {
            var d = w(v);
            try {
                if (t) {
                    a.push([44], d[0], [44, 68, [44, 44]], r(MAP), [44]);
                    if (u !== o - 1) a.push([42]);
                    continue
                }
                var f = d[1]();
                if (f && f.length && !f.charCodeAt) f = e(f);
                if (f && f.charCodeAt) {
                    f = f.replace(/"/g, [90, 44]);
                    a.push([44], d[0], [44, 68, [44]]);
                    for (var s = 0; s < f.length; s++) {
                        a.push(3 + (5 ^ f.charCodeAt(s)) ^ 6)
                    }
                    a.push([44])
                } else a.push([44], d[0], [44, 68, [46]], n(f.toString()))
            } catch (n) {
                a.push([44], d[0], [44, 68, [46, 60, 62, [49, [51, [62, 53, [49, 49]]]]]])
            }
            if (u !== o - 1) a.push([42])
        }
        var h = c([135].concat(a).concat([125]));
        if (!t) {
            var g = l(h, r(IN.tbs || IN));
            var p = btoa(i(g));
            OUT.data = p
        } else OUT.data = btoa(i(h))
    };
    var v = [
        [
            [126, 49],
            function() {
                return window.encodeURIComponent(window.JSON.stringify(IN))
            }
        ],
        [
            [117, 49],
            function() {
                return window.navigator.userAgent || 'NULL'
            }
        ],
        [
            [106, 49],
            function() {
                return window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage || window.navigator.systemLanguage || [72, 85, [74, 74]]
            }
        ],
        [
            [127, 49],
            function() {
                return window.screen.height || 'NULL'
            }
        ],
        [
            [127, 60],
            function() {
                return window.screen.width || 'NULL'
            }
        ],
        [
            [115, 49],
            function() {
                return window.document.height || 'NULL'
            }
        ],
        [
            [115, 60],
            function() {
                return window.document.width || 'NULL'
            }
        ],
        [
            [97, 49],
            function() {
                return window.screen.availWidth || 'NULL'
            }
        ],
        [
            [97, 60],
            function() {
                return window.screen.availHeight || 'NULL'
            }
        ],
        [
            [127, 63],
            function() {
                return !!window.sessionStorage
            }
        ],
        [
            [106, 60],
            function() {
                return !!window.localStorage
            }
        ],
        [
            [105, 49],
            function() {
                return !!window.indexedDB
            }
        ],
        [
            [97, 63],
            function() {
                return !!window.document.body.addBehavior
            }
        ],
        [
            [126, 60],
            function() {
                return window.navigator.platform || 'NULL'
            }
        ],
        [
            [98, 49],
            function() {
                return window.navigator.doNotTrack || window.navigator.msDoNotTrack || window.navigator.msDoNotTrack || window.doNotTrack || 'NULL'
            }
        ],
        [
            [111, 49],
            function() {
                return s()
            }
        ],
        [
            [97, 50],
            function() {
                return !!window.awesomium
            }
        ],
        [
            [126, 63],
            function() {
                return !!window._phantom || !!window.phantom || !!window.callPhantom
            }
        ],
        [
            [104, 49],
            function() {
                return window.__nightmare
            }
        ],
        [
            [115, 63],
            function() {
                return !!(window._Selenium_IDE_Recorder || window.document.__webdriver_script_fn || window.navigator.webdriver || window.document.documentElement.getAttribute('webdriver') || window.document.$cdc_asdjflasutopfhvcZLmcfl_ || window.document.$wdc_)
            }
        ],
        [
            [101, 49],
            function() {
                return global.process.type || global.process.versions.electron || 'NULL'
            }
        ],
        [
            [104, 60],
            function() {
                return !!global
            }
        ],
        [
            [104, 63],
            function() {
                return f(global.process.versions, 20).join()
            }
        ],
        [
            [124, 49],
            function() {
                return Function.prototype.toString.apply(Math.random).slice(0, 100).replace(/\n/g, [])
            }
        ],
        [
            [114, 49],
            function() {
                return Function.prototype.toString.apply(Function.toString).slice(0, 100).replace(/\n/g, [])
            }
        ],
        [
            [115, 50],
            function() {
                return f(window, 20).join()
            }
        ],
        [
            [114, 60],
            function() {
                return Math.floor(Date.now() / 1000)
            }
        ],
        [
            [109, 49],
            function() {
                return 'basilisk_aLv0jg'
            }
        ],
        [
            [109, 60],
            function() {
                return _BSK.userBehavior.mouseMoveArr.join() || 'NULL'
            }
        ],
        [
            [109, 63],
            function() {
                return _BSK.userBehavior.isMouseClicked
            }
        ],
        [
            [109, 50],
            function() {
                return _BSK.userBehavior.scrollArr.join() || 'NULL'
            }
        ],
        [
            [109, 53],
            function() {
                return _BSK.userBehavior.sendByClick
            }
        ],
        [
            [119, 49],
            function() {
                return _BSK.userBehavior.sendByKeyBoard
            }
        ],
        [
            [119, 60],
            function() {
                return _BSK.userBehavior.keyUpArr.join() || 'NULL'
            }
        ]
    ];
    g()
}())