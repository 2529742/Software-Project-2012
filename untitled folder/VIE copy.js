$(function() {
  var vie = new VIE();
  vie.use(new vie.StanbolService(), "stanbol");
  vie.analyze({
              element: $('#test')
              }).using("stanbol").done(function(ent) {
                                       _.each(ent, function(e) {
                                              if (e.isof("dbpedia:Person")) {
                                              $('#result').append($('<p>').text(e.id));
                                              }
                                              });
                                       }).execute();
  });​