/* globals Co, sb */

"import sb.channel, Co.util.agent";

sb.directive("pagecontextchange", function (agent) {
    "use strict";

    var Dir = this;

    Dir.init = function (element, options) {
        this.setOptions(options);
        this.element = element;

        if (this.isPageOutline) {
            this.handlePageContextChange();
        }
    };

    Dir.handlePageContextChange = function () {
        var that = this;
        this.modal = this.element.closest("[data-modal]");
        // TODO: ModalManager: this.modal.getSettings();
        var modalSettings = this.modal.dataset.modalSettings;
        modalSettings = modalSettings && JSON.parse(modalSettings);
        var pageTitle = modalSettings && modalSettings.pageTitle;

        var channel = sb.channel.create();
        channel.pair("EditorContainer").then(function () {
            channel.subscribe("PageContextChanged", that.changeContext.bind(that));

            if (pageTitle) {

                var service = {
                    "static": {
                        fullId: "Co.service.pages"
                    }
                };

                Co.when(agent.proxy(service, "load", [])).then(function (pages) {
                    channel.publish("PageContextUpdated", {
                        pages: pages,
                        title: pageTitle || ""
                    });
                });
            }
        });
    };

    Dir.changeContext = function (data) {

        var url = data.url;

        if (data.isChild) {
            var ancElm = document.createElement("a");
            ancElm.href = url;
            ancElm.style.visibility = "hidden";
            this.modal.appendChild(ancElm);
            try{
                ancElm.dispatchEvent(new Event("click", {
                    bubbles: true
                }));
            }catch (error){
                //workaround for IE11.
                ancElm.click();
            }

        } else {
            this.modal.dataset.modalHref = url;
            this.modal.dispatchEvent(new CustomEvent("selfUpdate", {
                bubbles: true
            }));
        }
    };

}).requires(Co.util.agent);