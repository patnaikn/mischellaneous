/*jshint browser: true */
/*globals sb*/
"import sb.channel";

sb.directive("confirmdialog", function () {
    "use strict";
    var Directive = this;

    Directive.init = function (element, options) {
        // register activated element
        this.element = element;
        this.proceedLabel = "yes";
        this.abortLabel = "no";
        // set options passed from the views
        // valid options:
        // <message>: Title for the dialog
        // <proceedLabel>: yes, reset (make sure data attribute is added in confirmDialog.html)
        // <abortLabel>: no, cancel (make sure data attribute is added in confirmDialog.html)
        this.setOptions(options);
        // register confirmation dialog elements
        this.registerElements();
    };

    // Register all required elements
    Directive.registerElements = function () {
        // Confirm dialog element, added in wrapper.html
        this.confirmationDialog = document.querySelector('.editor-confirm') || document.createElement("div");
        // Title element
        this.titleElement = this.confirmationDialog.querySelector('.editor-confirm_text');
        // Abort/Cancel button
        this.abortButton = this.confirmationDialog.querySelector('[data-action="abort"]');
        // Proceed/Done button
        this.proceedButton = this.confirmationDialog.querySelector('[data-action="proceed"]');
    };

    // Show confirmation dialog
    Directive.showDialog = function () {
        // set title message
        //check for pageOutline change
        if (this.warn && this.confirm){
            this.titleElement.innerHTML = this.warn + '<br />' + this.message + '<br />' + this.confirm;
        }else {
            this.titleElement.innerHTML = this.message;
        }

        // set button labels
        this.proceedButton.innerHTML = this.confirmationDialog.dataset[this.proceedLabel];
        this.abortButton.innerHTML = this.confirmationDialog.dataset[this.abortLabel];

        // add show mutator class
        this.confirmationDialog.classList.add("show");
    };

    // Close confirmation dialog
    Directive.closeDialog = function () {
        // reset title
        this.titleElement.innerHTML = "";
        // reset button labels
        this.proceedButton.innerHTML = this.confirmationDialog.dataset.yes;
        this.abortButton.innerHTML = this.confirmationDialog.dataset.no;
        // remove show class mutator
        this.confirmationDialog.classList.remove('show');
        // reset values for continuity
        if (this.clickedElement) {
            // reset confirm dataset on target element clicked
            this.clickedElement.dataset.confirmed = false;
        }
        // reset clicked element value
        this.clickedElement = false;
    };

    // Event handlers
    // Attach click event handler to the element
    Directive.clickHandler = function (e) {
        // element is the current target on which the event is bound
        var clickedElement = e.currentTarget;
        // cache the dataset property of the element
        var dataset = clickedElement.dataset;

        // register current target clicked element
        // this will be used by proceed handler
        this.clickedElement = clickedElement;

        // check the elements confirm dataset value
        // confirm dataset value is set by proceed and abort handlers
        // if the value is truthy, proceed with natural behavioral flow
        if (dataset.confirmed !== "true") {
            // show confirmation dialog if the value is falsy
            this.showDialog();
            // prevent default behavior and event propagation
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    };
    Directive.clickHandler.context = "element";
    Directive.clickHandler.event = "click";

    // Attach a click handler to the proceed button
    Directive.proceedHandler = function () {
        // check for clicked element
        if (this.clickedElement) {
            // set confirm status on target element
            // when set to truthy, elements click handler executes default workflow
            this.clickedElement.dataset.confirmed = true;
            // dispatch click event to execute custom or default handlers on the element
            try{
                this.clickedElement.dispatchEvent(new Event("click", {
                    bubbles: true,
                    cancelable: true
                }));
            }catch(error){
                //workaround for IE11
                this.clickedElement.click();
            }
        }
        // close confirmation dialog
        this.closeDialog();
    };
    Directive.proceedHandler.context = "proceedButton";
    Directive.proceedHandler.event = "click";

    // Attach a click handler to the abort button
    Directive.abortHandler = function () {
        // close confirmation dialog
        this.closeDialog();
    };
    Directive.abortHandler.context = "abortButton";
    Directive.abortHandler.event = "click";
});
