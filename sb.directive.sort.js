/*jshint es3: false, forin: true, freeze: true, latedef: true, newcap: false, strict: true, undef:true, camelcase: true, curly: true, eqeqeq: false, immed: true, lastsemic: true, onevar: true, quotmark: double, unused:true, maxdepth: 4, maxcomplexity: 5 */
/*globals $, base, describe, it, expect, Co, waitsFor, runs */

sb.directive("sort", function () {

    "use strict";

    /*
     * Re-order drag-and-drop lists
     *
     * */

    var Sort = this;

    // ClassName
    var _classNames = {
        active: "active",
        clone: "clone",
        current: "current",
        target: "target",
        added: "added"
    };

    Sort.init = function (element, options) {
        this.setOptions(options);
        this.element = element;
        this.draggables = this.element.querySelectorAll(this.selector || "li");

        this.setAttributes();
    };

    // Set draggable attributes to list items
    Sort.setAttributes = function () {
        var self = this;
        [].forEach.call(self.draggables, function (sortable) {
            sortable.setAttribute("draggable", "true");
        });
    };

    // Dom Event handlers

    // Handle DragStart event®
    Sort.dragstart = function (e) {
        var dragtransfer;

        this.candidate = e && e.currentTarget;
        this.candidateHeight = this.candidate.offsetHeight;
        this.candidateParent = this.candidate.parentNode;

        this.addClass(this.candidate, "active");

        dragtransfer = e.originalEvent && e.originalEvent.dataTransfer;
        dragtransfer.setData("text/plain",this.candidate.id);
        dragtransfer.effectAllowed = "move";
        dragtransfer.setDragImage(this.candidate, this.dragImageLeft, this.candidateHeight / 2);

        var self = this;
        setTimeout(function () {
            self.addClass(self.candidate, "current"); //This class name change should not impact drag image
        }, 0);

        e.stopPropagation && e.stopPropagation();
    };
    Sort.dragstart.context = "draggables";

    // Handle DragEnter event
    Sort.dragenter = function (e) {

        var self = this;
        var target = e.target;
        var droppable = e.currentTarget;
        //var isDroppableContainer = (target.nodeName === "UL") && (!target.children.length);

        if (!self.previeMode) { // || isDroppableContainer
            self.previeMode = true;

            var rect = droppable.getBoundingClientRect();
            this.yaxis = (e.originalEvent.clientY - rect.top) / (rect.bottom - rect.top);

            /*if (isDroppableContainer) { //Allow drops on empty <UL/> elements
                self.dropParent = target;
                self.dropTarget = null;
            } else {
                self.dropParent = droppable.parentNode; //Handle Drop on <li> elements
                self.dropTarget = droppable;
            }*/

            self.dropParent = droppable.parentNode; //Handle Drop on <li> elements
            self.dropTarget = droppable;

            self.setTargetClass(droppable);
            if (self.dropParent === self.candidateParent) {
                self.showPlaceholder();
            }

            setTimeout(function () {
                self.previeMode = false;
            }, 400);
        }

        e.stopPropagation();
        e.preventDefault();
    };
    Sort.dragenter.context = "draggables";

    // Handle DragEnd event
    Sort.dragend = function (e) {
        var self = this;

        self.removePlaceholder();
        self.removeTargetClass();

        if(self.dropParent === self.candidateParent) {
            self.dropElement();
            self.addClass(self.candidate, "added");
            self.element.dispatchEvent(new CustomEvent("sortcomplete", {cancelable: true})); // Other controllers can listen to this
        } else {
            self.removeClass(self.candidate, "active");
            console.log("Multilevel operation not allowed");
        }

        self.removeClass(self.candidate, "current");

        e.stopPropagation();
        e.preventDefault();
    };
    Sort.dragend.context = "draggables";

    // Show drop placeholder
    Sort.showPlaceholder = function () {
        var self = this;
        var target = self.dropTarget;
        var placeholder = self.getPlaceHolder();

        var sibling = (self.yaxis > 0.5) ? "nextElementSibling" : "previousElementSibling";
        var isCloneSibling = target && target[sibling] && target[sibling].classList.contains(_classNames.clone);

        if (!isCloneSibling) {
            self.removePlaceholder();
            self.dropElement(placeholder);
        }

        setTimeout(function () {
            placeholder.style.height = self.candidateHeight + "px";
        }, 10);
    };

    // Drop element to specific target
    Sort.dropElement = function (elm) {
        var self = this;

        var parent = self.dropParent;
        var target = self.dropTarget;
        var candidate = elm || self.candidate;
        var pos = self.yaxis > 0.5;

        if (parent && target) {

            var next = target.nextElementSibling;

            if (pos) {

                if (next) {
                    parent.insertBefore(candidate, next);
                } else {
                    parent.appendChild(candidate);
                }

            } else {
                parent.insertBefore(candidate, target)
            }

        } else {
            parent.appendChild(candidate);
        }
    };

    // Remove placeholder element
    Sort.removePlaceholder = function () {
        var placeholder = this.element.querySelector("." + _classNames.clone);
        placeholder && placeholder.parentNode.removeChild(placeholder);
    };

    Sort.getPlaceHolder = function () {
        var placeholder = document.createElement("span");
        placeholder.classList.add(_classNames.clone);
        return placeholder;
    };

    // Set target class name to potential target element
    Sort.setTargetClass = function (elm) {
        var self = this;

        self.removeTargetClass();
        self.addClass(elm, "target");
    };

    // Remove target class from all drop targets
    Sort.removeTargetClass = function () {
        var self = this;
        var targetElms = self.element.querySelectorAll("." + _classNames.target);
        targetElms && [].forEach.call(targetElms, function (targetElm) {
            self.removeClass(targetElm, "target");
        })
    };

    // Helper to add class
    Sort.addClass = function (elm, name) {
        elm.classList.add(_classNames[name]);
    };

    // Helper to remove class
    Sort.removeClass = function (elm, name) {
        elm.classList.remove(_classNames[name]);
    };
});