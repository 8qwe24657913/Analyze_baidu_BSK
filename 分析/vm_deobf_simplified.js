(function(global) {
    function each(arr, func) {
        for (let i = 0; i < arr.length; i++) func(arr[i], i)
    }

    function map(arr, func, thisArg = null) {
        for (var res = [], i = 0; i < arr.length; i++) res.push(func.call(thisArg, arr[i], i));
        return res
    }
    const MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/<$+-%>{:* \\,}[^=_~&](")';
    const statementArr = ["ForStatement", "IfStatement", "BreakStatement", "ContinueStatement", "ThrowStatement", "TryStatement", "WtfStatement"];
    const expArr1 = ["SequenceExpression", "VariableDeclaration", "FunctionDeclaration", "Literal", "ExpressionStatement", "BinaryExpression", "FunctionExpression"];
    const expArr2 = ["CallExpression", "CallExpression", "AssignmentExpression", "ArrayPattern", "ObjectPattern", "ThisExpression", "MemberExpression", "UpdateExpression"];
    const types = [].concat(expArr1, expArr2, statementArr, ["ReturnStatement", "LogicalExpression", "UnaryExpression", "ConditionalExpression", "BlockStatement", "ForInStatement"]);

    class CodeRunner {
        constructor(scope) {
            this.scope = scope;
            this.topVarDump = scope.varDump;
            this.topVarDump._A = xorKey => this.scope.xorKey = xorKey; // allows changing xorKey dynamically
        }
        getChar(charCode) {
            charCode ^= this.scope.xorKey; // xor decrypt
            return MAP.charAt(0 <= charCode && 26 >= charCode || 64 < charCode ? charCode : 32 <= charCode && 58 >= charCode ? 26 + charCode - 32 : -17 <= charCode && -8 >= charCode ? 52 + charCode + 17 : 0)
        }
        getStrRec(data) {
            if (Array.isArray(data)) {
                for (var res = '', i = 0, l = data.length; i < l; i++) res += this.getStrRec(data[i]);
                return res
            } else return this.getChar(data);
        }
        getStr(data) {
            const res = this.getStrRec(data);
            strTrap(res);
            return res;
        }
        parse(code, isContainer = false) {
            if (this.scope.returnSign || this.scope.breakSign || this.scope.continueSign) return;
            const type = types[code[0] - 30 ^ this.scope.xorKey]; // xor decrypt
            if (type) return this[type](code, isContainer);
            else throw Error();
        }
        batchParse(codes) {
            for (var i = 0, l = codes.length - 1; i < l; i++) this.parse(codes[i]);
            return this.parse(codes[l]);
        }
        runCode(code) {
            try {
                this.batchParse(code);
                this.status = 0;
            } catch (err) {
                this.status = 1;
            } finally {
                this.topVarDump = this.scope = null;
            }
        }
        SequenceExpression([type, expressions]) { // (foo, bar, baz)
            return this.batchParse(expressions);
        }
        VariableDeclaration([type, id, init]) { // var foo; | var foo = bar;
            this.scope.varDump[this.getStr(id)] = init ? this.parse(init) : undefined;
        }
        ConditionalExpression([type, test, consequent, alternate]) { // foo ? bar : baz;
            return this.parse(this.parse(test) ? consequent : alternate)
        }
        Literal([type, value, raw, flags]) { // 123 | "str" | /regexp/ | ...
            if (-2 === value) return new RegExp(this.getStr(raw), this.getStr(flags)); // regexp
            else if (-1 === value) return raw; // str?
            else return value; // num?
        }
        ExpressionStatement([type, key], isContainer) { // foo
            const data = this.scope.getVar(this.getStr(key));
            return isContainer ? data : data.getData();
        }
        BinaryExpression([type, rightExp, leftExp, operator]) { // foo + bar | foo - bar | ...
            const left = this.parse(leftExp);
            const right = this.parse(rightExp);
            return [
                () => left + right,
                () => left - right,
                () => left / right,
                () => left < right,
                () => left > right,
                () => left <= right,
                () => left >= right,
                () => left == right,
                () => left % right,
                () => left ^ right,
                () => left * right,
                () => left === right,
                () => left !== right,
                () => left << right,
                () => left | right,
                () => left >> right,
                () => left & right
            ][operator]()
        }
        AssignmentExpression([type, operator, right, left]) { // foo = bar | foo += bar | foo -= bar
            const data = this.parse(left, true);
            const origValue = data.getData();
            const rightValue = this.parse(right);
            return data.setData([
                () => rightValue, // =
                () => origValue + rightValue, // +=
                () => origValue - rightValue // -=
            ][operator]());
        }
        LogicalExpression([type, operator, left, right]) { // foo || bar | foo && bar
            const leftValue = this.parse(left);
            return [
                () => leftValue || this.parse(right),
                () => leftValue && this.parse(right)
            ][operator]()
        }
        UpdateExpression([type, argument, operator/*, prefix: false*/]) { // foo++ | foo--
            const {parent, key} = this.parse(argument, true);
            return [
                () => parent[key]++,
                () => parent[key]--
            ][operator]();
        }
        UnaryExpression([type, operator, argument]) { // !foo | -foo
            const value = this.parse(argument, false);
            return [
                () => !value,
                () => -value
            ][operator]()
        }
        FunctionDeclaration([type, name, params, body, xorKey]) { // function foo(bar, baz){...}
            this.scope.varDump[this.getStr(name)] = new FakeFunc(this, this.scope, params.map(param => this.getStr(param[1])), body, xorKey)
        }
        FunctionExpression([type, params, body, xorKey]) { // function (foo, bar){...}
            return new FakeFunc(this, this.scope, params.map(param => this.getStr(param[1])), body, xorKey)
        }
        CallExpression([type, callee, argsExp]) { // foo(bar, baz);
            const args = argsExp.map(expression => this.parse(expression));
            const {parent, key} = this.parse(callee, true),
                func = parent[key];
            if (func.apply) return func.apply(parent, args); // call an actual function or a fakeFunc
            else throw Error();
        }
        ArrayPattern([type, elements]) { // [foo, bar, baz]
            const arr = [];
            each(elements, elem => arr.push(this.parse(elem)));
            return arr
        }
        ObjectPattern([type, properties]) { // {foo: bar}
            const obj = {};
            each(properties, ([key, value]) => obj[this.getStr(key)] = this.parse(value));
            return obj
        }
        ThisExpression() { // this
            return this.scope.varDump["this"] || this.topVarDump
        }
        MemberExpression([type, isObjIdentifier, isPropIdentifier, isComputed, object, property], isContainer) { // foo.bar | foo[bar]
            const obj = 1 === isObjIdentifier ? this.scope.getVar(this.getStr(object[1])).getData() : this.parse(object, false);
            if (undefined === obj)  throw Error();
            const key = (0 === isComputed && 1 === isPropIdentifier) ? this.getStr(property[1]) : this.parse(property);
            return isContainer ? new DataContainer(obj, key) : obj[key]
        }
        BreakStatement() { // break
            this.scope.breakSign = true
        }
        ContinueStatement() { // continue
            this.scope.continueSign = true
        }
        ForInStatement([type, left, right, body]) { // for (var left in right) body;
            const {parent, key} = this.parse(left, true);
            for (const value in this.parse(right)) {
                parent[key] = value;
                this.batchParse(body);
                if (this.scope.breakSign) {
                    this.scope.breakSign = false;
                    break
                } else if (this.scope.continueSign) this.scope.continueSign = false;
            }
        }
        ForStatement([type, init, body, update, test]) { // for (init; test; update) body;
            this.parse(init);
            do {
                if (!this.parse(test)) break;
                this.batchParse(body);
                if (this.scope.breakSign) {
                    this.scope.breakSign = false;
                    break
                } else if (this.scope.continueSign) this.scope.continueSign = false;
                this.parse(update);
            } while (1)
        }
        BlockStatement([type, body]) { // {foo;bar;baz}
            this.batchParse(body);
        }
        IfStatement([type, test, consequent, alternate]) { // if (test) consequent; else alternate
            this.parse(test) ? consequent && this.parse(consequent) : alternate && this.parse(alternate)
        }
        ThrowStatement([type, argument]) { // throw argument
            throw this.parse(argument);
        }
        TryStatement([type, block, handlerParam, handlerBody, finalizer]) { // try{block}catch(handlerParam){handlerBody}finally{finalizer}
            try {
                this.batchParse(block);
            } catch (err) {
                const key = this.getStr(handlerParam[1]);
                if (handlerParam) {
                    var origValue = this.scope.varDump[key];
                    this.scope.varDump[key] = err;
                }
                try {
                    this.batchParse(handlerBody);
                } finally {
                    if (handlerParam) this.scope.varDump[key] = origValue;
                }
            } finally {
                if (finalizer) this.batchParse(finalizer);
            }
        }
        WtfStatement([type, statement]) { // wtf???
            return this.parse(statement);
        }
        ReturnStatement([type, argument]) { // return foo
            if (argument) this.scope.returnValue = this.parse(argument);
            this.scope.returnSign = true;
        }
    }
    class DataContainer {
        constructor(parent, key, isVarDump = false) {
            this.parent = parent;
            this.key = key;
            this.isVarDump = isVarDump;
        }
        getData() {
            return this.parent[this.key]
        }
        setData(data) {
            return this.parent[this.key] = data
        }
    }
    class Scope {
        constructor(varDump, xorKey = -1) {
            this.continueSign = this.breakSign = this.returnSign = false;
            this.upperScope = this.result = this.returnValue = undefined;
            this.xorKey = xorKey === -1 ? 0 : xorKey;
            this.varDump = varDump || {
                btoa(a, d, b, k, h) {
                    undefined === d && (d = MAP.slice(0, 64));
                    for (k = h = ""; a[k | 0] || (d = "=", k % 1); h += d[63 & b >> 8 - k % 1 * 8]) b = b << 8 | a.charCodeAt(k -= -.75);
                    return h
                }
            }
        }
        getVar(key) {
            if (this.varDump.hasOwnProperty(key)) return new DataContainer(this.varDump, key, true);
            if (this.upperScope) return this.upperScope.getVar(key);
            if (global[key]) return new DataContainer(global, key);
            throw Error();
        }
    }
    class FakeFunc {
        constructor(codeRunner, scope, args, codes, xorKey = -1) {
            this.codeRunner = codeRunner;
            this.codes = codes;
            this.upperScope = scope;
            this.args = args;
            this.xorKey = xorKey
        }
        apply(thisPointer, args) {
            // init scope
            const scope = new Scope(null, this.xorKey);
            scope.varDump["this"] = thisPointer;
            if (this.args) each(this.args, (elem, key) => scope.varDump[elem] = args[key]);
            scope.upperScope = this.upperScope;
            // go deeper
            const oldScope = this.codeRunner.scope;
            this.codeRunner.scope = scope;
            try {
                this.codeRunner.batchParse(this.codes); // run codes
            } finally {
                this.codeRunner.scope = oldScope; // go upper
            }
            return scope.returnValue
        }
    }
    const codes = {};
    global._BSK = {
        a(name, varDump) {
            //varDump.MAP = MAP;
            new CodeRunner(new Scope(varDump)).runCode(codes[name])
        },
        c(varDump, code) {
            //varDump.MAP = MAP;
            new CodeRunner(new Scope(varDump)).runCode(code)
        },
        l(name, code) {
            codes[name] = code
        }
    };
})(window);