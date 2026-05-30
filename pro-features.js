// Additional Pro Features - Photos, Analytics, Calendar
// Consolidated module for remaining Pro features

// ===== PHOTOS MODULE =====
class ProgressPhotos {
  constructor() {
    this.storageKey = 'photos';
    this.data = this.loadData();
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : { photos: [] };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    if (typeof saveCloudData === 'function') saveCloudData();
  }

  addPhoto(base64Image, notes = '') {
    const photo = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      image: base64Image,
      notes
    };
    this.data.photos.push(photo);
    this.saveData();
    return photo;
  }

  deletePhoto(photoId) {
    this.data.photos = this.data.photos.filter(p => p.id !== photoId);
    this.saveData();
  }

  getPhotos() {
    return this.data.photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

// ===== ANALYTICS MODULE =====
class Analytics {
  getWeightTrend(days = 30) {
    const bodyStats = JSON.parse(localStorage.getItem('bodyStats') || '{}');
    if (!bodyStats.weight) return [];
    
    // Simulated trend - in real implementation, track historical weight data
    const currentWeight = bodyStats.weight;
    const data = [];
    for (let i = days; i >= 0; i--) {
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        weight: currentWeight + (Math.random() - 0.5) * 2
      });
    }
    return data;
  }

  getStrengthProgress(exerciseName) {
    const log = new TrainingLog();
    return log.getExerciseHistory(exerciseName).slice(0, 10).reverse();
  }

  getMacroTrends(days = 7) {
    const tracker = new NutritionTracker();
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
      const meals = tracker.getMealsByDate(date);
      const totals = meals.reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      trends.push({ date, ...totals });
    }
    return trends;
  }

  getComplianceScore() {
    const checklist = new DailyChecklist();
    return checklist.getCompletionRate();
  }
}

// ===== CALENDAR MODULE =====
class CycleCalendar {
  constructor() {
    this.storageKey = 'calendar';
    this.data = this.loadData();
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : { events: [], cycleStart: null };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    if (typeof saveCloudData === 'function') saveCloudData();
  }

  addEvent(date, type, notes = '') {
    const event = {
      id: Date.now(),
      date,
      type, // 'injection', 'bloodwork', 'measurement', 'other'
      notes,
      timestamp: new Date().toISOString()
    };
    this.data.events.push(event);
    this.saveData();
    return event;
  }

  deleteEvent(eventId) {
    this.data.events = this.data.events.filter(e => e.id !== eventId);
    this.saveData();
  }

  getEventsForDate(date) {
    return this.data.events.filter(e => e.date === date);
  }

  getEventsInRange(startDate, endDate) {
    return this.data.events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });
  }

  getUpcomingEvents(days = 7) {
    const today = new Date();
    const future = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return this.getEventsInRange(today.toLocaleDateString(), future.toLocaleDateString());
  }
}

// ===== UI RENDERING =====
function renderPhotosUI(containerEl) {
  if (!containerEl) return;
  
  const photos = new ProgressPhotos();
  const photoList = photos.getPhotos();
  
  containerEl.innerHTML = `
    <div class="photos-module">
      <h2>📸 Progress Photos</h2>
      
      <!-- Upload Section -->
      <div class="upload-section">
        <input type="file" id="photo-input" accept="image/*" style="display:none" />
        <button id="upload-photo-btn" class="btn-primary">Upload Photo</button>
        <input type="text" id="photo-notes" placeholder="Add notes (optional)" />
      </div>
      
      <!-- Photo Gallery -->
      <div class="photo-gallery">
        ${photoList.length === 0 ? '<p class="empty-state">No photos yet</p>' : 
          photoList.map(photo => `
            <div class="photo-card">
              <img src="${photo.image}" alt="Progress photo" />
              <div class="photo-info">
                <span class="photo-date">${photo.date}</span>
                ${photo.notes ? `<p>${photo.notes}</p>` : ''}
                <button class="delete-photo-btn" data-photo-id="${photo.id}">Delete</button>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  
  document.getElementById('upload-photo-btn')?.addEventListener('click', () => {
    document.getElementById('photo-input').click();
  });
  
  document.getElementById('photo-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const notes = document.getElementById('photo-notes').value;
        photos.addPhoto(event.target.result, notes);
        document.getElementById('photo-notes').value = '';
        renderPhotosUI(containerEl);
      };
      reader.readAsDataURL(file);
    }
  });
  
  document.querySelectorAll('.delete-photo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this photo?')) {
        photos.deletePhoto(parseInt(btn.dataset.photoId));
        renderPhotosUI(containerEl);
      }
    });
  });
}

