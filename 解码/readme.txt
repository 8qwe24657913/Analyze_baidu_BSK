basilisk 分为两部分：
1. 一个解释器 (https://fex.bdstatic.com/bsk/dknsaZmLdyKfEeIVbKxn_dcc70f7.js)
2. 一个加密过的 AST (https://fex.bdstatic.com/bsk/omzVouOACqkNljzDbdOB_af501e9.js)

这两个js由百度服务器合并，成为 https://fex.bdstatic.com/bsk/??dknsaZmLdyKfEeIVbKxn_dcc70f7.js,omzVouOACqkNljzDbdOB_af501e9.js

要解码 omzVouOACqkNljzDbdOB 这个版本的 basilisk, 请打开 basilisk自动解码.html

要解码新版本 basilisk,
    请将加密过的 AST 粘贴到 data.js 中 (本目录下自带 omzVouOACqkNljzDbdOB 这个版本),
    并将这个字符串 ("omzVouOACqkNljzDbdOB") 替换 gen_code.js 中对应字符串,
    打开 basilisk自动解码.html 如无意外，便可得到解码出的js

解码出的 basilisk 会包含形如 e([72,85,[74,74]]) 这样的代码
    这其实是一个字符串，理论上可以通过 partial evaluation 还原
    然而就目前来说， Closure Compiler 和 Prepack 均无法将其还原
    所以麻烦手动……（被打

By: 8qwe24657913