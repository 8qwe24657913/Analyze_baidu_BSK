const ast = window._BSK.generateAST("omzVouOACqkNljzDbdOB")
const code = escodegen.generate(ast, {
    comment: true,
    format: {
        indent: {
            style: '  '
        },
        quotes: 'auto',
        escapeless: true,
        parentheses: false,
        semicolons: false,
        compact: true
    }
}).replace(/;{2,}/g, ';');
(document.body || document.documentElement).appendChild(document.createTextNode(`(function(){${code}}())`));