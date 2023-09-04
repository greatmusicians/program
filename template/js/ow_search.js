function search() {
    keyword = $("#search_keyword").val().toString();
    if (keyword == "") {
        return
    }
    var tmpwin = window.open('_blank');
    tmpwin.location = "/search?keyword=" + encodeURI(keyword);
}

function autosearch(event) {
    if (event.keyCode == 13) {
        search();
    }
}