import React, { Component } from 'react';
import ChromeHelper from "../helpers/chromeHelper";

class App extends Component {
  constructor(props) {
      super(props);
      // Init inspector tab page
      ChromeHelper.instance().devtools.panels.create("Page Tools", "favicon.png", "tab.html",
          function(panel) {
            // code invoked on panel creation
          }
      );
  }

  render() {
      return ('');
  }
}

export default App;
