class TaskList extends HTMLElement {
    constructor() {
        super();
        this.tasks = []; 
    }

    connectedCallback() {
        this.renderLayout();

        this.form = this.querySelector('#task-form');
        this.input = this.querySelector('#task-input');
        this.list = this.querySelector('#task-list-items');
        this.emptyState = this.querySelector('#task-empty');
        this.totalSpan = this.querySelector('#task-total');
        this.doneSpan = this.querySelector('#task-done');
        this.form.addEventListener('submit', (e) => this.handleAddTask(e));
        this.list.addEventListener('click', (e) => this.handleListClick(e));
        this.updateStats();
        this.updateEmptyState();
    }

    renderLayout() {
        this.innerHTML = `
            <div class="task-list">
                <div class="task-list__inner">
                    <header class="task-list__header">
                        <div>
                            <h1 class="task-list__title">Список задач</h1>
                        </div>
                        <div class="task-stats">
                            <span class="task-stats__value">
                                <span id="task-done">0</span>/<span id="task-total">0</span>
                            </span>
                            <span>выполнено</span>
                        </div>
                    </header>

                    <form id="task-form" class="task-form" autocomplete="off">
                        <input
                            id="task-input"
                            class="task-form__input"
                            type="text"
                            placeholder="Введите задачу и нажмите Enter…"
                            required
                        >
                        <button class="task-form__button" type="submit">
                            Добавить
                        </button>
                    </form>

                    <ul id="task-list-items" class="task-list__items"></ul>
                    <div id="task-empty" class="task-empty">
                        Пока нет задач. Добавьте первую ✨
                    </div>
                </div>
            </div>
        `;
    }

    handleAddTask(event) {
        event.preventDefault();

        const text = this.input.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text,
            done: false
        };

        this.tasks.push(newTask);

        this.addTaskToDOM(newTask);

        this.updateStats();
        this.updateEmptyState();

        this.input.value = '';
        this.input.focus();
    }

    addTaskToDOM(task) {
        const li = document.createElement('li');
        li.className = 'task-item task-item_enter';
        li.dataset.id = task.id;

        li.innerHTML = `
            <label class="task-item__main">
                <input 
                    type="checkbox" 
                    class="task-item__checkbox"
                    ${task.done ? 'checked' : ''}
                >
                <span class="task-item__text">${this.escapeHtml(task.text)}</span>
            </label>
            <button 
                class="task-item__delete" 
                type="button"
                title="Удалить задачу"
            >
                <span class="task-item__delete-icon">✕</span>
                Удалить
            </button>
        `;

        if (task.done) {
            li.classList.add('task-item_done');
        }

        this.list.appendChild(li);

        setTimeout(() => li.classList.remove('task-item_enter'), 230);
    }

    handleListClick(event) {
        const target = event.target;
        const item = target.closest('.task-item');
        if (!item) return;

        const id = item.dataset.id;
        const task = this.tasks.find((t) => t.id === id);
        if (!task) return;

        if (target.classList.contains('task-item__checkbox')) {
            task.done = target.checked;
            item.classList.toggle('task-item_done', task.done);
            this.updateStats();
            return;
        }

        if (
            target.classList.contains('task-item__delete') ||
            target.closest('.task-item__delete')
        ) {
            this.deleteTask(task, item);
        }
    }

    deleteTask(task, itemElement) {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);

        itemElement.classList.add('task-item_leaving');
        setTimeout(() => {
            itemElement.remove();
            this.updateStats();
            this.updateEmptyState();
        }, 190);
    }


    updateStats() {
        const total = this.tasks.length;
        const done = this.tasks.filter((t) => t.done).length;
        this.totalSpan.textContent = String(total);
        this.doneSpan.textContent = String(done);
    }

    updateEmptyState() {
        if (!this.emptyState) return;
        const isEmpty = this.tasks.length === 0;
        this.emptyState.style.display = isEmpty ? 'block' : 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('task-list', TaskList);

