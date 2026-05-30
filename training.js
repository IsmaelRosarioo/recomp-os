// Training Log Module - Pro Feature
// Exercise tracking with sets, reps, weight progression

class TrainingLog {
  constructor() {
    this.storageKey = 'trainingLog';
    this.data = this.loadData();
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      workouts: [],
      exercises: [],
      templates: [],
      history: {} // Date-keyed workout history
    };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    // Trigger cloud sync if available
    if (typeof saveCloudData === 'function') {
      saveCloudData();
    }
  }

  addExercise(exerciseData) {
    const exercise = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      name: exerciseData.name || 'Exercise',
      sets: parseInt(exerciseData.sets) || 1,
      reps: parseInt(exerciseData.reps) || 1,
      weight: parseFloat(exerciseData.weight) || 0,
      unit: exerciseData.unit || 'lbs',
      rpe: parseFloat(exerciseData.rpe) || null, // Rate of Perceived Exertion
      notes: exerciseData.notes || '',
      workoutId: exerciseData.workoutId || null
    };
    
    this.data.exercises.push(exercise);
    
    // Add to history
    if (!this.data.history[exercise.date]) {
      this.data.history[exercise.date] = [];
    }
    this.data.history[exercise.date].push(exercise);
    
    this.saveData();
    return exercise;
  }

  deleteExercise(exerciseId) {
    const exerciseIndex = this.data.exercises.findIndex(e => e.id === exerciseId);
    if (exerciseIndex > -1) {
      const exercise = this.data.exercises[exerciseIndex];
      this.data.exercises.splice(exerciseIndex, 1);
      
      // Remove from history
      if (this.data.history[exercise.date]) {
        this.data.history[exercise.date] = this.data.history[exercise.date].filter(e => e.id !== exerciseId);
      }
      
      this.saveData();
      return true;
    }
    return false;
  }

  getTodayExercises() {
    const today = new Date().toLocaleDateString();
    return this.data.exercises.filter(e => e.date === today);
  }

  getExercisesByDate(date) {
    return this.data.history[date] || [];
  }

  getExerciseHistory(exerciseName) {
    return this.data.exercises
      .filter(e => e.name.toLowerCase() === exerciseName.toLowerCase())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getPersonalRecords() {
    const prs = {};
    this.data.exercises.forEach(exercise => {
      const name = exercise.name;
      if (!prs[name] || exercise.weight > prs[name].weight) {
        prs[name] = {
          weight: exercise.weight,
          reps: exercise.reps,
          sets: exercise.sets,
          date: exercise.date,
          unit: exercise.unit
        };
      }
    });
    return prs;
  }

  getTotalVolume(date = null) {
    let exercises;
    if (date) {
      exercises = this.getExercisesByDate(date);
    } else {
      exercises = this.getTodayExercises();
    }
    
    return exercises.reduce((total, exercise) => {
      return total + (exercise.sets * exercise.reps * exercise.weight);
    }, 0);
  }

  exportData(format = 'json') {
    if (format === 'json') {
      const dataStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-log-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      let csv = 'Date,Exercise,Sets,Reps,Weight,Unit,RPE,Notes\n';
      this.data.exercises.forEach(exercise => {
        csv += `${exercise.date},${exercise.name},${exercise.sets},${exercise.reps},${exercise.weight},${exercise.unit},${exercise.rpe || ''},"${exercise.notes}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  clearTodayWorkout() {
    const today = new Date().toLocaleDateString();
    this.data.exercises = this.data.exercises.filter(e => e.date !== today);
    if (this.data.history[today]) {
      delete this.data.history[today];
    }
    this.saveData();
  }
}

// UI Render Functions
function renderTrainingUI(containerEl) {
  if (!containerEl) return;
  
  const log = new TrainingLog();
  const todayExercises = log.getTodayExercises();
  const totalVolume = log.getTotalVolume();
  const prs = log.getPersonalRecords();
  
  containerEl.innerHTML = `
    <div class="training-log">
      <h2>🏋️‍♂️ Training Log</h2>
      
      <!-- Today's Stats -->
      <div class="stats-section">
        <h3>Today's Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Exercises</div>
            <div class="stat-value">${todayExercises.length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Volume</div>
            <div class="stat-value">${totalVolume.toLocaleString()} lbs</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">PRs</div>
            <div class="stat-value">${Object.keys(prs).length}</div>
          </div>
        </div>
      </div>
      
      <!-- Add Exercise Form -->
      <div class="add-exercise-section">
        <h3>Log Exercise</h3>
        <div class="exercise-form">
          <input type="text" id="exercise-name" placeholder="Exercise name" list="exercise-suggestions" />
          <datalist id="exercise-suggestions">
            <option value="Bench Press">
            <option value="Squat">
            <option value="Deadlift">
            <option value="Overhead Press">
            <option value="Barbell Row">
            <option value="Pull-ups">
            <option value="Dips">
          </datalist>
          <input type="number" id="exercise-sets" placeholder="Sets" value="3" />
          <input type="number" id="exercise-reps" placeholder="Reps" value="10" />
          <input type="number" id="exercise-weight" placeholder="Weight" step="0.1" />
          <select id="exercise-unit">
            <option value="lbs">lbs</option>
            <option value="kg">kg</option>
          </select>
          <input type="number" id="exercise-rpe" placeholder="RPE (1-10)" min="1" max="10" step="0.5" />
          <input type="text" id="exercise-notes" placeholder="Notes (optional)" />
          <button id="add-exercise-btn" class="btn-primary">Log Exercise</button>
        </div>
      </div>
      
      <!-- Today's Workout -->
      <div class="workout-section">
        <h3>Today's Workout</h3>
        <div id="exercise-list"></div>
      </div>
      
      <!-- Personal Records -->
      <div class="pr-section">
        <h3>Personal Records</h3>
        <div id="pr-list"></div>
      </div>
      
      <!-- Actions -->
      <div class="training-actions">
        <button id="export-json-btn" class="btn-secondary">Export JSON</button>
        <button id="export-csv-btn" class="btn-secondary">Export CSV</button>
        <button id="clear-today-btn" class="btn-danger">Clear Today</button>
      </div>
    </div>
  `;
  
  // Event Listeners
  document.getElementById('add-exercise-btn').addEventListener('click', () => {
    const exerciseData = {
      name: document.getElementById('exercise-name').value,
      sets: document.getElementById('exercise-sets').value,
      reps: document.getElementById('exercise-reps').value,
      weight: document.getElementById('exercise-weight').value,
      unit: document.getElementById('exercise-unit').value,
      rpe: document.getElementById('exercise-rpe').value,
      notes: document.getElementById('exercise-notes').value
    };
    
    if (!exerciseData.name || !exerciseData.weight) {
      alert('Please enter exercise name and weight');
      return;
    }
    
    log.addExercise(exerciseData);
    
    // Clear form (keep sets/reps)
    document.getElementById('exercise-name').value = '';
    document.getElementById('exercise-weight').value = '';
    document.getElementById('exercise-rpe').value = '';
    document.getElementById('exercise-notes').value = '';
    
    renderTrainingUI(containerEl);
  });
  
  document.getElementById('export-json-btn').addEventListener('click', () => {
    log.exportData('json');
  });
  
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    log.exportData('csv');
  });
  
  document.getElementById('clear-today-btn').addEventListener('click', () => {
    if (confirm('Clear today\'s workout?')) {
      log.clearTodayWorkout();
      renderTrainingUI(containerEl);
    }
  });
  
  // Render exercise list
  renderExerciseList(log);
  renderPRList(prs);
}

function renderExerciseList(log) {
  const exerciseListEl = document.getElementById('exercise-list');
  if (!exerciseListEl) return;
  
  const todayExercises = log.getTodayExercises();
  
  if (todayExercises.length === 0) {
    exerciseListEl.innerHTML = '<p class="empty-state">No exercises logged today</p>';
    return;
  }
  
  exerciseListEl.innerHTML = todayExercises.map(exercise => `
    <div class="exercise-card" data-exercise-id="${exercise.id}">
      <div class="exercise-header">
        <span class="exercise-name">${exercise.name}</span>
        <span class="exercise-time">${new Date(exercise.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="exercise-details">
        <span>${exercise.sets} sets × ${exercise.reps} reps @ ${exercise.weight} ${exercise.unit}</span>
        ${exercise.rpe ? `<span class="rpe">RPE: ${exercise.rpe}</span>` : ''}
      </div>
      ${exercise.notes ? `<div class="exercise-notes">${exercise.notes}</div>` : ''}
      <button class="delete-exercise-btn" onclick="deleteExerciseById(${exercise.id})">Delete</button>
    </div>
  `).join('');
}

function renderPRList(prs) {
  const prListEl = document.getElementById('pr-list');
  if (!prListEl) return;
  
  const prEntries = Object.entries(prs);
  
  if (prEntries.length === 0) {
    prListEl.innerHTML = '<p class="empty-state">No personal records yet</p>';
    return;
  }
  
  prListEl.innerHTML = prEntries.map(([name, pr]) => `
    <div class="pr-card">
      <div class="pr-name">${name}</div>
      <div class="pr-details">
        ${pr.sets} × ${pr.reps} @ ${pr.weight} ${pr.unit}
      </div>
      <div class="pr-date">${pr.date}</div>
    </div>
  `).join('');
}

function deleteExerciseById(exerciseId) {
  const log = new TrainingLog();
  log.deleteExercise(exerciseId);
  // Re-render
  const containerEl = document.querySelector('.training-log').parentElement;
  renderTrainingUI(containerEl);
}

// Initialize on page load
if (typeof window !== 'undefined') {
  window.TrainingLog = TrainingLog;
  window.renderTrainingUI = renderTrainingUI;
  window.deleteExerciseById = deleteExerciseById;
}
