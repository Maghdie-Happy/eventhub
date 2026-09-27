/*Maghdie Petersen
230600204
Class 3.I
Group MM3
Last Date and Time worked on: Thursday 10 September 2026 10:10
*/

//LocalStorage identifier constant for keeping theme preferences saved across refreshes
const THEME_KEY = 'eventhub_theme';


//Default demo events that always appear on the homepage
const DEFAULT_EVENTS = [
    {
        id: 'demo-1',
        title: 'Cape Town Amapiano Night',
        description: 'An energetic night of Amapiano music, dancing and entertainment featuring local DJs and performers.',
        price: 150,
        category: 'Music',
        featured: true,
        loc: 'Cape Town CBD',
        scope: 'Western Cape',
        date: '2026-10-10',
        time: '20:00',
        organizer: 'EventHub'
    },
    {
        id: 'demo-2',
        title: 'Cape Town Art & Culture Festival',
        description: 'Experience local art, culture, live performances, food and creative talent from across Cape Town.',
        price: 80,
        category: 'Arts & Culture',
        featured: true,
        loc: 'Company Gardens',
        scope: 'Western Cape',
        date: '2026-10-17',
        time: '10:00',
        organizer: 'EventHub'
    },
    {
        id: 'demo-3',
        title: 'Tech & Innovation Meetup',
        description: 'Connect with technology enthusiasts, developers and entrepreneurs while exploring new ideas and innovations.',
        price: 0,
        category: 'Technology',
        featured: true,
        loc: 'Cape Town',
        scope: 'Western Cape',
        date: '2026-10-24',
        time: '09:00',
        organizer: 'EventHub'
    },
    {
        id: 'demo-4',
        title: 'Cape Town Food & Lifestyle Festival',
        description: 'Enjoy local food, entertainment and lifestyle experiences from some of Cape Town’s emerging businesses.',
        price: 120,
        category: 'Food & Lifestyle',
        featured: true,
        loc: 'V&A Waterfront',
        scope: 'Western Cape',
        date: '2026-10-31',
        time: '11:00',
        organizer: 'EventHub'
    }
];


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

    if (isLight) {
        document.body.classList.add('light-mode');
    }

    updateThemeBtn(isLight);
}


//Toggle between light and dark mode
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');

    localStorage.setItem(
        THEME_KEY,
        isLight ? 'light' : 'dark'
    );

    updateThemeBtn(isLight);
}


//Update theme button text and icon
function updateThemeBtn(isLight) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');

    if (icon && text) {
        icon.textContent = isLight ? '🌙' : '☀️';
        text.textContent = isLight ? 'Night Mode' : 'Day Mode';
    }
}


//Toggle mobile navigation menu
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');

    if (drawer) {
        drawer.classList.toggle('open');
    }
}


//Fetch events for display on index.html
async function fetchFeaturedEvents() {
    try {
        const response = await fetch('/api/events');
        const result = await response.json();

        if (result.success) {

            //Combine the four default events with database events
            const allEvents = [
                ...DEFAULT_EVENTS,
                ...result.data
            ];

            renderGrid(allEvents, 'trending-grid');
        }

    } catch (err) {

        console.error('Error loading events:', err);

        //Show the four demo events even if the database is unavailable
        renderGrid(DEFAULT_EVENTS, 'trending-grid');
    }
}


//Homepage search functionality
function executeHeroSearch() {
    const searchInput = document.getElementById('hero-search-input');

    const query = searchInput.value.trim();

    if (query) {
        window.location.href =
            `explore.html?search=${encodeURIComponent(query)}`;
    }
}


//Fetch events from backend with active query parameters
async function fetchEventsWithFilters() {

    const urlParams = new URLSearchParams(
        window.location.search
    );

    const searchQuery = urlParams.get('search');

    let apiPath = '/api/events';

    if (searchQuery) {
        apiPath +=
            `?search=${encodeURIComponent(searchQuery)}`;
    }

    try {

        const response = await fetch(apiPath);

        const result = await response.json();

        if (result.success) {
            renderGrid(result.data, 'results-grid');
        }

    } catch (err) {

        console.error(
            'Error fetching filtered events:',
            err
        );
    }
}


