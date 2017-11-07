/*jshint browser: true */
/*globals sb, Co */
/**
 * The purpose of this directive is to change the consumer and config frame based on selected card
 */
(function () {

    "use strict";
    "import Co.util.url, Co.util.comparator, sb.channel";

    sb.directive("menubar", function (urlUtil, comparator) {

        var SelectPage = this;
        var pageWr, pageList;
        var baseView = "route/base-view/",
            consumer = "consumer",
            pageOutLineView = 'outlineEditor';

        SelectPage.init = function (element, options) {
            this.i18nDictMenubar = Co.get(window, "imports.i18n.dictionaries.editor.directives.menubar") || {};
            this.element = element;
            this.setOptions(options);
            this.initSelectors();
            this.bindEvents();
        };

        SelectPage.handleExpandCollapseIconClick = function () {
            var searchField = document.querySelectorAll(".searchPages .search-wrapper input[type=search]")[0];
            if (searchField) {
                searchField.value = "";
            }
        };
        SelectPage.handleExpandCollapseIconClick.context = "pageSelectorDropdown";
        SelectPage.handleExpandCollapseIconClick.event = "click";

        
        SelectPage.pageOutlineButtonClickHandler = function () {
            if (this.pageSelectorDropdown.className.indexOf("plus") !== -1) {
                this.pageSelectorDropdown.click();
            }
        };
        SelectPage.pageOutlineButtonClickHandler.context = "pageOutlineButton";
        SelectPage.pageOutlineButtonClickHandler.event = "click";

        
        SelectPage.bindEvents = function () {
            var self = this;
            window.addEventListener('message', function (e) {
                if (e.data && e.data.action === "showPage") {
                    self.showPage(e);
                }
                if (e.data && e.data.action === "updatelandingpagename") {
                    self.updateLandingPageInfo(e.data.pages, e.data.data);
                }
            });

            this.editorChannel = sb.channel.create();
            this.editorChannel.pair("EditorContainer").then(function () {

                self.editorChannel.subscribe("PageContextUpdated", function (data) {
                    self.updateLandingPageInfo(data.pages, data.title);
                });

                self.editorChannel.subscribe("PageTitleUpdation", function () {
                    self.setSearchInputAttrs(self.dataPageNamePreviousVal, self.dataPagelabelPreviousVal);
                    self.updateSearchInput();
                });

            });

        };

        SelectPage.initSelectors = function () {
            this.dropdown = document.querySelector(".dropdown-icon");
            this.pageList = document.querySelector(".page-list");
            this.searchInput = document.getElementById('pageName');
            this.elements = document.querySelectorAll('[data-web-id]');
            this.editor = document.querySelector('[name=editor]');
            this.viewer = document.querySelector('[name=viewer]');
            pageWr = document.getElementsByClassName('page-list')[0];
            pageList = pageWr.querySelector('ul');
            this.searchArea = this.element.querySelector('.searchPages');
            this.siteToolWindow = document.querySelector("iframe[name='sitetools']").contentWindow;
            this.pageName = this.searchInput.getAttribute('data-page-name');
            this.pageLabel = this.searchInput.getAttribute('data-page-label') || "";
            this.pageSelectorDropdown = document.querySelector(".custom-dropdown.pageSelector");
            this.pageOutlineButton = document.querySelector("button.btn[data-title='Page Outline']");
            if (!this.pageName) {
                this.pageName = "HomePage";
            }
            this.mode = document.getElementById('mode').value;
        };

        SelectPage.findContext = function (e) {
            this.selectPage(e.target);
            $(e.target).siblings().removeClass('selected');
            e.target.classList.add('selected');
        };
        SelectPage.findContext.context = "elements";
        SelectPage.findContext.event = "click";

        
        //toggles list and displays all pages in the list with fixed height
        SelectPage.togglePages = function (e) {
            if (!this.isEnabled()) {
                return;
            }
            var target = e.target,
                isBarClicked;
            isBarClicked = target.dataset && target.dataset.bar;
            if (!isBarClicked) {
                var pageSelector = target.closest('[data-bar=true]');
                isBarClicked = pageSelector ? (pageSelector.dataset ? pageSelector.dataset.bar : "") : "";
            }
            
            if (isBarClicked) {
                
                if (this.isVisible()) {
                    this.hide();
                } else {
                    this.showAll();
                }
            }
        };
        SelectPage.togglePages.context = "element";
        SelectPage.togglePages.event = "click";

        
        SelectPage.isEnabled = function () {
            return !this.pageList.classList.contains("disabled");
        };

        SelectPage.isVisible = function () {
            return this.pageList.className.indexOf("height-zero") === -1;
        };

        SelectPage.show = function () {
            if (!this.isVisible()) {
                this.pageList.className = this.pageList.className.replace("height-zero", "height-maximum");
                this.dropdown.classList.add('rotate180');
                this.searchArea.classList.remove('hide');
                this.dropdown.parentElement.classList.add('plus');
            }
        };

        SelectPage.showAll = function () {
            if (!this.isVisible()) {
                var liElements = pageWr.querySelectorAll('ul li');
                for (var i = 0; i < liElements.length; i++) {
                    liElements[i].classList.remove("hide");
                    liElements[i].tabIndex = i + 1;
                }
                this.searchInput.innerText = this.i18nDictMenubar.selectAPage || "Select a page";
                this.show();
            }
        };

        SelectPage.hide = function () {
            if (this.isVisible()) {
                this.pageList.className = this.pageList.className.replace("height-maximum", "height-zero");
                this.dropdown.classList.remove('rotate180');
                this.updateSearchInput();
                this.searchArea.classList.add('hide');
                this.dropdown.parentElement.classList.remove('plus');
            }
        };

        //Selects the Dom Li Element from the searchbox that matches Id and posts message with changeUrl action
        SelectPage.showPage = function (e) {
            var message = e.data;
            var currentLi;
            if (message.data.pageId) {
                var query = "[data-selected-id='" + message.data.pageId + "']";
                currentLi = pageList.querySelector(query);
                if (currentLi) {
                    if (message.target === 'editor') {
                        this.selectPage(currentLi);
                    } else {
                        this.selectFromMenu(currentLi, e.data);
                    }
                }
            }
        };

        SelectPage.updateSearchInput = function () {
            this.searchInput.innerText = this.searchInput.getAttribute('data-page-name');
            var pageLabel = this.searchInput.getAttribute('data-page-label') || "";
            if (pageLabel) {
                this.searchInput.innerText += " ( " + pageLabel + " ) ";
            }
        };

        SelectPage.getPageName = function () {
            return this.searchInput.getAttribute('data-page-name') || "HomePage";
        };

        SelectPage.selectFromMenu = function (element, message) {
            this.setSearchInputAttrs(element.dataset.pageName, element.dataset.searchName);
            this.updateSearchInput();
            this.hide();
            this.sendMessage('viewer', message.data.url, message.data.pageName);
        };

        SelectPage.setSearchInputAttrs = function (pageName, pageLabel) {
            this.dataPageNamePreviousVal = this.searchInput.getAttribute('data-page-name') || "HomePage";
            this.dataPagelabelPreviousVal = this.searchInput.getAttribute('data-page-label') || "";
            this.searchInput.setAttribute('data-page-name', pageName);
            this.searchInput.setAttribute('data-page-label', pageLabel);
        };

        SelectPage.updateLiveSiteUrl = function (pageName) {
            //Send the message to site tools iframe and update live site link href
            var msgData = {
                target: 'siteTool',
                action: 'updateLiveSiteUrl',
                data: {
                    pageName: pageName
                }
            };
            this.siteToolWindow.postMessage(msgData, '*');
        };

        SelectPage.selectPage = function (e) {
            this.selectedPage = e.dataset.pageName;
            this.hide();
            this.setSearchInputAttrs(e.dataset.pageName, e.dataset.searchName || "");
            this.updateSearchInput();
            this.setUrls(e);
            this.redirectToPage(e);
            this.updateLiveSiteUrl(this.getPageName());

        };
        SelectPage.selectPage.context = "selectPage";
        SelectPage.selectPage.event = "click";

        
        SelectPage.setUrls = function (element) {
            var view = element.dataset && element.dataset.view;
            if (!view) {
                view = pageOutLineView;
            }
            this.editorURL = this.getUrl(view, false, false);
            this.viewerURL = this.getUrl(consumer, true, true);
        };

        SelectPage.getUrl = function (view, allStyles, isConsumer, pageName) {
            var queryParams = this.getQueryParams(isConsumer);

            //Get the selected page name for newly created page
            if (pageName) {
                queryParams.configCtx.page = pageName;
            }

            var url = baseView + view + "?" + urlUtil.formatQuery(queryParams);
            if (allStyles) {
                url = url + "&allStyles=true";
            }
            return url;
        };

        SelectPage.getQueryParams = function (isConsumer) {
            var params = {
                configCtx: {
                    webId: this.webId,
                    locale: this.locale,
                    page: this.selectedPage,
                    version: this.version
                }
            };
            if (isConsumer) {
                params.addDesign = this.addDesignParam;
                params.webId = this.webId;
                params.locale = this.locale;
                params.nextGen = 'true';
            }
            return params;
        };

        SelectPage.redirectToPage = function (e) {
            if (e.dataset && e.dataset.view !== 'siteEditor') {
                this.sendMessage('viewer', this.viewerURL, this.getPageName());
            }
            //this.sendMessage('editor', this.editorURL);
            // TODO: Refactor
            this.editorChannel.publish("PageContextChanged", {
                url: this.editorURL,
                isChild: (e.dataset.pageName === "New Page")
            });

            this.editorChannel.publish("CloseChildModals", {});

        };

        SelectPage.sendMessage = function (target, url, pageName) {
            var message;
            message = {
                source: 'editor',
                target: target,
                action: 'changeUrl',
                status: 'pending',
                data: {
                    url: url
                }
            };
            if (pageName) {
                message.data.pageName = pageName;
            }
            window.postMessage(message, '*');
        };

        SelectPage.updateLandingPageInfo = function (pages, data) {
            var self = this;
            var selectedPage;
            var pageList = document.querySelector('.page-list');
            var ul = pageList.querySelector('ul');
            Co.directive.deactivate(self.element);
            pages = self.sort(pages);
            var frag = document.createDocumentFragment();
            pages.forEach(function (page) {
                var li = document.createElement('li');
                li.setAttribute('data-search-name', page.label || "");
                li.setAttribute('data-search-fallbackname', page.name || "");
                li.setAttribute('data-page-name', page.name || "");
                li.setAttribute('data-selected-id', page.name || "");
                li.setAttribute('data-web-id', self.webId || "");
                li.setAttribute('data-locale', self.locale || "");
                li.setAttribute('data-version', self.version || "");
                li.setAttribute('sb-naventer', "");
                li.innerHTML = page.name + " ( " + page.label + " ) ";
                if (page.label === data) {
                    selectedPage = page;
                    li.setAttribute('class', "selected");
                }
                frag.appendChild(li);
            });
            ul.innerHTML = "";
            ul.appendChild(frag);
            Co.directive.activate(self.element);
            self.setSearchInputAttrs(selectedPage.name, selectedPage.label);
            self.updateSearchInput();

            //Reloading editor and viewer iframe with the newly created page name
            this.editorURL = this.getUrl("outlineEditor", false, false, selectedPage.name);
            this.viewerURL = this.getUrl(consumer, true, true, selectedPage.name);
            // this.sendMessage('editor', this.editorURL);
            this.sendMessage('viewer', this.viewerURL, selectedPage.name);
        };

        SelectPage.sort = function (pages) {
            pages = pages && pages.sort(function (page1, page2) {
                return comparator.compare(page1, page2, 'name');
            });
            return pages;
        };

    }).requires(Co.util.url, Co.util.comparator);
})();
