document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const taskInput = document.getElementById('taskInput');
    const taskDescription = document.getElementById('taskDescription');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyList = document.getElementById('emptyList');
    const taskStats = document.getElementById('taskStats');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Estado da aplicação
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Inicializar
    renderTasks();
    updateStats();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addTask();
        }
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Atualizar filtro ativo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
    
    // Funções
    function addTask() {
        const taskTitle = taskInput.value.trim();
        const description = taskDescription.value.trim();
        
        if (taskTitle !== '') {
            const newTask = {
                id: Date.now(),
                title: taskTitle,
                description: description,
                completed: false,
                createdAt: new Date()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateStats();
            
            // Limpar inputs
            taskInput.value = '';
            taskDescription.value = '';
            taskInput.focus();
        }
    }
    
    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
        updateStats();
    }
    
    function showDeleteConfirmation(taskId, taskElement) {
        // Ocultar os botões normais
        const actionBtns = taskElement.querySelector('.task-actions');
        actionBtns.style.display = 'none';
        
        // Criar e mostrar os botões de confirmação
        const confirmationDiv = document.createElement('div');
        confirmationDiv.className = 'delete-confirmation';
        confirmationDiv.innerHTML = `
            <span class="confirmation-text">Excluir tarefa?</span>
            <button class="btn-confirm">Confirmar</button>
            <button class="btn-cancel">Cancelar</button>
        `;
        
        // Adicionar event listeners aos botões
        const confirmBtn = confirmationDiv.querySelector('.btn-confirm');
        const cancelBtn = confirmationDiv.querySelector('.btn-cancel');
        
        confirmBtn.addEventListener('click', () => {
            deleteTask(taskId);
        });
        
        cancelBtn.addEventListener('click', () => {
            taskElement.removeChild(confirmationDiv);
            actionBtns.style.display = 'flex';
        });
        
        // Adicionar a confirmação ao elemento da tarefa
        taskElement.appendChild(confirmationDiv);
    }
    
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
    
    function toggleDescription(taskItem) {
        taskItem.classList.toggle('show-description');
        const toggleBtn = taskItem.querySelector('.btn-toggle-desc');
        if (taskItem.classList.contains('show-description')) {
            toggleBtn.textContent = 'Ocultar';
        } else {
            toggleBtn.textContent = 'Ver mais';
        }
    }
    
    function renderTasks() {
        // Filtrar tarefas de acordo com o filtro atual
        let filteredTasks = tasks;
        
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Ordenar tarefas por data de criação (mais recentes primeiro)
        filteredTasks.sort((a, b) => {
            // Garantir que as datas sejam tratadas como objetos Date
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB - dateA;
        });
        
        // Limpar a lista atual
        taskList.innerHTML = '';
        
        // Renderizar cada tarefa ou mostrar mensagem de lista vazia
        if (filteredTasks.length > 0) {
            emptyList.style.display = 'none';
            
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.completed ? 'task-completed' : ''}`;
                taskItem.dataset.taskId = task.id;
                
                // Criar o cabeçalho da tarefa com título e ações
                const taskHeader = document.createElement('div');
                taskHeader.className = 'task-header';
                
                // Checkbox para marcar como concluída
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
                
                // Título da tarefa
                const taskTitle = document.createElement('span');
                taskTitle.className = 'task-title';
                taskTitle.textContent = task.title;
                taskTitle.addEventListener('click', () => {
                    toggleTaskStatus(task.id);
                    checkbox.checked = !checkbox.checked;
                });
                
                // Div para ações
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';
                
                // Botão para alternar descrição (se houver)
                if (task.description) {
                    const toggleDescBtn = document.createElement('button');
                    toggleDescBtn.className = 'btn-toggle-desc';
                    toggleDescBtn.textContent = 'Ver mais';
                    toggleDescBtn.addEventListener('click', () => toggleDescription(taskItem));
                    actionsDiv.appendChild(toggleDescBtn);
                }
                
                // Botão para concluir tarefa
                const completeBtn = document.createElement('button');
                completeBtn.className = 'btn-complete';
                completeBtn.textContent = task.completed ? 'Reabrir' : 'Concluir';
                completeBtn.addEventListener('click', () => toggleTaskStatus(task.id));
                actionsDiv.appendChild(completeBtn);
                
                // Botão de exclusão
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = 'Excluir';
                deleteBtn.addEventListener('click', () => showDeleteConfirmation(task.id, taskItem));
                actionsDiv.appendChild(deleteBtn);
                
                // Adicionar elementos ao cabeçalho
                taskHeader.appendChild(checkbox);
                taskHeader.appendChild(taskTitle);
                taskHeader.appendChild(actionsDiv);
                
                // Descrição da tarefa
                const descElement = document.createElement('div');
                descElement.className = `task-description ${task.description ? 'has-content' : ''}`;
                descElement.textContent = task.description || '';
                
                // Montar o item da tarefa
                taskItem.appendChild(taskHeader);
                taskItem.appendChild(descElement);
                
                taskList.appendChild(taskItem);
            });
        } else {
            if (tasks.length === 0) {
                emptyList.textContent = 'Nenhuma tarefa adicionada ainda.';
            } else {
                emptyList.textContent = 'Nenhuma tarefa corresponde ao filtro atual.';
            }
            emptyList.style.display = 'block';
        }
    }
    
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;
        
        taskStats.textContent = `Total: ${totalTasks} | Concluídas: ${completedTasks} | Pendentes: ${activeTasks}`;
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
