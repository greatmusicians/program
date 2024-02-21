// @ts-ignore
var AlsListening;
(function (AlsListening) {
    var GlobalList = new Array();
    /**
     * "darkblue", "darkgreen", "darkmagenta", "darkorange", "darkred", "darkviolet"
     */
    var ColorList = ["lightcoral", "lightgreen", "lightseagreen",
        "lightpink", "goldenrod", "lightskyblue", "lightyellow",
        "cadetblue", "coral", "darkkhaki", "darkorchid", "darkgreen", "thistle"];
    var Position;
    (function (Position) {
        Position[Position["AfterHeader"] = 1] = "AfterHeader";
        Position[Position["AfterAudio"] = 2] = "AfterAudio";
    })(Position || (Position = {}));
    ;
    /**
     * <h2></h2> --Header
     * <p><audio></audio></p> --Audio
     * <pre><code></code></pre> --Text
     * <pre><code></code></pre> --NoteList
     */
    var Text = /** @class */ (function () {
        function Text(pre, code) {
            this.Pre = pre;
            this.Code = code;
            var codeClass = code.className;
            if (codeClass.startsWith("language-")) {
                this.Language = codeClass.substring(9);
            }
            else {
                this.Language = "";
            }
            this.HighlightText = this.highlight(this.unescape(this.Code.innerHTML));
        }
        Text.prototype.doHide = function () {
            this.Pre.style.display = "none";
        };
        Text.prototype.undoHide = function () {
            this.Pre.style.display = "block";
        };
        Text.prototype.reverseHide = function () {
            if (this.Pre.style.display == "none") {
                this.undoHide();
            }
            else {
                this.doHide();
            }
        };
        //highlight()应该在coverText()前面被调用
        Text.prototype.highlight = function (text) {
            var _this = this;
            var newtext = "";
            var colorMap = new Map();
            var colorIndex = 0;
            text.split("\n").forEach(function (line, index, arr) {
                if (index < arr.length - 1) {
                    line += "\n";
                }
                var name = _this.parseName(line);
                if (name == "") {
                    newtext += line;
                    return;
                }
                var color = colorMap.get(name) || "";
                if (color == "") {
                    color = ColorList[colorIndex];
                    colorMap.set(name, color);
                    colorIndex = (colorIndex + 1) % ColorList.length;
                }
                //添加标签
                //replace函数默认只替换一次，正好满足我们的需要
                //设置为90%大小，是为了不遮挡其他文字的下划线(使用border制作的下划线)
                var newline = line.replace(name, "<span style=\"font-size: 90%;background-color: ".concat(color, ";\">").concat(name, "</span>"));
                newtext += newline;
            });
            return newtext;
        };
        /**
         * 解析人名，特征是：
         * 1，人名在行开头；
         * 2，人名不能超过3个空格；
         * 3，人名后面有个英文冒号，冒号后面有个空格。
         */
        Text.prototype.parseName = function (line) {
            //?表示最短匹配
            //人名可能包含法语特殊字符，没办法列举
            var mlist = line.match(/^([^:]+): /);
            //匹配不到的不处理
            if (mlist != null) {
                var name_1 = mlist[1];
                //多于3个空格的不算人名
                var space = name_1.match(/ /g);
                if (space == null || space.length < 4) {
                    return name_1;
                }
            }
            return "";
        };
        /**
         * coverText(0)只会将文本设置为highlight过的文本，不会执行覆盖
         * 大于等于length长度的单词会被覆盖。若length为0，不进行覆盖
         */
        Text.prototype.coverText = function (length) {
            var _this = this;
            if (length < 1) {
                this.Code.innerHTML = this.HighlightText;
                return;
            }
            var lineList = this.HighlightText.split("\n");
            lineList.forEach(function (line, i) {
                if (line.indexOf("</span>:") >= 0) {
                    var pos = line.lastIndexOf("</span>:");
                    lineList[i] = line.substring(0, pos + "</span>: ".length)
                        + _this.coverLine(line.substring(pos + "</span>: ".length), length);
                }
                else {
                    lineList[i] = _this.coverLine(line, length);
                }
            });
            this.Code.innerHTML = lineList.join("\n");
        };
        /**
         * 大于等于length长度的单词会被覆盖。若length为0，不进行覆盖
         */
        Text.prototype.coverLine = function (line, length) {
            if (length < 1) {
                return line;
            }
            var odd = false;
            var replacer = function (m) {
                odd = !odd;
                return odd ? "<span class=\"cover odd\">".concat(m, "</span>")
                    : "<span class=\"cover\">".concat(m, "</span>");
            };
            return line
                .replace(RegExp("\\d*[a-zA-Z\u00E4\u00C4\u00FC\u00DC\u00F6\u00D6\u00DF\u00E9\u0153-]{".concat(length, ",}"), "g"), replacer)
                .replace(/\d+ Uhr \d+/g, replacer)
                .replace(/\d[\d\s\.,/:]*\d/g, replacer)
                .replace(/\d+/g, replacer);
        };
        Text.prototype.unescape = function (str) {
            var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
            return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (_, t) { return arrEntities[t]; });
        };
        return Text;
    }());
    var Data = /** @class */ (function () {
        function Data(header, p, audio, textList) {
            this.Header = header;
            this.P = p;
            this.Audio = audio;
            this.AudioOriginalLoop = audio.loop;
            this.TextList = textList;
            this.Transcript = new Array();
            this.Note = new Array();
            for (var i = 0; i < textList.length; i++) {
                //从第一个开始，所有带language的，都是Transcript
                if (textList[i].Language.length > 0) {
                    this.Transcript.push(textList[i]);
                    continue;
                }
                //如果都不带language，那么就指定第一个是Transcript
                if (this.Transcript.length == 0) {
                    this.Transcript.push(textList[i]);
                    continue;
                }
                //其余的都是Note
                this.Note = textList.slice(i);
                break;
            }
            //设置audio的显示样式
            this.Audio.setAttribute("controlsList", "nodownload");
            //e.playbackRate = 1;
            //使button和audio水平对齐
            this.Audio.style.marginRight = "1em";
            this.P.style.display = "flex";
            this.P.style.alignItems = "center";
            this.P.style.marginLeft = "2em";
            //设置audio更方便的被选中，从而使用空格控制播放或暂停
            this.Audio.onmouseover = function (ev) {
                ev.target.focus();
            };
        }
        Data.prototype.appendButton = function (pos, button) {
            switch (pos) {
                case Position.AfterHeader:
                    button.setAttribute("class", "btn btn-link btn-lg");
                    //button.setAttribute("class", "btn btn-outline-primary btn-sm");
                    button.setAttribute("style", "margin: 0 0 0 0.5em;");
                    this.Header.insertBefore(button, null);
                    break;
                case Position.AfterAudio:
                    button.setAttribute("class", "btn btn-primary btn-lg");
                    button.setAttribute("style", "margin: 0 0.5em 0 0;");
                    this.P.insertBefore(button, null);
                    break;
            }
        };
        return Data;
    }());
    function init(print) {
        var disable = document.getElementById("not-listening");
        if (disable != null) {
            return;
        }
        var audioList = Array.from(document.getElementsByTagName("audio"));
        audioList.forEach(function (audio) {
            var p = audio.parentElement;
            //audio标签的上一级标签必须是p
            if (!p || p.tagName != "P") {
                return;
            }
            //p的前一个元素必须是h1/h2/h3...
            var header = p.previousElementSibling;
            if (!header || !header.tagName.match(/^H[1-9]$/)) {
                return;
            }
            //p的后面可能有多个<pre><code></code></pre>
            var i = 1;
            var current = p;
            var textList = new Array();
            while (true) {
                var pre = current.nextElementSibling;
                if (!pre || pre.tagName.toLowerCase() != "pre") {
                    break;
                }
                var children = Array.from(pre.children);
                if (children.length != 1) {
                    return;
                }
                var code = children[0];
                if (code.tagName.toLowerCase() != "code") {
                    break;
                }
                textList.push(new Text(pre, code));
                i++;
                current = pre;
            }
            GlobalList.push(new Data(header, p, audio, textList));
        });
        if (print) {
            GlobalList.forEach(function (e) {
                //只显示第一个Transcript，其余的不显示
                /* if (e.Transcript.length > 0) {
                    e.Transcript[0].coverText(0);
                    e.Transcript.slice(1).forEach(e => e.doHide());
                } */
                //显示所有的Transcript
                e.Transcript.forEach(function (t) { return t.coverText(0); });
                e.Note.forEach(function (t) { return t.doHide(); });
            });
            return;
        }
        if (GlobalList.length > 0) {
            var container = document.getElementById("top-container");
            container === null || container === void 0 ? void 0 : container.appendChild(newButton("▶ 全部", "AlsListening.playFrom(0, false, 1)"));
            //container?.appendChild(newButton("▶ 全部x3", `AlsListening.playFrom(0, false, 3)`));
            container === null || container === void 0 ? void 0 : container.appendChild(newButton("显示/隐藏文本&备注", "AlsListening.reverseHide(-1, true, -1, true)"));
            container === null || container === void 0 ? void 0 : container.appendChild(newButton("覆盖0", "AlsListening.coverText(-1, 0)"));
            container === null || container === void 0 ? void 0 : container.appendChild(newButton("覆盖1", "AlsListening.coverText(-1, 1)"));
            //container?.appendChild(newButton("覆盖4", `AlsListening.coverText(-1, 4)`));
        }
        GlobalList.forEach(function (e, i) {
            var _a;
            e.appendButton(Position.AfterAudio, newButton("▶ 向后", "AlsListening.playFrom(".concat(i, ", false, 1)")));
            //e.appendButton(Position.AfterAudio, newButton("▶ 向后x3", `AlsListening.playFrom(${i}, false, 3)`));
            e.appendButton(Position.AfterAudio, newButton("▶ 向前", "AlsListening.playFrom(".concat(i, ", true, 1)")));
            //e.appendButton(Position.AfterAudio, newButton("▶ 向前x3", `AlsListening.playFrom(${i}, true, 3)`));
            e.appendButton(Position.AfterAudio, newButton("覆盖1", "AlsListening.coverText(".concat(i, ", 1)")));
            //e.appendButton(Position.AfterAudio, newButton("覆盖4", `AlsListening.coverText(${i}, 4)`));
            e.Transcript.forEach(function (t, ti) { return e.appendButton(Position.AfterAudio, newButton("文本" + t.Language, "AlsListening.reverseHide(".concat(i, ", true, ").concat(ti, ", false)"))); });
            e.Note.length > 0 &&
                e.appendButton(Position.AfterAudio, newButton("备注", "AlsListening.reverseHide(".concat(i, ", false, -1, true)")));
            doHide(-1, true, -1, true);
            (_a = e.Transcript[0]) === null || _a === void 0 ? void 0 : _a.coverText(1);
        });
    }
    AlsListening.init = init;
    function newButton(text, fn) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", fn);
        button.innerHTML = text;
        return button;
    }
    /**
     * forward、afterward
     */
    function playFrom(index, forward, repeat) {
        repeat = Math.floor(repeat);
        var list = new Array();
        if (forward) {
            // 倒序向前播放
            for (var i = 0; i <= index; i++) {
                for (var j = 1; j <= repeat; j++) {
                    list.push(GlobalList[i]);
                }
            }
        }
        else {
            // 反转数组，这样每次pop最后一个就是从前往后的顺序了
            for (var i = GlobalList.length - 1; i >= index; i--) {
                for (var j = 1; j <= repeat; j++) {
                    list.push(GlobalList[i]);
                }
            }
        }
        var play = function (d) {
            var _a;
            (_a = d.Transcript[0]) === null || _a === void 0 ? void 0 : _a.undoHide();
            d.Audio.scrollIntoView();
            d.Audio.focus();
            d.Audio.loop = false; // 禁止循环，否则无法触发ended事件
            list.length > 0 && d.Audio.addEventListener('ended', playEndedHandler);
            d.Audio.play();
        };
        var restore = function (d) {
            var _a;
            d.Audio.removeEventListener('ended', playEndedHandler);
            (_a = d.Transcript[0]) === null || _a === void 0 ? void 0 : _a.doHide();
            d.Audio.loop = d.AudioOriginalLoop;
        };
        var d = list.pop();
        d && play(d);
        function playEndedHandler() {
            d && restore(d);
            d = list.pop();
            d && play(d);
        }
    }
    AlsListening.playFrom = playFrom;
    function doHide(index, transcript, transcript_index, note) {
        if (index >= 0) {
            if (transcript) {
                if (transcript_index >= 0) {
                    GlobalList[index].Transcript[transcript_index].doHide();
                }
                else {
                    GlobalList[index].Transcript.forEach(function (t) { return t.doHide(); });
                }
            }
            note && GlobalList[index].Note.forEach(function (t) { return t.doHide(); });
        }
        else {
            GlobalList.forEach(function (v) {
                transcript && v.Transcript.forEach(function (t) { return t.doHide(); });
                note && v.Note.forEach(function (t) { return t.doHide(); });
            });
        }
    }
    AlsListening.doHide = doHide;
    function undoHide(index, transcript, transcript_index, note) {
        if (index >= 0) {
            if (transcript) {
                if (transcript_index >= 0) {
                    GlobalList[index].Transcript[transcript_index].undoHide();
                }
                else {
                    GlobalList[index].Transcript.forEach(function (t) { return t.undoHide(); });
                }
            }
            note && GlobalList[index].Note.forEach(function (t) { return t.undoHide(); });
        }
        else {
            GlobalList.forEach(function (v) {
                transcript && v.Transcript.forEach(function (t) { return t.undoHide(); });
                note && v.Note.forEach(function (t) { return t.undoHide(); });
            });
        }
    }
    AlsListening.undoHide = undoHide;
    function reverseHide(index, transcript, transcript_index, note) {
        if (index >= 0) {
            if (transcript) {
                if (transcript_index >= 0) {
                    GlobalList[index].Transcript[transcript_index].reverseHide();
                }
                else {
                    GlobalList[index].Transcript.forEach(function (t) { return t.reverseHide(); });
                }
            }
            note && GlobalList[index].Note.forEach(function (t) { return t.reverseHide(); });
        }
        else {
            GlobalList.forEach(function (v) {
                transcript && v.Transcript.forEach(function (t) { return t.reverseHide(); });
                note && v.Note.forEach(function (t) { return t.reverseHide(); });
            });
        }
    }
    AlsListening.reverseHide = reverseHide;
    //只有第一个Transcript才执行覆盖
    function coverText(index, length) {
        var _a;
        if (index >= 0) {
            (_a = GlobalList[index].Transcript[0]) === null || _a === void 0 ? void 0 : _a.coverText(length);
        }
        else {
            GlobalList.forEach(function (v) {
                var _a;
                (_a = v.Transcript[0]) === null || _a === void 0 ? void 0 : _a.coverText(length);
            });
        }
    }
    AlsListening.coverText = coverText;
})(AlsListening || (AlsListening = {}));
// 使用以下命令生成js
// tsc als_listening.ts --target "es5" --lib "es2015,dom" --downlevelIteration
