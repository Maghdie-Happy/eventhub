/*Maghdie Petersen 
230600204
Class 3.I 
Group MM3
Last Date and Time worked on: Thursday 10 September 2026 10:10
*/

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
    if (isLight) document.body.classList.add('light-mode');
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
            renderGrid(result.data, 'results-grid');
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
        container.innerHTML = `<p style ="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">No events found matching criteria.</p>`;
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
async function loadEventDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const container = document.getElementById('event-details-container');

    if (!eventId) {
        container.innerHTML = `<p>Invalid Event ID requested.</p>`;
        return;
    }

    try {
        const response = await fetch('/api/events?id=${eventId}');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            const event = result.data[0];
            container.innerHTML = `
            <div class="form-card" style="max-width: 800px; margin-top: 1rem;">
            <span class="badge">${event.catagory}</span>
            <h1 style="margin-top: 0.5rem;">${event.title}</h1>
            <p style="color: var(--text-secondary);">Hosted by ${event.organizer}</p>
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            <p><strong>Date & Time:</strong> ${event.date.split('T')[0]} at ${event.time}</p>
            <p><strong>Location:</strong> ${event.loc}, ${event.scope}</p>
            <p><strong>Price:</strong> ${event.price > 0 ? `R${event.price}` : 'Free Entry'}</p>
            <h3 style="margin-top: 1.5rem;">About this event</h3>
            <p style=color:"var(--text-secondary); margin-top: 0.5rem;">${event.description}</p>
            <button class="action-btn" style="margin-top: 1.5rem; width: 100%; font-size: 1.1rem;" onclick=alert"('Ticket successfully reserved!')">
            Book Ticket Now
            </button>
            </div>
            `;
        }
    } catch (err) {
        container.innerHTML = `<p>Error loading event details!</p>`;
    }
}

//Dynamically attatch dynamic query filtering to checkbox changes
function setupFilterListeners() {
    const checkboxes = document.querySelectorAll('.geo-filter, .cat-filter');
    checkboxes.forEach(box => {
        box.addEventListener('change', async () => {
            const activeScopes = Array.from(document.querySelectorAll('.geo-filter:checked')).map(b => b.value);
            const activeCats = Array.from(document.querySelectorAll('.cat-filter:checked')).map(b => b.value);

            let params = [];
            if (activeScopes.length > 0 && !activeScopes.includes('National')) {
                params.push(`province=${encodeURIComponent(activeScopes[0])}`);
            }
            if (activeCats.length > 0) {
                params.push(`category=${encodeURIComponent(activeCats.join(','))}`);
            }

            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            const res = await fetch('/api/events${queryString}');
            const result = await res.json();
            if (result.success) renderGrid(result.data, 'results-grid');
        });
    });
}

//Intercept form submission and send new event payload via POST to Express API
async function handlePostEvent(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('post-title').value,
        category: document.getElementById('post-category').value,
        price: parseFloat(document.getElementById('post-price').value) || 0,
        area: document.getElementById('post-area').value,
        province: document.getElementById('post-province').value,
        date: document.getElementById('post-date').value,
        time: document.getElementById('post-time').value,
        description: document.getElementById('post-description').value
    };

    try {
        const res = await fetch('/api/events', {
            mathod: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert('Event created successfully.');
            window.location.href = 'explore.html';
        }
    } catch (err) {
        alert('Failed to create event!');
    }
}

//Mock login handler
async function handleLogin(e) {
    e.preventDefault();
    alert('Logged In Successfully!');
    window.location.href = 'dashboard.html';
}

//Mock sign up handler
async function handleSignUp(e) {
    e.preventDefault();
    alert('Account Registered! Please Login.');
    window.location.href = 'login.html';
}