let settings = null;

window.onload = () => {
    buildfire.datastore.get("RssFeedInfo", (err, result) => {
        if(err) return console.error(err);
        settings = result.data;
        
        if(settings?.readRequiresLogin) {
            readRequiresLogin.checked = true;
        }
    });
}

const saveSettings = () => {
    settings.readRequiresLogin = readRequiresLogin.checked;
    buildfire.datastore.save(settings, "RssFeedInfo", () => {});
}