/**
 * Created by patnaikn on 5/25/17.
 */
/*globals sb*/
sb.directive("adminmodalwrappermodal", function () {
    "use strict";

    var Dir = this;
    var Static = this["static"];

    Dir.init = function (element, options) {
        var self = this;
        this.element = element;
        this.setOptions(options);

        Static.pairs = Static.pairs || [];
        if (Static.pairs.indexOf(this.view) >= 0) {
            return;
        }

        self.channel = sb.channel.create();
        self.channel.pair(this.view).then(function () {
            Static.pairs.push(self.view);
            self.channel.subscribe("jsonResponse", function (data) {
                // DO ALL THE MODIFICATIONS HERE
                // LIKE UPDATING CARD ID IN DATA-HREF etc
                self.element.dispatchEvent(new CustomEvent("selfUpdate", {
                    detail: {
                        data: data,
                        modal: self.element
                    },
                    bubbles: true
                }));
            });
        });
    };
});