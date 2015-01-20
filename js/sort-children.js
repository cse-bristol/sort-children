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

	findDragTarget = function(parent, draggingElement) {
	    var draggingMid = draggingElement.offsetTop + (draggingElement.offsetHeight / 2),
		target = selection.filter(
		    function(d, i) {
			var ourBottom = this.offsetTop + this.offsetHeight;
			
			if (this === draggingElement) {
			    return false;
			    
			} else {
			    // The middle of the element being dragged is between our top and our bottom.
			    return (ourBottom > draggingMid) &&
				(this.offsetTop < draggingMid);
			}
		    }
	    );
	    
	    if (target.empty()) {
		return null;

	    } else
		return target[0][0];
	},

	dragSort = d3.behavior.drag()
	    .origin(function(d, i) {
		return {
		    x: 0,
		    y: 0
		};
	    })
	    .on("dragstart", function(d, i) {
		d3.event.sourceEvent.stopPropagation();
		d3.event.sourceEvent.preventDefault();

		startIndex = findChildIndex(this);
		height = this.offsetHeight + "px";
	    })
	    .on("drag", function(d, i) {
		d3.event.sourceEvent.stopPropagation();
		d3.event.sourceEvent.preventDefault();
		
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
		target = findDragTarget(this.parentNode, this);

		if (target) {
		    displaced = d3.selectAll(
	    		movedDown ? 
	    		    findSiblingsBetween(this, target).concat([target]) :
	    		    [target].concat(findSiblingsBetween(target, this)))
	    		.filter(function(d, i) {
	    		    return d3.select(this).classed(dragClass);
	    		})
	    		.style("position", "relative")
	    		.style("top", movedDown ? "-" + height : height);
		}
	    })
	    .on("dragend", function(d, i) {
		d3.event.sourceEvent.stopPropagation();
		d3.event.sourceEvent.preventDefault();

		var parent = this.parentNode;

		d3.select(parent)
		    .selectAll("." + dragClass)
		    .style("position", null)
		    .style("left", null)
		    .style("top", null);

		if (target) {
		    var startPosition = Array.prototype.indexOf.call(parent.children, this);
		    
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
			callback(
			    this,
			    startPosition,
			    Array.prototype.indexOf.call(parent.children, this)
			);
		    }
		}

		startIndex = null,
		height = null,
		target = null,
		displaced = null;
	    });

    selection
	.classed(dragClass, true)
	.call(dragSort);
};
