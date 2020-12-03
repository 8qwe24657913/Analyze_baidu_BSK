(function (global) {
    /*function modify_concat(to, from) {
        for (var i = 0; i < from.length; i++) to.push(from[i]);
        return to
    }*/

    function each(arr, func) {
        for (var i = 0; i < arr.length; i++) func(arr[i], i)
    }

    function map(arr, func, thisArg) {
        undefined === thisArg && (thisArg = null);
        for (var res = [], i = 0; i < arr.length; i++) res.push(func.apply(thisArg, [arr[i], i]));
        return res
    }

    function isArray(b) {
        return "[object Array]" === Object.prototype.toString.call(b)
    }

    var MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/<$+-%>{:* \\,}[^=_~&](")';

    function CodeRunner(scope) {
        this.scopes = [];
        this.specialCode = 0;
        this.specialCodeStack = [];
        var that = this;
        this.scope = scope;
        this.scope.input._A = function (specialCode) {
            that.specialCode = specialCode
        };
        this.scopes.push(this.scope)
    }

    /*CodeRunner.prototype.va = function () {
        return 10;
        //function c(d, e) {
        //return e ? c(d ^ e, (d & e) << 1) : d
        //}(8, 2)

special code this.w
specialcodestack this.D

    };*/
    CodeRunner.prototype.jmpIntoScope = function (scope, specialCode) {
        undefined === specialCode && (specialCode = -1);
        this.scopes.push(scope);
        this.scope = scope;
        -1 !== specialCode && (this.specialCode = specialCode);
        this.specialCodeStack.push(this.specialCode)
    };
    CodeRunner.prototype.groupingOperator = function (statements) {
        var that = this;
        each(statements[1], function (statement) {
            return that.parseStatement(statement)
        })
    };
    CodeRunner.prototype.declare = function (statement) {
        statement[2] ? this.parseStatement(statement[2]) : this.pushStackValue(undefined);
        this.scope.input[this.getStr(statement[1])] = this.popStackValue()
    };
    CodeRunner.prototype.conditionalOperator = function (statement) {
        this.parseStatement(statement[1]);
        this.popStackValue() ? this.parseStatement(statement[2]) : this.parseStatement(statement[3])
    };
    CodeRunner.prototype.declareFunc = function (statements) {// b.prototype.aa = function(a) {
        var that = this;
        this.scope.input[this.getStr(statements[1])] = new FakeFunc(this, this.scope, map(statements[2], function (statement) {
            return that.getStr(statement[1])
        }), statements[3], statements[4])
    };
    CodeRunner.prototype.literal = function (statement) {
        -2 === statement[1] ? this.pushStackValue(new RegExp(this.getStr(statement[2]), this.getStr(statement[3]))) : -1 === statement[1] ? this.pushStackValue(statement[2]) : this.pushStackValue(statement[1])
    };
    CodeRunner.prototype.getDefinedValue = function (statement, isPureData) {
        var data = this.scope.dataGetter(this.getStr(statement[1]));
        if (undefined !== data) isPureData ? this.pushStackValue(data) : this.pushStackValue(data.parent[data.key]);
        else throw Error();
    };
    CodeRunner.prototype.binaryOperation = function (statement) {
        var that = this;
        this.parseStatement(statement[1]);
        this.parseStatement(statement[2]);
        var value1 = this.popStackValue(),
            value2 = this.popStackValue();
        [function () {
            that.pushStackValue(value1 + value2)
        }, function () {
            that.pushStackValue(value1 - value2)
        }, function () {
            that.pushStackValue(value1 / value2)
        }, function () {
            that.pushStackValue(value1 < value2)
        }, function () {
            that.pushStackValue(value1 > value2)
        }, function () {
            that.pushStackValue(value1 <= value2)
        }, function () {
            that.pushStackValue(value1 >= value2)
        }, function () {
            that.pushStackValue(value1 == value2)
        }, function () {
            that.pushStackValue(value1 % value2)
        }, function () {
            that.pushStackValue(value1 ^ value2)
        }, function () {
            that.pushStackValue(value1 * value2)
        }, function () {
            that.pushStackValue(value1 === value2)
        }, function () {
            that.pushStackValue(value1 !== value2)
        }, function () {
            that.pushStackValue(value1 << value2)
        }, function () {
            that.pushStackValue(value1 | value2)
        }, function () {
            that.pushStackValue(value1 >> value2)
        }, function () {
            that.pushStackValue(value1 & value2)
        }][statement[3]]()
    };
    CodeRunner.prototype.pushStackValue = function (value) {
        this.scope.pushValue(value)
    };
    CodeRunner.prototype.runCode = function (code) { //b.prototype.P = function(a) {
        var that = this;
        try {
            each(code, function (statement) {
                return that.parseStatement(statement)
            });
            this.status = 0
        } catch (err) {
            this.status = 1
        } finally {
            this.scope = null;
            this.scopes = []
        }
    };
    CodeRunner.prototype.funcExpression = function (statements) {
        var that = this;
        this.pushStackValue(new FakeFunc(this, this.scope, map(statements[1], function (statement) {
            return that.getStr(statement[1])
        }), statements[2], statements[3]))
    };
    CodeRunner.prototype.runFunc = function (statements) { //b.prototype.J = function(a) {
        var that = this;
        each(statements[2], function (statement) {
            return that.parseStatement(statement)
        });
        this.parseStatement(statements[1], true);
        var dataContainer = this.popStackValue(),
            thisPointer = dataContainer.parent,
            func = dataContainer.parent[dataContainer.key],
            args = [];
        for (var l = statements[2].length; l--;) args.unshift(this.popStackValue());
        if (func.apply) {
            var res = func.apply(thisPointer, args);
            this.pushStackValue(res);
        } else {
            throw Error();
        }
    };
    CodeRunner.prototype.getStr = function (statements) {
        var res = map(function deepClone(statement) {
            return isArray(statement) ? [].concat.apply([], map(statement, deepClone)) : statement
        }(statements), this.getChar, this).join("");
        return res;
    };
    CodeRunner.prototype.assign = function (statement) {
        this.parseStatement(statement[2]);
        this.parseStatement(statement[3], true);
        this.parseStatement(statement[3]);
        var origValue = this.popStackValue(),
            assignTo = this.popStackValue(),
            rightValue = this.popStackValue();
        [function () {
        }, function () {
            rightValue = origValue + rightValue
        }, function () {
            rightValue = origValue - rightValue
        }][statement[1]]();
        assignTo.parent ? assignTo.parent[assignTo.key] = rightValue : this.scope.input[assignTo] = rightValue
    };
    CodeRunner.prototype.getChar = function (charCode) {
        charCode ^= this.specialCode;
        return MAP[0 <= charCode && 26 >= charCode || 64 < charCode ? charCode : 32 <= charCode && 58 >= charCode ? 26 + charCode - 32 : -17 <= charCode && -8 >= charCode ? 52 + charCode + 17 : 0]
    };
    CodeRunner.prototype.jmpOutOfScope = function () {
        this.scopes.pop();
        this.specialCodeStack.pop();
        this.scope = this.scopes[this.scopes.length - 1];
        this.specialCode = this.specialCodeStack[this.specialCodeStack.length - 1]
    };
    CodeRunner.prototype.popStackValue = function () { //O
        return this.scope.popValue()
    };
    CodeRunner.prototype.andOr = function (statement) {
        this.parseStatement(statement[2]);
        var value = this.popStackValue(),
            that = this;
        [function () { // or
            value ? that.pushStackValue(value) : that.parseStatement(statement[3])
        }, function () { // and
            that.parseStatement(statement[3]);
            that.pushStackValue(value && that.popStackValue())
        }][statement[1]]()
    };
    CodeRunner.prototype.literalValue = function () {
        return [this.groupingOperator, this.declare, this.declareFunc, this.literal, this.getDefinedValue, this.binaryOperation, this.funcExpression]
    };
    CodeRunner.prototype.createArray = function (statements) {  
        var that = this;
        each(statements[1], function (statement) {
            return that.parseStatement(statement)
        });
        var arr = [];
        for (var l = statements[1].length; l--;) arr.unshift(this.popStackValue());
        this.pushStackValue(arr)
    };
    CodeRunner.prototype.createObject = function (statements) {
        var that = this,
            obj = {};
        each(statements[1], function (statement) {
            that.parseStatement(statement[1]);
            obj[that.getStr(statement[0])] = that.popStackValue()
        });
        this.pushStackValue(obj)
    };
    CodeRunner.prototype.thisKeyword = function () {
        this.pushStackValue(this.scope.input["this"] || this.scope.input)
    };
    CodeRunner.prototype.getValue = function (statement, isContainer) {
        var dataContainer, value;
        if (1 === statement[1]) {
            if (dataContainer = this.scope.dataGetter(this.getStr(statement[4][1]))) value = dataContainer.parent[dataContainer.key];
            else throw Error();
        } else {
            this.parseStatement(statement[4], false);
            value = this.popStackValue();
        }
        if (undefined !== value) {
            0 === statement[3] && 1 === statement[2] ? this.pushStackValue(this.getStr(statement[5][1])) : this.parseStatement(statement[5]);
            var key = this.popStackValue();
            isContainer ? this.pushStackValue(this.scope.getDataContainer(value, key)) : this.pushStackValue(value[key])
        } else throw Error();
    };
    CodeRunner.prototype.postfixIncreaseDecrease = function (statement) {
        this.parseStatement(statement[1], true);
        var dataContainer = this.popStackValue(),
            value = dataContainer.parent[dataContainer.key];
        [function () {
            value++
        }, function () {
            value--
        }][statement[2]]();
        dataContainer.parent[dataContainer.key] = value
    };
    CodeRunner.prototype.getParseStatementArr = function () {
        return [this.forStatement, this.ifElse, this.breakStatement, this.continueStatement, this.throwStatement, this.tryCatchFinally, this.parseExpression]
    };
    CodeRunner.prototype.parseStatement = function (statement, isWhat) { //b.prototype.b = function(a, c) {
        undefined === isWhat && (isWhat = false);
        if (!this.scope.returnSign && !this.scope.breakSign && !this.scope.continueSign) {
            //var funcs = modify_concat(this.qa(), modify_concat(this.ra(), modify_concat(this.sa(), [this.ia, this.fa, this.unaryOperation, this.W, this.U, this.Z]))),
            //    b = a[0] - 3 * this.va() ^ this.w;  this.va() =10
            var funcs = [].concat(this.literalValue(), this.ra(), this.getParseStatementArr(), [this.returnStatement, this.andOr, this.unaryOperation, this.conditionalOperator, this.codeBlock, this.forIn]),
                key = statement[0] - 30 ^ this.specialCode;
            if (funcs[key]) funcs[key].apply(this, [statement, isWhat]);
            else throw Error();
        }
    };
    CodeRunner.prototype.forIn = function (statements) {
        var that = this;
        this.parseStatement(statements[1], true);
        var dataContainer = this.popStackValue();
        this.parseStatement(statements[2]);
        for (var value in this.popStackValue()) {
            dataContainer.parent[dataContainer.key] = value;
            each(statements[3], function (statement) {
                return that.parseStatement(statement)
            });
            if (this.scope.breakSign) {
                this.scope.breakSign = false;
                break
            }
            this.scope.continueSign && (this.scope.continueSign = false)
        }
    };
    CodeRunner.prototype.forStatement = function (statements) {
        var that = this;
        this.parseStatement(statements[1]);
        do {
            each(statements[2], function (statement) {
                return that.parseStatement(statement)
            });
            if (this.scope.breakSign) {
                this.scope.breakSign = false;
                break
            }
            this.scope.continueSign && (this.scope.continueSign = false);
            this.parseStatement(statements[3]);
            this.parseStatement(statements[4]);
            if (!this.popStackValue()) break
        } while (1)
    };
    CodeRunner.prototype.codeBlock = function (statements) {
        var that = this;
        each(statements[1], function (statement) {
            return that.parseStatement(statement)
        })
    };
    CodeRunner.prototype.ifElse = function (statement) {
        this.parseStatement(statement[1]);
        this.popStackValue() ? statement[2] && this.parseStatement(statement[2]) : statement[3] && this.parseStatement(statement[3])
    };
    CodeRunner.prototype.breakStatement = function () {
        this.scope.breakSign = true
    };
    CodeRunner.prototype.continueStatement = function () {
        this.scope.continueSign = true
    };
    CodeRunner.prototype.unaryOperation = function (statement) {
        var that = this;
        this.parseStatement(statement[2], false);
        var value = this.popStackValue();
        [function () {
            that.pushStackValue(!value)
        }, function () {
            that.pushStackValue(-value)
        }][statement[1]]()
    };
    CodeRunner.prototype.ra = function () {
        return [this.runFunc, this.runFunc, this.assign, this.createArray, this.createObject, this.thisKeyword, this.getValue, this.postfixIncreaseDecrease]
    };
    CodeRunner.prototype.throwStatement = function (statement) {
        this.parseStatement(statement[1]);
        throw this.popStackValue();
    };
    CodeRunner.prototype.tryCatchFinally = function (statements) {
        var that = this;
        try {
            each(statements[1], function (statement) {
                return that.parseStatement(statement)
            })
        } catch (err) {
            var scope = new Scope;
            scope.upperScope = this.scope;
            this.jmpIntoScope(scope);
            statements[2] && (this.scope.input[this.getStr(statements[2][1])] = err);
            each(statements[3], function (statement) {
                return that.parseStatement(statement)
            });
            this.jmpOutOfScope()
        } finally {
            statements[4] && each(statements[4], function (statement) {
                return that.parseStatement(statement)
            })
        }
    };
    CodeRunner.prototype.parseExpression = function (statement) {
        this.parseStatement(statement[1]);
    };
    CodeRunner.prototype.returnStatement = function (statement) {
        statement[1] && this.parseStatement(statement[1]);
        this.scope.returnSign = true
    };
    function Scope(input) {
        this.DataContainer = function DataContainer(parent, key) {
            this.parent = parent;
            this.key = key
        };
        this.continueSign = this.breakSign = this.returnSign = false;
        this.valueStack = []; //H
        this.input = input || {
                btoa: function (a, d, b, k, h) {
                    undefined === d && (d = MAP.slice(0, 64));
                    for (k = h = ""; a[k | 0] || (d = "=", k % 1); h += d[63 & b >> 8 - k % 1 * 8]) b = b << 8 | a.charCodeAt(k -= -.75);
                    return h
                }
            }
    }

    Scope.prototype.popValue = function () {
        return this.valueStack.pop()
    };
    Scope.prototype.pushValue = function (value) { //b.prototype.xa = function(a) {
        this.valueStack.push(value)
    };
    Scope.prototype.getDataContainer = function (parent, key) {
        return new this.DataContainer(parent, key)
    };
    Scope.prototype.dataGetter = function (key) {//b.prototype.G = function(a) {
        if (this.input.hasOwnProperty(key)) return new this.DataContainer(this.input, key);
        if (this.upperScope) return this.upperScope.dataGetter(key);
        if (global[key]) return new this.DataContainer(global, key);
    };
    function FakeFunc(codeRunner, scope, args, codes, specialCode) { //function b(a, c, d, b, k) 
        this.codeRunner = codeRunner;
        this.codes = codes;
        this.upperScope = scope;
        this.args = args;
        this.specialCode = specialCode
    }

    FakeFunc.prototype.apply = function (thisPointer, args) {
        var that = this,
            scope = new Scope;
        scope.upperScope = this.upperScope;
        this.args && each(this.args, function (elem, key) {
            scope.input[elem] = args[key]
        });
        scope.input["this"] = thisPointer;
        this.codeRunner.jmpIntoScope(scope, this.specialCode);
        try {
            each(this.codes, function (statement) {
                return that.codeRunner.parseStatement(statement, false)
            })
        } finally {
            this.codeRunner.jmpOutOfScope()
        }
        if (0 !== scope.valueStack.length) return scope.popValue()
    };
    var codes = {};
    global._BSK = {
        a: function (name, input) {
            input.MAP = MAP;
            (new CodeRunner(new Scope(input))).runCode(codes[name])
        },
        c: function (input, code) {
            input.MAP = MAP;
            (new CodeRunner(new Scope(input))).runCode(code)
        },
        l: function (name, code) { // setCodeToRun
            codes[name] = code
        }
    };
})(window);