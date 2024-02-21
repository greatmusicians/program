// @ts-ignore
namespace AlsListening {
    let GlobalList = new Array<Data>();

    /**
     * "darkblue", "darkgreen", "darkmagenta", "darkorange", "darkred", "darkviolet"
     */
    let ColorList: string[] = ["lightcoral", "lightgreen", "lightseagreen",
        "lightpink", "goldenrod", "lightskyblue", "lightyellow",
        "cadetblue", "coral", "darkkhaki", "darkorchid", "darkgreen", "thistle"];

    enum Position {
        AfterHeader = 1,
        AfterAudio,
    };

    /**
     * <h2></h2> --Header
     * <p><audio></audio></p> --Audio
     * <pre><code></code></pre> --Text
     * <pre><code></code></pre> --NoteList
     */

    class Text {
        Pre: HTMLElement;
        Code: HTMLElement;
        Language: string; // code的class应该类似language-de，则只取de
        HighlightText: string; //已经highlight过的原始文本，用于覆盖单词

        constructor(pre: HTMLElement, code: HTMLElement) {
            this.Pre = pre;
            this.Code = code;
            let codeClass = code.className;
            if (codeClass.startsWith("language-")) {
                this.Language = codeClass.substring(9);
            } else {
                this.Language = "";
            }
            this.HighlightText = this.highlight(this.unescape(this.Code.innerHTML));
        }

        doHide(): void {
            this.Pre.style.display = "none";
        }

        undoHide(): void {
            this.Pre.style.display = "block";
        }

        reverseHide(): void {
            if (this.Pre.style.display == "none") {
                this.undoHide();
            } else {
                this.doHide();
            }
        }

        //highlight()应该在coverText()前面被调用
        highlight(text: string): string {
            let newtext = "";
            let colorMap = new Map<string, string>();
            let colorIndex = 0;
            text.split("\n").forEach((line, index, arr) => {
                if (index < arr.length - 1) {
                    line += "\n";
                }
                let name = this.parseName(line);
                if (name == "") {
                    newtext += line;
                    return
                }
                let color = colorMap.get(name) || "";
                if (color == "") {
                    color = ColorList[colorIndex];
                    colorMap.set(name, color);
                    colorIndex = (colorIndex + 1) % ColorList.length;
                }
                //添加标签
                //replace函数默认只替换一次，正好满足我们的需要
                //设置为90%大小，是为了不遮挡其他文字的下划线(使用border制作的下划线)
                let newline = line.replace(name,
                    `<span style="font-size: 90%;background-color: ${color};">${name}</span>`);
                newtext += newline;
            })
            return newtext;
        }

        /**
         * 解析人名，特征是：
         * 1，人名在行开头；
         * 2，人名不能超过3个空格；
         * 3，人名后面有个英文冒号，冒号后面有个空格。
         */
        parseName(line: string): string {
            //?表示最短匹配
            //人名可能包含法语特殊字符，没办法列举
            let mlist = line.match(/^([^:]+): /);
            //匹配不到的不处理
            if (mlist != null) {
                let name = mlist[1];
                //多于3个空格的不算人名
                let space = name.match(/ /g);
                if (space == null || space.length < 4) {
                    return name;
                }
            }
            return "";
        }

        /**
         * coverText(0)只会将文本设置为highlight过的文本，不会执行覆盖
         * 大于等于length长度的单词会被覆盖。若length为0，不进行覆盖
         */
        coverText(length: number): void {
            if (length < 1) {
                this.Code.innerHTML = this.HighlightText;
                return;
            }
            let lineList = this.HighlightText.split("\n");
            lineList.forEach((line, i) => {
                if (line.indexOf("</span>:") >= 0) {
                    let pos = line.lastIndexOf("</span>:")
                    lineList[i] = line.substring(0, pos + "</span>: ".length)
                        + this.coverLine(line.substring(pos + "</span>: ".length), length);
                } else {
                    lineList[i] = this.coverLine(line, length);
                }
            });
            this.Code.innerHTML = lineList.join("\n");
        }

        /**
         * 大于等于length长度的单词会被覆盖。若length为0，不进行覆盖
         */
        coverLine(line: string, length: number): string {
            if (length < 1) {
                return line;
            }
            let odd = false;
            var replacer = function (m: string): string {
                odd = !odd;
                return odd ? `<span class="cover odd">${m}</span>`
                    : `<span class="cover">${m}</span>`;
            }
            return line
                .replace(RegExp(`\\d*[a-zA-ZäÄüÜöÖßéœ-]{${length},}`, "g"), replacer)
                .replace(/\d+ Uhr \d+/g, replacer)
                .replace(/\d[\d\s\.,/:]*\d/g, replacer)
                .replace(/\d+/g, replacer);
        }

