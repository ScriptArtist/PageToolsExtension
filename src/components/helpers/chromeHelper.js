declare var chrome;
declare var window;

class ChromeHelper {
    static isExtension() {
        return chrome && chrome.extension;
    }

    static instance() {
        return chrome;
    }

    static getFolders() {
        return new Promise((resolve, reject) => {
            if(this.isExtension()) {
                this.instance().bookmarks.getTree((tree) => {
                    var rootCategories = tree[0].children.filter(item => item.url == undefined);

                    ChromeHelper.instance().bookmarks.search({}, (results) => {
                        var folders = results.filter(item => item.url == undefined);

                        // add root folders
                        folders.forEach((item, i, foldersArray) => {
                            var rootCategory = rootCategories.find(el => el.id == item.parentId);
                            if(rootCategory) {
                                foldersArray.splice(i, 0, rootCategory);
                                rootCategories.splice(rootCategories.indexOf(rootCategory), 1);
                            }
                        });
                        folders.concat(rootCategories);

                        // create hierarchy (add spaces to folder title)
                        var spaces = 0;
                        folders.forEach((item, i) => {
                            if(i > 0) {
                                if(folders[i-1].id == item.parentId) {
                                    spaces += 1;
                                } else if(folders[i-1].parentId !== item.parentId) {
                                    spaces -= 1;
                                }
                            }
                            for(var i = 0; i < spaces; i++) {
                                item.title = '\xA0\xA0\xA0\xA0' + item.title;
                            }
                        });

                        resolve(folders);
                    });
                });
            } else {
                resolve([]);
            }
        });
    }

    static isPopupInstance() {
        return this.getUrlParams().action == 'popup';
    }

    static isNewTabInstance() {
        return this.getUrlParams().action == 'newtab';
    }

    static getUrlParams() {
        var urlParams = {};
        window.location.search.substr(1).split("&").forEach(function(item) {urlParams[item.split("=")[0]] = item.split("=")[1]});
        return urlParams;

    }
}

export default ChromeHelper;