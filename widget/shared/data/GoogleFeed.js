
class GoogleFeed {
    constructor(data = {}) {
        this.type = "google";
        this.subtitle = "Google Feed";
        this.id = data.id || "";
        this.title = data.title || "";
        this.keywords = data.keywords || "";
    }
}