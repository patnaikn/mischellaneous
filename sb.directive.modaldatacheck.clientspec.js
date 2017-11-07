/**
 * Created by patnaikn on 7/14/17.
 */

"import Co.test.directive, Co.test";

sb.directive.modaldatacheck('clientspec', function () {

    "use strict";

    describe('sb.directive.modaldatacheck', function () {

        var instance, element, closeBtn, inputField;

        beforeEach(function () {

            element = document.createElement('section');
            element.setAttribute('data-modal', '');
            closeBtn = document.createElement('button');
            closeBtn.setAttribute('class', 'modal-close');
            element.appendChild(closeBtn);
            instance = Co.inject(sb.directive.modaldatacheck).create(element);

        });

        afterEach(function () {

            element.remove();
            instance = null;

        });

        it('sb.directive.modaldatacheck is a co module', function () {

            expect(sb.directive.modaldatacheck.isCo).to.be.true;

        });

        describe('init()', function () {

            it('checks if the options are set for the instance', function(){

                expect(instance.element).to.equal(element);
                expect(instance.closeElement).to.equal(closeBtn);
                expect(instance.message).to.be.defined;
                expect(instance.textToContinue).to.be.defined;
                expect(instance.textToCancel).to.be.defined;

            });

            it('checks if the confirm dialog directive is set with the close button', function(){

                var confirmDialogDirective = instance.closeElement.getAttribute('sb-confirmdialog');

                expect(confirmDialogDirective).to.be.defined;
                expect(instance.closeElement.dataset.confirmed).to.equal('true');

            });

        });

        describe("changeHandler()", function () {

            it("enableConfirmDialog() gets triggered on any change in the element", function () {

                var changeSpy = sinon.spy(instance, "enableConfirmDialog");

                var event = new Event("change");

                element.dispatchEvent(event);

                expect(changeSpy.called).to.be.true;
                expect(instance.closeElement.dataset.confirmed).to.equal("false");

            });
        });


    });


});