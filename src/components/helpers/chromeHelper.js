declare var chrome;

class ChromeHelper {
    static isExtension() {
        return chrome && chrome.extension;
    }

    static instance() {
        return chrome;
    }

    static eval(code, handler) {
        ChromeHelper.instance().devtools.inspectedWindow.eval(code, handler);
    }

    static sendMessage(name, data, response) {
        ChromeHelper.instance().runtime.sendMessage({ name: name, params: data }, response);
    }

    static onMessage(name, response) {
        ChromeHelper.instance().runtime.onMessage.addListener(function(message) {
            if(message.name == name) {
                response(message.params);
            }
        });
    }
}

export default ChromeHelper;