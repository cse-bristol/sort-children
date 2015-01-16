"use strict";

/*global module, require*/

var d3 = require("d3"),
    sortChildren = require("./js/sort-children.js"),
    body = d3.select(document.body),
    listContainer = body.append("div"),
    data = "abcdefghi",
    list = listContainer.selectAll("div")
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
	}),
    movedEl = body.append("div");
	
sortChildren(newList, function(moved, from, to) {
    movedEl.text("Moved " + d3.select(moved).datum() + " from " + from + " to " + to + ".");
});
