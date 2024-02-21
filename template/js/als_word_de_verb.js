// @ts-ignore
var AlsWordDEVerb;
(function (AlsWordDEVerb) {
    var GlobalList = new Array();
    var GlobalTestMap = new Map();
    var Data = /** @class */ (function () {
        function Data(e) {
            var _this = this;
            /**
             * W1: Infinitiv
             * W2: dritte Person Singular
             * W3: Präteritum
             * W4: Perfekt
             */
            this.WList = new Array();
            this.Notiz = "";
            var m = new Map();
            Array.from(e.children).forEach(function (c) {
                switch (c.tagName) {
                    case "Notiz".toUpperCase():
                        _this.Notiz += c.innerHTML.trim();
                        break;
                    default:
                        m.set(c.tagName, c.innerHTML.trim());
                        break;
                }
            });
            this.initWList(m);
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
        Data.prototype.html = function () {
            var innerHTML = "<div class=\"wort\">";
            innerHTML += "<div style=\"display: flex;\">";
            innerHTML += "<div class=\"wort-col1\">".concat(this.WList.join(", "), "</div>");
            innerHTML += "</div>";
            if (this.Notiz != "") {
                innerHTML += "<div class=\"pre\">".concat(this.Notiz, "</div>");
            }
            innerHTML += "</div>";
            return innerHTML;
        };
        Data.prototype.getQuestion = function () {
            var qList = new Array();
            this.WList.forEach(function (v) {
                if (v.length > 0)
                    qList.push(v);
            });
            return qList[Math.floor((Math.random() * qList.length))];
        };
        Data.prototype.getAnswer = function () {
            return "<table>" +
                "<tr><td>Infinitiv</td><td>".concat(this.WList[0], "</td></tr>") +
                "<tr><td>dritte Person Singular</td><td>".concat(this.WList[1], "</td></tr>") +
                "<tr><td>Pr\u00E4teritum</td><td>".concat(this.WList[2], "</td></tr>") +
                "<tr><td>Perfekt</td><td>".concat(this.WList[3], "</td></tr>") +
                "</table>" +
                "".concat(this.Notiz);
        };
        return Data;
    }());
    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    var Test = /** @class */ (function () {
        function Test(Kapitel) {
            this.list = [];
            this.list = Array.from(GlobalList);
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
        var elementList = Array.from(document.getElementsByClassName("Verb"));
        elementList.forEach(function (e) {
            var w = new Data(e);
            e.innerHTML = w.html();
            GlobalList.push(w);
        });
        if (GlobalList.length > 0 && showButton) {
            var container = document.getElementById("top-container");
            container === null || container === void 0 ? void 0 : container.appendChild(newButton("动词测试", ""));
        }
    }
    AlsWordDEVerb.init = init;
    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text, Kapitel) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", "AlsWordDEVerb.nextTest(\"".concat(Kapitel, "\")"));
        button.innerHTML = text;
        return button;
    }
    function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }
    AlsWordDEVerb.hiddenAnswer = hiddenAnswer;
    function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }
    AlsWordDEVerb.showAnswer = showAnswer;
    function nextTest(Kapitel) {
        var _a, _b, _c;
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "AlsWordDEVerb.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", "AlsWordDEVerb.nextTest(\"".concat(Kapitel, "\")"));
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
    AlsWordDEVerb.nextTest = nextTest;
})(AlsWordDEVerb || (AlsWordDEVerb = {}));
// 使用以下命令生成js
// tsc als_word_de_verb.ts --target "es5" --lib "es2015,dom" --downlevelIteration
