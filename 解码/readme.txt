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


#---------------------
Updated：
as of 2020/12/03, 百度已经更换了data.js （从https://tb1.bdstatic.com/??tb/static-common/lib/tb_lib_384d873.js里面可以拿到），我把旧的data.js加了一个old后缀。 由于vm.js仍然是一样的，所以我们还是可以用之前的gen_ast.js去反解。我也在结果文件夹中更新了raw_new.js 和 deobf_new.js，重新生成出来的js改动幅度不大，主要是加了userbehavior的一些返回值，并且从之前的static key变成了用你的tbs作为key去encrypt。

ps. 我加了一个小warpper放在解码文件夹中： wrapper_to_get_or_check_bsk.js，

第一个功能：你带入tbs就可以算出符合要求的bsk(我hard code了window obj 和 userbehavior的参数，并且删掉了nodejs的部分，这样即使我用nodejs去运行，还是可以让百度觉得你是一个真实用户)。用python发帖的朋友可以用nodejs的server去run这个js，然后用python去request对应的bsk，这样你的python程序就可以不用每次掉用webdriver去exejs()，效率会快很多。

第二个功能：提供你的bsk加上你的tbs，它可以帮你把bsk转成明文，这样你就可以check你的bsk是否符合要求。

另外，我尝试把AST给存成json格式，然后试了些其他的库 比如astring去generate javascript，结果和escodegen是差不多的，还是不能解决
 e( [44, 68,]) 这种字符串问题。

By：bigtrace