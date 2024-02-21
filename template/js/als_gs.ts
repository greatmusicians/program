/**
 * GS: good sentences, gute Sätze
 */

// @ts-ignore
namespace AlsGS {
    let GlobalList = new Array<Data>();
    let GlobalTest: Test;

    class Data {
        S: string = "";
        N: string = "";

        constructor(e: Element) {
            Array.from(e.children).forEach((c) => {
                switch (c.tagName) {
                    case "S":
                        this.S = c.innerHTML.trim();
                        break;
                    case "N":
                        this.N = c.innerHTML.trim();
                        break;
                }
            })
        }

        validate(): boolean {
            return this.S.length > 0;
        }

        html(): string {
            let innerHTML = `<div class="qsa">`;
            if (this.S != "") {
                innerHTML += `<div class="qsa-q">${this.S}</div>`;
            }
            if (this.N != "") {
                innerHTML += `<div class="qsa-a">${this.N}</div>`;
            }
            innerHTML += `</div>`;
            return innerHTML;
        }

        getQuestion(): string {
            let innerHTML = `<div style="display: flex; flex-direction: column;">`;
            innerHTML += `<div>${this.S}</div>`;
            innerHTML += `</div>`;
            return innerHTML;
        }

        getAnswer(): string {
            let innerHTML = `${this.N}`;
            return innerHTML;
        }
    }

    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    class Test {
        list: Data[] = [];

        constructor() {
            this.list = Array.from(GlobalList);
        }

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
        let elementList = Array.from(document.getElementsByClassName("GS"));
        elementList.forEach((e) => {
            let w = new Data(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalList.push(w);
            } else {
                e.innerHTML += `<span style="background-color: red;">validate error<span >`;
            }
        })
        if (GlobalList.length > 0 && showButton) {
            let container = document.getElementById("top-container");
            container?.appendChild(newButton("GS测试"));
        }
    }

    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text: string): Element {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", `AlsGS.nextTest()`);
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

    export function nextTest() {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "AlsGS.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", `AlsGS.nextTest()`);

        if (!GlobalTest || GlobalTest.empty()) {
            console.log("新一轮测试开始");
            GlobalTest = new Test();
        }
        let d = GlobalTest.random();
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
}

// 使用以下命令生成js
// tsc als_gs.ts --target "es5" --lib "es2015,dom" --downlevelIteration