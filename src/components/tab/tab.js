import React, {Component} from 'react';
import './tab.css';
import ChromeHelper from "../helpers/chromeHelper";
import Channel from "jschannel/src/jschannel";

class Tab extends Component {
    constructor(props) {
        super(props);

        this.state = {
            iframeUrl: null,
            iframeLoading: false
        };
        this.channel = null;
        this.iframe = React.createRef();
        this.initContentScript();
        this.allowIframeOrigin();
        this.loadIframePage();

        // when inspected page updated
        ChromeHelper.instance().devtools.network.onNavigated.addListener(() => this.loadIframePage());
    }

    initContentScript() {
        // Create a connection to the background page
        var backgroundPageConnection = ChromeHelper.instance().runtime.connect({
            name: "devtools-page"
        });

        backgroundPageConnection.onMessage.addListener(function (message) {
            // Handle responses from the background page, if any
        });

        // Relay the tab ID to the background page
        backgroundPageConnection.postMessage({
            name: 'inject_script',
            params: {
                tabId: ChromeHelper.instance().devtools.inspectedWindow.tabId,
                scriptToInject: "static/js/iframe_content_script.js"
            }
        });
    }

    allowIframeOrigin() {
        ChromeHelper.instance().webRequest.onHeadersReceived.addListener(
            function (info) {
                var headers = info.responseHeaders;
                for (var i = headers.length - 1; i >= 0; --i) {
                    var header = headers[i].name.toLowerCase();
                    if (header == 'x-frame-options' || header == 'frame-options') {
                        headers.splice(i, 1); // Remove header
                    }
                }
                return {responseHeaders: headers};
            },
            {
                urls: ['*://*/*'], // Pattern to match all http(s) pages
                types: ['sub_frame']
            },
            ['blocking', 'responseHeaders']
        );
    }

    loadIframePage() {
        ChromeHelper.eval(`document.querySelector("meta[name='chrome-extension:my-tools']").getAttribute("content")`,
            (url) => {
                if(url) {
                    this.iframe.current.contentWindow.location = '';
                    this.iframe.current.contentWindow.location = url;
                    this.setState({
                        iframeUrl: url,
                        iframeLoading: true
                    });
                    this.initChannel();
                }
            }
        );
    }

    initChannel() {
        if(this.channel) {
            this.channel.destroy();
        }

        this.channel = Channel.build({
            // debugOutput: true,
            window: this.iframe.current.contentWindow,
            origin: "*",
            scope: "extensionScope"
        });

        this.bindChannelEvents();
    }


    bindChannelEvents() {
        this.channel.bind("alert", function (transaction, text) {
            alert(text);
        });

        this.channel.bind("eval", function (transaction, code) {
            ChromeHelper.eval(code, (response) => {
                transaction.complete(response);
            });
            transaction.delayReturn(true);
        });
    }

    onIframeLoaded = () => {
        // if (!this.state.iframeLoading) {
        //     this.updateInspectedUrl();
        // }
        this.setState({iframeLoading: false});
    };

    updateInspectedUrl() {
        //this.iframe.current.contentWindow.document;
    }

    render() {
        return (
            <div className="tab">
                <iframe ref={this.iframe} className="tab__iframe" onLoad={this.onIframeLoaded}></iframe>
            </div>
        );
    }
}

export default Tab;
