
var profilehelp = (function () {
    var joinUpdates = function (list1, list2, next) {
        var res = [];
        for (var i in list1) {
            for (var ii in list1[i].votes) {
                if (list1[i].votes[ii]) {
                    list1[i].votes[ii].type = "event";
                    list1[i].votes[ii].name = list1[i].name;
                    list1[i].votes[ii].location = list1[i].location;
                    res.push(list1[i].votes[ii]);
                }
            }
        }
        for (var i in list2) {
            for (var ii in list2[i].votes) {
                if (list2[i].votes[ii]) {
                    list2[i].votes[ii].type = "moodCircle";
                    list2[i].votes[ii].name = list2[i].name;
                    list2[i].votes[ii].location = list2[i].city;
                    res.push(list2[i].votes[ii]);
                }
            }
        }
        res.sort(function (a, b) {
            return (Date.parse(b.Date) - Date.parse(a.Date));
        });
        next(res);
    };
    return {
        joinUpdates : joinUpdates 
    };
})();
module.exports = profilehelp;
