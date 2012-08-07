/**
 $(function() {
 var vie = new VIE();
 vie.use(new vie.StanbolService(), "stanbol");
 vie.analyze({
 element: $('#piatest')
 }).using("stanbol").done(function(ent) {
 _.each(ent, function(e) {
 if (e.isof("dbpedia:Person")) {
 $('#result').append($('<p>').text(e.id));
 }
 });
 }).execute();
 })
 **/
/**
 $(function() {
 var vie = new VIE();
 var stnblService = new vie.StanbolService();
 vie.use(stnblService, "stanbol");
 vie.analyze({
 element : $('#piatest')
 }).using("stanbol").done(function(ent) {
 _.each(ent, function(e) {
 var url = e.getSubjectUri();
 var label = VIE.Util.getPreferredLangForPreferredProperty(e, ['rdfs:label'], ['en', 'de']);
 if (label === 'n/a') {
 return true;
 }
 jQuery('#result').append(jQuery('<a target="_blank" href="' + url + '">' + label + '</a><br />'));
 });
 }).execute();
 })
 */
/**
 $(function(){

 var eiffel = "Eiffel Tower";
 var vie = new VIE();
 var stnblService = new vie.StanbolService();
 vie.use(stnblService, 'stanbol');
 vie
 .find({
 term: eiffel,
 field: "rdfs:label",
 })
 .using('stanbol')
 .execute()
 .done(function(ent) {
 alert('found');
 });​

 })
 */

$(function() {
    var vie = new VIE();
    var stnblService = new vie.StanbolService();
    vie.use(stnblService, 'stanbol');
    vie.use(new vie.DBPediaService());
    vie.find({
        term : "The Beatles",
        field : "rdfs:label",
        properties : ["skos:prefLabel", "rdfs:label"] // are going to be loaded with the result entities
    }).using("stanbol").execute().done(function(ent) {
        _.each(ent, function(e) {
            loadUrl = e.getSubjectUri();
            vie.load({
                entity : loadUrl
            }).using("dbpedia").execute().done(function(entities) {
                entities = (_.isArray(entities)) ? entities : [entities];
                _.each(entities, function(enti) {

                    //if (enti.isof("dbpedia:Place") || enti.isof("dbpedia:Person") || enti.isof('dbpedia:Organisation')) {
                    var fullAbstract = VIE.Util.getPreferredLangForPreferredProperty(enti, ['http://dbpedia.org/ontology/abstract'], ['en', 'de']);

                    var fullWords = fullAbstract.split(" ");
                    var shortWords = [];
                    var numberOfWords;
                    if (fullWords.length >= 20) {
                        numberOfWords = 20;
                    } else {
                        numberOfWords = fullWords.length
                    }
                    for (var i = 0; i < numberOfWords; i++) {
                        shortWords.push(fullWords[i]);
                    }
                    shortAbstract = shortWords.join(" ");

                    var url = enti.getSubjectUri();
                    var label = VIE.Util.getPreferredLangForPreferredProperty(enti, ['rdfs:label'], ['en', 'de']);

                    if (label == 'n/a' || url == 'n/a' || fullAbstract == 'n/a') {

                    } else {

                        console.log(label + " ( " + url + " )");
                        console.log(shortAbstract);
                    }
                    //}
                });

            });

        });
    });
})
/**
 $(function(){

 var vie = new VIE();
 vie.use(new vie.DBPediaService());

 var mongoliaURI = "<http://dbpedia.org/resource/Mongolia>";
 var capitalPropURI = "<http://dbpedia.org/property/capital>";

 vie
 .load({entity : mongoliaURI})
 .using('dbpedia')
 .execute()
 .done(function (mongolia) {
 var capitalURI = mongolia.get(capitalPropURI);
 vie
 .load({entity : capitalURI})
 .using('dbpedia')
 .execute()
 .done(function(capital) {
 var url = capital.getSubjectUri();
 var label = VIE.Util.getPreferredLangForPreferredProperty(capital, ['rdfs:label'], ['en']);
 alert('The capital of Mongolia is ' + label + '.');
 });
 });
 })
 **/