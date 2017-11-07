/**
 * Created by sagares on 22/05/17.
 */

(function () {
    "use strict";
    "import sb.channel"
    sb.directive("contentblockpopup", function () {
        var popupLoader = this;
        popupLoader.init = function (element, options) {
            this.element = element;
            var popUpOuter = document.getElementById("hiddenContentBlockPopUpOuter");
            var popIframe = document.getElementById('contentBlockPopupIframe');
            var self = this;
            this.setOptions(options);

            this.channel = sb.channel.create();
            this.channel.pair("ContentBlocks");
            this.channel.subscribe("contentBlockShow", function (data) {
                popIframe.src = data.url;
                popUpOuter.classList.add('contentBlockOpened');
                self.preloader(true);
                popIframe.addEventListener("load", function () {
                    self.preloader(false);
                });
            });

            this.channel.subscribe("closeContentBlock", function (data) {
                popUpOuter.classList.remove('contentBlockOpened');
            });


        };

        popupLoader.preloader = function (val) {
            var event = new CustomEvent('preloader', {
                "detail": val
            });
            document.body.dispatchEvent(event);
        };

    }).requires();
}());



