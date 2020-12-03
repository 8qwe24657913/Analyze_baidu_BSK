//var btoa = require('btoa');

var seed = 1;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


function bsk_solver(tbs_str,bsk_to_decrypt) {
    var MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/<$+-%>{:* \\,}[^=_~&](")';
    var IN=tbs_str;  // this is tbs

    var OUT={};

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

    function encodeCharCode(code) {
        return 3 + (5 ^ code) ^ 6
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
    function RevRes(arr, map) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i] ^ map[i % map.length]
            arr[i] = encodeCharCode(arr[i]);
        }
        return arr
    }

    function nextFunc(funcs) {
        var index = Math.floor(Math.random() * funcs.length);
        //var index = Math.floor(random() * funcs.length);
        return funcs.splice(index, 1)[0]
    }



    function startRun() {
        var isNodejs = false;
        try {
            isNodejs = Boolean(global.process || global.Buffer)
        } catch (n) {
            isNodejs = false
        }

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
        
        var length = funcs.length;
        var str = `{${Array.from({length}).map(func).join()}}`;
        console.log('plain text before bsk:');
        console.log(str);


        // console.log(str.length)
        // console.log(decodeStr(encodeStr(str)))
        // first version of bsk use static key to encrypt
        // const map_static = [94, 126, 97, 99, 69, 49, 36, 43, 69, 117, 51, 95, 97, 76, 118, 48, 106, 103, 69, 87, 90, 37, 117, 55, 62, 77, 103, 38, 69, 53, 70, 80, 81, 48, 80, 111, 51, 73, 68, 125, 117, 51, 93, 87, 100, 45, 42, 105, 73, 40, 95, 52, 126, 80, 56, 71]
        // current version of bsk use tbs as a dynamic key to encrypt
        const map_static =toCharCodeArr(IN.tbs || IN)
        var charCodes = genRes(encodeStr(str),map_static );

        // console.log('encodeStr：')
        // console.log(encodeStr(str))
        // console.log('charCodes')
        // console.log(charCodes)

        var data = Buffer.from(fromCharCodes(charCodes)).toString('base64');
        //-------test
        // try to decode again
        //decodeChar()

        if (bsk_to_decrypt){
            console.log('decoding the bsk you provided:')
            // for example:
            //bsk_to_decrypt = 'GBBQAhYLQ1cOAAIZREBWFwsUABoIHgccQl4NVl5EGEIGClEeVloFQg9QX0IcWFhfUBxZWABTRVpbX08FQkFGWgtyDlBcU15CSh5dWUZDDEBIH1heAAdDW11bBFYQGVxTXkNbU0ccRVIRQV5dVV0BB0UeQVYUWA5ZU1dCRRVBQVFBQhBQUEEYRQwJW1BTR0pEFlRFQ0MaWl5aQ1BTT1RDUllUEEpbV1xSEl9OQV5GEhobRQYSDxcFU11AUR1BFQQQCBUSRRdQHRRABRsIFVZUWxBXHRFHAEFcFwMCDVYbQEIDFAoUd2d5fBcbQV8CEQ4RFxRCVx4XBwNADxFQUVpKVxkSWAJBCBFHRkQGShVcAxdcF1AFAAEAAwgDGRJbBUEIEUdGRAZKFV8GF1wVWwUBGgkBCRAZEkAGQQgTfltLCgpbUx0ASAdCHWZfXlJWRUYQe2NDAwEdBApDMV5cBAFdFxoDBR8Qd0lCWVViUgF5WEcbBFBRGQEEFU58KmF8ehwWVVteVRVwBlFaXB0RIA5FXV9QSQ9VGwEYBAQBAhsIDRcwU1dSRlhMUwQFHAZQFU4XUgcSDBlGR0VQG0FGAxEOEVJQBwQLAlIAVQYdFEMEGwgVAQwFUx4TQwYTWURgW1wGVBVOF18FEgwZAAUBAgdWAwAfFlVSRA0QfGAqe0AZE1oBFAMQUF4XG0FXABEOEVFWBgUCAFcGThddBBIMGUZHRVAbQV8AEQ4TAQdEW15cFVw9VH1AAFxeEBkSXAZBCBFHRkQGShVZABdcFVMHAhoCBAAeAwUZBVELHQUMHVFUDh4FBUoFUAwdAAUaCwAMEhkVEwMTCRYUVCQSAABBBERHBwMTA3ccAAdTBwZQBgBQUgZRVAJUBVdTBlQFBw8CAwkHAhUHBUYFdREYEwJUFQgSBFYDUhkTXQEUAxJTUVlEBh4TQQUTWURRR1xWEl4NWxFEUVhdXVgYHBcYEmpdVUUKEFISUVoCUj8VTBQcFFQAFwoXH1cLAx8EGE9OAwAKGVIDURwdHgYBCR4BAgceTxoGAwEdUFABGx4dUwZXGQAfHB4PAAwcBwBaGx0bAQBTSgQbHh1fAVIZAAUHARAeHQEFBVoeAAcBAkpKHwoBAUoGVA0BHxIaG1MGEg8XBVNdQFEdQRIGEAgXAEIMVkVfX1gZRlpjQUUKXFYbHREYRmxcU0EPQQcVUllUU2QSSBIZFRQDEwkWfzYqexBP'
            console.log(bsk_to_decrypt.length)
            fromCharCodes_reverse =Buffer.from(bsk_to_decrypt, 'base64').toString();
            charCodes_reverse = toCharCodeArr(fromCharCodes_reverse)
            encodeStr_reverse = RevRes(charCodes_reverse,map_static)
            str_reverse = decodeStr(encodeStr_reverse)
            console.log('plain text of your bsk to decrypt')
            console.log(str_reverse)
        }


        // var data =btoa(fromCharCodes(charCodes));
        OUT.data = data

    }
    var funcs = [['p1', function () {
        return encodeURIComponent(JSON.stringify(IN))
}], ['u1', function () {
        return "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
}], ['l1', function () {
        return "en-US"
}], ['s1', function () {
        return 1080
}], ['s2', function () {
        return 1920
}], ['w1', function () {
        return "NULL"
}], ['w2', function () {
        return "NULL"
}], ['a1', function () {
        return 1920
}], ['a2', function () {
        return 1040
}], ['s3', function () {
        return true
}], ['l2', function () {
        return true
}], ['i1', function () {
        return true
}], ['a3', function () {
        return false
}], ['p2', function () {
        return "Win32"
}], ['d1', function () {
        return "NULL"
}], ['c1', function () {
        return true
}], ['a4', function () {
        return false
}], ['p3', function () {
        return false
}], ['n1', function () {
        return 20170511
}], ['w3', function () {
        return false
}], ['e1', function () {
        return 20170511
}], ['n2', function () {
        return 20170511
}], ['n3', function () {
        return 20170511
}], ['r1', function () {
        return "function random() { [native code] }"
}], ['t1', function () {
        return "function toString() { [native code] }"
}], ['w4', function () {
        return "stop,open,alert,confirm,prompt,print,requestAnimationFrame,cancelAnimationFrame,requestIdleCallback,cancelIdleCallback,captureEvents,releaseEvents,getComputedStyle,matchMedia,moveTo,moveBy,resizeTo,resizeBy,getSelection,find,getMatchedCSSRules"
}], ['t2', function () {
        return Math.floor(Date.now() / 1000)
}], ['m1', function () {
        return 'basilisk_aLv0jg'
}],
[
    'm2',
    function() {
        return  "(492,0),(428,443),(670,422),(705,366),(515,1),(629,279),(510,3),(960,1377),(1029,1453),(834,1680)"//_BSK.userBehavior.mouseMoveArr.join() || 'NULL'
    }
],
[
   'm3',
    function() {
        return  true //_BSK.userBehavior.isMouseClicked
    }
],
[
   'm4',
    function() {
        return  "900,970" //_BSK.userBehavior.scrollArr.join() || 'NULL'
    }
],
[
    'm5',
    function() {
        return true // _BSK.userBehavior.sendByClick
    }
],
[
    'k1',
    function() {
        return false //_BSK.userBehavior.sendByKeyBoard
    }
],
[
   'k2',
    function() {
        return  "123,229,65,229,68,229,70,229,65,229" //_BSK.userBehavior.keyUpArr.join() || 'NULL'
    }
]
];
    startRun();

    return OUT.data
}

