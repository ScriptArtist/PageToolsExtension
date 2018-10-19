class IconLoader {
    static parseIcon(url) {
        return fetch('https://i.olsh.me/allicons.json?url=' + url, {
            // method: 'get'
        }).then(r => r.json())
            .then(data => {
                if(data.icons.length > 0 && data.icons[0].width >= 32) {
                    return data.icons[0].url;
                }
            }).catch(function(err) {

            // Error :(
        });
    }

    static getIcon(model) {
        var cacheIcon = this.getCacheIcon(model.id);

        if(typeof cacheIcon != 'undefined') {
            return Promise.resolve(this.getProxyLink(cacheIcon));
        } else {
            return this.updateIcon(model);
        }
    }

    static updateIcon(model) {
        return this.parseIcon(model.url).then((icon) => {
            this.setCacheIcon(model.id, icon);
            return this.getProxyLink(icon);
        });
    }

    static getProxyLink(url) {
        if(!url) {
            return null;
        }

        return "https://images.weserv.nl/?page=1&url=" + url;
    }

    static getCacheIcon(id) {
        var allcookies = JSON.parse(localStorage.getItem('icons'));
        if(!allcookies) {
            allcookies = {};
            localStorage.setItem('icons', JSON.stringify(allcookies));
        }
        return allcookies[id];
    }

    static setCacheIcon(id, icon = null) {
        var allcookies = JSON.parse(localStorage.getItem('icons'));
        if(!allcookies) {
            allcookies = {};
            localStorage.setItem('icons', JSON.stringify(allcookies));
        }
        allcookies[id] = icon;
        localStorage.setItem('icons', JSON.stringify(allcookies));
    }
}

export default IconLoader;