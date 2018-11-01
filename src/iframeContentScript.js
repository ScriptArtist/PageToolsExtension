import ChromeHelper from "./components/helpers/chromeHelper";

class IframeContentScript {
    constructor() {
        // document.getElementsByTagName('body')[0].innerHTML = 'test'
        this.iframeMessageListener();
    }

    eval() {

    }

    sendMessage(data, response) {
        ChromeHelper.instance().runtime.sendMessage(data, response);
    }

    iframeMessageListener() {
        window.addEventListener("message", (event) => {
            // We only accept messages from ourselves
            if (event.source != window)
                return;

            console.log(event.data);

            this.sendMessage(event.data, function (response) {
                alert(response);
            });

            // if (event.data.type && (event.data.type == "FROM_PAGE")) {
            //     console.log("Content script received: " + event.data.text);
            //     port.postMessage(event.data.text);
            // }
        }, false);
    }
}

new IframeContentScript();