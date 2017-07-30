(function(global) {
    const MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/<$+-%>{:* \\,}[^=_~&](")';
    const expArr1 = ['SequenceExpression', 'VariableDeclaration', 'FunctionDeclaration', 'Literal', 'Identifier', 'BinaryExpression', 'FunctionExpression'];
    const expArr2 = ['CallExpression', 'CallExpression', 'AssignmentExpression', 'ArrayPattern', 'ObjectPattern', 'ThisExpression', 'MemberExpression', 'UpdateExpression'];
    const statementArr = ['ForStatement', 'IfStatement', 'BreakStatement', 'ContinueStatement', 'ThrowStatement', 'TryStatement', 'ExpressionStatement'];
    const types = [].concat(expArr1, expArr2, statementArr, ['ReturnStatement', 'LogicalExpression', 'UnaryExpression', 'ConditionalExpression', 'BlockStatement', 'ForInStatement']);

    function flatten(data) {
        return Array.isArray(data) ? [].concat(...data.map(flatten)) : data
    }
    class CodeDecoder {
        constructor(scope) {
            this.scope = scope;
        }
        getChar(charCode) {
            charCode ^= this.scope.xorKey; // xor decrypt
            return MAP.charAt(0 <= charCode && 26 >= charCode || 64 < charCode ? charCode : 32 <= charCode && 58 >= charCode ? 26 + charCode - 32 : -17 <= charCode && -8 >= charCode ? 52 + charCode + 17 : 0)
        }
        getStr(data) {
            if (Array.isArray(data)) return flatten(data).map(this.getChar.bind(this)).join('');
            else return this.getChar(data);
        }
        parse(code, isContainer = false) {
            const index = (code[0] - 30) ^ this.scope.xorKey;
            const type = types[index];
            if (type) return this[type](code, isContainer);
            else throw Error(`Unknown type: ${index}`);
        }
        batchParse(codes) {
            return codes.map(this.parse.bind(this));
        }
        generateAST(code) {
            return {
                "type": "Program",
                "body": [{
                    "type": "VariableDeclaration",
                    "declarations": [{
                        "type": "VariableDeclarator",
                        "id": {
                            "type": "Identifier",
                            "name": "MAP"
                        },
                        "init": {
                            "type": "Literal",
                            "value": MAP,
                            "raw": JSON.stringify(MAP)
                        }
                    }],
                    "kind": "var"
                }].concat(this.batchParse(code)),
                "sourceType": "script"
            };
        }
        SequenceExpression([type, expressions]) { // (foo, bar, baz)
            return expressions.length === 1 ? this.parse(expressions[0]) : {
                "type": "SequenceExpression",
                "expressions": this.batchParse(expressions)
            };
        }
        VariableDeclaration([type, id, init]) { // var foo; | var foo = bar;
            return {
                "type": "VariableDeclaration",
                "declarations": [{
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": this.getStr(id)
                    },
                    "init": init ? this.parse(init) : null
                }],
                "kind": "var"
            };
        }
        ConditionalExpression([type, test, consequent, alternate]) { // foo ? bar : baz;
            return {
                "type": "ConditionalExpression",
                "test": this.parse(test),
                "consequent": this.parse(consequent),
                "alternate": this.parse(alternate)
            }
        }
        Literal([type, value, raw, flags]) { // 123 | "str" | /regexp/ | ...
            function genNumAst(num) {
                return {
                    "type": "Literal",
                    "value": num
                };
            }

            function genArrAst(elems) {
                return {
                    "type": "ArrayExpression",
                    "elements": elems.map(elem => Array.isArray(elem) ? genArrAst(elem) : genNumAst(elem))
                };
            }
            if (-2 === value) {
                let pattern = this.getStr(raw),
                    trueFlags = this.getStr(flags);
                return {
                    "type": "Literal",
                    "value": new RegExp(pattern, trueFlags),
                    "regex": {
                        "pattern": pattern,
                        "flags": trueFlags
                    }
                };
            } else if (-1 === value) {
                return genNumAst(raw);
            } else {
                return genArrAst(value);
            }
        }
        Identifier([type, key], isContainer) {
            return {
                "type": "Identifier",
                "name": this.getStr(key)
            }
        }
        BinaryExpression([type, rightExp, leftExp, operator]) { // foo + bar | foo - bar | ...
            return {
                "type": "BinaryExpression",
                "operator": ["+", "-", "/", "<", ">", "<=", ">=", "==", "%", "^", "*", "===", "!==", "<<", "|", ">>", "&"][operator],
                "left": this.parse(leftExp),
                "right": this.parse(rightExp)
            };
        }
        AssignmentExpression([type, operator, right, left]) { // foo = bar | foo += bar | foo -= bar
            return {
                "type": "AssignmentExpression",
                "operator": ["=", "+=", "-="][operator],
                "left": this.parse(left),
                "right": this.parse(right)
            };
        }
        LogicalExpression([type, operator, left, right]) { // foo || bar | foo && bar
            return {
                "type": "LogicalExpression",
                "operator": ["||", "&&"][operator],
                "left": this.parse(left),
                "right": this.parse(right)
            };
        }
        UpdateExpression([type, argument, operator /*, prefix: false*/ ]) { // foo++ | foo--
            return {
                "type": "UpdateExpression",
                "operator": ["++", "--"][operator],
                "argument": this.parse(argument),
                "prefix": false
            };
        }
        UnaryExpression([type, operator, argument]) { // !foo | -foo
            return {
                "type": "UnaryExpression",
                "operator": ["!", "-"][operator],
                "argument": this.parse(argument),
                "prefix": true
            };
        }
        FunctionDeclaration([type, name, params, body, xorKey]) { // function foo(bar, baz){...}
            return {
                "type": "FunctionDeclaration",
                "id": {
                    "type": "Identifier",
                    "name": this.getStr(name)
                },
                "params": params.map(param => ({
                    "type": "Identifier",
                    "name": this.getStr(param[1])
                })),
                "body": this.scope.inDeeperScope(this, body, xorKey),
                "generator": false,
                "expression": false,
                "async": false
            };
        }
        FunctionExpression([type, params, body, xorKey]) { // function (foo, bar){...}
            return {
                "type": "FunctionExpression",
                "id": null,
                "params": params.map(param => ({
                    "type": "Identifier",
                    "name": this.getStr(param[1])
                })),
                "body": this.scope.inDeeperScope(this, body, xorKey),
                "generator": false,
                "expression": false,
                "async": false
            };
        }
        CallExpression([type, calleeExp, argsExp]) { // foo(bar, baz);
            const callee = this.parse(calleeExp),
                args = this.batchParse(argsExp);
            if ('Identifier' === callee.type && '_A' === callee.name) {
                this.scope.xorKey = args[0].value;
                return {
                    "type": "EmptyStatement"
                };
            }
            return {
                "type": "CallExpression",
                "callee": callee,
                "arguments": args
            };
        }
        ArrayPattern([type, elements]) { // [foo, bar, baz]
            return {
                "type": "ArrayExpression",
                "elements": this.batchParse(elements)
            };
        }
        ObjectPattern([type, properties]) { // ({foo: bar}) (unused in code)
            return {
                "type": "ObjectExpression",
                "properties": properties.map(([key, value]) => ({
                    "type": "Property",
                    "key": {
                        "type": "Identifier",
                        "name": this.getStr(key)
                    },
                    "computed": false,
                    "value": this.parse(value),
                    "kind": "init",
                    "method": false,
                    "shorthand": false
                }))
            };
        }
        ThisExpression() { // this (unused in code)
            return {
                "type": "ThisExpression"
            };
        }
        MemberExpression([type, isObjIdentifier, isPropStr, isComputed, object, property], isContainer) { // foo.bar | foo[bar]
            return {
                "type": "MemberExpression",
                "computed": Boolean(isComputed),
                "object": (1 === isObjIdentifier) ? ({
                    "type": "Identifier",
                    "name": this.getStr(object[1])
                }) : this.parse(object),
                "property": (0 === isComputed && 1 === isPropStr) ? {
                    "type": "Literal",
                    "name": this.getStr(property[1])
                } : this.parse(property)
            };
        }
        BreakStatement() { // break
            return {
                "type": "BreakStatement",
                "label": null
            };
        }
        ContinueStatement() { // continue (unused in code)
            return {
                "type": "ContinueStatement",
                "label": null
            };
        }
        ForInStatement([type, left, right, body]) { // for (var left in right) body;
            return {
                "type": "ForInStatement",
                "left": this.parse(left),
                "right": this.parse(right),
                "body": {
                    "type": "BlockStatement",
                    "body": this.batchParse(body)
                },
                "each": false
            };
        }
        ForStatement([type, init, body, update, test]) { // for (init; test; update) body;
            return {
                "type": "ForStatement",
                "init": this.parse(init),
                "test": this.parse(test),
                "update": this.parse(update),
                "body": {
                    "type": "BlockStatement",
                    "body": this.batchParse(body)
                }
            };
        }
        BlockStatement([type, body]) { // {foo;bar;baz}
            return {
                "type": "BlockStatement",
                "body": this.batchParse(body)
            };
        }
        IfStatement([type, test, consequent, alternate]) { // if (test) consequent; else alternate
            return {
                "type": "IfStatement",
                "test": this.parse(test),
                "consequent": consequent ? this.parse(consequent) : {
                    "type": "BlockStatement",
                    "body": []
                },
                "alternate": alternate ? this.parse(alternate) : null
            };
        }
        ThrowStatement([type, argument]) { // throw argument (unused in code)
            return {
                "type": "ThrowStatement",
                "argument": this.parse(argument)
            };
        }
        TryStatement([type, block, handlerParam, handlerBody, finalizer]) { // try{block}catch(handlerParam){handlerBody}finally{finalizer}
            return {
                "type": "TryStatement",
                "block": {
                    "type": "BlockStatement",
                    "body": this.batchParse(block)
                },
                "handler": handlerParam ? ({
                    "type": "CatchClause",
                    "param": {
                        "type": "Identifier",
                        "name": this.getStr(handlerParam[1])
                    },
                    "body": {
                        "type": "BlockStatement",
                        "body": this.batchParse(handlerBody)
                    }
                }) : null,
                "finalizer": finalizer ? ({
                    "type": "BlockStatement",
                    "body": this.batchParse(finalizer)
                }) : null
            };
        }
        ExpressionStatement([type, statement]) {
            return {
                "type": "ExpressionStatement",
                "expression": this.parse(statement)
            };
        }
        ReturnStatement([type, argument]) { // return foo
            return {
                "type": "ReturnStatement",
                "argument": this.parse(argument)
            };
        }
    }
    class Scope {
        constructor(xorKey = -1) {
            this.xorKey = xorKey === -1 ? 0 : xorKey;
        }
        inDeeperScope(codeDecoder, body, xorKey = -1) {
            const newScope = new Scope(xorKey);
            codeDecoder.scope = newScope;
            const ast = {
                "type": "BlockStatement",
                "body": codeDecoder.batchParse(body)
            }
            codeDecoder.scope = this;
            return ast
        }
    }
    const codes = {};
    global._BSK = {
        generateAST(name) {
            return new CodeDecoder(new Scope()).generateAST(codes[name])
        },
        l(name, code) {
            codes[name] = code
        }
    };
})(window);