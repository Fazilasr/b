document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const hardshipForm = document.getElementById('hardship-form');
    const hardshipInput = document.getElementById('hardship-input');
    const categorySelect = document.getElementById('category-select');
    const hardshipContainer = document.getElementById('hardship-container');
    const filterSelect = document.getElementById('filter-select');
    const sortSelect = document.getElementById('sort-select');
    const loadMoreBtn = document.getElementById('load-more');
    const charCount = document.querySelector('.char-count');
    const myHardshipsBtn = document.getElementById('my-hardships-btn');

    // Constants
    const MAX_CHARS = 1000;
    let hardships = JSON.parse(localStorage.getItem('hardships')) || [];
    let visibleHardships = 6;
    let currentUserId = 1; // Simulated current user ID (for demo purposes)
    let showOnlyMyHardships = false;

    // Initial render of hardships
    renderHardships();

    // Attach event listeners
    attachEventListeners();

    /* ========================================================
    | EVENT LISTENER SETUP: All event handlers
    ========================================================= */
    function attachEventListeners() {
        // Form submission event
        hardshipForm.addEventListener('submit', submitHardship);

        // Character count for the textarea input
        hardshipInput.addEventListener('input', updateCharCount);

        // Filter and sort change events
        filterSelect.addEventListener('change', renderHardships);
        sortSelect.addEventListener('change', renderHardships);

        // Load more hardships
        loadMoreBtn.addEventListener('click', () => {
            visibleHardships += 6;
            renderHardships();
        });

        // Toggle between all hardships and user-only hardships
        myHardshipsBtn.addEventListener('click', toggleMyHardships);
    }

    /* ========================================================
    | SUBMIT HARDSHIP: Add a new hardship to the list
    ========================================================= */
    function submitHardship(e) {
        e.preventDefault();

        const hardshipText = hardshipInput.value.trim();
        const category = categorySelect.value;

        if (hardshipText && hardshipText.length <= MAX_CHARS && category) {
            // Create new hardship object
            const newHardship = {
                id: Date.now(), // Unique ID using timestamp
                userId: currentUserId, // Assign current user ID
                text: hardshipText,
                category: category,
                comments: [],
                likes: 0,
                isLiked: false,
                createdAt: new Date().toISOString(),
                lastEdited: null
            };

            // Add hardship to the array and save to localStorage
            hardships.unshift(newHardship);
            saveHardships();

            // Re-render hardships and reset the form
            renderHardships();
            resetForm();
        } else {
            alert(`Please enter a valid hardship (1-${MAX_CHARS} characters) and select a category.`);
        }
    }

    /* ========================================================
    | RESET FORM: Clear form inputs and update character count
    ========================================================= */
    function resetForm() {
        hardshipInput.value = '';
        categorySelect.value = '';
        updateCharCount(); // Reset character count display
    }

    /* ========================================================
    | SAVE HARDSHIPS: Persist hardships to localStorage
    ========================================================= */
    function saveHardships() {
        localStorage.setItem('hardships', JSON.stringify(hardships));
    }

    /* ========================================================
    | RENDER HARDSHIPS: Filter and Sort, then display hardships
    ========================================================= */
    function renderHardships() {
        hardshipContainer.innerHTML = '';

        // Filter and sort hardships
        let filteredHardships = filterHardships(hardships, filterSelect.value);
        
        if (showOnlyMyHardships) {
            filteredHardships = filteredHardships.filter(hardship => hardship.userId === currentUserId);
        }

        // Sort hardships based on the selected criteria
        const sortedHardships = sortHardships(filteredHardships);

        // Limit the number of visible hardships
        const hardshipsToShow = sortedHardships.slice(0, visibleHardships);

        // Render each hardship
        hardshipsToShow.forEach(hardship => renderHardship(hardship));

        // Toggle the visibility of the "Load More" button
        loadMoreBtn.style.display = visibleHardships >= sortedHardships.length ? 'none' : 'block';
    }

    /* ========================================================
    | FILTER HARDSHIPS: Filter by category
    ========================================================= */
    function filterHardships(hardships, category) {
        return category === 'all' ? hardships : hardships.filter(h => h.category === category);
    }

    /* ========================================================
    | SORT HARDSHIPS: Sort by selected option
    ========================================================= */
    function sortHardships(hardships) {
        const sortOption = sortSelect.value;

        switch (sortOption) {
            case 'most-liked':
                // Sort by most likes (descending order)
                return hardships.sort((a, b) => b.likes - a.likes);
            case 'newest':
                // Sort by newest (most recent date)
                return hardships.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                // Sort by oldest (least recent date)
                return hardships.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'most-comments':
                // Sort by most comments (descending order)
                return hardships.sort((a, b) => b.comments.length - a.comments.length);
            default:
                return hardships;
        }
    }

    /* ========================================================
    | RENDER HARDSHIP: Create a hardship card and display it
    ========================================================= */
    function renderHardship(hardship) {
        const hardshipCard = document.createElement('div');
        hardshipCard.classList.add('hardship-card');
        hardshipCard.dataset.id = hardship.id;

        hardshipCard.innerHTML = `
            <div class="category-tag category-${hardship.category}">${hardship.category}</div>
            <p class="hardship-text">${hardship.text}</p>
            <p class="hardship-meta">
                Posted: ${formatDate(hardship.createdAt)}
                ${hardship.lastEdited ? `<br>Last edited: ${formatDate(hardship.lastEdited)}` : ''}
            </p>
            <div class="hardship-actions">
                <button class="like-btn${hardship.isLiked ? ' liked' : ''}" onclick="toggleLike(${hardship.id})">
                    <i class="fas fa-heart"></i> <span class="like-count">${hardship.likes}</span>
                </button>
                <button class="comment-btn" onclick="toggleComments(${hardship.id})">
                    <i class="fas fa-comment"></i> ${hardship.comments.length}
                </button>
            </div>
            <div class="comments-section" id="comments-section-${hardship.id}" style="display: none;">
                <div class="comments-list">
                    ${hardship.comments.map(comment => `
                        <div class="comment">
                            <p>${comment.text}</p>
                            <small>${formatDate(comment.createdAt)}</small>
                        </div>
                    `).join('')}
                </div>
                <form class="comment-form" onsubmit="addComment(event, ${hardship.id})">
                    <textarea placeholder="Add a comment..." required></textarea>
                    <button type="submit">Submit Comment</button>
                </form>
            </div>
        `;

        hardshipContainer.appendChild(hardshipCard);
    }

    /* ========================================================
    | TOGGLE MY HARDSHIPS: Show/hide user-only hardships
    ========================================================= */
    function toggleMyHardships() {
        showOnlyMyHardships = !showOnlyMyHardships;
        renderHardships();
        myHardshipsBtn.textContent = showOnlyMyHardships ? 'All Submissions' : 'My Submissions';
    }

    /* ========================================================
    | CHARACTER COUNT: Update character count in real-time
    ========================================================= */
    function updateCharCount() {
        const currentLength = hardshipInput.value.length;
        charCount.textContent = `${currentLength} / ${MAX_CHARS}`;
        charCount.style.color = currentLength > MAX_CHARS ? 'red' : '';
    }

    /* ========================================================
    | HELPER FUNCTIONS: Format date and handle comments/likes
    ========================================================= */
    window.toggleLike = (id) => {
        const hardship = hardships.find(h => h.id === id);
        if (hardship) {
            hardship.isLiked = !hardship.isLiked;
            hardship.likes += hardship.isLiked ? 1 : -1;
            saveHardships();
            renderHardships();
        }
    };

    window.toggleComments = (id) => {
        const commentsSection = document.getElementById(`comments-section-${id}`);
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    };

    window.addComment = (e, hardshipId) => {
        e.preventDefault();
        const hardship = hardships.find(h => h.id === hardshipId);
        const commentText = e.target.querySelector('textarea').value.trim();
        if (hardship && commentText) {
            const newComment = {
                id: Date.now(),
                text: commentText,
                createdAt: new Date().toISOString()
            };
            hardship.comments.push(newComment);
            saveHardships();
            renderHardships();
        }
    };

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});