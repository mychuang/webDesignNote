"use strict";
var message = "Hello World";
function test(b) {
    if (b) {
        return '20';
    }
    else {
        return 20;
    }
}
function say(something) {
    console.log(something);
}
var nestedObject = {
    prop: 'Hello',
    child: {
        prop1: 123,
        prop2: false
    }
};
console.log(nestedObject);
var aFunction = function () {
    console.log('hi');
};
var week;
(function (week) {
    week[week["w1"] = 0] = "w1";
    week[week["w2"] = 1] = "w2";
    week[week["w3"] = 2] = "w3";
})(week || (week = {}));
;
