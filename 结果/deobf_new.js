(function () {
    var MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/<$+-%>{:* \\,}[^=_~&](")';
    function encodeStr(str) {
        var res = [];
        for (var i = 0; i < str.length; i++) {
            res.push(3 + (5 ^ str.charCodeAt(i)) ^ 6)
        }
        return res
    }

    function decodeCharCode(code) {
        return (6 ^ code) - 3 ^ 5
    }

    function toCharCodeArr(str) {
        var res = [];
        for (var i = 0; i < str.length; i++) {
            res.push(str.charCodeAt(i))
        }
        return res
    }

    function decodeChar(code) {
        return String.fromCharCode(decodeCharCode(code))
    }

    function decodeStr(arr) {
        return map(flatten(arr), decodeChar).join('')
    }

    function fromCharCodes(charCodes) {
        return String.fromCharCode.apply(null, charCodes)
    }

    function map(arr, func) {
        var res = [];
        for (var i = 0; i < arr.length; i++) {
            res.push(func(arr[i], i))
        }
        return res
    }

    function isArr(wtf) {
        return wtf.push && 0 === wtf.length || wtf.length
    }

    function flatten(arr) {
        return isArr(arr) ? [].concat.apply([], map(arr, flatten)) : arr
    }

    function genRes(arr, map) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = decodeCharCode(arr[i]);
            arr[i] = arr[i] ^ map[i % map.length]
        }
        return arr
    }

    function modifyConcat(to, from) {
        for (var r = 0; r < from.length; r++) {
            to.push(from[r])
        }
        return to
    }

    function ownPropNames(obj, maxLength) {
        var res = [];
        var hasOwnProperty = window.Object.prototype.hasOwnProperty;
        var elem;
        var counter = 0;
        for (elem in obj) {
            if (hasOwnProperty.call(obj, elem)) res.push(elem);
            counter++;
            if (counter > maxLength) break;
        }
        return res
    }

    function nextFunc(funcs) {
        var index = Math.floor(Math.random() * funcs.length);
        return funcs.splice(index, 1)[0]
    }

    function canCanvasTrack() {
        var canvas = window.document.createElement('canvas');
        return Boolean(canvas.getContext && canvas.getContext('2d'))
    }

    function canvasTrack() {
        var canvas = window.document.createElement('canvas');
        canvas.width = 20;
        canvas.height = 20;
        canvas.style.display = 'inline';
        var ctx = canvas.getContext('2d');
        ctx.rect(0, 0, 10, 10);
        ctx.rect(2, 2, 6, 6);
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(1, 1, 13, 13);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.2)';
        ctx.font = '18pt Arial';
        ctx.fillText('Cwm fjoddddrdbank glyphs', 1, 25);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(10, 10, 10, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgb(0,255,255)';
        ctx.beginPath();
        ctx.arc(10, 5, 5, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgb(255,255,0)';
        ctx.beginPath();
        ctx.arc(8, 10, 5, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.arc(7, 7, 7, 0, 2 * Math.PI, true);
        ctx.arc(6, 6, 2, 0, 2 * Math.PI, true);
        ctx.fill('evenodd');
        return (false === ctx.isPointInPath(5, 5, 'evenodd') ? 'yes' : 'no') + canvas.toDataURL()
    }

    function startRun() {
        var isNodejs = false;
        try {
            isNodejs = Boolean(global.process || global.Buffer)
        } catch (n) {
            isNodejs = false
        }
        if (isNodejs) {
            var wtf = decodeStr(toCharCodeArr(MAP)); // bug: quote isn't escaped
            func = function () {
                var [key, func] = nextFunc(funcs);
                return `"${key}":""${wtf}"` // bug: duplicate quotes
            }
        } else {
            func = function () {
                var [key, func] = nextFunc(funcs);
                try {
                    var res = func();
                    if (res && res.charCodeAt) {
                        res = res.replace(/"/g, encodeStr('\\"')); // bug: encoded twice
                        return `"${key}":"${res}"`;
                    } else return `"${key}": ${res.toString()}`
                } catch (n) {
                    return `"${key}": 20170511`
                }
            }
        }
        var length = funcs.length;
        var str = `{${Array.from({length}).map(func).join()}}`;
        console.log(str);
        if (!isNodejs) {
            var charCodes = genRes(encodeStr(str), toCharCodeArr(IN.tbs || IN));
            var data = btoa(fromCharCodes(charCodes));
            OUT.data = data
        } else OUT.data = btoa(fromCharCodes(str))
    }
    var funcs = [['p1', function () {
        return window.encodeURIComponent(window.JSON.stringify(IN))
}], ['u1', function () {
        return window.navigator.userAgent || 'NULL'
}], ['l1', function () {
        return window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage || window.navigator.systemLanguage || 'NULL'
}], ['s1', function () {
        return window.screen.height || 'NULL'
}], ['s2', function () {
        return window.screen.width || 'NULL'
}], ['w1', function () {
        return window.document.height || 'NULL'
}], ['w2', function () {
        return window.document.width || 'NULL'
}], ['a1', function () {
        return window.screen.availWidth || 'NULL'
}], ['a2', function () {
        return window.screen.availHeight || 'NULL'
}], ['s3', function () {
        return !!window.sessionStorage
}], ['l2', function () {
        return !!window.localStorage
}], ['i1', function () {
        return !!window.indexedDB
}], ['a3', function () {
        return !!window.document.body.addBehavior
}], ['p2', function () {
        return window.navigator.platform || 'NULL'
}], ['d1', function () {
        return window.navigator.doNotTrack || window.navigator.msDoNotTrack || window.navigator.msDoNotTrack || window.doNotTrack || 'NULL'
}], ['c1', function () {
        return canCanvasTrack()
}], ['a4', function () {
        return !!window.awesomium
}], ['p3', function () {
        return !!window._phantom || !!window.phantom || !!window.callPhantom
}], ['n1', function () {
        return window.__nightmare
}], ['w3', function () {
        return !!(window._Selenium_IDE_Recorder || window.document.__webdriver_script_fn || window.navigator.webdriver || window.document.documentElement.getAttribute('webdriver') || window.document.$cdc_asdjflasutopfhvcZLmcfl_ || window.document.$wdc_)
}], ['e1', function () {
        return global.process.type || global.process.versions.electron || 'NULL'
}], ['n2', function () {
        return !!global
}], ['n3', function () {
        return ownPropNames(global.process.versions, 20).join()
}], ['r1', function () {
        return Function.prototype.toString.apply(Math.random).slice(0, 100).replace(/\n/g, '')
}], ['t1', function () {
        return Function.prototype.toString.apply(Function.toString).slice(0, 100).replace(/\n/g, '')
}], ['w4', function () {
        return ownPropNames(window, 20).join()
}], ['t2', function () {
        return Math.floor(Date.now() / 1000)
}], ['m1', function () {
        return 'basilisk_aLv0jg'
}]，
        [
            'm2',
            function() {
                return _BSK.userBehavior.mouseMoveArr.join() || 'NULL'
            }
        ],
        [
           'm3',
            function() {
                return _BSK.userBehavior.isMouseClicked
            }
        ],
        [
           'm4',
            function() {
                return _BSK.userBehavior.scrollArr.join() || 'NULL'
            }
        ],
        [
            'm5',
            function() {
                return _BSK.userBehavior.sendByClick
            }
        ],
        [
            'k1',
            function() {
                return _BSK.userBehavior.sendByKeyBoard
            }
        ],
        [
           'k2',
            function() {
                return _BSK.userBehavior.keyUpArr.join() || 'NULL'
            }
        ]

];
    startRun();
}())