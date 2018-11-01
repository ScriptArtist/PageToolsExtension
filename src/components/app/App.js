import React, { Component } from 'react';
import './app.css';
import ChromeHelper from "../helpers/chromeHelper";

class App extends Component {
  constructor(props) {
      super(props);

      ChromeHelper.instance().devtools.panels.create("My Tools", "MyPanelIcon.png", "tab.html",
          function(panel) {
            // code invoked on panel creation
          }
      );


      ChromeHelper.instance().runtime.onMessage.addListener(function(message, sender, sendResponse) {
          switch(message.name) {
              case 'alert':
                  alert(message.value);
                  break;
              case 'eval':
                  ChromeHelper.eval(message.value, sendResponse);
          }
          return true;
      });
  }

  render() {
      return (
          <div>Hello World</div>
      );
  }
}

export default App;
