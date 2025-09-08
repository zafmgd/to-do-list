document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksContainer = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    const taskModal = document.getElementById('taskModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    
    // Form Elements
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskCategory = document.getElementById('taskCategory');
    const taskPriority = document.getElementById('taskPriority');
    const taskDueDate = document.getElementById('taskDueDate');
    
    // Stats Elements
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');
    const highPriorityTasksEl = document.getElementById('highPriorityTasks');
    
    // State
    let tasks = [];
    let currentFilter = 'all';
    let editingTaskId = null;
    
    // Initialize
    function init() {
        loadTasks();
        setupEventListeners();
        checkTheme();
        renderTasks();
        updateStats();
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        themeToggle.addEventListener('click', toggleTheme);
        searchInput.addEventListener('input', handleSearch);
        addTaskBtn.addEventListener('click', openAddTaskModal);
        modalClose.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        taskForm.addEventListener('submit', handleFormSubmit);
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                setFilter(button.dataset.filter);
                updateActiveFilterButton(button);
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeModal();
            }
        });
        
        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            // ESC key closes modal
            if (e.key === 'Escape' && taskModal.style.display === 'flex') {
                closeModal();
            }
        });
    }
    
    // Theme Management
    function checkTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Aydınlık moda geç');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Karanlık moda geç');
        }
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Karanlık moda geç');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Aydınlık moda geç');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Task Management
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function addTask(task) {
        task.id = Date.now().toString();
        task.createdAt = new Date().toISOString().split('T')[0];
        task.completed = false;
        tasks.push(task);
        saveTasks();
        renderTasks();
        updateStats();
    }
    
    function updateTask(id, updatedTask) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
            saveTasks();
            renderTasks();
            updateStats();
        }
    }
    
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
    
    function toggleTaskCompletion(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            updateStats();
        }
    }
    
    // Filtering and Searching
    function setFilter(filter) {
        currentFilter = filter;
        renderTasks();
    }
    
    function updateActiveFilterButton(activeButton) {
        filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    function handleSearch() {
        renderTasks();
    }
    
    function getFilteredTasks() {
        let filteredTasks = tasks;
        
        // Apply category filter
        if (currentFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === currentFilter);
        }
        
        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                task.description.toLowerCase().includes(searchTerm)
            );
        }
        
        return filteredTasks;
    }
    
    // Rendering
    function renderTasks() {
        const filteredTasks = getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        tasksContainer.innerHTML = filteredTasks.map(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let dueDateClass = '';
            if (dueDate) {
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < today) {
                    dueDateClass = 'overdue';
                } else if (dueDate.getTime() === today.getTime()) {
                    dueDateClass = 'today';
                }
            }
            
            const completeTitle = task.completed ? 'Görevi Tamamlanmadı İşaretle' : 'Görevi Tamamlandı İşaretle';
            const completeAriaLabel = task.completed ? `"${task.title}" görevini tamamlanmadı olarak işaretle` : `"${task.title}" görevini tamamlandı olarak işaretle`;
            
            return `
                <div class="task-card ${task.category} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-header">
                        <h3 class="task-title">${escapeHtml(task.title)}</h3>
                        <div class="task-actions">
                            <button class="task-action-btn complete" onclick="toggleTaskCompletion('${task.id}')" title="${completeTitle}" aria-label="${completeAriaLabel}">
                                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                            </button>
                            <button class="task-action-btn edit" onclick="openEditTaskModal('${task.id}')" title="Düzenle" aria-label=""${escapeHtml(task.title)}" görevini düzenle">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-action-btn delete" onclick="confirmDeleteTask('${task.id}')" title="Sil" aria-label=""${escapeHtml(task.title)}" görevini sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <div class="task-category ${task.category}">
                            <i class="fas ${getCategoryIcon(task.category)}"></i>
                            ${getCategoryName(task.category)}
                        </div>
                        <div class="task-priority ${task.priority}">
                            <i class="fas ${getPriorityIcon(task.priority)}"></i>
                            ${getPriorityName(task.priority)}
                        </div>
                        ${task.dueDate ? `
                            <div class="task-date ${dueDateClass}">
                                <i class="fas fa-calendar"></i>
                                ${formatDate(task.dueDate)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length;
        
        totalTasksEl.textContent = totalTasks;
        completedTasksEl.textContent = completedTasks;
        pendingTasksEl.textContent = pendingTasks;
        highPriorityTasksEl.textContent = highPriorityTasks;
    }
    
    // Modal Management
    function openAddTaskModal() {
        editingTaskId = null;
        modalTitle.textContent = 'Yeni Görev Ekle';
        saveTaskBtn.textContent = 'Kaydet';
        taskForm.reset();
        taskModal.style.display = 'flex';
        taskModal.setAttribute('aria-hidden', 'false');
        taskTitle.focus();
    }
    
    function openEditTaskModal(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        editingTaskId = id;
        modalTitle.textContent = 'Görevi Düzenle';
        saveTaskBtn.textContent = 'Güncelle';
        
        taskTitle.value = task.title;
        taskDescription.value = task.description;
        taskCategory.value = task.category;
        taskPriority.value = task.priority;
        taskDueDate.value = task.dueDate;
        
        taskModal.style.display = 'flex';
        taskModal.setAttribute('aria-hidden', 'false');
        taskTitle.focus();
    }
    
    function closeModal() {
        taskModal.style.display = 'none';
        taskModal.setAttribute('aria-hidden', 'true');
        taskForm.reset();
        editingTaskId = null;
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!taskTitle.value.trim()) {
            showNotification('Görev başlığı boş olamaz', 'error');
            return;
        }
        
        const taskData = {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            category: taskCategory.value,
            priority: taskPriority.value,
            dueDate: taskDueDate.value
        };
        
        if (editingTaskId) {
            updateTask(editingTaskId, taskData);
            showNotification('Görev başarıyla güncellendi', 'success');
        } else {
            addTask(taskData);
            showNotification('Görev başarıyla eklendi', 'success');
        }
        
        closeModal();
    }
    
    // Utility Functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    }
    
    function getCategoryIcon(category) {
        switch (category) {
            case 'work': return 'fa-briefcase';
            case 'school': return 'fa-graduation-cap';
            case 'personal': return 'fa-user';
            default: return 'fa-tag';
        }
    }
    
    function getCategoryName(category) {
        switch (category) {
            case 'work': return 'İş';
            case 'school': return 'Okul';
            case 'personal': return 'Kişisel';
            default: return 'Diğer';
        }
    }
    
    function getPriorityIcon(priority) {
        switch (priority) {
            case 'high': return 'fa-exclamation-circle';
            case 'medium': return 'fa-minus-circle';
            case 'low': return 'fa-arrow-down';
            default: return 'fa-circle';
        }
    }
    
    function getPriorityName(priority) {
        switch (priority) {
            case 'high': return 'Yüksek';
            case 'medium': return 'Orta';
            case 'low': return 'Düşük';
            default: return 'Belirsiz';
        }
    }
    
    function confirmDeleteTask(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        if (confirm(`"${task.title}" görevini silmek istediğinizden emin misiniz?`)) {
            deleteTask(id);
            showNotification('Görev başarıyla silindi', 'success');
        }
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: var(--card-bg);
                    border-radius: 5px;
                    box-shadow: var(--shadow-hover);
                    padding: 15px 20px;
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                }
                
                .notification.success {
                    border-left: 4px solid var(--success-color);
                }
                
                .notification.error {
                    border-left: 4px solid var(--danger-color);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification i {
                    font-size: 18px;
                }
                
                .notification.success i {
                    color: var(--success-color);
                }
                
                .notification.error i {
                    color: var(--danger-color);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Global functions for onclick handlers
    window.toggleTaskCompletion = toggleTaskCompletion;
    window.openEditTaskModal = openEditTaskModal;
    window.confirmDeleteTask = confirmDeleteTask;
    
    // Initialize the app
    init();
});