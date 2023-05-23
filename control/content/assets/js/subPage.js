class SubPage {
	constructor(id) {
		this.container = document.getElementById(id);
		if (!this.container) throw "Sub Page ID not found";
		if (!this.container.classList.contains("subPage")) throw "Sub Page doesnt have class [subPage]";

		let closeButton = this.container.querySelector(".close-modal");
		if (closeButton)
			closeButton.onclick = () => { this.container.classList.remove("activeDialog"); };
	}

	show() {
		this.container.classList.add("activeFull");
	}

	showInvalidFeedMessage(type, message) {
		let elementId = null;
		elementId = type === "rss" ? "#rssErrorMessage" : "#googleErrorMessage";
		let node = this.container.querySelector(elementId);
		node.innerHTML = message;
		node.style.display = "block";
	}

	showDialog(options, saveCallback, deleteCallback) {
		let btnSave = this.container.querySelector(".spSaveButton");
		btnSave.onclick = () => {
			let values = getElementsValues();
			saveCallback(values);
		};

		const getElementsValues = () => {
			let nodes = this.container.querySelectorAll("input");
			let values = {};
			nodes.forEach(element => {
				values[element.id] = element.value
			});
			return values;
		};

		const setElementsValues = () => {
			Object.keys(options.values).map(key => {
				let node = this.container.querySelector(`#${key}`);
				node.value = options.values[key];
			});
			this.container.querySelector(".spSaveButton").disabled = false;
		};

		this.container.addEventListener("change", (e) => {
			let values = getElementsValues();
			let hasAllValues = Object.values(values).every((v) => v);
			let btnSave = this.container.querySelector(".spSaveButton");

			btnSave.disabled = hasAllValues ? false : true;
		});

		if (options.values)
			setElementsValues();

		let btnDeleteButton = this.container.querySelector(".spDeleteButton");
		btnDeleteButton.style.display = ''; //reset
		btnDeleteButton.onclick = () => {
			deleteCallback();
		};
		if (options) {
			if (options.title) {
				let h = this.container.querySelector(".spHeaderText");
				h.innerHTML = options.title;
			}
			if (options.saveText)
				btnSave.innerHTML = options.saveText;


			if (options.hideDelete)
				btnDeleteButton.style.display = 'none';

		}
		this.container.classList.add("activeDialog");
	}

	close() {
		this.container.classList.remove("activeFull");
		this.container.classList.remove("activeDialog");
		this.container.removeEventListener("change", () => {});

		let nodes = this.container.querySelectorAll("input");
		nodes.forEach(node => {
			node.value = null;
		});

		let rssErrorMessage = this.container.querySelector("#rssErrorMessage")
		if(rssErrorMessage) {
			rssErrorMessage.innerHTML = "";
			rssErrorMessage.style.display = "none";
		}

		let googleErrorMessage = this.container.querySelector("#googleErrorMessage")
		if(googleErrorMessage) {
			googleErrorMessage.innerHTML = "";
			googleErrorMessage.style.display = "none";
		}
	}
}