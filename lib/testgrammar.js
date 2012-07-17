//
//  testgrammar.js
//
/*
  The author or authors of this code dedicate any and all 
  copyright interest in this code to the public domain.
*/


// a very ambiguous grammar for doing calculations

var grammar = new Grammar('utt');

grammar.utt = [OneOf([
                       [Ref('deictic'), Ref('ne'), Tag("out = rules.ne")],
                       [Ref('test'), Tag("out = rules.test")],
                       ])];
                       
grammar.deictic = [Optional([OneOf([
    ['this', 'is'],
    ['these', 'are'],
    ['here', 'is'],
    ['here', 'are'],
    ['mark','this','as'],
    ['tag','this','as'],
    ['mark','these','as'],
    ['tag','these','as'],
])])];

grammar.ne = [OneOf([
    ['the','beatles',Tag("out = 'The Beatles'")],
    ['beatles',Tag("out = 'The Beatles'")],
    ['john','lennon', Tag("out = 'John Lennon'")],
    ['ringo','starr', Tag("out = 'Ringo Starr'")],
    ['paul','mccartney', Tag("out = 'Paul McCartney'")],
    ['george','harrison', Tag("out = 'George Harrison'")],
    ['barak','obama', Tag("out = 'Barrack Obama'")],
    ['barrack','obama', Tag("out = 'Barrack Obama'")]
])]
                 
grammar.test = [OneOf([['test', Tag("out = 'Paris Hilton'")], ['pizza', Tag("out = 'Angela Merkel'")]])];

grammar.$check();