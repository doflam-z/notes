// script.js - Main application logic

// Configuration
const DOCS_PATH = 'docs';

// Application state management
let currentState = {
  directories: [],       // Directory structure with files
  currentDirectory: null, // Currently selected directory
  currentDocument: null   // Currently loaded document
};

// DOM Elements cache
const directoryListEl = document.getElementById('directory-list');
const documentTitleEl = document.getElementById('document-title');
const documentBodyEl = document.getElementById('document-body');
const outlineContentEl = document.getElementById('outline-content');

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Load directory structure and set up event listeners
  await loadDirectoryStructure();
  setupEventListeners();

  // Check if there's a document specified in the URL
  const urlParams = parseUrlParams();
  if (urlParams) {
    // Try to load the requested document
    try {
      await loadDocument(urlParams.dirName, urlParams.fileName);
    } catch (error) {
      // If failed to load the requested document, load a default one
      loadDefaultDocument();
    }
  } else {
    // Load the first document by default
    loadDefaultDocument();
  }
});

/**
 * Load directory structure from the backend API
 */
async function loadDirectoryStructure() {
  try {
    const response = await fetch('/api/documents');
    if (response.ok) {
      const rawDirectories = await response.json();
      // Transform backend data to match frontend state structure
      currentState.directories = rawDirectories.map(dir => ({
        name: dir.name,
        expanded: false, // All directories are collapsed by default
        files: dir.files || []
      }));
    } else {
      throw new Error('Failed to load directory structure');
    }

    renderDirectoryStructure();
  } catch (error) {
    // Use empty directory structure on error
    currentState.directories = [];
    renderDirectoryStructure();
  }
}

/**
 * Render the directory structure in the sidebar
 */
function renderDirectoryStructure() {
  directoryListEl.innerHTML = '';

  currentState.directories.forEach(dir => {
    const dirItemEl = document.createElement('li');
    dirItemEl.className = 'directory-item';
    
    // Create directory item with header and file list
    dirItemEl.innerHTML = `
      <div class="directory-header ${dir.expanded ? 'active' : ''}" data-dir="${dir.name}">
        <span class="directory-name">${dir.name}</span>
        <span class="toggle-icon ${dir.expanded ? 'rotated' : ''}">▶</span>
      </div>
      <ul class="file-list ${dir.expanded ? 'expanded' : ''}" id="files-${dir.name}">
        ${dir.files.map(file => `
          <li class="file-item" data-dir="${dir.name}" data-file="${file}">${file.replace('.md', '').replace(/^\d+/, '')}</li>
        `).join('')}
      </ul>
    `;

    directoryListEl.appendChild(dirItemEl);
  });
}

/**
 * Toggle directory expanded/collapsed state
 * @param {string} dirName - Name of the directory to toggle
 */
async function loadDirectory(dirName) {
  // Update state - toggle directory expanded state
  let wasExpanded = false;
  currentState.directories.forEach(dir => {
    if (dir.name === dirName) {
      wasExpanded = dir.expanded;
      dir.expanded = !dir.expanded; // Toggle expand/collapse
    }
  });

  currentState.currentDirectory = dirName;
  renderDirectoryStructure();

  // If directory was not previously expanded, we might need to wait for DOM update
  if (!wasExpanded) {
    // Force a reflow to ensure DOM is updated
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }
}

/**
 * Load and display a document
 * @param {string} dirName - Directory name
 * @param {string} fileName - File name
 */
