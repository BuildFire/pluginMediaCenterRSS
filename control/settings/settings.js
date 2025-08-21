let settings = null;
let _defaultData = {
    "content": {
        "carouselImages": [],
        "description": "",
        "rssUrl": null, // "https://blog.ted.com/feed",
        "feeds": [
            {
                id: "default",
                title: "Feed",
                type: "rss",
                url: "https://blog.ted.com/feed"
            }
        ]
    },
    "design": {
        "itemListLayout": "List_Layout_1",
        "itemDetailsLayout": "Feed_Layout_1",
        "itemListBgImage": "",
        "itemDetailsBgImage": ""
    },
    "default": true
}

window.onload = () => {
    buildfire.datastore.get("RssFeedInfo", (err, result) => {
        if (err) return console.error(err);
        settings = result.data;
        if (!Object.keys(settings).length) {
            settings = _defaultData;
        }

        readRequiresLogin.disabled = false;
        preferLinkPage.disabled = false;
        if (settings?.readRequiresLogin) {
            readRequiresLogin.checked = true;
        }
        if (settings?.preferLinkPage) {
            preferLinkPage.checked = true;
        }
        
        const launchContainer = document.getElementById('launchContainer');
        if (!settings.preferLinkPage) {
            launchContainer.classList.add('hidden');
        } else {
            launchContainer.classList.remove('hidden');
        }
        
        preferLinkPage.addEventListener('change', () => {
            settings.preferLinkPage = preferLinkPage.checked;
            saveSettings();
            
            if (!settings.preferLinkPage) {
                launchContainer.classList.add('hidden');
            } else {
                launchContainer.classList.remove('hidden');
            }
        });
        
        const launchInRadios = document.querySelectorAll('input[name="launchIn"]');
        launchInRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                settings.launchIn = event.target.value;
                saveSettings();
            });
        });
    });
};

const saveSettings = () => {
    settings.readRequiresLogin = readRequiresLogin.checked;
    buildfire.datastore.save(settings, "RssFeedInfo", () => { });
}
