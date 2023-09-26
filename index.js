const listTemplate = document.createElement('template');
listTemplate.innerHTML = `
    <style>
        @import url('./style.css');
    </style>
    <div class="todo-list">
        <div class="todo-list__container">
            <h1 class="todo-list__title">Todo List</h1>
            <div class="todo-list__controls">
                <input type="text" class="todo-list__input" placeholder="Add a new task..."/>
                <div class="todo__btn todo-list__btn">+</div>
            </div>
            <div class="todo-items"></div>
        </div>
    </div>
`;

class TodoList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(listTemplate.content.cloneNode(true));

        TodoListController.initialize();

        this.todoList = this.shadowRoot.querySelector(".todo-list");
        this.todoItems = this.todoList.querySelector(".todo-items");
        this.todoItemInput = this.todoList.querySelector(".todo-list__input");
        this.addTodoItemBtn = this.todoList.querySelector(".todo-list__btn");
    }

    connectedCallback() {
        this.addTodoItemBtn.addEventListener("click", (e) =>{
            e.stopPropagation();
            this.handleAddTodoItem();
        });

        this.todoItemInput.addEventListener("keydown", (e) =>{
            e.stopPropagation();
            if (e.key === "Enter") this.handleAddTodoItem();
        });

        // load items from todo list controller state
        TodoListController.state.forEach((item) => {
            if (!item.content) return;

            this.addTodoItem(item.id, item.content);
        })

    }

    disconnectedCallback() {}

    handleAddTodoItem = () => {
        const controllerState = TodoListController.state;
        this.addTodoItem(controllerState.size ? [...controllerState][controllerState.size-1][0] + 1: 1, this.todoItemInput.value);
    };

    addTodoItem(id, content) {
        if (content.trim().length === 0) return;

        let todoItem = document.createElement("todo-item");

        todoItem.todoItem.attributes.id = id;
        todoItem.contentInput.value = content;

        this.todoItems.appendChild(todoItem);

        if (this.todoItemInput.value) this.todoItemInput.value = "";
    }
}

const itemTemplate = document.createElement('template');
itemTemplate.innerHTML = `
    <style>
        @import url('./style.css')
    </style>
    <div class="todo-item">
        <div class="todo-item__content">
            <input type="text" hidden class="todo-item__content-input" />
            <span class="todo-item__content-display"></span>
        </div>
        <div class="spacer"></div>
        <button class="todo__btn todo-item__btn">✕</button>
    </div>
`;

class TodoItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(itemTemplate.content.cloneNode(true));

        this.mouseDownEl = null;

        this.todoItem = this.shadowRoot.querySelector(".todo-item");

        this.todoContent = this.todoItem.querySelector(".todo-item__content");
        this.contentInput = this.todoContent.querySelector(".todo-item__content-input");
        this.contentDisplay = this.todoContent.querySelector(".todo-item__content-display");
        this.deleteTodoItemBtn = this.todoItem.querySelector(".todo-item__btn");
    }

    connectedCallback() {
        this.contentDisplay.innerHTML = this.contentInput.value;

        TodoListController.AddTodoItem(
            this.todoItem.attributes.id,
            this.contentInput.value
        );

        this.deleteTodoItemBtn.addEventListener("click", (e) =>
            this.deleteTodoItem(e)
        );
    }

    deleteTodoItem(e) {
        e.stopPropagation();
        let todoItem = this;
        if (todoItem.parentNode && todoItem.parentNode.matches(".todo-items")) {
            TodoListController.DeleteTodoItem(todoItem.todoItem.attributes.id);
            todoItem.parentNode.removeChild(todoItem);
        }
    }

    disconnectedCallback() {}
}

class TodoListController {
    static state = new Map();

    static initialize() {
        this.state = new Map(JSON.parse(sessionStorage.getItem('todoList')) || []);
    }

    static AddTodoItem(id, content) {
        this.state.set(id, { id: id, content: content });
        // add object to session storage
        sessionStorage.setItem('todoList', JSON.stringify([...this.state]));
    }

    static DeleteTodoItem(id) {
        this.state.delete(id);
        // updates session storage
        sessionStorage.setItem('todoList', JSON.stringify([...this.state]));
    }
}

window.customElements.define('todo-item', TodoItem);
window.customElements.define('todo-list', TodoList);


