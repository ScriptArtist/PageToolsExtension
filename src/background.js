import ChromeHelper from "./components/helpers/chromeHelper";

class Background {
    constructor() {
        ChromeHelper.instance().runtime.onConnect.addListener(function(devToolsConnection) {
            console.log('devToolsConnection');
            var tabId = null;

            // assign the listener function to a variable so we can remove it later
            var devToolsListener = function(message, sender, sendResponse) {
                console.log('executeScript');
                if(message.name == 'inject_script') {
                    tabId = message.params.tabId;
                    // Inject a content script into the identified tab
                    ChromeHelper.instance().tabs.executeScript(message.params.tabId, {file: message.params.scriptToInject});

                }
            };

            // add the listener
            console.log('add the listener');
            // ChromeHelper.instance().runtime.onMessage.addListener(devToolsListener);
            devToolsConnection.onMessage.addListener(devToolsListener);
            // ChromeHelper.onMessage('inject_script', devToolsListener);

            devToolsConnection.onDisconnect.addListener(function(message) {
                console.log('remove the listener');
                ChromeHelper.instance().runtime.onMessage.removeListener(devToolsListener);
                ChromeHelper.instance().tabs.executeScript(tabId, {code: 'iframeContentScript.unbindEvents()'});
            });
        });
    }
}

new Background();