async function loadDocument(dirName, fileName) {
  try {
    // Update state
    currentState.currentDirectory = dirName;
    currentState.currentDocument = fileName;

    // Update UI to show active document
    document.querySelectorAll('.file-item').forEach(el => {
      el.classList.remove('active');
    });

    const activeFileEl = document.querySelector(`.file-item[data-dir="${dirName}"][data-file="${fileName}"]`);
    if (activeFileEl) {
      activeFileEl.classList.add('active');
    }

    // Load document content from backend API
    const response = await fetch(`/api/document/${encodeURIComponent(dirName)}/${encodeURIComponent(fileName)}`);
    if (response.ok) {
      const data = await response.json();
      const content = data.content;

      // Render document title and content
      documentTitleEl.textContent = fileName.replace('.md', '');
      documentBodyEl.innerHTML = marked.parse(content);
    } else {
      throw new Error('Failed to load document, status: ' + response.status);
    }

    // Generate outline from document headings
    generateOutline();

    // Update URL to reflect current document
    const newUrl = `/docs/${encodeURIComponent(dirName)}/${encodeURIComponent(fileName)}`;
    history.pushState({ dirName, fileName }, '', newUrl);

    // Scroll to top of document
    document.querySelector('.main-content').scrollTop = 0;
  } catch (error) {
    documentBodyEl.innerHTML = '<p>Error loading document: ' + error.message + '</p>';
    throw error;
  }
}

/**
 * Generate outline from document headings
 */
function generateOutline() {
  // Clear previous outline
  outlineContentEl.innerHTML = '';

  // Get all headings from the document
  const headings = documentBodyEl.querySelectorAll('h1, h2, h3, h4, h5, h6');

  if (headings.length === 0) {
    outlineContentEl.innerHTML = '<p>No headings found</p>';
    return;
  }

  // Create outline list
  const outlineListEl = document.createElement('ul');
  outlineListEl.className = 'outline-list';

  headings.forEach((heading, index) => {
    // Assign ID to heading if it doesn't have one
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    // Create outline item
    const outlineItemEl = document.createElement('li');
    outlineItemEl.className = 'outline-item';

    const level = parseInt(heading.tagName.charAt(1));
    const outlineLinkEl = document.createElement('a');
    outlineLinkEl.href = `#${heading.id}`;
    outlineLinkEl.className = `outline-link level-${level}`;
    outlineLinkEl.textContent = heading.textContent;

    outlineItemEl.appendChild(outlineLinkEl);
    outlineListEl.appendChild(outlineItemEl);
  });

  outlineContentEl.appendChild(outlineListEl);
}

/**
 * Set up event listeners for user interactions
 */
function setupEventListeners() {
  // Directory toggle
  directoryListEl.addEventListener('click', async (e) => {
    const dirHeader = e.target.closest('.directory-header');
    if (dirHeader) {
      const dirName = dirHeader.getAttribute('data-dir');
      await loadDirectory(dirName);
      return;
    }

    // File selection
    const fileItem = e.target.closest('.file-item');
    if (fileItem) {
      const dirName = fileItem.getAttribute('data-dir');
      const fileName = fileItem.getAttribute('data-file');
      await loadDocument(dirName, fileName);
    }
  });

  // Outline link scrolling
  outlineContentEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('outline-link')) {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', async (event) => {
    if (event.state) {
      await loadDocument(event.state.dirName, event.state.fileName);
    } else {
      // Load default document if no state
      if (currentState.directories.length > 0) {
        const firstDir = currentState.directories[0];
        if (firstDir.files.length > 0) {
          await loadDocument(firstDir.name, firstDir.files[0]);
        }
      }
    }
  });
}

/**
 * Helper function to load the default document
 */
function loadDefaultDocument() {
  if (currentState.directories.length > 0) {
    const firstDir = currentState.directories[0];
    loadDirectory(firstDir.name).then(() => {
      if (firstDir.files.length > 0) {
        loadDocument(firstDir.name, firstDir.files[0]);
      }
    });
  }
}

/**
 * Parse URL parameters to load specific document
 * @returns {Object|null} Object with dirName and fileName, or null if not found
 */
function parseUrlParams() {
  const pathParts = window.location.pathname.split('/').filter(part => part !== '');

  // Check if URL follows the pattern /docs/dirName/fileName
  if (pathParts.length >= 3 && pathParts[0] === 'docs') {
    const dirName = decodeURIComponent(pathParts[1]);
    const fileName = decodeURIComponent(pathParts.slice(2).join('/'));

    // Always return the parsed values even if we haven't loaded the directory structure yet
    return { dirName, fileName };
  }

  return null;
}