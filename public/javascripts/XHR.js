/**
* @classDescription	    Using XMLHTTP object to populate the property "responseData" 
* @param                {String} url 
* @author 		        JohanV@howest
* @version		        0.1.0
*/


window.console ? window.console.log(" utils.js loaded") : null;

function XHR(url, callback) {
    this.url = url + "?t=" + (new Date()).getTime(); // caching verhinderen
    if (url != null) { this.getData(url, callback); }
}

XHR.prototype = {
    //Members
    _responseData: "",
    
    //Instance Properties indien IE9 +
    get responseData() { return this._responseData ? this._responseData : null; },
    set responseData(value) { this._responseData = value; },
    // responseData: this._responseData ? this._responseData : null,
    
    //Instance Methods
    createRequest: function (url) {
        try {
            request = new XMLHttpRequest();
        } catch (tryMS) {
            try {
                request = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (otherMS) {
                try {
                    request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (failed) {
                    request = null; // de fout door de caller laten behandelen
                }
            }
        }
        return request
    },
    getData: function (url, callback) {
        request = this.createRequest(url);
        if (request == null) {
            this.responseData = "Unable to create request. URL is missing.";
            callback(new Error(this.responseData));
            return;
        }
        request.open("GET", url, true);
        request.onreadystatechange = function () { XHR.prototype.displayResult(callback) };
        request.send();
    },
    
    
    displayResult: function (callback) {
        if (request.readyState == 4 && request.status == 200) {  //finished na readyState 2 en 3 
            //// XML response
            if (request.getResponseHeader("content-type").indexOf("text/xml") > -1) {
                var resultNodes;
                var xmlDoc = request.responseXML;
                //bij IE is een processing instructie een node
                if (xmlDoc.childNodes[0].nodeType != 1) {
                    resultNodes = xmlDoc.childNodes[1].childNodes
                } else {
                    resultNodes = xmlDoc.childNodes[0].childNodes
                }
                XHR.prototype.responseData = resultNodes;
                callback(resultNodes);

            } else if (request.getResponseHeader("content-type").indexOf("application/j") > -1) {
                XHR.prototype.responseData = JSON.parse(request.responseText); //JSON response
                callback(JSON.parse(request.responseText));

            } else {
                XHR.prototype.responseData = request.responseText;
                callback(request.responseText);
            }
        } else {
            if (request.statusText !== "OK") {
                XHR.prototype.responseData = "error on server" + request.statusText;
                callback("Error on server:" + request.statusText);
            }
        }
    },
    
    createRequestBody: function () {
        var values = [];
        
        for (var i = 0, l = form.elements.length; i < l; i = i + 1) {
            var el = form.elements[i],
                name = encodeURIComponent(el.name),
                value = encodeURIComponent(el.value),
                complete = name + "=" + value;
            
            values.push(complete);
        }
        return values.join("&");
    },
    
    ajaxRequest: function (url, callback) {
        $.ajax({
            url: url,
            cache: false,
            error: function (data, status, error) {
                window.console ? window.console.log("Error: " + status + "\n\n" + error.message) : null;
                XHR.prototype.responseData = "Error: " + status + "\n\n" + error.message;
                callback(new Error(error.message)); request
            },
            success: function (data, status) {
                XHR.prototype.responseData = data;
                callback(data);
            }
        })
    },
    postEncodeURIComponent: function (str) {
        // bij AJAX en method post dient een spatie vervangen te worden.
        str = encodeURIComponent(str);
        return str.replace(/%20/g, "+");
    },
    showDataInTable: function (data , parameters , callback) {
        var table = document.createElement("table");
        for (var obj in data) {
             var tr = table.appendChild(document.createElement("tr"))
            for (param in parameters) {
                if (data[obj][parameters[param]]) {                   
                        var td = tr.appendChild(document.createElement("td"));
                        td.appendChild(document.createTextNode(data[obj][parameters[param]]));             
                }            
            }
            // for (prop in data[obj]) {      
        }
        callback(table);
    }
}
