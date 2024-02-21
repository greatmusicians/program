// @ts-ignore
namespace AlsWordDE {
    let GlobalList = new Array<Data>();
    let GlobalTestMap = new Map<string, Test>();

    enum Typ {
        Nomen, //名词
        Verb, //动词
        einfach, //simple
        einfach_Nomen, //简化的名词
        Fehler, //解析错误
    }

    class Data {
        Kapitel: string = "";
        Typ: Typ = Typ.Fehler;
        WList: string[] = new Array<string>();
        Notiz: string = "";

        constructor(e: Element) {
            this.Kapitel = e.getAttribute("Kapitel") || "";
            let m = new Map<string, string>();
            Array.from(e.children).forEach((c) => {
                switch (c.tagName) {
                    case "Beispiel".toUpperCase():
                        this.Notiz += c.innerHTML.trim() + "\n";
                        break;
                    case "Notiz".toUpperCase():
                        this.Notiz += c.innerHTML.trim();
                        break;
                    default:
                        m.set(c.tagName, c.innerHTML.trim());
                        break;
                }
            })
            this.initWList(m);
            this.Typ = this.initTyp();
        }

        initWList(m: Map<string, string>): void {
            //按顺序查找 W1、W2、W3、W4... 如果有中断，后面的也不要了
            for (let i = 1; ; i++) {
                if (m.has(`W${i}`)) {
                    this.WList.push(m.get(`W${i}`) || "");
                } else {
                    break
                }
            }
            //从后往前，去掉空值
            while (true) {
                if (this.WList[this.WList.length - 1] == "") {
                    this.WList.pop();
                } else {
                    break
                }
            }
        }

        //类型推断
        initTyp(): Typ {
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
        }

        html(): string {
            let innerHTML = `<div class="wort">`;
            innerHTML += `<div style="display: flex;">`;
            switch (this.Typ) {
                case Typ.Verb:
                    innerHTML += `<div class="wort-col1">${this.WList.slice(0, 3).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.WList[3]}</div>`;
                    break;
                case Typ.Nomen:
                    innerHTML += `<div class="wort-col1">${this.WList.slice(0, 3).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.WList[3]}</div>`;
                    break;
                case Typ.einfach:
                    innerHTML += `<div class="wort-col1">${this.WList.slice(0, 1).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.WList[1]}</div>`;
                    break;
                case Typ.einfach_Nomen:
                    innerHTML += `<div class="wort-col1">${this.WList.slice(0, 1).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.WList[1]}</div>`;
                    break;
            }
            innerHTML += `</div>`;
            if (this.Notiz != "") {
                innerHTML += `<div class="pre">${this.Notiz}</div>`;
            }
            innerHTML += `</div>`;
            return innerHTML;
        }

        getQuestion(): string {
            let qList = new Array<string>();
            let addQuestion = function (...textList: string[]): void {
                textList.forEach((v) => {
                    if (v.length > 0) qList.push(v);
                })
            }
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
        }

        getAnswer(): string {
            return `${this.WList.join(", ")}<br/>${this.Notiz}`;
        }
    }


    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    class Test {
        list: Data[] = [];

        constructor(Kapitel: string) {
            this.list = Array.from(GlobalList);
            if (Kapitel.length > 0) {
                this.list.filter((v) => {
                    return v.Kapitel == Kapitel;
                });
            }
        }

        //Math.random()挺让人无语的，有时候感觉它根本不随机，所以增加点复杂度
        //Math.random()精确到小数点后14位
        random(): Data {
            let index = Math.floor(Math.random() * 123456789) % this.list.length;
            let d = this.list[index];
            this.list.splice(index, 1);
            console.log("本轮测试剩余数量", this.list.length);
            return d;
        }

        empty(): boolean {
            return this.list.length == 0;
        }

        left(): number {
            return this.list.length;
        }
    }

    export function init(showButton: boolean): void {
        let elementList = Array.from(document.getElementsByClassName("Wort"));
        elementList.forEach((e) => {
            let w = new Data(e);
            if (w.Typ != Typ.Fehler) {
                e.innerHTML = w.html();
                GlobalList.push(w);
                //隐藏
                //e.setAttribute("style", "display: none;");
            } else {
                e.innerHTML += `<span style="background-color: red;">validate error<span >`;
            }
        })
        if (GlobalList.length > 0 && showButton) {
            let buttonSet = new Set<string>;
            GlobalList.forEach((v) => {
                buttonSet.add(v.Kapitel);
            })
            buttonSet.delete("");
            let buttonList = [...buttonSet].sort();

            let container = document.getElementById("top-container");
            container?.appendChild(newButton("词汇测试", ""));
            buttonList.forEach((v) => {
                container?.appendChild(newButton(v, v));
            })
        }
    }

    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text: string, Kapitel: string): Element {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", `AlsWordDE.nextTest("${Kapitel}")`);
        button.innerHTML = text;
        return button;
    }

    export function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }

    export function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }

    export function nextTest(Kapitel: string) {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "AlsWordDE.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", `AlsWordDE.nextTest("${Kapitel}")`);

        if (!GlobalTestMap.has(Kapitel) || GlobalTestMap.get(Kapitel)?.empty()) {
            console.log("新一轮测试开始");
            GlobalTestMap.set(Kapitel, new Test(Kapitel));
        }
        let d = GlobalTestMap.get(Kapitel)?.random();
        if (d) {
            // @ts-ignore
            $("#modal1-question").html(d.getQuestion());
            // @ts-ignore
            $("#modal1-answer").html(d.getAnswer());
            // @ts-ignore
            $("#modal1-num").html("本轮剩余：" + GlobalTestMap.get(Kapitel)?.left());
        }

        // @ts-ignore
        $("#modal1").modal('show');
    }
}

// 使用以下命令生成js
// tsc als_word_de.ts --target "es5" --lib "es2015,dom" --downlevelIteration