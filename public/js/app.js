//LocalStorage identifier constant for keeping theme preferences saved across refreshes
const THEME_KEY = 'eventhub_theme';

//Execute page-specific functions once HTML content loads fully
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    //Check elements on current page to trigger appropriate backend api calls
    if (document.getElementById('trending-grid')) {
        fetchFeaturedEvents();
    }
    if (document.getElementById('results-grid')) {
        setupFilterListeners();
        fetchEventsWithFilters();
    }
    if (document.getElementById('event-details-container')) {
        loadEventDetailsPage();
    }
});

//Controls light and dark theme initialization and toggling
function initTheme() {
    const isLight = localStorage.getItem(THEME_KEY) === 'light';
    if (isLight) document.body.classList.toggle('light-mode');
    updateThemeBtn(isLight);
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
    updateThemeBtn(isLight);
}

function updateThemeBtn(isLight) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon && text) {
        icon.textContent = isLight ? '🌙' : '☀️';
        text.textContent = isLight ? 'Night Mode' : 'Day Mode';
    }
}

function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.toggle('open');
}

//Fetch featured events for display on index.html
async function fetchFeaturedEvents() {
    try {
        const response = await fetch('/api/events?featured=true');
        const result = await response.json();
        if (result.success) {
            renderGrid(result.data, 'trending-grid');
        }
    } catch (err) {
        console.error('Error loading featured events', err);
    }
}

//Search bar functionality connecting home search to explore page
function executeHeroSearch() {
    const query = document.getElementById('hero-search-input').value.trim();
    if (query) {
        window.location.href = `explore.html?search=${encodeURIComponent(query)}`;
    }
}

//Fetch events from backend with active query parameters
async function fetchEventsWithFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    let apiPath = '/api/events';
    if (searchQuery) {
        apiPath += `?search=${encodeURIComponent(searchQuery)}`;
    }

    try {
        const response = await fetch(apiPath);
        const result = await response.json();
        if (result.success) {
            renderGrid(result.data, 'results-grid')
        }
    } catch (err) {
        console.error('Error fetching filtered events:', err);
    }
}

//Dynamically render HTML event card structures into target container
function renderGrid(events, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `<p style = "color: var(--text-secondary); grid-column: 1/-1; text-align: center;">No events found matching criteria.</p>`;
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="event-card">
        <div class="image-placeholder"><span>${event.title}</span></div>
        <div class="card-content">
        <span class="badge">${event.catagory}</span>
        <h4>${event.title}</h4>
        <p class="event-date">🗓️ ${event.date ? event.date.split('T')[0] : ''} at ${event.time}</p>
        <p class="event-loc">📍 ${event.loc} (${event.scope})</p>
        <p style="font-weight: bold; marfin-top: 0.25rem;">
        ${event.price > 0 ? `R${event.price}` : 'FREE'}
        </p>
        <!-- Connects card to details view using Query Parameter ID -->
        <a class="action-btn" style="margin-top:0.5rem;" href="details.html?id=${event.id}">
        View Details
        </a>
        </div>
        </div>
        `).join('');
}

//Read event ID from query parameters and render dynamic details
