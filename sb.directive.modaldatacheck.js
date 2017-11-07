/*globals Co, sb*/

"import sb.channel";

sb.directive("modaldatacheck", function () {

    "use strict";

    var Dir = this;

    Dir.init = function (element, options) {
        this.element = element;
        this.setOptions(options);
        this.closeElement = this.element.querySelector(".modal-close"); //TODO: Can be enhanced to handle other selectors

        if (this.closeElement) {
            this.closeElement.setAttribute("sb-confirmdialog", "message:" + this.message);
            Co.directive.activate(this.closeElement);
            this.closeElement.dataset.confirmed = true;
        }
    };

    Dir.enableConfirmDialog = function () {

        if (this.closeElement) {
            this.closeElement.dataset.confirmed = false;
        }
    };

    Dir.changeHandler = function(e) {

        var targetElm = e.target;
        if (targetElm) {
            this.enableConfirmDialog();
        }
    };

    Dir.changeHandler.context = "element";
    Dir.changeHandler.event = "change";

});