//Dynamically render HTML event card structures into target container
function renderGrid(events, containerId) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    if (events.length === 0) {

        container.innerHTML = `
            <p style="
                color: var(--text-secondary);
                grid-column: 1/-1;
                text-align: center;
            ">
                No events found matching criteria.
            </p>
        `;

        return;
    }

    container.innerHTML = events.map(event => `

        <div class="event-card">

            <div class="image-placeholder">
                <span>${event.title}</span>
            </div>

            <div class="card-content">

                <span class="badge">
                    ${event.category}
                </span>

                <h4>
                    ${event.title}
                </h4>

                <p class="event-date">
                    🗓️ ${event.date ? event.date.split('T')[0] : ''}
                    at ${event.time}
                </p>

                <p class="event-loc">
                    📍 ${event.loc} (${event.scope})
                </p>

                <p style="
                    font-weight: bold;
                    margin-top: 0.25rem;
                ">
                    ${event.price > 0
        ? `R${event.price}`
        : 'FREE'}
                </p>

                <!-- Connects card to details view -->
                <a
                    class="action-btn"
                    style="margin-top:0.5rem;"
                    href="details.html?id=${event.id}">
                    View Details
                </a>

            </div>

        </div>

    `).join('');
}


//Read event ID from query parameters and render dynamic details
async function loadEventDetailsPage() {

    const container =
        document.getElementById(
            'event-details-container'
        );

    if (!container) return;


    //Get the event ID from the URL
    const params =
        new URLSearchParams(
            window.location.search
        );

    const eventId = params.get('id');


    if (!eventId) {

        container.innerHTML = `
            <div class="form-card">

                <h2>Event Not Found</h2>

                <p style="
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                ">
                    No event was selected.
                </p>

                <a
                    href="index.html"
                    class="action-btn"
                    style="margin-top: 1.5rem;">
                    Back to Home
                </a>

            </div>
        `;

        return;
    }


    /*
     * Check if the selected event is one of
     * the four default demo events.
     */
    const demoEvent =
        DEFAULT_EVENTS.find(
            event => event.id === eventId
        );


    //If it is a demo event, display it directly
    if (demoEvent) {

        renderEventDetails(
            demoEvent,
            container
        );

        return;
    }


    try {

        //Get a real event from the backend
        const response =
            await fetch(
                `/api/events?id=${eventId}`
            );


        if (!response.ok) {
            throw new Error(
                'Failed to load event'
            );
        }


        const result =
            await response.json();


        if (
            !result.success ||
            result.data.length === 0
        ) {

            container.innerHTML = `
                <div class="form-card">

                    <h2>Event Not Found</h2>

                    <p style="
                        color: var(--text-secondary);
                        margin-top: 0.5rem;
                    ">
                        The event you're looking for
                        could not be found.
                    </p>

                    <a
                        href="index.html"
                        class="action-btn"
                        style="margin-top: 1.5rem;">
                        Back to Home
                    </a>

                </div>
            `;

            return;
        }


        const event = result.data[0];


        //Display real database event
        renderEventDetails(
            event,
            container
        );


    } catch (error) {

        console.error(
            'Error loading event details:',
            error
        );


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


//Render the event details page
function renderEventDetails(event, container) {

    container.innerHTML = `

        <div
            class="form-card"
            style="max-width: 850px;">

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
                ${event.description ||
    'No description available.'}
            </p>


            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 2rem;
            ">


                <div class="dash-card">

                    <p style="
                        color: var(--text-secondary);
                    ">
                        📅 Date
                    </p>

                    <p style="
                        margin-top: 0.4rem;
                        font-weight: 600;
                    ">
                        ${event.date}
                    </p>

                </div>


                <div class="dash-card">

                    <p style="
                        color: var(--text-secondary);
                    ">
                        🕐 Time
                    </p>

                    <p style="
                        margin-top: 0.4rem;
                        font-weight: 600;
                    ">
                        ${event.time}
                    </p>

                </div>


                <div class="dash-card">

                    <p style="
                        color: var(--text-secondary);
                    ">
                        📍 Location
                    </p>

                    <p style="
                        margin-top: 0.4rem;
                        font-weight: 600;
                    ">
                        ${event.loc}
                    </p>

                </div>


                <div class="dash-card">

                    <p style="
                        color: var(--text-secondary);
                    ">
                        🌍 Province
                    </p>

                    <p style="
                        margin-top: 0.4rem;
                        font-weight: 600;
                    ">
                        ${event.scope}
                    </p>

                </div>


                <div class="dash-card">

                    <p style="
                        color: var(--text-secondary);
                    ">
                        👤 Organizer
                    </p>

                    <p style="
                        margin-top: 0.4rem;
                        font-weight: 600;
                    ">
                        ${event.organizer}
                    </p>

                </div>


                <div class="dash-card">

                    <p style="
                        color: var(--text-secondary);
                    ">
                        🎟️ Ticket Price
                    </p>

                    <p style="
                        margin-top: 0.4rem;
                        font-weight: 700;
                        font-size: 1.2rem;
                    ">
                        ${Number(event.price || 0) > 0
        ? `R${Number(event.price).toFixed(2)}`
        : 'FREE'}
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
                    onclick="buyTicket('${event.id}')">
                    🎟️ Buy Ticket
                </button>


                <button
                    class="theme-toggle-btn"
                    onclick="saveEvent('${event.id}')">
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
}


//Buy Ticket button
//Open the mock ticket checkout
//Open the mock ticket checkout for demo and database events
async function buyTicket(eventId) {

    let selectedEvent = null;

    //Check if the event is one of the default demo events
    selectedEvent = DEFAULT_EVENTS.find(
        event => String(event.id) === String(eventId)
    );


    //If it is not a demo event, get it from the database
    if (!selectedEvent) {

        try {

            const response =
                await fetch(
                    `/api/events?id=${encodeURIComponent(eventId)}`
                );


            if (!response.ok) {
                throw new Error('Failed to load event');
            }


            const result =
                await response.json();


            if (
                !result.success ||
                result.data.length === 0
            ) {

                alert(
                    'The selected event could not be found.'
                );

                return;
            }


            //Use the database event
            selectedEvent = result.data[0];


        } catch (error) {

            console.error(
                'Error loading event for checkout:',
                error
            );

            alert(
                'Unable to open checkout. Please try again.'
            );

            return;
        }
    }


    //Create the mock checkout screen
    const checkout =
        document.createElement('div');


    checkout.id =
        'checkout-modal';


    checkout.innerHTML = `

        <div class="checkout-overlay">

            <div class="checkout-card">

                <button
                    class="checkout-close"
                    onclick="closeCheckout()">
                    ×
                </button>


                <h2>
                    Checkout
                </h2>


                <p class="checkout-demo">
                    Demo payment only — no real payment
                    will be processed.
                </p>


                <div class="checkout-event">

                    <h3>
                        ${selectedEvent.title}
                    </h3>


                    <p>
                        🎟️ Ticket

                        <strong>
                            ${
        Number(selectedEvent.price || 0) > 0
            ? `R${Number(selectedEvent.price).toFixed(2)}`
            : 'FREE'
    }
                        </strong>
                    </p>

                </div>


                <h3 class="payment-heading">
                    Payment Method
                </h3>


                <div class="payment-methods">

                    <label>

                        <input
                            type="radio"
                            name="payment-method"
                            value="card"
                            checked
                            onchange="changePaymentMethod()">

                        Credit / Debit Card

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="payment-method"
                            value="eft"
                            onchange="changePaymentMethod()">

                        EFT

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="payment-method"
                            value="payfast"
                            onchange="changePaymentMethod()">

                        PayFast

                    </label>

                </div>


                <div id="payment-fields">

                    <label>
                        Card Number
                    </label>


                    <input
                        type="text"
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        maxlength="19">


                    <div class="checkout-row">

                        <div>

                            <label>
                                Expiry
                            </label>


                            <input
                                type="text"
                                id="card-expiry"
                                placeholder="MM/YY"
                                maxlength="5">

                        </div>


                        <div>

                            <label>
                                CVV
                            </label>


                            <input
                                type="text"
                                id="card-cvv"
                                placeholder="123"
                                maxlength="3">

                        </div>

                    </div>

                </div>


                <button
                    class="action-btn checkout-pay-btn"
                    onclick="processMockPayment(
                        '${selectedEvent.id}',
                        ${Number(selectedEvent.price || 0)}
                    )">

                    Pay ${
        Number(selectedEvent.price || 0) > 0
            ? `R${Number(selectedEvent.price).toFixed(2)}`
            : 'R0'
    }

                </button>

            </div>

        </div>
    `;


    document.body.appendChild(checkout);
}

//Change the fields according to the selected payment method
function changePaymentMethod() {

    const selectedMethod =
        document.querySelector(
            'input[name="payment-method"]:checked'
        ).value;

    const fields =
        document.getElementById(
            'payment-fields'
        );

    if (selectedMethod === 'card') {

        fields.innerHTML = `

            <label>
                Card Number
            </label>

            <input
                type="text"
                id="card-number"
                placeholder="0000 0000 0000 0000"
                maxlength="19">

            <div class="checkout-row">

                <div>

                    <label>
                        Expiry
                    </label>

                    <input
                        type="text"
                        id="card-expiry"
                        placeholder="MM/YY"
                        maxlength="5">

                </div>

                <div>

                    <label>
                        CVV
                    </label>

                    <input
                        type="text"
                        id="card-cvv"
                        placeholder="123"
                        maxlength="3">

                </div>

            </div>
        `;

    } else if (selectedMethod === 'eft') {

        fields.innerHTML = `

            <label>
                Bank
            </label>

            <select id="eft-bank">

                <option value="">
                    Select your bank
                </option>

                <option>
                    Capitec
                </option>

                <option>
                    FNB
                </option>

                <option>
                    Standard Bank
                </option>

                <option>
                    Absa
                </option>

                <option>
                    Nedbank
                </option>

            </select>

            <label>
                Account Number
            </label>

            <input
                type="text"
                id="eft-account"
                placeholder="0000000000">

        `;

    } else {

        fields.innerHTML = `

            <div class="payfast-info">

                <strong>PayFast</strong>

                <p>
                    You will be redirected to PayFast
                    to complete your payment.
                </p>

                <p>
                    <small>
                        Demo only — no real payment will occur.
                    </small>
                </p>

            </div>

        `;
    }
}


//Process the fake payment
function processMockPayment(eventId, price) {

    const selectedMethod =
        document.querySelector(
            'input[name="payment-method"]:checked'
        ).value;

    //Generate a fake EventHub reference
    const reference =
        'EH-' +
        Math.floor(
            100000 + Math.random() * 900000
        );

    const checkout =
        document.getElementById(
            'checkout-modal'
        );

    checkout.innerHTML = `

        <div class="checkout-overlay">

            <div class="checkout-card success-card">

                <div class="success-icon">
                    ✓
                </div>

                <h2>
                    Payment Successful!
                </h2>

                <p>
                    Your ticket has been reserved successfully.
                </p>

                <div class="ticket-reference">

                    <span>
                        Ticket Reference
                    </span>

                    <strong>
                        ${reference}
                    </strong>

                </div>

                <p class="payment-method-result">

                    Payment method:
                    ${selectedMethod.toUpperCase()}

                </p>

                <p class="checkout-demo">
                    This was a simulated payment for demonstration purposes.
                </p>

                <button
                    class="action-btn"
                    onclick="closeCheckout()">

                    Back to Event

                </button>

            </div>

        </div>
    `;
}


//Close the checkout modal
function closeCheckout() {

    const checkout =
        document.getElementById(
            'checkout-modal'
        );

    if (checkout) {
        checkout.remove();
    }
}


//Save Event button
function saveEvent(eventId) {

    alert(
        `Event #${eventId} has been selected to save.`
    );
}


