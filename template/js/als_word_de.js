var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// @ts-ignore
var AlsWordDE;
(function (AlsWordDE) {
    var GlobalList = new Array();
    var GlobalTestMap = new Map();
    var Typ;
    (function (Typ) {
        Typ[Typ["Nomen"] = 0] = "Nomen";
        Typ[Typ["Verb"] = 1] = "Verb";
        Typ[Typ["einfach"] = 2] = "einfach";
        Typ[Typ["einfach_Nomen"] = 3] = "einfach_Nomen";
        Typ[Typ["Fehler"] = 4] = "Fehler";
    })(Typ || (Typ = {}));
    var Data = /** @class */ (function () {
        function Data(e) {
            var _this = this;
            this.Kapitel = "";
            this.Typ = Typ.Fehler;
            this.WList = new Array();
            this.Notiz = "";
            this.Kapitel = e.getAttribute("Kapitel") || "";
            var m = new Map();
            Array.from(e.children).forEach(function (c) {
                switch (c.tagName) {
                    case "Beispiel".toUpperCase():
                        _this.Notiz += c.innerHTML.trim() + "\n";
                        break;
                    case "Notiz".toUpperCase():
                        _this.Notiz += c.innerHTML.trim();
                        break;
                    default:
                        m.set(c.tagName, c.innerHTML.trim());
                        break;
                }
            });
            this.initWList(m);
            this.Typ = this.initTyp();
        }
        Data.prototype.initWList = function (m) {
            //按顺序查找 W1、W2、W3、W4... 如果有中断，后面的也不要了
            for (var i = 1;; i++) {
                if (m.has("W".concat(i))) {
                    this.WList.push(m.get("W".concat(i)) || "");
                }
                else {
                    break;
                }
            }
            //从后往前，去掉空值
            while (true) {
                if (this.WList[this.WList.length - 1] == "") {
                    this.WList.pop();
                }
                else {
                    break;
                }
            }
        };
        //类型推断
        Data.prototype.initTyp = function () {
            switch (this.WList.length) {
                case 2:
                    //<W1>die Ampel</W1><W2>红绿灯</W2>
                    if (this.WList[0].match("^(der|die|das) [A-ZÜÖÄ][^ ]+$")) {
                        return Typ.einfach_Nomen;
                    }
                    if (this.WList[0].match("^(der|die|das)$")) {
                        return Typ.Fehler;
                    }
                    //<W1>Hausaufgaben machen</W1><W2>做作业</W2>
                    return Typ.einfach;
                case 4:
                    //<W1>die</W1>  <W2>Badehose</W2>  <W3>-n</W3>  <W4>游泳裤</W4>
                    if (this.WList[0].match("^(der|die|das|der/das|der/die)$")) {
                        return Typ.Nomen;
                    }
                    //<W1>feiern</W1>  <W2>feiert</W2>  <W3>hat gefeiert</W3>  <W4>庆祝</W4>
                    return Typ.Verb;
            }
            return Typ.Fehler;
        };
        Data.prototype.html = function () {
            var innerHTML = "<div class=\"wort\">";
            innerHTML += "<div style=\"display: flex;\">";
            switch (this.Typ) {
                case Typ.Verb:
                    innerHTML += "<div class=\"wort-col1\">".concat(this.WList.slice(0, 3).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.WList[3], "</div>");
                    break;
                case Typ.Nomen:
                    innerHTML += "<div class=\"wort-col1\">".concat(this.WList.slice(0, 3).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.WList[3], "</div>");
                    break;
                case Typ.einfach:
                    innerHTML += "<div class=\"wort-col1\">".concat(this.WList.slice(0, 1).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.WList[1], "</div>");
                    break;
                case Typ.einfach_Nomen:
                    innerHTML += "<div class=\"wort-col1\">".concat(this.WList.slice(0, 1).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.WList[1], "</div>");
                    break;
            }
            innerHTML += "</div>";
            if (this.Notiz != "") {
                innerHTML += "<div class=\"pre\">".concat(this.Notiz, "</div>");
            }
            innerHTML += "</div>";
            return innerHTML;
        };
        Data.prototype.getQuestion = function () {
            var qList = new Array();
            var addQuestion = function () {
                var textList = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    textList[_i] = arguments[_i];
                }
                textList.forEach(function (v) {
                    if (v.length > 0)
                        qList.push(v);
                });
            };
            switch (this.Typ) {
                case Typ.Verb:
                    addQuestion(this.WList[0], "[Verb] " + this.WList[3]);
                    break;
                case Typ.Nomen:
                    addQuestion(this.WList[1], "[Nomen] " + this.WList[3]);
                    break;
                case Typ.einfach:
                    addQuestion(this.WList[0], "[2] " + this.WList[1]);
                    break;
                case Typ.einfach_Nomen:
                    addQuestion(this.WList[0].substring(4), "[Nomen] " + this.WList[1]);
                    break;
            }
            return qList[Math.floor((Math.random() * qList.length))];
        };
        Data.prototype.getAnswer = function () {
            return "".concat(this.WList.join(", "), "<br/>").concat(this.Notiz);
        };
        return Data;
    }());
    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    var Test = /** @class */ (function () {
        function Test(Kapitel) {
            this.list = [];
            this.list = Array.from(GlobalList);
            if (Kapitel.length > 0) {
                this.list.filter(function (v) {
                    return v.Kapitel == Kapitel;
                });
            }
        }
        //Math.random()挺让人无语的，有时候感觉它根本不随机，所以增加点复杂度
        //Math.random()精确到小数点后14位
        Test.prototype.random = function () {
            var index = Math.floor(Math.random() * 123456789) % this.list.length;
            var d = this.list[index];
            this.list.splice(index, 1);
            console.log("本轮测试剩余数量", this.list.length);
            return d;
        };
        Test.prototype.empty = function () {
            return this.list.length == 0;
        };
        Test.prototype.left = function () {
            return this.list.length;
        };
        return Test;
    }());
    function init(showButton) {
        var elementList = Array.from(document.getElementsByClassName("Wort"));
        elementList.forEach(function (e) {
            var w = new Data(e);
            if (w.Typ != Typ.Fehler) {
                e.innerHTML = w.html();
                GlobalList.push(w);
                //隐藏
                //e.setAttribute("style", "display: none;");
            }
            else {
                e.innerHTML += "<span style=\"background-color: red;\">validate error<span >";
            }
        });
        if (GlobalList.length > 0 && showButton) {
            var buttonSet_1 = new Set;
            GlobalList.forEach(function (v) {
                buttonSet_1.add(v.Kapitel);
            });
            buttonSet_1.delete("");
            var buttonList = __spreadArray([], __read(buttonSet_1), false).sort();
            var container_1 = document.getElementById("top-container");
            container_1 === null || container_1 === void 0 ? void 0 : container_1.appendChild(newButton("词汇测试", ""));
            buttonList.forEach(function (v) {
                container_1 === null || container_1 === void 0 ? void 0 : container_1.appendChild(newButton(v, v));
            });
        }
    }
    AlsWordDE.init = init;
    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text, Kapitel) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", "AlsWordDE.nextTest(\"".concat(Kapitel, "\")"));
        button.innerHTML = text;
        return button;
    }
    function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }
    AlsWordDE.hiddenAnswer = hiddenAnswer;
    function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }
    AlsWordDE.showAnswer = showAnswer;
    function nextTest(Kapitel) {
        var _a, _b, _c;
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "AlsWordDE.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", "AlsWordDE.nextTest(\"".concat(Kapitel, "\")"));
        if (!GlobalTestMap.has(Kapitel) || ((_a = GlobalTestMap.get(Kapitel)) === null || _a === void 0 ? void 0 : _a.empty())) {
            console.log("新一轮测试开始");
            GlobalTestMap.set(Kapitel, new Test(Kapitel));
        }
        var d = (_b = GlobalTestMap.get(Kapitel)) === null || _b === void 0 ? void 0 : _b.random();
        if (d) {
            // @ts-ignore
            $("#modal1-question").html(d.getQuestion());
            // @ts-ignore
            $("#modal1-answer").html(d.getAnswer());
            // @ts-ignore
            $("#modal1-num").html("本轮剩余：" + ((_c = GlobalTestMap.get(Kapitel)) === null || _c === void 0 ? void 0 : _c.left()));
        }
        // @ts-ignore
        $("#modal1").modal('show');
    }
    AlsWordDE.nextTest = nextTest;
})(AlsWordDE || (AlsWordDE = {}));
// 使用以下命令生成js
// tsc als_word_de.ts --target "es5" --lib "es2015,dom" --downlevelIteration
