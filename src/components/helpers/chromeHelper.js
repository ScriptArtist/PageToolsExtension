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
}

export default ChromeHelper;