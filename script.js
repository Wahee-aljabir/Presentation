// Utility functions
const loadContent = async () => {
    try {
        const response = await fetch('/data/content.json');
        if (!response.ok) throw new Error('Failed to load content');
        return await response.json();
    } catch (error) {
        console.error('Error loading content:', error);
        return null;
    }
};

const createPresentationContent = (presentation) => {
    switch (presentation.type) {
        case 'prezi':
            return `<iframe src="${presentation.presentationUrl}" 
                id="iframe_container" 
                frameborder="0" 
                webkitallowfullscreen="" 
                mozallowfullscreen="" 
                allowfullscreen="" 
                allow="autoplay; fullscreen" 
                height="315" 
                width="560"></iframe>`;
        default:
            return `<div class="placeholder-content">${presentation.title}</div>`;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const toggleIcon = document.querySelector('.toggle-icon');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme;
        toggleIcon.textContent = savedTheme === 'dark-mode' ? '☀️' : '🌙';
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            toggleIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            toggleIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // Load content data
    const contentData = await loadContent();
    if (!contentData) return;

    // Create presentation content based on type
    const createPresentationContent = (presentation) => {
        switch (presentation.type.toLowerCase()) {
            case 'prezi':
                return `<iframe src="${presentation.presentationUrl}" 
                    id="iframe_container" 
                    frameborder="0" 
                    webkitallowfullscreen="" 
                    mozallowfullscreen="" 
                    allowfullscreen="" 
                    allow="autoplay; fullscreen" 
                    height="600" 
                    width="100%"></iframe>`;
            case 'slidesgpt':
                return `<iframe src="${presentation.presentationUrl}"
                    frameborder="0"
                    allowfullscreen=""
                    height="600"
                    width="100%"></iframe>`;
            default:
                return `<div class="presentation-placeholder">
                    <h3>${presentation.title}</h3>
                    <p>Presentation type not supported</p>
                </div>`;
        }
    };

    // Modal functionality
    const modal = document.getElementById('presentationModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');

    const openModal = (presentation) => {
        modalContent.innerHTML = createPresentationContent(presentation);
        modal.style.display = 'block';
    };

    const closeModalHandler = () => {
        modal.style.display = 'none';
        modalContent.innerHTML = '';
    };

    closeModal?.addEventListener('click', closeModalHandler);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModalHandler();
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModalHandler();
        }
    });

    // Handle folders page
    const foldersGrid = document.querySelector('.folders-grid');
    if (foldersGrid) {
        foldersGrid.innerHTML = contentData.folders.map(folder => `
            <a href="presentations.html?category=${folder.id}" class="folder-card">
                <div class="folder-icon">
                    <span class="material-icons">${folder.icon}</span>
                </div>
                <div class="folder-content">
                    <h2>${folder.title}</h2>
                    <p>${folder.description}</p>
                </div>
            </a>
        `).join('');
    }

    // Handle presentations page
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const presentationsContainer = document.getElementById('presentationsContainer');

    if (category && presentationsContainer) {
        const folder = contentData.folders.find(f => f.id === category);
        if (folder) {
            const pageTitle = document.querySelector('.page-title');
            pageTitle.textContent = folder.title;

            presentationsContainer.innerHTML = folder.presentations.map(pres => `
                <div class="presentation-card">
                    <div class="presentation-thumbnail">
                        <img src="${pres.thumbnail}" alt="${pres.title}">
                    </div>
                    <div class="presentation-content">
                        <h2>${pres.title}</h2>
                        <p>${pres.description}</p>
                        <button class="present-btn" data-id="${pres.id}">Present</button>
                    </div>
                </div>
            `).join('');

            // Add click handlers for present buttons
            document.querySelectorAll('.present-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const presentationId = button.dataset.id;
                    const presentation = folder.presentations.find(p => p.id === presentationId);
                    if (presentation) {
                        modalContent.innerHTML = createPresentationContent(presentation);
                        modal.style.display = 'block';
                    }
                });
            });
        }
    }
});