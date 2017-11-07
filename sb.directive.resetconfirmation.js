/**
 * Created by patnaikn on 3/22/17.
 * The purpose of this directive is to show confirmation dialog box when someone tries to restore the default state of any card*/


(function () {
    "use strict";

    sb.directive("resetconfirmation", function () {

        var confirm = this;
        var self;

        confirm.init = function (element, options) {
            self = this;
            this.setOptions(options);
            self.element = element;
            this.initDialogBox();
            this.initSelectors();

        };

        confirm.initDialogBox = function() {
            this.dialogBox = this.createDialog();

        }

        confirm.initSelectors = function() {

            this.links = this.element.querySelectorAll('.restore-default:not(.restore-disabled)');
            this.cancelBtn = this.dialogBox.querySelector('a[data-event="Cancel"]');
            this.saveBtn = this.dialogBox.querySelector('a[data-event="Restore"]');

        }

        confirm.hidePreload = function() {
            document.querySelector('body').classList.remove('wait');
            self.hideDialog();
        }

        confirm.hidePreload.context = "saveBtn";
        confirm.hidePreload.event = "click";

        confirm.linkClick = function (e) {
                e.preventDefault();
                self.showDialog();
        };

        confirm.showDialog = function () {
            self.dialogBox.classList.add('show');
        };

        confirm.hideDialog = function () {
            self.dialogBox.classList.remove('show');
        };

        confirm.createDialog = function createDialog() {

            $(".reset-dialog").remove();

            var wrapper = document.createElement('div'),
                dialogBox = document.createElement('section'),
                messageDiv = document.createElement('div'),
                actions = document.createElement('div'),
                noButton = document.createElement('a'),
                yesButton = document.createElement('a');

            actions.classList.add('actions');

            noButton.classList.add('btn');
            noButton.setAttribute('data-event', "Cancel");
            noButton.textContent = 'Cancel';

            yesButton.classList.add('btn', 'btn-primary', 'btn-right');
            yesButton.setAttribute('data-event', "Restore");
            yesButton.setAttribute('href',this.url);
            yesButton.textContent = 'Restore';

            wrapper.classList.add('reset-dialog');

            messageDiv.classList.add('message');
            messageDiv.textContent = this.message;

            actions.appendChild(noButton);
            actions.appendChild(yesButton);

            dialogBox.appendChild(messageDiv);
            dialogBox.appendChild(actions);
            wrapper.appendChild(dialogBox);
            return self.element.parentElement.appendChild(wrapper);
        }

        confirm.cancelAction = function(e) {
            document.querySelector('body').classList.remove('wait');
            self.hideDialog();
        }

        confirm.linkClick.context = "links";
        confirm.linkClick.event = "click";

        confirm.cancelAction.context = "cancelBtn";
        confirm.cancelAction.event = "click";

    });
})();
