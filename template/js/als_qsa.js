/**
 * QSA: Question-Suggestion-Answer
 */
// @ts-ignore
var AlsQSA;
(function (AlsQSA) {
    var GlobalList = new Array();
    var GlobalTest;
    var Data = /** @class */ (function () {
        function Data(e) {
            var _this = this;
            this.Q = "";
            this.S = "";
            this.A = "";
            this.NeedSwap = false;
            if (e.hasAttribute("swap"))
                this.NeedSwap = true;
            Array.from(e.children).forEach(function (c) {
                switch (c.tagName) {
                    case "Q":
                        _this.Q = c.innerHTML.trim();
                        break;
                    case "S":
                        _this.S = c.innerHTML.trim();
                        break;
                    case "A":
                        _this.A = c.innerHTML.trim();
                        break;
                }
            });
        }
        Data.prototype.validate = function () {
            return this.Q.length > 0 && this.A.length > 0;
        };
        Data.prototype.swap = function () {
            var qsa = new Data(document.createElement("div"));
            qsa.Q = this.A;
            qsa.S = this.S;
            qsa.A = this.Q;
            return qsa;
        };
        Data.prototype.html = function () {
            var innerHTML = "<div class=\"qsa\">";
            if (this.Q != "") {
                innerHTML += "<div class=\"qsa-q\">".concat(this.Q, "</div>");
            }
            if (this.S != "") {
                innerHTML += "<div class=\"qsa-s\">".concat(this.S, "</div>");
            }
            if (this.A != "") {
                innerHTML += "<div class=\"qsa-a\">".concat(this.A, "</div>");
            }
            innerHTML += "</div>";
            return innerHTML;
        };
        Data.prototype.getQuestion = function () {
            var innerHTML = "<div style=\"display: flex; flex-direction: column;\">";
            innerHTML += "<div>".concat(this.Q, "</div>");
            innerHTML += "<div><font color=#A52A2A >".concat(this.S, "</font></div>");
            innerHTML += "</div>";
            return innerHTML;
        };
        Data.prototype.getAnswer = function () {
            var innerHTML = "".concat(this.A);
            return innerHTML;
        };
        return Data;
    }());
    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    var Test = /** @class */ (function () {
        function Test() {
            this.list = [];
            this.list = Array.from(GlobalList);
        }
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
        var elementList = Array.from(document.getElementsByClassName("QSA"));
        elementList.forEach(function (e) {
            var w = new Data(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalList.push(w);
                if (w.NeedSwap)
                    GlobalList.push(w.swap());
                //隐藏
                //e.setAttribute("style", "display: none;");
            }
            else {
                e.innerHTML += "<span style=\"background-color: red;\">validate error<span >";
            }
        });
        if (GlobalList.length > 0 && showButton) {
            var container = document.getElementById("top-container");
            container === null || container === void 0 ? void 0 : container.appendChild(newButton("QSA测试"));
        }
    }
    AlsQSA.init = init;
    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", "AlsQSA.nextTest()");
        button.innerHTML = text;
        return button;
    }
    function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }
    AlsQSA.hiddenAnswer = hiddenAnswer;
    function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }
    AlsQSA.showAnswer = showAnswer;
    function nextTest() {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "AlsQSA.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", "AlsQSA.nextTest()");
        if (!GlobalTest || GlobalTest.empty()) {
            console.log("新一轮测试开始");
            GlobalTest = new Test();
        }
        var d = GlobalTest.random();
        if (d) {
            // @ts-ignore
            $("#modal1-question").html(d.getQuestion());
            // @ts-ignore
            $("#modal1-answer").html(d.getAnswer());
            // @ts-ignore
            $("#modal1-num").html("本轮剩余：" + GlobalTest.left());
        }
        // @ts-ignore
        $("#modal1").modal('show');
    }
    AlsQSA.nextTest = nextTest;
})(AlsQSA || (AlsQSA = {}));
// 使用以下命令生成js
// tsc als_qsa.ts --target "es5" --lib "es2015,dom" --downlevelIteration