//Dynamically attach query filtering to checkbox changes
function setupFilterListeners() {

    const checkboxes =
        document.querySelectorAll(
            '.geo-filter, .cat-filter'
        );


    checkboxes.forEach(box => {

        box.addEventListener(
            'change',
            async () => {

                const activeScopes =
                    Array.from(
                        document.querySelectorAll(
                            '.geo-filter:checked'
                        )
                    ).map(
                        b => b.value
                    );


                const activeCats =
                    Array.from(
                        document.querySelectorAll(
                            '.cat-filter:checked'
                        )
                    ).map(
                        b => b.value
                    );


                let params = [];


                if (
                    activeScopes.length > 0 &&
                    !activeScopes.includes('National')
                ) {

                    params.push(
                        `province=${encodeURIComponent(
                            activeScopes[0]
                        )}`
                    );
                }


                if (activeCats.length > 0) {

                    params.push(
                        `category=${encodeURIComponent(
                            activeCats.join(',')
                        )}`
                    );
                }


                const queryString =
                    params.length > 0
                        ? `?${params.join('&')}`
                        : '';


                const res =
                    await fetch(
                        `/api/events${queryString}`
                    );


                const result =
                    await res.json();


                if (result.success) {
                    renderGrid(
                        result.data,
                        'results-grid'
                    );
                }

            }
        );
    });
}


