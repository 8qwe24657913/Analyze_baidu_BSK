const code = escodegen.generate(window._BSK.generateAST("omzVouOACqkNljzDbdOB"), {
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