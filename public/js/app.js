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
        const response = await fetch('/api/events');
        const result = await response.json();

        if (result.success) {
            renderGrid(result.data, 'trending-grid');
        }
    } catch (err) {
        console.error('Error loading events', err);
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
        <span class="badge">${event.category}</span>
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
    const container = document.getElementById('event-details-container');

    if (!container) return;

    // Get the event ID from the URL
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        container.innerHTML = `
<div class="form-card">
    <h2>Event Not Found</h2>
<p style="color: var(--text-secondary); margin-top: 0.5rem;">
    No event was selected.
</p>

<a href="index.html"
   class="action-btn"
   style="margin-top: 1.5rem;">
    Back to Home
</a>
</div>
`;

        return;
    }

    try {
        // Get the selected event from the backend
        const response = await fetch(`/api/events?id=${eventId}`);

        if (!response.ok) {
            throw new Error('Failed to load event');
        }

        const result = await response.json();

        if (!result.success || result.data.length === 0) {
            container.innerHTML = `
    <div class="form-card">
    <h2>Event Not Found</h2>

<p style="color: var(--text-secondary); margin-top: 0.5rem;">
    The event you're looking for could not be found.
</p>

<a href="index.html"
   class="action-btn"
   style="margin-top: 1.5rem;">
    Back to Home
</a>
</div>
`;

            return;
        }

        const event = result.data[0];

        container.innerHTML = `
<div class="form-card" style="max-width: 850px;">

    <span class="badge">
    ${event.category || 'Event'}
</span>

<h1 style="margin-top: 1rem;">
    ${event.title}
</h1>

<p style="
                    color: var(--text-secondary);
                    margin-top: 1rem;
                    line-height: 1.7;
                ">
    ${event.description || 'No description available.'}
</p>

<div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-top: 2rem;
                ">

    <div class="dash-card">
        <p style="color: var(--text-secondary);">
            📅 Date
        </p>

        <p style="margin-top: 0.4rem; font-weight: 600;">
            ${event.date}
        </p>
    </div>

    <div class="dash-card">
        <p style="color: var(--text-secondary);">
            🕐 Time
        </p>

        <p style="margin-top: 0.4rem; font-weight: 600;">
            ${event.time}
        </p>
    </div>

    <div class="dash-card">
        <p style="color: var(--text-secondary);">
            📍 Location
        </p>

        <p style="margin-top: 0.4rem; font-weight: 600;">
            ${event.loc}
        </p>
    </div>

    <div class="dash-card">
        <p style="color: var(--text-secondary);">
            🌍 Province
        </p>

        <p style="margin-top: 0.4rem; font-weight: 600;">
            ${event.scope}
        </p>
    </div>

    <div class="dash-card">
        <p style="color: var(--text-secondary);">
            👤 Organizer
        </p>

        <p style="margin-top: 0.4rem; font-weight: 600;">
            ${event.organizer}
        </p>
    </div>

    <div class="dash-card">
        <p style="color: var(--text-secondary);">
            🎟️ Ticket Price
        </p>

        <p style="
                            margin-top: 0.4rem;
                            font-weight: 700;
                            font-size: 1.2rem;
                        ">
            R${Number(event.price || 0).toFixed(2)}
        </p>
    </div>

</div>

<div style="
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    flex-wrap: wrap;
                ">

    <button
        class="action-btn"
        onclick="buyTicket(${event.id})">
        🎟️ Buy Ticket
    </button>

    <button
        class="theme-toggle-btn"
        onclick="saveEvent(${event.id})">
        ❤️ Save Event
    </button>

    <a
        href="index.html"
        class="theme-toggle-btn"
        style="text-decoration: none;">
        ← Back
    </a>

</div>

</div>
`;

    } catch (error) {

        console.error('Error loading event details:', error);

        container.innerHTML = `
<div class="form-card">

    <h2>Something went wrong</h2>

<p style="
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                ">
    We couldn't load the event details.
    Please try again.
</p>

<a
    href="index.html"
    class="action-btn"
    style="margin-top: 1.5rem;">
    Back to Home
</a>

</div>
`;
    }
}


// Buy Ticket button
function buyTicket(eventId) {
    alert(`Ticket purchase for event #${eventId} will be available soon.`);
}


// Save Event button
function saveEvent(eventId) {
    alert(`Event #${eventId} has been selected to save.`);
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
            method: 'POST',
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