//Intercept form submission and send new event payload via POST to Express API
async function handlePostEvent(e) {

    e.preventDefault();


    const payload = {

        title:
        document.getElementById(
            'post-title'
        ).value,

        category:
        document.getElementById(
            'post-category'
        ).value,

        price:
            parseFloat(
                document.getElementById(
                    'post-price'
                ).value
            ) || 0,

        area:
        document.getElementById(
            'post-area'
        ).value,

        province:
        document.getElementById(
            'post-province'
        ).value,

        date:
        document.getElementById(
            'post-date'
        ).value,

        time:
        document.getElementById(
            'post-time'
        ).value,

        description:
        document.getElementById(
            'post-description'
        ).value
    };


    try {

        const res =
            await fetch(
                '/api/events',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body:
                        JSON.stringify(payload)
                }
            );


        const data =
            await res.json();


        if (data.success) {

            alert(
                'Event created successfully.'
            );

            window.location.href =
                'explore.html';
        }

    } catch (err) {

        alert(
            'Failed to create event!'
        );
    }
}


//Mock login handler
async function handleLogin(e) {

    e.preventDefault();

    alert(
        'Logged In Successfully!'
    );

    window.location.href =
        'dashboard.html';
}


//Mock sign up handler
async function handleSignUp(e) {

    e.preventDefault();

    alert(
        'Account Registered! Please Login.'
    );

    window.location.href =
        'login.html';
}