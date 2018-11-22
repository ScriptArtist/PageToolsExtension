import ChromeHelper from "./components/helpers/chromeHelper";

class Background {
    constructor() {
        this.connections = {};
        var self = this;

        ChromeHelper.instance().runtime.onConnect.addListener(function(devToolsConnection) {
            console.log('devToolsConnection');
            var tabId = null;

            // assign the listener function to a variable so we can remove it later
            var devToolsListener = (message, sender, sendResponse) => {
                console.log('executeScript');

                switch (message.name) {
                    case "init":
                        tabId = message.params.tabId;
                        self.connections[tabId] = devToolsConnection;
                        break;

                    case "event":
                        ChromeHelper.instance().tabs.sendMessage(tabId, {
                            params: message.params
                        });
                        // if(tabId) {
                        //     ChromeHelper.instance().tabs.executeScript(message.params.tabId, {file: message.params.scriptToInject});
                        // }
                        break;

                    case "inject_script":
                        // Inject a content script into the identified tab
                        ChromeHelper.instance().tabs.executeScript(message.params.tabId, {file: message.params.scriptToInject});
                        break;
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

                Object.keys(self.connections).forEach((tabId) => {
                    if(self.connections[tabId] == devToolsConnection) {
                        console.log('remove ' + tabId);
                        delete self.connections[tabId]
                    }
                });
            });
        });

        // Receive message from content script and relay to the devTools page for the current tab
        ChromeHelper.instance().runtime.onMessage.addListener(function(request, sender, sendResponse) {
            // Messages from content scripts should have sender.tab set
            if (sender.tab) {
                var tabId = sender.tab.id;
                if (tabId in self.connections) {
                    self.connections[tabId].postMessage(request);
                } else {
                    console.log("Tab not found in connection list.");
                }
            } else {
                console.log("sender.tab not defined.");
            }
            return true;
        });
    }
}

new Background();