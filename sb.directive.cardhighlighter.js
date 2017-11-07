/*globals sb*/
(function() {

    "use strict";
    "import Co.util.url";

    sb.directive("cardhighlighter", function () {
        /*
         Purpose : Highlight/RemoveHighlight element from viewer frame, when hovered from editor frame.

         This directive accepts a unique id (cardId for card, and navigation name for navigation).
         And then sends respective message to base.siteeditor.cardHighlight

         */
        var CardHighlighter = this;

        CardHighlighter.init = function (element, options) {
            this.options = options;
            this.setOptions();
            this.element = element;
        };

        CardHighlighter.highlightCard = function(e){

            var self = this, data = {};

            if(self.id){
                /*
                 If the directive is applied on card element
                 */
                data.cardId = self.id;
            }
            else{
                /*
                 If the directive is applied on navigation element
                 */
                data.tabSelector = self.getSelector(self.tabName);
            }
            var message = {
                source: 'editor',
                target: 'viewer',
                action: 'highlightCard',
                status: 'pending',
                data: data
            };
            window.parent.postMessage(message, '*');
        };

        CardHighlighter.getSelector = function (element) {
            var selector = "div.navigation>ul>li:contains('" + element + "')";
            return selector;
        };

        CardHighlighter.highlightCard.context = "element";
        CardHighlighter.highlightCard.event = "click";

    });
})();