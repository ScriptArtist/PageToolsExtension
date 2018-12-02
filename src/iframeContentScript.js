import ChromeHelper from "./components/helpers/chromeHelper";

class IframeContentScript {
    constructor() {
        // alert('init content script');
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('message', this.onMessage);
        ChromeHelper.instance().runtime.onMessage.addListener(this.onBackgroundMessage);
    }

    unbindEvents() {
        // alert('unbind');
        window.removeEventListener('message', this.onMessage);
        ChromeHelper.instance().runtime.onMessage.removeListener(this.onBackgroundMessage);

    }

    // message from window
    onMessage(event) {
        // Only accept messages from the same frame
        if (event.source !== window) {
            return;
        }

        var message = event.data;

        // Only accept messages that we know are ours
        if (typeof message !== 'object' || message === null || !message.source === 'page-tools-extension') {
            return;
        }

        ChromeHelper.instance().runtime.sendMessage(message);
    }

    // on message from background
    onBackgroundMessage(e) {
        if(e && e.params && e.params.name) {
            window.dispatchEvent(new CustomEvent(e.params.name, {detail: e.params.params}));
        }
    }
}

window.iframeContentScript = new IframeContentScript();