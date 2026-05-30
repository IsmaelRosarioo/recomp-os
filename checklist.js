// Daily Checklist Module - Pro Feature
// Pre-cycle preparation and daily task tracking

class DailyChecklist {
  constructor() {
    this.storageKey = 'checklist';
    this.data = this.loadData();
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      templates: this.getDefaultTemplates(),
      customTasks: [],
      dailyHistory: {} // Date-keyed completion history
    };
  }

  getDefaultTemplates() {
    return [
      { id: 1, text: 'Morning weigh-in', category: 'tracking', enabled: true },
      { id: 2, text: 'Log breakfast macros', category: 'nutrition', enabled: true },
      { id: 3, text: 'Take morning supplements', category: 'supplements', enabled: true },
      { id: 4, text: 'Morning workout', category: 'training', enabled: true },
      { id: 5, text: 'Post-workout protein shake', category: 'nutrition', enabled: true },
      { id: 6, text: 'Log lunch macros', category: 'nutrition', enabled: true },
      { id: 7, text: 'Hydration check (8+ cups)', category: 'health', enabled: true },
      { id: 8, text: 'Log dinner macros', category: 'nutrition', enabled: true },
      { id: 9, text: 'Evening supplements', category: 'supplements', enabled: true },
      { id: 10, text: 'Skin care routine', category: 'health', enabled: true },
      { id: 11, text: 'Progress photo (weekly)', category: 'tracking', enabled: false },
      { id: 12, text: 'Update body measurements', category: 'tracking', enabled: false }
    ];
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    if (typeof saveCloudData === 'function') {
      saveCloudData();
    }
  }

  getTodayTasks() {
    const today = new Date().toLocaleDateString();
    if (!this.data.dailyHistory[today]) {
      // Initialize today's tasks from templates
      this.data.dailyHistory[today] = this.data.templates
        .filter(t => t.enabled)
        .map(t => ({ ...t, completed: false, completedAt: null }));
      
      // Add custom tasks
      this.data.customTasks.forEach(ct => {
        this.data.dailyHistory[today].push({ ...ct, completed: false, completedAt: null });
      });
      
      this.saveData();
    }
    return this.data.dailyHistory[today];
  }

  toggleTask(taskId) {
    const today = new Date().toLocaleDateString();
    const tasks = this.getTodayTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.saveData();
    }
  }

  addCustomTask(text, category = 'custom') {
    const newTask = {
      id: Date.now(),
      text,
      category,
      enabled: true,
      isCustom: true
    };
    this.data.customTasks.push(newTask);
    
    // Add to today's tasks
    const today = new Date().toLocaleDateString();
    if (this.data.dailyHistory[today]) {
      this.data.dailyHistory[today].push({ ...newTask, completed: false, completedAt: null });
    }
    
    this.saveData();
    return newTask;
  }

  deleteCustomTask(taskId) {
    this.data.customTasks = this.data.customTasks.filter(t => t.id !== taskId);
    this.saveData();
  }

  getCompletionRate(date = null) {
    const targetDate = date || new Date().toLocaleDateString();
    const tasks = this.data.dailyHistory[targetDate];
    
    if (!tasks || tasks.length === 0) return 0;
    
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  getStreak() {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toLocaleDateString();
      const rate = this.getCompletionRate(dateStr);
      
      if (rate >= 80) { // 80% completion = success
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
      
      // Safety limit
      if (streak > 365) break;
    }
    
    return streak;
  }

  exportData(format = 'json') {
    if (format === 'json') {
      const dataStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checklist-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}

// UI Render Functions
function renderChecklistUI(containerEl) {
  if (!containerEl) return;
  
  const checklist = new DailyChecklist();
  const todayTasks = checklist.getTodayTasks();
  const completionRate = checklist.getCompletionRate();
  const streak = checklist.getStreak();
  
  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  
  containerEl.innerHTML = `
    <div class="daily-checklist">
      <h2>☑️ Daily Checklist</h2>
      
      <!-- Stats -->
      <div class="checklist-stats">
        <div class="stat-card">
          <div class="stat-value">${completedCount}/${totalCount}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${completionRate}%</div>
          <div class="stat-label">Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${streak} days</div>
          <div class="stat-label">Streak</div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${completionRate}%"></div>
      </div>
      
      <!-- Tasks by Category -->
      <div class="tasks-section">
        ${renderTasksByCategory(todayTasks)}
      </div>
      
      <!-- Add Custom Task -->
      <div class="add-task-section">
        <h3>Add Custom Task</h3>
        <div class="task-form">
          <input type="text" id="custom-task-text" placeholder="Task description" />
          <button id="add-task-btn" class="btn-primary">Add Task</button>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="checklist-actions">
        <button id="export-checklist-btn" class="btn-secondary">Export Data</button>
      </div>
    </div>
  `;
  
  // Event Listeners
  document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const taskId = parseInt(e.target.dataset.taskId);
      checklist.toggleTask(taskId);
      renderChecklistUI(containerEl);
    });
  });
  
  document.getElementById('add-task-btn')?.addEventListener('click', () => {
    const text = document.getElementById('custom-task-text').value.trim();
    if (text) {
      checklist.addCustomTask(text);
      document.getElementById('custom-task-text').value = '';
      renderChecklistUI(containerEl);
    }
  });
  
  document.getElementById('export-checklist-btn')?.addEventListener('click', () => {
    checklist.exportData('json');
  });
  
  // Delete custom task buttons
  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.target.dataset.taskId);
      if (confirm('Delete this custom task?')) {
        checklist.deleteCustomTask(taskId);
        renderChecklistUI(containerEl);
      }
    });
  });
}

function renderTasksByCategory(tasks) {
  const categories = {
    tracking: '📊 Tracking',
    nutrition: '🍽️ Nutrition',
    training: '🏋️ Training',
    supplements: '💊 Supplements',
    health: '❤️ Health',
    custom: '⚙️ Custom'
  };
  
  const groupedTasks = {};
  tasks.forEach(task => {
    const cat = task.category || 'custom';
    if (!groupedTasks[cat]) {
      groupedTasks[cat] = [];
    }
    groupedTasks[cat].push(task);
  });
  
  return Object.entries(groupedTasks)
    .map(([category, categoryTasks]) => `
      <div class="task-category">
        <h3>${categories[category] || category}</h3>
        <div class="task-list">
          ${categoryTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
              <input 
                type="checkbox" 
                class="task-checkbox" 
                data-task-id="${task.id}" 
                ${task.completed ? 'checked' : ''}
              />
              <span class="task-text">${task.text}</span>
              ${task.completedAt ? `<span class="task-time">${new Date(task.completedAt).toLocaleTimeString()}</span>` : ''}
              ${task.isCustom ? `<button class="delete-task-btn" data-task-id="${task.id}">×</button>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
}

// Initialize on page load
if (typeof window !== 'undefined') {
  window.DailyChecklist = DailyChecklist;
  window.renderChecklistUI = renderChecklistUI;
}
