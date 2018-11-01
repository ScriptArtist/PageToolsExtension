import React, { Component } from 'react';
import './tab.css';
import ChromeHelper from "../helpers/chromeHelper";

class Tab extends Component {
  constructor(props) {
      super(props);

      ChromeHelper.instance().webRequest.onHeadersReceived.addListener(
          function(info) {
              var headers = info.responseHeaders;
              for (var i=headers.length-1; i>=0; --i) {
                  var header = headers[i].name.toLowerCase();
                  if (header == 'x-frame-options' || header == 'frame-options') {
                      headers.splice(i, 1); // Remove header
                  }
              }
              return {responseHeaders: headers};
          },
          {
              urls: [ '*://*/*' ], // Pattern to match all http(s) pages
              types: [ 'sub_frame' ]
          },
          ['blocking', 'responseHeaders']
      );

      this.state = {
          inspectedPageUrl: null,
          iframeUpdating: false
      };

      this.iframe = React.createRef();
      this.updateIframeUrl();


      // when inspected page updated
      ChromeHelper.instance().devtools.network.onNavigated.addListener(() => this.updateIframeUrl());

  }

    updateIframeUrl() {
    ChromeHelper.eval(`document.querySelector("meta[name='chrome-extension:my-tools']").getAttribute("content")`,
        (result) => {
            // this.iframe.current.contentWindow.location = '';
            // this.iframe.current.contentWindow.location = result;
            this.setState({
                inspectedPageUrl: result,
                iframeUpdating: true
            });
        }
    );
    }

    updateInspectedUrl() {
      // this.iframe.current.contentWindow.document;
    }

    onAlertClick = (e) => {
        ChromeHelper.eval("alert('Alert')");
    };

    onIframeLoad = () => {
        if(!this.state.iframeUpdating) {
            this.updateInspectedUrl();
        }

        this.setState({iframeUpdating: false});
    };

  render() {
      return (
          <div className="tab">
              {/*<button onClick={this.onAlertClick}>Alert</button>*/}
              <iframe ref={this.iframe} className="tab__iframe" onLoad={this.onIframeLoad}></iframe>
          </div>
      );
  }
}

export default Tab;
