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
        this.backgroundPageConnection = null;
        this.iframe = React.createRef();
        this.initContentScript();
        this.allowIframeOrigin();
        this.loadIframePage();

        // when inspected page updated
        ChromeHelper.instance().devtools.network.onNavigated.addListener(() => {
            this.initContentScript();
            this.loadIframePage()
        });
    }

    initContentScript() {
        // Create a connection to the background page
        this.backgroundPageConnection = ChromeHelper.instance().runtime.connect({
            name: "devtools-page"
        });

        this.backgroundPageConnection.onMessage.addListener((message) => {
            // Handle responses from the background page, if any
            this.channel.call({method: "event", params: message, success: function() {}});
        });

        this.backgroundPageConnection.postMessage({
            name: 'init',
            params: {
                tabId: ChromeHelper.instance().devtools.inspectedWindow.tabId
            }
        });

        // Relay the tab ID to the background page
        this.backgroundPageConnection.postMessage({
            name: 'inject_script',
            params: {
                tabId: ChromeHelper.instance().devtools.inspectedWindow.tabId,
                scriptToInject: "static/js/iframe_content_script.js"
            }
        });
    }

    allowIframeOrigin() {
        ChromeHelper.instance().webRequest.onHeadersReceived.addListener(
            (info) => {
                if(info.url == this.state.iframeUrl) {
                    var headers = info.responseHeaders;
                    for (var i = headers.length - 1; i >= 0; --i) {
                        var header = headers[i].name.toLowerCase();
                        if (header == 'x-frame-options' || header == 'frame-options') {
                            headers.splice(i, 1); // Remove header
                        }
                    }
                    return {responseHeaders: headers};
                }
            },
            {
                urls: ['*://*/*'], // Pattern to match all http(s) pages
                types: ['sub_frame']
            },
            ['blocking', 'responseHeaders']
        );
    }

    loadIframePage() {
        ChromeHelper.eval(`document.querySelector("meta[name='chrome-extension:page-tools']").getAttribute("content")`,
            (url) => {
                //if(url) {
                    this.iframe.current.contentWindow.location = '';
                    this.iframe.current.contentWindow.location = url;
                    this.setState({
                        iframeUrl: url,
                        iframeLoading: true
                    });
                    this.initChannel();
                //}
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
        this.channel.bind("init", (transaction, params) => {
            this.updateInspectedUrl(params.toolsUrl);
        });

        this.channel.bind("alert", function (transaction, text) {
            alert(text);
        });

        this.channel.bind("event", (transaction, params) => {
            this.backgroundPageConnection.postMessage({
                name: 'event',
                params: params
             });
        });

        this.channel.bind("eval", function (transaction, code) {
            ChromeHelper.eval(code, (response) => {
                transaction.complete(response);
            });
            transaction.delayReturn(true);
        });
    }

    onIframeLoaded = () => {
        this.initChannel();
    };

    updateInspectedUrl(newUrl) {
        if(newUrl && !this.state.iframeLoading) {
            var tabId = ChromeHelper.instance().devtools.inspectedWindow.tabId;
            ChromeHelper.instance().tabs.update(tabId, {url: newUrl});
        } else {
            this.setState({iframeLoading: false});
        }
    }

    render() {
        return (
            <div className="tab">
                <iframe ref={this.iframe} className={`tab__iframe ${this.state.iframeUrl?'':'tab__iframe_hide'}`} onLoad={this.onIframeLoaded}></iframe>

                {!this.state.iframeUrl &&
                    <div className="tab__not-found">
                        <img className="tab__warning" src="images/info.png"/>
                        <div>
                            <h1>No tools found</h1>
                            <h2>Add "chrome-extension:page-tools" meta tag to manage this page.</h2>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Tab;
