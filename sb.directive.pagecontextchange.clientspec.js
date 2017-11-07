/* globals afterEach, beforeEach, Co, describe, expect, it, sb, sinon, quickPromise*/

"import Co.test, Co.test.promise";

sb.directive.pagecontextchange("clientspec", function () {

    "use strict";

    describe("sb.directive.pagecontextchange", function () {

        var element, channel, instance, section, agentProxy, pairStub, subscribeStub, publishStub, proxyStub,
            mockPages, mockSettings;

        it("sb.directive.pagecontextchange is a Co module", function () {
            expect(sb.directive.pagecontextchange.isCo).to.be.true;
        });

        beforeEach(function () {
            var body = document.body;
            element = document.createElement("div");
            element.setAttribute('class', 'container');
            section = document.createElement("section");
            section.setAttribute('data-modal', '');
            section.append(element);
            body.append(section);

            mockPages = ["page1", "page2"];
            mockSettings = '{"pageTitle":"TestTitle"}';

            pairStub = sinon.stub().returns(quickPromise());
            subscribeStub = sinon.stub();
            publishStub = sinon.stub();
            proxyStub = sinon.stub().returns(quickPromise(mockPages));

            sb.channel = {
                create: function () {
                    return {
                        pair: pairStub,
                        subscribe: subscribeStub,
                        publish: publishStub
                    };
                }
            };
            agentProxy = {
                proxy: proxyStub
            };

        });

        afterEach(function () {
            element.remove();
            instance = null;
        });

        describe('init()', function () {

            it("will set modal property", function () {
                instance = Co.inject(sb.directive.pagecontextchange, agentProxy).create(element, "isPageOutline:true");
                expect(instance.isPageOutline).to.be.true;
                expect(instance.modal).to.be.defined;
            });

            it("will not set modal property", function () {
                instance = Co.inject(sb.directive.pagecontextchange, agentProxy).create(element, "isPageOutline:");
                expect(instance.isPageOutline).to.not.be.true;
                expect(instance.modal).to.be.undefined;
            });

        });

        describe("handlePageContextChange()", function () {

            it("pairs and subscribes to EditorContainer channel", function (done) {
                instance = Co.inject(sb.directive.pagecontextchange, agentProxy).create(element, "isPageOutline:true");
                // delayed assertion since pair is promise
                setTimeout(function () {
                    expect(pairStub.calledWith("EditorContainer")).to.be.true;
                    expect(subscribeStub.calledWith("PageContextChanged")).to.be.true;
                    expect(publishStub.called).to.be.false;
                    done();
                }, 10);

            });

            it("pairs and publishes to EditorContainer channel", function (done) {
                section.setAttribute("data-modal-settings", mockSettings);
                instance = Co.inject(sb.directive.pagecontextchange, agentProxy).create(element, "isPageOutline:true");
                // delayed assertion since pair is promise
                setTimeout(function () {
                    expect(pairStub.calledWith("EditorContainer")).to.be.true;
                    expect(subscribeStub.calledWith("PageContextChanged")).to.be.true;
                    expect(publishStub.args[0][0]).to.equal("PageContextUpdated");
                    expect(publishStub.args[0][1]).to.deep.equal({
                        pages: mockPages,
                        title: "TestTitle"
                    });
                    expect(proxyStub.args[0][0]).to.deep.equal({
                        "static": {
                            fullId: "Co.service.pages"
                        }
                    });
                    expect(proxyStub.args[0][1]).to.equal("load");
                    done();
                }, 10);

            });
        });

        describe("changeContext()", function () {

            var data;

            beforeEach(function () {
                data = {url: 'https://localhost:3000/route/base-view/xyz'};
                instance = Co.inject(sb.directive.pagecontextchange, agentProxy).create(section, "isPageOutline:true");
            });

            it("can invoke modal as a child", function () {

                data.isChild = true;
                var mockAnchor = document.createElement("a");
                var createElementStub = sinon.stub(document, "createElement", function (nodename) {
                    if (nodename === "a") {
                        return mockAnchor;
                    }
                });
                var appendChildSpy = sinon.spy(section, "appendChild");
                var dispatchEventStub = sinon.stub(mockAnchor, "dispatchEvent", function () {
                    return true;
                });

                instance.changeContext(data);

                expect(createElementStub.calledWith("a")).to.be.true;

                expect(appendChildSpy.calledWith(mockAnchor)).to.be.true;

                expect(dispatchEventStub.called).to.be.true;
                expect(dispatchEventStub.args[0][0].type).to.equal("click");

                expect(mockAnchor.href).to.equal(data.url);
                expect(mockAnchor.style.visibility).to.equal("hidden");


                createElementStub.restore();
                appendChildSpy.restore();
                dispatchEventStub.restore();
            });

            it("can self update", function (done) {

                var dispatchEventStub = sinon.stub(section, "dispatchEvent", function () {
                    return true;
                });

                instance.changeContext(data);

                setTimeout(function () {
                    expect(section.dataset.modalHref).to.equal(data.url);
                    expect(dispatchEventStub.called).to.be.true;
                    expect(dispatchEventStub.args[0][0].type).to.equal("selfUpdate");
                    dispatchEventStub.restore();
                    done();
                }, 10);

            });

        });

    });

});