console.log('test 1: get bsk that looks like run from the browser')
var a =  bsk_solver('c21341cf7225f7b51606925057')
console.log('bsk:')
console.log(a)
console.log(a.length)

console.log('-------------')
console.log('test 2: convert a given bsk with tbs back to plain text to see what it means')
bsk_solver('c21341cf7225f7b51606925057','GBBQAhYLQ1cOAAIZREBWFwsUABoIHgccQl4NVl5EGEIGClEeVloFQg9QX0IcWFhfUBxZWABTRVpbX08FQkFGWgtyDlBcU15CSh5dWUZDDEBIH1heAAdDW11bBFYQGVxTXkNbU0ccRVIRQV5dVV0BB0UeQVYUWA5ZU1dCRRVBQVFBQhBQUEEYRQwJW1BTR0pEFlRFQ0MaWl5aQ1BTT1RDUllUEEpbV1xSEl9OQV5GEhobRQYSDxcFU11AUR1BFQQQCBUSRRdQHRRABRsIFVZUWxBXHRFHAEFcFwMCDVYbQEIDFAoUd2d5fBcbQV8CEQ4RFxRCVx4XBwNADxFQUVpKVxkSWAJBCBFHRkQGShVcAxdcF1AFAAEAAwgDGRJbBUEIEUdGRAZKFV8GF1wVWwUBGgkBCRAZEkAGQQgTfltLCgpbUx0ASAdCHWZfXlJWRUYQe2NDAwEdBApDMV5cBAFdFxoDBR8Qd0lCWVViUgF5WEcbBFBRGQEEFU58KmF8ehwWVVteVRVwBlFaXB0RIA5FXV9QSQ9VGwEYBAQBAhsIDRcwU1dSRlhMUwQFHAZQFU4XUgcSDBlGR0VQG0FGAxEOEVJQBwQLAlIAVQYdFEMEGwgVAQwFUx4TQwYTWURgW1wGVBVOF18FEgwZAAUBAgdWAwAfFlVSRA0QfGAqe0AZE1oBFAMQUF4XG0FXABEOEVFWBgUCAFcGThddBBIMGUZHRVAbQV8AEQ4TAQdEW15cFVw9VH1AAFxeEBkSXAZBCBFHRkQGShVZABdcFVMHAhoCBAAeAwUZBVELHQUMHVFUDh4FBUoFUAwdAAUaCwAMEhkVEwMTCRYUVCQSAABBBERHBwMTA3ccAAdTBwZQBgBQUgZRVAJUBVdTBlQFBw8CAwkHAhUHBUYFdREYEwJUFQgSBFYDUhkTXQEUAxJTUVlEBh4TQQUTWURRR1xWEl4NWxFEUVhdXVgYHBcYEmpdVUUKEFISUVoCUj8VTBQcFFQAFwoXH1cLAx8EGE9OAwAKGVIDURwdHgYBCR4BAgceTxoGAwEdUFABGx4dUwZXGQAfHB4PAAwcBwBaGx0bAQBTSgQbHh1fAVIZAAUHARAeHQEFBVoeAAcBAkpKHwoBAUoGVA0BHxIaG1MGEg8XBVNdQFEdQRIGEAgXAEIMVkVfX1gZRlpjQUUKXFYbHREYRmxcU0EPQQcVUllUU2QSSBIZFRQDEwkWfzYqexBP')


// example of plain text of the bsk from above
// {"a1": 1920,"w4":"0,1,2,window,self,document,name,location,customElements,history,locationbar,menubar,personalbar,scrollbars,statusbar,toolbar,status,closed,frames,length,top","w3": false,"s3": true,"p3": false,"s1": 1080,"w2":"NULL","m3": true,"a4": false,"m5": true,"n1": 20170511,"n2": true,"m4":"900,970","u1":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36","c1": true,"t2": 
// 1606974773,"s2": 1920,"p2":"Win32","n3": 20170511,"d1":"NULL","l1":"en","e1": 20170511,"l2": true,"m1":"basilisk_aLv0jg","i1": true,"k2":"123,229,65,229,68,229,70,229,65,229","p1":"%7B%22tbs%22%3A%22c21341cf7225f7b51606925057%22%7D","a2": 1040,"k1": false,"r1":"function random() { [native code] }","m2":"(492,0),(428,443),(670,422),(705,366),(515,1),(629,279),(510,3),(960,1377),(1029,1453),(834,1680)","a3": false,"t1":"function toString() { [native code] }","w1":"NULL"}