        unescape(str: string) {
            let arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
            return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, (_, t) => { return arrEntities[t]; });
        }
    }

    class Data {
        Header: Element;
        P: HTMLElement;
        Audio: HTMLAudioElement;
        AudioOriginalLoop: boolean;
        TextList: Text[];
        Transcript: Text[];
        Note: Text[];

        constructor(header: Element, p: HTMLElement, audio: HTMLAudioElement, textList: Text[]) {
            this.Header = header;
            this.P = p;
            this.Audio = audio;
            this.AudioOriginalLoop = audio.loop;
            this.TextList = textList;
            this.Transcript = new Array<Text>();
            this.Note = new Array<Text>();

            for (let i = 0; i < textList.length; i++) {
                //从第一个开始，所有带language的，都是Transcript
                if (textList[i].Language.length > 0) {
                    this.Transcript.push(textList[i]);
                    continue
                }
                //如果都不带language，那么就指定第一个是Transcript
                if (this.Transcript.length == 0) {
                    this.Transcript.push(textList[i]);
                    continue
                }
                //其余的都是Note
                this.Note = textList.slice(i);
                break
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
            this.Audio.onmouseover = (ev) => {
                (ev.target as HTMLAudioElement).focus();
            }
        }

        appendButton(pos: Position, button: HTMLButtonElement): void {
            switch (pos) {
                case Position.AfterHeader:
                    button.setAttribute("class", "btn btn-link btn-lg");
                    //button.setAttribute("class", "btn btn-outline-primary btn-sm");
                    button.setAttribute("style", "margin: 0 0 0 0.5em;");
                    this.Header.insertBefore(button, null);
                    break
                case Position.AfterAudio:
                    button.setAttribute("class", "btn btn-primary btn-lg");
                    button.setAttribute("style", "margin: 0 0.5em 0 0;");
                    this.P.insertBefore(button, null);
                    break
            }
        }
    }

    export function init(print?: boolean): void {
        let disable = document.getElementById("not-listening");
        if (disable != null) {
            return
        }
        let audioList = Array.from(document.getElementsByTagName("audio"));
        audioList.forEach((audio) => {
            let p = audio.parentElement;
            //audio标签的上一级标签必须是p
            if (!p || p.tagName != "P") {
                return
            }

            //p的前一个元素必须是h1/h2/h3...
            let header = p.previousElementSibling;
            if (!header || !header.tagName.match(/^H[1-9]$/)) {
                return
            }

            //p的后面可能有多个<pre><code></code></pre>
            let i = 1;
            let current: Element = p;
            let textList = new Array<Text>();
            while (true) {
                let pre = current.nextElementSibling as HTMLElement;
                if (!pre || pre.tagName.toLowerCase() != "pre") {
                    break
                }
                let children = Array.from(pre.children);
                if (children.length != 1) {
                    return
                }
                let code = children[0] as HTMLElement;
                if (code.tagName.toLowerCase() != "code") {
                    break
                }
                textList.push(new Text(pre, code));
                i++;
                current = pre;
            }

            GlobalList.push(new Data(header, p, audio, textList));
        });

        if (print) {
            GlobalList.forEach((e) => {
                //只显示第一个Transcript，其余的不显示
                /* if (e.Transcript.length > 0) {
                    e.Transcript[0].coverText(0);
                    e.Transcript.slice(1).forEach(e => e.doHide());
                } */
                //显示所有的Transcript
                e.Transcript.forEach(t => t.coverText(0));
                e.Note.forEach(t => t.doHide());
            })
            return
        }

        if (GlobalList.length > 0) {
            let container = document.getElementById("top-container");
            container?.appendChild(newButton("▶ 全部", `AlsListening.playFrom(0, false, 1)`));
            //container?.appendChild(newButton("▶ 全部x3", `AlsListening.playFrom(0, false, 3)`));
            container?.appendChild(newButton("显示/隐藏文本&备注", `AlsListening.reverseHide(-1, true, -1, true)`));
            container?.appendChild(newButton("覆盖0", `AlsListening.coverText(-1, 0)`));
            container?.appendChild(newButton("覆盖1", `AlsListening.coverText(-1, 1)`));
            //container?.appendChild(newButton("覆盖4", `AlsListening.coverText(-1, 4)`));
        }

        GlobalList.forEach((e, i) => {
            e.appendButton(Position.AfterAudio, newButton("▶ 向后", `AlsListening.playFrom(${i}, false, 1)`));
            //e.appendButton(Position.AfterAudio, newButton("▶ 向后x3", `AlsListening.playFrom(${i}, false, 3)`));
            e.appendButton(Position.AfterAudio, newButton("▶ 向前", `AlsListening.playFrom(${i}, true, 1)`));
            //e.appendButton(Position.AfterAudio, newButton("▶ 向前x3", `AlsListening.playFrom(${i}, true, 3)`));
            e.appendButton(Position.AfterAudio, newButton("覆盖1", `AlsListening.coverText(${i}, 1)`));
            //e.appendButton(Position.AfterAudio, newButton("覆盖4", `AlsListening.coverText(${i}, 4)`));

            e.Transcript.forEach((t, ti) => e.appendButton(Position.AfterAudio, newButton("文本" + t.Language, `AlsListening.reverseHide(${i}, true, ${ti}, false)`)));
            e.Note.length > 0 &&
                e.appendButton(Position.AfterAudio, newButton("备注", `AlsListening.reverseHide(${i}, false, -1, true)`));
            doHide(-1, true, -1, true);

            e.Transcript[0]?.coverText(1);
        })
    }

    function newButton(text: string, fn: string): HTMLButtonElement {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", fn);
        button.innerHTML = text;
        return button;
    }

    /**
     * forward、afterward
     */
    export function playFrom(index: number, forward: boolean, repeat: number): void {
        repeat = Math.floor(repeat)

        let list = new Array<Data>();
        if (forward) {
            // 倒序向前播放
            for (let i = 0; i <= index; i++) {
                for (let j = 1; j <= repeat; j++) {
                    list.push(GlobalList[i]);
                }
            }
        } else {
            // 反转数组，这样每次pop最后一个就是从前往后的顺序了
            for (let i = GlobalList.length - 1; i >= index; i--) {
                for (let j = 1; j <= repeat; j++) {
                    list.push(GlobalList[i]);
                }
            }
        }

        var play = function (d: Data) {
            d.Transcript[0]?.undoHide();
            d.Audio.scrollIntoView();
            d.Audio.focus();
            d.Audio.loop = false; // 禁止循环，否则无法触发ended事件
            list.length > 0 && d.Audio.addEventListener('ended', playEndedHandler);
            d.Audio.play();
        }

        var restore = function (d: Data) {
            d.Audio.removeEventListener('ended', playEndedHandler);
            d.Transcript[0]?.doHide();
            d.Audio.loop = d.AudioOriginalLoop;
        }

        var d = list.pop();
        d && play(d);
        function playEndedHandler() {
            d && restore(d);
            d = list.pop();
            d && play(d);
        }
    }

    export function doHide(index: number, transcript: boolean, transcript_index: number, note: boolean): void {
        if (index >= 0) {
            if (transcript) {
                if (transcript_index >= 0) {
                    GlobalList[index].Transcript[transcript_index].doHide();
                } else {
                    GlobalList[index].Transcript.forEach(t => t.doHide());
                }
            }
            note && GlobalList[index].Note.forEach(t => t.doHide());
        } else {
            GlobalList.forEach((v) => {
                transcript && v.Transcript.forEach(t => t.doHide());
                note && v.Note.forEach(t => t.doHide());
            });
        }
    }

    export function undoHide(index: number, transcript: boolean, transcript_index: number, note: boolean): void {
        if (index >= 0) {
            if (transcript) {
                if (transcript_index >= 0) {
                    GlobalList[index].Transcript[transcript_index].undoHide();
                } else {
                    GlobalList[index].Transcript.forEach(t => t.undoHide());
                }
            }
            note && GlobalList[index].Note.forEach(t => t.undoHide());
        } else {
            GlobalList.forEach((v) => {
                transcript && v.Transcript.forEach(t => t.undoHide());
                note && v.Note.forEach(t => t.undoHide());
            });
        }
    }

    export function reverseHide(index: number, transcript: boolean, transcript_index: number, note: boolean): void {
        if (index >= 0) {
            if (transcript) {
                if (transcript_index >= 0) {
                    GlobalList[index].Transcript[transcript_index].reverseHide();
                } else {
                    GlobalList[index].Transcript.forEach(t => t.reverseHide());
                }
            }
            note && GlobalList[index].Note.forEach(t => t.reverseHide());
        } else {
            GlobalList.forEach((v) => {
                transcript && v.Transcript.forEach(t => t.reverseHide());
                note && v.Note.forEach(t => t.reverseHide());
            });
        }
    }

    //只有第一个Transcript才执行覆盖
    export function coverText(index: number, length: number): void {
        if (index >= 0) {
            GlobalList[index].Transcript[0]?.coverText(length);
        } else {
            GlobalList.forEach((v) => {
                v.Transcript[0]?.coverText(length);
            });
        }
    }
}

// 使用以下命令生成js
// tsc als_listening.ts --target "es5" --lib "es2015,dom" --downlevelIteration