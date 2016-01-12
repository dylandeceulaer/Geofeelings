
var eventhelp = (function () {
    var joinUpdates = function (list1, list2, friends, next) {
        var res = [];
        
        for (var i in list1) {
            for (var ii = 0; ii < list1[i].votes.length; ii++) {
                if (list1[i].votes[ii] && isInArray(friends, list1[i].votes[ii].voter._id)) {
                    list1[i].votes[ii]._doc.type = "moodCircle";
                    list1[i].votes[ii]._doc.name = list1[i].name;
                    list1[i].votes[ii]._doc.id = list1[i]._id;
                    list1[i].votes[ii]._doc.center = list1[i].center;
                    list1[i].votes[ii]._doc.location = list1[i].city;
                    res.push(list1[i].votes[ii]);
                }
            }
        }
        for (var i in list2) {
            for (var ii = 0; ii < list2[i].votes.length; ii++) {
                if (list2[i].votes[ii] && isInArray(friends, list2[i].votes[ii].voter._id)) {
                    list2[i].votes[ii]._doc.type = "event";
                    list2[i].votes[ii]._doc.name = list2[i].name;
                    list2[i].votes[ii]._doc.id = list2[i]._id;
                    list2[i].votes[ii]._doc.center = list2[i].center;
                    list2[i].votes[ii]._doc.location = list2[i].location;
                    res.push(list2[i].votes[ii]);
                }
            }
        }
        
        res.sort(function (a, b) {
            return (Date.parse(b.Date) - Date.parse(a.Date));
        });
        res.splice(10, res.length - 10)
        
        next(res);
    },
        isInArray = function (array, item) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].equals(item))
                return true;
        }
        return false;
    } 
    return {
        joinUpdates : joinUpdates
    };
})();
module.exports = eventhelp;
