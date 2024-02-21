// @ts-ignore
namespace AlsSearching {

    export function search() {
        // @ts-ignore
        let keyword = $("#search_keyword").val().toString();
        if (keyword == "") {
            return
        }
        let tmpwin = window.open('_blank');
        if (tmpwin) {
            tmpwin.location = "/search?keyword=" + encodeURI(keyword);
        }
    }

    export function autosearch(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            search();
        }
    }

}