if (typeof buildfire == "undefined")
    throw "please add buildfire.js first to use buildfire components";

if (typeof buildfire.components == "undefined") buildfire.components = {};

class ControlListViewStateManager {
    constructor() {
        this.selector = null;
        this.items = [];
        this.headerContainer = null;
        this.searchBarContainer = null;
        this.actionsContainer = null;
        this.itemsContainer = null;
        this.currentSortOption = null;
        this.searchValue = null;
        this.itemActionsPresets = [
            { action: 'toggle' },
            { action: "custom" },
            { action: "edit", icon: "icon-pencil", theme: "primary" },
            { action: "delete", icon: "icon-cross2", theme: "danger" },
        ];
        this.sortOptionsPresets = [
            { id: 2, title: "Title A-Z", default: true },
            { id: 3, title: "Title Z-A" },
            { id: 4, title: "Newest" },
            { id: 5, title: "Oldest" },
        ];
    }
}

buildfire.components.sortableList = class SortableList {
    #state;

    constructor(selector, options = {}) {
        if (!document.querySelector(selector)) throw new Error('Element not found!');


        if (!this.#state) {
            this.#state = new ControlListViewStateManager();
        }
        this.#state.selector = selector;
        this.selector = document.querySelector(selector);

        this.options = {
            appearance: {
                title: null,
                info: null,
                addButtonText: "Add Item",
            },
            settings: {
                showSearchBar: false,
                showSortOptions: false,
                showAddButton: false,
                allowDragAndDrop: true,
            },
            addButtonOptions: [],
            sortOptions: options.sortOptions ? options.sortOptions : this.#state.sortOptionsPresets,
            itemActions: {
                disableToggle: true,
                disableEdit: false,
                disableDelete: false,
                custom: [],
            }
        }

        this.options.appearance = options.appearance ?
            Object.assign(this.options.appearance, options.appearance) : this.options.appearance;
        this.options.settings = options.settings ?
            Object.assign(this.options.settings, options.settings) : this.options.settings;
        this.options.addButtonOptions = options.addButtonOptions ?
            Object.assign(this.options.addButtonOptions, options.addButtonOptions) : this.options.addButtonOptions;
        this.options.itemActions = options.itemActions ?
            Object.assign(this.options.itemActions, options.itemActions) : this.options.itemActions;

        this.items = [];
        this.init();
    }

    init() {
        this.selector.className = 'sortable-list';

        this.#state.actionsContainer = document.createElement("div");
        this.#state.actionsContainer.className = 'sortable-list-actions-container';

        this.#state.itemsContainer = document.createElement("div");
        this.#state.itemsContainer.className = "sortable-list-container";

        this.#state.headerContainer = document.createElement("div");
        this.#state.headerContainer.className = "sortable-list-header";

        this.initializeHeader();
        this.initializeSearchBar();
        this.initializeActions();

        this.selector.appendChild(this.#state.itemsContainer);

        setTimeout(() => {
            if (this.onDataRequest) {
                this._triggerOnDataRequested();
            }
        }, 0);
    }
    //=======================================================================================
    _triggerOnDataRequested() {
        let callbackOptions = {};

        if (this.options.settings.showSearchBar)
            callbackOptions.searchValue = this.#state.searchValue;

        if (this.options.settings.showSortOptions)
            callbackOptions.sort = this.#state.currentSortOption;

        this.onDataRequest(callbackOptions, (items) => {
            this.#state.itemsContainer.innerHTML = '';
            this.items = items;
            items.forEach((item, index) => {
                this.renderItem(item, index);
            });

            if (!this.#state.sortableList && this.options.settings.allowDragAndDrop)
                this._initSortableList();
        });
    }

    onOrderChange() { }

    _initSortableList() {
        let oldIndex = 0;
        this.#state.sortableList = Sortable.create(this.#state.itemsContainer, {
            animation: 150,
            onUpdate: (evt) => {

                let newIndex = this._getSortableItemIndex(evt.item);
                let tmp = this.items.splice(oldIndex, 1)[0];
                this.items.splice(newIndex, 0, tmp);
                this.reIndexRows();
                this.onOrderChange({ items: this.items, oldIndex, newIndex });
            },
            onStart: (evt) => {
                oldIndex = this._getSortableItemIndex(evt.item);
            }
        });
    }

    reIndexRows() {
        let i = 0;
        this.#state.itemsContainer.childNodes.forEach(e => {
            e.setAttribute("arrayIndex", i);
            i++;
        });
    }

    // get item index from the DOM sortable elements
    _getSortableItemIndex(item) {
        var index = 0;
        while ((item = item.previousSibling) != null) {
            index++;
        }
        return index;
    }

    onAddButtonClick() { }

    onItemClick() { }

    onItemActionClick() { }

    onItemRender() { }

    onSearchInput() { }

    onSortOptionChange() { }

    //=======================================================================================
    initializeHeader() {
        if (this.options.appearance.title) {
            let title = this._createUIElement('h1', 'section-title', this.options.appearance.title, null);
            this.#state.headerContainer.appendChild(title);
        }
        if (this.options.appearance.info) {
            let info = this._createUIElement('p', 'info-note', this.options.appearance.info, null);
            this.#state.headerContainer.appendChild(info);
        }

        if (this.options.appearance.title || this.options.appearance.info) {
            this.selector.insertBefore(this.#state.headerContainer, this.selector.firstChild);
        }
    }

    initializeSearchBar() {
        if (this.options.settings.showSearchBar) {
            this.#state.searchBarContainer = document.createElement("div");
            this.#state.searchBarContainer.className = "sortable-list-search-bar";

            let input = document.createElement("input"),
                button = document.createElement("button"),
                icon = document.createElement("div");

            input.type = "text";
            input.placeholder = "Search";
            button.className = "btn btn-info";
            icon.className = "search-icon";
            button.onclick = () => {
                this.#state.searchValue = input.value && input.value !== '' ? input.value : null;

                if (this.onDataRequest)
                    this._triggerOnDataRequested();
                else if (this.onSearchInput)
                    this.onSearchInput(this.#state.searchValue);
            }

            input.addEventListener('keyup', this._debounce((e) => {
                this.#state.searchValue = e.target.value && e.target.value !== '' ? e.target.value : null;
                button.onclick();
            }, 300))

            button.appendChild(icon);
            this.#state.searchBarContainer.appendChild(input);
            this.#state.searchBarContainer.appendChild(button);
            this.selector.insertBefore(this.#state.searchBarContainer, this.itemsContainer);
        }
    }

    initializeActions() {
        this.selector.insertBefore(this.#state.actionsContainer, this.itemsContainer);
        if (this.options.settings.showSortOptions) {
            this.initializeSortOptions();
        }
        if (this.options.settings.showAddButton) {
            this.initializeAddButton();
        }

        if (!this.options.settings.showSortOptions && !this.options.settings.showAddButton)
            this.#state.actionsContainer.remove();
    }

    initializeAddButton() {
        if (this.options.addButtonOptions.length) {
            let dropdown = this._createUIElement('div', 'dropdown dropdown-button-success', null, null),
                btn = this._createUIElement('button', 'btn btn-success  btn-add sort-dropdown2', `<span class="pull-left">${this.options.appearance.addButtonText}</span>
            <span class="chevron icon-chevron-down pull-right"></span>`, null),
                list = this._createUIElement('ul', 'dropdown-menu extended', null, null);
            list.role = 'menu';
            btn.onclick = function () {
                if (dropdown.classList.contains('open')) {
                    dropdown.classList.remove('open');
                } else
                    dropdown.classList.add('open');
            }
            btn.setAttribute('data-toggle', 'dropdown');
            btn.setAttribute('dropdown-toggle', true);
            btn.setAttribute('aria-expanded', true);

            this.options.addButtonOptions.forEach(element => {
                let li = document.createElement('li');
                li.innerHTML = `<a>${element.title}</a>`;
                li.onclick = () => {
                    this.onAddButtonClick({ option: element });
                    dropdown.classList.remove('open');
                };
                list.appendChild(li);
            });

            dropdown.appendChild(btn);
            dropdown.appendChild(list);
            this.#state.actionsContainer.appendChild(dropdown);
        } else {
            let button = this._createUIElement('button', 'btn btn-success btn-add sort-dropdown2', `<span>${this.options.appearance.addButtonText}</span>`, null);
            this.#state.actionsContainer.appendChild(button);

            button.onclick = () => {
                this.onAddButtonClick();
            }
        }

    }

    initializeSortOptions() {
        if (this.options.settings.allowDragAndDrop)
            this.options.sortOptions.unshift({ id: 1, title: 'Manual', default: true });
        else this.options.sortOptions[0].default = true;

        this.#state.currentSortOption = this.options.sortOptions[0];

        let dropdown = this._createUIElement('div', 'dropdown', null, null),
            btn = this._createUIElement('button', 'btn btn-default text-left dropdown-toggle sort-dropdown', `<span class="pull-left">${this.#state.currentSortOption.title}</span>
            <span class="chevron icon-chevron-down pull-right"></span>`, null),
            list = this._createUIElement('ul', 'dropdown-menu extended', null, null);


        btn.onclick = function () {
            if (dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
            } else
                dropdown.classList.add('open');
        }
        btn.setAttribute('data-toggle', 'dropdown');
        btn.setAttribute('dropdown-toggle', true);
        btn.setAttribute('aria-expanded', true);

        this.options.sortOptions.forEach(element => {
            let li = document.createElement('li');
            li.innerHTML = `<a>${element.title}</a>`;
            li.onclick = () => {
                this.#state.currentSortOption = element;
                btn.innerHTML = `<span class="pull-left">${this.#state.currentSortOption.title}</span>
                <span class="chevron icon-chevron-down pull-right"></span>`;
                dropdown.classList.remove('open');

                if (this.options.settings.allowDragAndDrop)
                    this.refresh();

                if (this.onDataRequest)
                    this._triggerOnDataRequested();
                else if (this.onSortOptionChange)
                    this.onSortOptionChange(this.#state.currentSortOption);
            };
            list.appendChild(li);
        });

        dropdown.appendChild(btn);
        dropdown.appendChild(list);
        this.#state.actionsContainer.appendChild(dropdown);
    }
    //=======================================================================================
    renderItem(item, index) {
        let rowExists = this.#state.itemsContainer.querySelector(`[arrayindex="${encodeURI(index)}"`),
            itemRow = null;

        if (rowExists) {
            itemRow = rowExists;
            itemRow.innerHTML = '';
        } else {
            itemRow = document.createElement("div");
        }

        itemRow.setAttribute("arrayIndex", index);

        var dragHandle = document.createElement("span"),
            editButton = document.createElement("span"),
            deleteButton = document.createElement("span");

        itemRow.className = "sortable-list-item clearfix";
        dragHandle.className = "icon icon-menu cursor-grab";

        editButton.className = "btn btn--icon icon icon-pencil";
        deleteButton.className = "btn btn--icon icon icon-cross2";

        if (this.options.settings.allowDragAndDrop)
            itemRow.appendChild(dragHandle);

        const createImage = (itemImage, callback) => {
            let imageElement = null;
            if (itemImage) {
                let img = this._createUIElement("img", '', null, buildfire.imageLib.cropImage(itemImage, { size: "half_width", aspect: "1:1" }));
                itemRow.appendChild(img);
                imageElement = img;
            } else {
                let div = this._createUIElement("div", "icon-holder"),
                    span = this._createUIElement("div", "add-icon text-success", '+');

                div.appendChild(span);
                itemRow.appendChild(div);
                imageElement = div;
            }
            imageElement.onclick = () => {
                callback();
            };
        }

        const renderColumns = (columns) => {
            columns.forEach((element) => {
                if (element.type == 'anchor') {
                    let div = this._createUIElement("div", 'anchor-holder', null, null, null);
                    let anchor = this._createUIElement('a', 'title ellipsis', this._getMappingKeyValue(item, element.title), null);
                    anchor.onclick = () => this.onItemClick({ item, column: element });
                    div.appendChild(anchor);

                    if (element.subtitle) {
                        let subtitle = this._createUIElement('span', 'subtitle ellipsis', this._getMappingKeyValue(item, element.subtitle), null);
                        div.appendChild(subtitle);
                    }
                    itemRow.appendChild(div);
                }
                if (element.type == 'image') {
                    createImage(this._getMappingKeyValue(item, element.title), () => {
                        this.onItemClick({ item, column: element });
                    });
                }
                if (element.type == 'text') {
                    let span = this._createUIElement('span', 'title ellipsis', this._getMappingKeyValue(item, element.title), null);
                    if (element.subtitle) {
                        let subtitle = this._createUIElement('span', 'subtitle ellipsis', this._getMappingKeyValue(item, element.subtitle), null);
                        span.appendChild(subtitle);
                    }
                    span.onclick = () => this.onItemClick({ item, column: element });
                    itemRow.appendChild(span);
                }
                else if (element.type == 'date') {
                    let date = this._createUIElement('span', 'title ellipsis', new Date(this._getMappingKeyValue(item, element.title)).toDateString(), null);
                    if (element.subtitle) {
                        let subtitle = this._createUIElement('span', 'subtitle ellipsis', this._getMappingKeyValue(item, element.subtitle), null);
                        date.appendChild(subtitle);
                    }
                    date.onclick = () => this.onItemClick({ item, column: element });
                    itemRow.appendChild(date);
                }
            });
        }

        const renderActions = () => {
            this.#state.itemActionsPresets.forEach((element) => {
                if (element.action == 'toggle' && !this.options.itemActions.disableToggle) {
                    let toggle = this._createUIElement('div', 'button-switch'),
                        input = this._createUIElement('input', null),
                        label = this._createUIElement('label', 'label-success');

                    input.type = 'checkbox';
                    input.id = 'toggle_' + index;
                    label.setAttribute('for', 'toggle_' + index);
                    toggle.appendChild(input);
                    toggle.appendChild(label);
                    itemRow.appendChild(toggle);

                    input.onclick = () => this.onItemActionClick({ item: item, action: 'toggle' });
                }
                else if (element.action == 'custom') {
                    this.options.itemActions.custom.length && this.options.itemActions.custom.forEach((element) => {
                        let button = this._createUIElement('button', `btn btn--icon icon ${element.theme} ${element.icon}`, null, null);
                        button.onclick = () => this.onItemActionClick({ item: item, action: element.action });
                        itemRow.appendChild(button);
                    });
                }
                else if (element.action == 'edit' && !this.options.itemActions.disableEdit) {
                    let button = this._createUIElement('button', 'btn btn--icon icon primary ' + element.icon, null, null);
                    button.onclick = () => this.onItemActionClick({ item: item, action: element.action });
                    itemRow.appendChild(button);
                }
                else if (element.action == 'delete' && !this.options.itemActions.disableDelete) {
                    let button = this._createUIElement('button', 'btn btn--icon icon danger ' + element.icon, null, null);
                    button.onclick = () => this.onItemActionClick({ item: item, action: element.action });
                    itemRow.appendChild(button);
                }
            });

        }
        let preferences = this.onItemRender({ item: item });
        if (preferences && preferences.columns)
            renderColumns(preferences.columns);

        renderActions();

        if (rowExists) {
            this.#state.itemsContainer.replaceChild(rowExists, itemRow);
        } else this.#state.itemsContainer.appendChild(itemRow);
    }
    //=======================================================================================
    refresh() {
        this.#state.itemsContainer.innerHTML = '';
        this.items.forEach((item) => this.renderItem(item));
    }
    //=======================================================================================
    append(items) {
        if ((items instanceof Array)) this.items = items;
        else if ((items instanceof Object)) this.items = [items, ...this.items,];
        else throw new Error('Invalid parameters!');
        this.items.forEach((item, index) => {
            this.renderItem(item, index);
        });
    }
    update(index, data) {
        this.items[index] = data;
        this.renderItem(this.items[index], index);
    }
    remove(index) {
        this.items = this.items.filter((el, ind) => ind !== index);
        let node = this.#state.itemsContainer.querySelector(`[arrayindex="${encodeURI(index)}"`);
        if (node) node.remove();
        this.reIndexRows();
    }
    //=======================================================================================
    _createUIElement(tag, className, innerHTML = null, src = null) {
        let element = document.createElement(tag);
        className ? element.className = className : null;
        innerHTML ? element.innerHTML = innerHTML : null;
        if (tag == 'img') element.src = src;
        return element;
    }

    _debounce(func, wait) {
        let timeout;

        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    _getMappingKeyValue(item, key) {
        if (!key) return null;
        let sequence = key.split('.');

        for (let i = 0; i < sequence.length; i++) {
            if (item[sequence[i]])
                item = item[sequence[i]];
            else
                return null;
        }
        return item;
    }
}