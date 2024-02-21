// @ts-ignore
var AlsSearching;
(function (AlsSearching) {
    function search() {
        // @ts-ignore
        var keyword = $("#search_keyword").val().toString();
        if (keyword == "") {
            return;
        }
        var tmpwin = window.open('_blank');
        if (tmpwin) {
            tmpwin.location = "/search?keyword=" + encodeURI(keyword);
        }
    }
    AlsSearching.search = search;
    function autosearch(event) {
        if (event.key === 'Enter') {
            search();
        }
    }
    AlsSearching.autosearch = autosearch;
})(AlsSearching || (AlsSearching = {}));
