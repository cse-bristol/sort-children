"use strict";

/*global module, require*/

var d3 = require("d3"),
    sortChildren = require("./src/sort-children.js"),
    body = d3.select(document.body),
    movedEl = body.append("div"),
    movedDownEl = body.append("div"),
    displacedEl = body.append("ul"),
    data = "abcdefghi",
    list = body.selectAll("div")
	.data(
	    data,
	    function(d, i) {
		return d;
	    }
	),
    newList = list.enter()
	.append("div")
	.style("border", "1px solid black")
	.style("border-collapse", "collapse")
	.style("font-size", "xx-large")
	.style("display", "block")
	.style("width", "1em")
	.style("text-align", "center")
	.style("font-family", "monospace")
	.text(function(d, i) {
	    return d;
	});
	
sortChildren(newList, function(moved, movedDown, displaced){
    movedEl.text(d3.select(moved).datum());
    movedDownEl.text(movedDown ? "down" : "up");
    var li = displacedEl.selectAll("li")
	.data(
	    displaced.data(), 
	    function(d, i) {
		return d;
	    }
	);

    li.exit().remove();
    li.enter().append("li")
	.text(function(d, i) {
	    return d;
	});
});