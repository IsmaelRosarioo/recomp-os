// Nutrition Tracker Module - Pro Feature
// Macro counting, meal logging, daily targets

class NutritionTracker {
  constructor() {
    this.storageKey = 'nutritionData';
    this.data = this.loadData();
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      dailyTargets: {
        calories: 2500,
        protein: 200,
        carbs: 250,
        fat: 80
      },
      meals: [],
      history: {} // Date-keyed meal history
    };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    // Trigger cloud sync if available
    if (typeof saveCloudData === 'function') {
      saveCloudData();
    }
  }

  setDailyTargets(calories, protein, carbs, fat) {
    this.data.dailyTargets = { calories, protein, carbs, fat };
    this.saveData();
  }

  addMeal(mealData) {
    const meal = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      name: mealData.name || 'Meal',
      calories: parseFloat(mealData.calories) || 0,
      protein: parseFloat(mealData.protein) || 0,
      carbs: parseFloat(mealData.carbs) || 0,
      fat: parseFloat(mealData.fat) || 0,
      notes: mealData.notes || ''
    };
    this.data.meals.push(meal);
    
    // Add to history
    if (!this.data.history[meal.date]) {
      this.data.history[meal.date] = [];
    }
    this.data.history[meal.date].push(meal);
    
    this.saveData();
    return meal;
  }

  deleteMeal(mealId) {
    const mealIndex = this.data.meals.findIndex(m => m.id === mealId);
    if (mealIndex > -1) {
      const meal = this.data.meals[mealIndex];
      this.data.meals.splice(mealIndex, 1);
      
      // Remove from history
      if (this.data.history[meal.date]) {
        this.data.history[meal.date] = this.data.history[meal.date].filter(m => m.id !== mealId);
      }
      
      this.saveData();
      return true;
    }
    return false;
  }

  getTodayMeals() {
    const today = new Date().toLocaleDateString();
    return this.data.meals.filter(m => m.date === today);
  }

  getTodayTotals() {
    const todayMeals = this.getTodayMeals();
    return todayMeals.reduce((totals, meal) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  getMealsByDate(date) {
    return this.data.history[date] || [];
  }

  getProgressPercentage() {
    const totals = this.getTodayTotals();
    const targets = this.data.dailyTargets;
    return {
      calories: Math.round((totals.calories / targets.calories) * 100),
      protein: Math.round((totals.protein / targets.protein) * 100),
      carbs: Math.round((totals.carbs / targets.carbs) * 100),
      fat: Math.round((totals.fat / targets.fat) * 100)
    };
  }

  exportData(format = 'json') {
    if (format === 'json') {
      const dataStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      let csv = 'Date,Meal Name,Calories,Protein,Carbs,Fat,Notes\n';
      this.data.meals.forEach(meal => {
        csv += `${meal.date},${meal.name},${meal.calories},${meal.protein},${meal.carbs},${meal.fat},"${meal.notes}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrition-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  clearTodayMeals() {
    const today = new Date().toLocaleDateString();
    this.data.meals = this.data.meals.filter(m => m.date !== today);
    if (this.data.history[today]) {
      delete this.data.history[today];
    }
    this.saveData();
  }
}

// UI Render Functions
function renderNutritionUI(containerEl) {
  if (!containerEl) return;
  
  const tracker = new NutritionTracker();
  const targets = tracker.data.dailyTargets;
  const totals = tracker.getTodayTotals();
  const progress = tracker.getProgressPercentage();
  
  containerEl.innerHTML = `
    <div class="nutrition-tracker">
      <h2>🍽️ Nutrition Tracker</h2>
      
      <!-- Daily Targets -->
      <div class="targets-section">
        <h3>Daily Targets</h3>
        <div class="targets-grid">
          <div class="target-item">
            <label>Calories</label>
            <input type="number" id="target-calories" value="${targets.calories}" />
          </div>
          <div class="target-item">
            <label>Protein (g)</label>
            <input type="number" id="target-protein" value="${targets.protein}" />
          </div>
          <div class="target-item">
            <label>Carbs (g)</label>
            <input type="number" id="target-carbs" value="${targets.carbs}" />
          </div>
          <div class="target-item">
            <label>Fat (g)</label>
            <input type="number" id="target-fat" value="${targets.fat}" />
          </div>
        </div>
        <button id="save-targets-btn" class="btn-primary">Save Targets</button>
      </div>
      
      <!-- Today's Progress -->
      <div class="progress-section">
        <h3>Today's Progress</h3>
        <div class="macro-progress">
          <div class="macro-item">
            <div class="macro-label">Calories</div>
            <div class="macro-bar">
              <div class="macro-fill" style="width: ${Math.min(progress.calories, 100)}%"></div>
            </div>
            <div class="macro-value">${totals.calories} / ${targets.calories} (${progress.calories}%)</div>
          </div>
          <div class="macro-item">
            <div class="macro-label">Protein</div>
            <div class="macro-bar">
              <div class="macro-fill" style="width: ${Math.min(progress.protein, 100)}%"></div>
            </div>
            <div class="macro-value">${totals.protein}g / ${targets.protein}g (${progress.protein}%)</div>
          </div>
          <div class="macro-item">
            <div class="macro-label">Carbs</div>
            <div class="macro-bar">
              <div class="macro-fill" style="width: ${Math.min(progress.carbs, 100)}%"></div>
            </div>
            <div class="macro-value">${totals.carbs}g / ${targets.carbs}g (${progress.carbs}%)</div>
          </div>
          <div class="macro-item">
            <div class="macro-label">Fat</div>
            <div class="macro-bar">
              <div class="macro-fill" style="width: ${Math.min(progress.fat, 100)}%"></div>
            </div>
            <div class="macro-value">${totals.fat}g / ${targets.fat}g (${progress.fat}%)</div>
          </div>
        </div>
      </div>
      
      <!-- Add Meal Form -->
      <div class="add-meal-section">
        <h3>Log Meal</h3>
        <div class="meal-form">
          <input type="text" id="meal-name" placeholder="Meal name" />
          <input type="number" id="meal-calories" placeholder="Calories" />
          <input type="number" id="meal-protein" placeholder="Protein (g)" />
          <input type="number" id="meal-carbs" placeholder="Carbs (g)" />
          <input type="number" id="meal-fat" placeholder="Fat (g)" />
          <input type="text" id="meal-notes" placeholder="Notes (optional)" />
          <button id="add-meal-btn" class="btn-primary">Add Meal</button>
        </div>
      </div>
      
      <!-- Meal Log -->
      <div class="meal-log-section">
        <h3>Today's Meals</h3>
        <div id="meal-list"></div>
      </div>
      
      <!-- Actions -->
      <div class="nutrition-actions">
        <button id="export-json-btn" class="btn-secondary">Export JSON</button>
        <button id="export-csv-btn" class="btn-secondary">Export CSV</button>
        <button id="clear-today-btn" class="btn-danger">Clear Today</button>
      </div>
    </div>
  `;
  
  // Event Listeners
  document.getElementById('save-targets-btn').addEventListener('click', () => {
    const calories = parseInt(document.getElementById('target-calories').value);
    const protein = parseInt(document.getElementById('target-protein').value);
    const carbs = parseInt(document.getElementById('target-carbs').value);
    const fat = parseInt(document.getElementById('target-fat').value);
    tracker.setDailyTargets(calories, protein, carbs, fat);
    renderNutritionUI(containerEl);
  });
  
  document.getElementById('add-meal-btn').addEventListener('click', () => {
    const mealData = {
      name: document.getElementById('meal-name').value,
      calories: document.getElementById('meal-calories').value,
      protein: document.getElementById('meal-protein').value,
      carbs: document.getElementById('meal-carbs').value,
      fat: document.getElementById('meal-fat').value,
      notes: document.getElementById('meal-notes').value
    };
    tracker.addMeal(mealData);
    // Clear form
    document.getElementById('meal-name').value = '';
    document.getElementById('meal-calories').value = '';
    document.getElementById('meal-protein').value = '';
    document.getElementById('meal-carbs').value = '';
    document.getElementById('meal-fat').value = '';
    document.getElementById('meal-notes').value = '';
    renderNutritionUI(containerEl);
  });
  
  document.getElementById('export-json-btn').addEventListener('click', () => {
    tracker.exportData('json');
  });
  
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    tracker.exportData('csv');
  });
  
  document.getElementById('clear-today-btn').addEventListener('click', () => {
    if (confirm('Clear all meals logged today?')) {
      tracker.clearTodayMeals();
      renderNutritionUI(containerEl);
    }
  });
  
  // Render meal list
  renderMealList(tracker);
}

function renderMealList(tracker) {
  const mealListEl = document.getElementById('meal-list');
  if (!mealListEl) return;
  
  const todayMeals = tracker.getTodayMeals();
  
  if (todayMeals.length === 0) {
    mealListEl.innerHTML = '<p class="empty-state">No meals logged today</p>';
    return;
  }
  
  mealListEl.innerHTML = todayMeals.map(meal => `
    <div class="meal-card" data-meal-id="${meal.id}">
      <div class="meal-header">
        <span class="meal-name">${meal.name}</span>
        <span class="meal-time">${new Date(meal.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="meal-macros">
        <span>${meal.calories} cal</span>
        <span>P: ${meal.protein}g</span>
        <span>C: ${meal.carbs}g</span>
        <span>F: ${meal.fat}g</span>
      </div>
      ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
      <button class="delete-meal-btn" onclick="deleteMealById(${meal.id})">Delete</button>
    </div>
  `).join('');
}

function deleteMealById(mealId) {
  const tracker = new NutritionTracker();
  tracker.deleteMeal(mealId);
  // Re-render
  const containerEl = document.querySelector('.nutrition-tracker').parentElement;
  renderNutritionUI(containerEl);
}

// Initialize on page load
if (typeof window !== 'undefined') {
  window.NutritionTracker = NutritionTracker;
  window.renderNutritionUI = renderNutritionUI;
  window.deleteMealById = deleteMealById;
}
