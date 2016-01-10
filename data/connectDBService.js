/* ConnectDBService.js*/

/*
 * 1. converteer het object naar een functie met args (= verplaats requires, niet meer zelfuitvoerend)
 * 2. Een service of factory functie initialiseert onmiddellijk op basis van de args
 * 3. closure houdt code privaat
 * 4. Eventueel verder uitbouwen met een container die het resultaat cacht voor toekomstige calls ( container.register(database) ).
 * 5. Externe library zoals mongoose initialiseren met een wrapper errond als database factory.
 */

module.exports = (function (configURL, database) {
    //var mongoose = database;

    var db = database.connect(configURL);// connecteer de database
    
    database.connection.on("open", function () {
        //mongoose test:
        var msg = "connection met mongo server " +configURL;
        
        //collection (=table) names met data als test (obj heeft geen lengte)
        var collections = database.connection.collections;
        msg += "\n \t with known collections/models: ";
        for (var property in collections) {
            msg += collections[property].name + ", ";
        }
        
        console.log(msg);
    });
    
    database.connection.on("error", function (error) {
        console.log("connection error: " , error.message);
    });
    
    database.connection.on("close", function () {
        console.log("connection closed: ", configURL);
    });
    
    return database; // mongoose connected
});