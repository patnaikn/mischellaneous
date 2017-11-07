/*globals sb*/
sb.directive("outlineinteraction", function () {

    "use strict";

    "import sb.channel";

    var Interaction = this;

    var _classNames = {
        active: "active"
    };

    Interaction.init = function (element, options) {
        this.i18nDictMessages = Co.get(window, "imports.i18n.dictionaries.editor.directives.messages") || {};
        this.element = element;
        this.fragmentId = "";
        this.setOptions(options);
        this.titles = this.element.querySelectorAll(".title");
        this.addCardCtaLinks = this.element.querySelectorAll(".cta-addCard");
        this.currentSelectedCard = this.element.querySelector(".card.active");
        this.propertySelector = this.element.querySelectorAll("[title='properties']");
        this.styleSelector = this.element.querySelectorAll("[title='style']");
        this.grabbers = this.element.querySelectorAll(".grabber, .grabberBar, .deck .card:not(.lock-position) > .content > .title");
        this.carddata = {};

        //TODO: Not a fan of this implementation, calls for Refactoring
        var modal = this.element.closest("[data-modal]");
        var settings = modal && modal.dataset.modalSettings && JSON.parse(modal.dataset.modalSettings);
        var self = this;
        if (this.modal && settings) {
            var mapProps = {
                fragmentId: "interactedCardId",
                selectedName: "selectedName",
                parentId: "parentCardId",
                interactionType: "interactionType",
                replaceFragmentId: "interactionCardToReplace",
                replaceFragmentName: "interactionCardNameToReplace"
            };
            Object.keys(mapProps).forEach(function (key) {
                var setting = settings[mapProps[key]];
                if (setting) {
                    self[key] = setting;
                }
            });
        }

        // Pair with LivePreview channel
        this.channel = sb.channel.create();
        this.channel.pair("LivePreview");

        this.callHandlers();


    };

    Interaction.setReloadFlag = function () {
        this.channel.publish("loadNonOutlineView", {doReload:false});

    };
    Interaction.setReloadFlag.context = "propertySelector styleSelector";
    Interaction.setReloadFlag.event = "click";

    Interaction.callHandlers = function () {
        var interactionHandler = this.interactionType && (this.interactionType + "Handler");

        if (interactionHandler && this[interactionHandler]) {
            this[interactionHandler]();
        } else {
            this.broadcast("removeAddCardPreview");
        }
        if (this.fragmentId || this.selectedName) {
            this.openCardForEdit(this.fragmentId, this.selectedName);
        }
    };

    Interaction.changePageOutlineHandler = function () {
        this.broadcast("windowReload");
    };

    Interaction.addCardToOutlineHandler = function () {
        this.broadcast("addNewFragment", {
            fragmentId: this.fragmentId,
            parentId: this.parentId
        });
    };

    Interaction.deleteCardFromOutlineHandler = function () {
        this.broadcast("deleteFragment", {
            fragmentId: this.fragmentId
        });
    };

    Interaction.replaceCardInOutlineHandler = function () {
        this.broadcast("replaceFragment", {
            fragmentId: this.fragmentId,
            replaceFragmentId: this.replaceFragmentId
        });
    };

    Interaction.editCardInOutlineHandler = function () {
        var self = this;
        var edited = document.querySelector("section[name='" + this.replaceFragmentName + "']"); //Outline DOM takes longer time to render
        Co.when(edited).then(function (edited) {
            self.replaceFragmentId = self.fragmentId;
            self.fragmentId = edited && edited.getAttribute("id") || "";
            self.replaceCardInOutlineHandler();
        });
    };

    Interaction.openCardForEdit = function (id, cardName) {
        var elem = document.querySelector('[id="' + id + '"]') || document.querySelector('[name="' + cardName + '"]');
        if (elem) {
            this.setActiveCard(elem);
            var outline = document.querySelector('[template=pageConfigurator]') || document.querySelector('.base-view-outlineEditor');
            var elementTop = document.querySelector('.active').getBoundingClientRect().top;
            var outlineMid = outline.clientHeight / 2;
            if (elementTop > outlineMid) {
                var diff = elementTop - outlineMid;
                $(outline).animate({
                    scrollTop: diff + 40
                })
            }
        }
    };

    // Event Handlers
    Interaction.clickTitle = function (evt) {

        var card = evt.currentTarget.parentNode.parentNode;
        var isActive = card.classList && card.classList.contains(_classNames.active);

        if (isActive) {
            this.closeActionTray(card);
        } else {
            this.setActiveCard(card);
        }
    };
    Interaction.clickTitle.context = "titles";
    Interaction.clickTitle.event = "click";

    Interaction.closeActionTray = function (card) {
        var self = this;
        card && card.classList.remove(_classNames.active);
        self.currentSelectedCard = null;
        self.carddata.cardId = null;
    };

    Interaction.setActiveCard = function (card) {
        var self = this;
        self.currentSelectedCard && self.currentSelectedCard.classList.remove(_classNames.active);

        card.classList.add(_classNames.active);
        self.currentSelectedCard = card;
        self.carddata.cardId = card.id;

        self.broadcast("highlightCard");
    };

    Interaction.enterAddCard = function () {
        this.broadcast("showAddCardPreview");
        this.showPlaceholder();
    };
    Interaction.enterAddCard.context = "addCardCtaLinks";
    Interaction.enterAddCard.event = "mouseenter";

    Interaction.leaveAddCard = function () {
        if (!this.addCardInProgress) {
            this.broadcast("removeAddCardPreview");
            var parentNode = this.placeholder && this.placeholder.parentNode;
            parentNode && parentNode.removeChild(this.placeholder);
        }
        this.removePlaceholder();
    };
    Interaction.leaveAddCard.context = "addCardCtaLinks";
    Interaction.leaveAddCard.event = "mouseleave";

    Interaction.clickAddCard = function () {
        this.addCardInProgress = true;
    };
    Interaction.clickAddCard.context = "addCardCtaLinks";
    Interaction.clickAddCard.event = "click";

    Interaction.enterGrabber = function (evt) {
        if (this.isSortTreeV2Enabled && this.isSortTreeV2Enabled === true || this.isSortTreeV2Enabled === 'true') {
            this.element.classList.add("fade");
            removePreviousHighlightedCards();
            var selectedCard = evt.currentTarget.closest('.card');
            highLightEligibleCards(selectedCard);
        } else {
            this.element.classList.add("fade");
            evt.currentTarget.closest(".deck").classList.add("highlightHovered");
        }
    };

    function removePreviousHighlightedCards() {
        var previouslyHighlightedEle = document.querySelectorAll('.highlightHovered');
        previouslyHighlightedEle && [].forEach.call(previouslyHighlightedEle, function (ele) {
            ele.classList.remove('highlightHovered');
        });
    }

    function highLightEligibleCards(selectedCard) {
        var selectedRegion = selectedCard.getAttribute('partitionclass');
        var selectedCardLevel = selectedRegion.split('-')[0];
        var elements = document.querySelectorAll('[sectionname="' + selectedCard.getAttribute('sectionname') + '"]');
        elements && [].forEach.call(elements, function (element) {
            var elementRegion = element.getAttribute('partitionclass');
            var elementLevel = elementRegion && elementRegion.split('-')[0];
            if (elementLevel !== selectedCardLevel || elementRegion === selectedRegion) {
                element.classList.add('highlightHovered');
            }
        });
    }

    Interaction.enterGrabber.context = "grabbers";
    Interaction.enterGrabber.event = "mouseenter";

    Interaction.leaveGrabber = function (evt) {
        this.element.classList.remove("fade");

        evt.currentTarget.closest(".deck").classList.remove("highlightHovered");
    };
    Interaction.leaveGrabber.context = "grabbers";
    Interaction.leaveGrabber.event = "mouseleave";

    Interaction.showPlaceholder = function () {
        var elm = document.createElement("div");
        elm.classList.add("addCardPlaceholder");
        elm.innerHTML = this.i18nDictMessages.newCard || "New Card";

        var deck = this.currentSelectedCard && this.currentSelectedCard.querySelector(".deck");
        deck && deck.appendChild(elm);
        this.placeholder = elm;
    };

    Interaction.removePlaceholder = function () {
        var parentElm = this.currentSelectedCard.querySelector(".deck");
        var elm = document.querySelector('.addCardPlaceholder');
        if (elm) {
            parentElm.removeChild(elm);
        }
    };

    Interaction.broadcast = function (action, data) {

        var self = this;

        var message = {
            source: 'editor',
            target: 'viewer',
            action: action,
            status: 'pending',
            data: data || self.carddata
        };
        // TODO: SIMPLIFY DATA, currently sending as it is to avoid major changes
        self.channel.publish("OutlineInteraction", {data: message});
    };

});