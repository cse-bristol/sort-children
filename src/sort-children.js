"use strict";

/*global module, require*/

var d3 = require("d3"),
    dragClass = "drag-reorder";

/*
 Adds d3 drag behaviour to statically positioned elements.
 When dropped, if they are dropped onto an element in the same parent container, they will move above that element in the list.
 This may push all the other children in the container around.

 The elements will be moved at the end of the drag action.
 */

var findChildIndex = function(node) {
    var i = 1;
    while ((node = node.previousElementSibling)) {
	i++;
    }

    return i;
};

var findDragTarget = function() {
    var target = document.elementFromPoint(
	d3.event.sourceEvent.clientX, 
	d3.event.sourceEvent.clientY);

    while (target) {
	if (target === document) {
	    return null;
	}

	var targetSelection = d3.select(target);
	if (targetSelection.classed(dragClass)) {
	    return target;
	} else {
	    target = target.parentNode;
	}
    }
    return null;
};

var findSiblingsBetween = function(first, second) {
    if (!first || !second) {
	return [];
    }

    var siblings = [],
	node = first.nextElementSibling;

    while (node && node !== second) {
	siblings.push(node);
	node = node.nextElementSibling;
    }

    return siblings;
};

module.exports = function(selection, callback) {
    var startIndex,
	height,
	movedDown,
	target,
	displaced,
	toClear = d3.set();

    var dragSort = d3.behavior.drag()
	    .origin(function(d, i) {
		return {
		    x: 0,
		    y: 0
		};
	    })
	    .on("dragstart", function(d, i) {
		d3.event.sourceEvent.stopPropagation();

		startIndex = findChildIndex(this);
		height = this.offsetHeight + "px";
		d3.select(this).style("pointer-events", "none");
	    })
	    .on("drag", function(d, i) {
		d3.event.sourceEvent.stopPropagation();

		if (displaced) {
		    displaced
			.style("position", null)
			.style("left", null)
			.style("top", null);
		}
		
		d3.select(this)
		    .style("position", "relative")
		    .style("top", d3.event.y + "px")
		    .style("left", d3.event.x + "px");

		movedDown = d3.event.y > 0;
		target = findDragTarget();

		if (target === this) {
		    return;
		}

		displaced = d3.selectAll(
		    movedDown ? 
			findSiblingsBetween(this, target).concat([target]) :
			[target].concat(findSiblingsBetween(target, this)))
			.filter(function(d, i) {
			    return d3.select(this).classed(dragClass);
			})
			.style("position", "relative")
			.style("top", movedDown ? "-" + height : height);
	    })
	    .on("dragend", function(d, i) {
		d3.event.sourceEvent.stopPropagation();

		var parent = this.parentNode;

		d3.select(parent)
		    .selectAll("." + dragClass)
		    .style("position", null)
		    .style("left", null)
		    .style("top", null);

		d3.select(this).style("pointer-events", null);

		if (!target || target === this) {
		    // NO-OP: missed the list
		} else {
		    parent.removeChild(this);

		    if (movedDown) {
			target = target.nextElementSibling;
			if (target) {
			    parent.insertBefore(this, target);
			} else {
			    parent.appendChild(this);
			}
		    } else {
			parent.insertBefore(this, target);
		    }

		    if (callback) {
			callback(this, movedDown, displaced);
		    }
		}
	    });

    selection
	.classed(dragClass, true)
	.call(dragSort);
};