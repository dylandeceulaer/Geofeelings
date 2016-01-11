function XHRGet(url, cb) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', cb);
    oReq.open("get", url, true);
    oReq.send();
}

function XHRPost(url, param, cb) {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    oReq.addEventListener('load', cb);
    oReq.send(param);
}


$(function () {
    
    XHRGet("/api/chat/getActiveChatWindows", function () {
        console.log(this);
    });

    
});