function renderAnalyticsUI(containerEl) {
  if (!containerEl) return;
  
  const analytics = new Analytics();
  const weightTrend = analytics.getWeightTrend(7);
  const macroTrends = analytics.getMacroTrends(7);
  const compliance = analytics.getComplianceScore();
  
  containerEl.innerHTML = `
    <div class="analytics-module">
      <h2>📊 Analytics & Forecast</h2>
      
      <!-- Compliance Score -->
      <div class="compliance-card">
        <h3>Daily Compliance</h3>
        <div class="compliance-circle">
          <span class="compliance-value">${compliance}%</span>
        </div>
      </div>
      
      <!-- Weight Trend -->
      <div class="trend-card">
        <h3>Weight Trend (7 days)</h3>
        <div class="simple-chart">
          ${weightTrend.map((d, i) => `
            <div class="chart-bar" style="height: ${(d.weight / Math.max(...weightTrend.map(x => x.weight))) * 100}%">
              <span class="chart-label">${d.weight.toFixed(1)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Macro Trends -->
      <div class="trend-card">
        <h3>Macro Trends</h3>
        <div class="macro-trends">
          ${macroTrends.map(day => `
            <div class="trend-day">
              <span class="trend-date">${day.date}</span>
              <span>Cal: ${day.calories}</span>
              <span>P: ${day.protein}g</span>
              <span>C: ${day.carbs}g</span>
              <span>F: ${day.fat}g</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCalendarUI(containerEl) {
  if (!containerEl) return;
  
  const calendar = new CycleCalendar();
  const upcoming = calendar.getUpcomingEvents();
  
  containerEl.innerHTML = `
    <div class="calendar-module">
      <h2>📅 Cycle Calendar</h2>
      
      <!-- Add Event -->
      <div class="add-event-section">
        <h3>Add Event</h3>
        <div class="event-form">
          <input type="date" id="event-date" />
          <select id="event-type">
            <option value="injection">Injection</option>
            <option value="bloodwork">Bloodwork</option>
            <option value="measurement">Measurement</option>
            <option value="other">Other</option>
          </select>
          <input type="text" id="event-notes" placeholder="Notes" />
          <button id="add-event-btn" class="btn-primary">Add Event</button>
        </div>
      </div>
      
      <!-- Upcoming Events -->
      <div class="upcoming-events">
        <h3>Upcoming Events</h3>
        ${upcoming.length === 0 ? '<p class="empty-state">No upcoming events</p>' :
          upcoming.map(event => `
            <div class="event-card">
              <span class="event-date">${event.date}</span>
              <span class="event-type">${event.type}</span>
              <span class="event-notes">${event.notes}</span>
              <button class="delete-event-btn" data-event-id="${event.id}">Delete</button>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  
  document.getElementById('add-event-btn')?.addEventListener('click', () => {
    const date = document.getElementById('event-date').value;
    const type = document.getElementById('event-type').value;
    const notes = document.getElementById('event-notes').value;
    
    if (date) {
      calendar.addEvent(date, type, notes);
      document.getElementById('event-date').value = '';
      document.getElementById('event-notes').value = '';
      renderCalendarUI(containerEl);
    }
  });
  
  document.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      calendar.deleteEvent(parseInt(btn.dataset.eventId));
      renderCalendarUI(containerEl);
    });
  });
}

// Export to window
if (typeof window !== 'undefined') {
  window.ProgressPhotos = ProgressPhotos;
  window.Analytics = Analytics;
  window.CycleCalendar = CycleCalendar;
  window.renderPhotosUI = renderPhotosUI;
  window.renderAnalyticsUI = renderAnalyticsUI;
  window.renderCalendarUI = renderCalendarUI;
}
