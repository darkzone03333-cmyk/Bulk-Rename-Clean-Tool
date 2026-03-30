/**
 * Bulk Rename & Clean Tool - Enhanced Version
 * Features: Drag-to-reorder, Sort, Filter, Dark Mode, Undo, Timestamp
 */

// ============================================
// Global State
// ============================================
let uploadedFiles = [];          // Array of File objects
let renamedFiles = [];           // Array of {original, newName, file}
let historyStack = [];           // Stack for undo functionality
let isProcessing = false;        // Prevent multiple operations
let currentFilter = 'all';       // Current file type filter
let currentSort = 'original';    // Current sort method

// File type categories for filtering
const FILE_CATEGORIES = {
    images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'],
    videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'],
    documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma', 'm4a']
};

// ============================================
// DOM Elements
// ============================================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileCount = document.getElementById('fileCount');
const fileCountStatus = document.getElementById('fileCountStatus');
const baseNameInput = document.getElementById('baseName');
const dateFormatSelect = document.getElementById('dateFormat');
const fileFilterSelect = document.getElementById('fileFilter');
const sortBySelect = document.getElementById('sortBy');
const renameBtn = document.getElementById('renameBtn');
const uppercaseBtn = document.getElementById('uppercaseBtn');
const lowercaseBtn = document.getElementById('lowercaseBtn');
const undoBtn = document.getElementById('undoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const tableBody = document.getElementById('tableBody');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// ============================================
// Initialization
// ============================================
function init() {
    // Load dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Set up event listeners
    setupEventListeners();

    console.log('Bulk Rename & Clean Tool initialized');
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());

    // File input
    fileInput.addEventListener('change', handleFileSelect);

    // Buttons
    renameBtn.addEventListener('click', renameFiles);
    uppercaseBtn.addEventListener('click', () => convertCase('upper'));
    lowercaseBtn.addEventListener('click', () => convertCase('lower'));
    undoBtn.addEventListener('click', undoLastRename);
    downloadBtn.addEventListener('click', downloadAsZip);
    resetBtn.addEventListener('click', resetAll);

    // Controls
    fileFilterSelect.addEventListener('change', handleFilterChange);
    sortBySelect.addEventListener('change', handleSortChange);
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Table row dragging
    tableBody.addEventListener('dragstart', handleRowDragStart);
    tableBody.addEventListener('dragover', handleRowDragOver);
    tableBody.addEventListener('drop', handleRowDrop);
    tableBody.addEventListener('dragend', handleRowDragEnd);
}

// ============================================
// Drag & Drop File Upload
// ============================================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        addFiles(files);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        addFiles(files);
    }
}

// ============================================
// File Management
// ============================================
function addFiles(files) {
    const newFiles = Array.from(files).filter(file => {
        return !uploadedFiles.some(existing =>
            existing.name === file.name && existing.size === file.size
        );
    });

    if (newFiles.length === 0) {
        showNotification('All selected files are already added!', 'error');
        return;
    }

    uploadedFiles.push(...newFiles);
    updateFileCount();
    enableButtons();
    applySortAndFilter();
}

function updateFileCount() {
    const count = uploadedFiles.length;
    const countText = count === 1 ? '1 File Selected' : `${count} Files Selected`;
    if (fileCount) fileCount.textContent = countText;
    if (fileCountStatus) fileCountStatus.textContent = countText;
}

function enableButtons() {
    const hasFiles = uploadedFiles.length > 0;
    renameBtn.disabled = !hasFiles;
    uppercaseBtn.disabled = !hasFiles;
    lowercaseBtn.disabled = !hasFiles;
    resetBtn.disabled = !hasFiles;
    downloadBtn.disabled = renamedFiles.length === 0;
    undoBtn.disabled = historyStack.length === 0;
}

// ============================================
// Filtering & Sorting
// ============================================
function handleFilterChange(e) {
    currentFilter = e.target.value;
    applySortAndFilter();
}

function handleSortChange(e) {
    currentSort = e.target.value;
    applySortAndFilter();
}

function getFileCategory(filename) {
    const ext = getFileExtension(filename).toLowerCase().replace('.', '');
    for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
        if (extensions.includes(ext)) {
            return category;
        }
    }
    return 'other';
}

function applySortAndFilter() {
    let displayFiles = [...uploadedFiles];

    // Apply filter
    if (currentFilter !== 'all') {
        displayFiles = displayFiles.filter(file =>
            getFileCategory(file.name) === currentFilter
        );
    }

    // Apply sort
    switch (currentSort) {
        case 'name-asc':
            displayFiles.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            displayFiles.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'size-asc':
            displayFiles.sort((a, b) => a.size - b.size);
            break;
        case 'size-desc':
            displayFiles.sort((a, b) => b.size - a.size);
            break;
        case 'type':
            displayFiles.sort((a, b) => {
                const catA = getFileCategory(a.name);
                const catB = getFileCategory(b.name);
                return catA.localeCompare(catB);
            });
            break;
        case 'original':
        default:
            // Keep original order
            break;
    }

    // Update table with sorted/filtered files
    updatePreviewTable(displayFiles);
}

// ============================================
// Drag-to-Reorder
// ============================================
let draggedRow = null;
let draggedIndex = null;

function handleRowDragStart(e) {
    const row = e.target.closest('tr');
    if (!row || row.classList.contains('empty-message')) return;

    draggedRow = row;
    draggedIndex = Array.from(tableBody.querySelectorAll('tr')).indexOf(row);
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleRowDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const afterElement = getDragAfterElement(tableBody, e.clientY);
    if (afterElement == null) {
        tableBody.appendChild(draggedRow);
    } else {
        tableBody.insertBefore(draggedRow, afterElement);
    }
}

function handleRowDrop(e) {
    e.preventDefault();
    // Reorder uploadedFiles array based on new table order
    const rows = tableBody.querySelectorAll('tr');
    const newOrder = [];

    rows.forEach(row => {
        const cells = row.cells;
        if (cells.length >= 2) {
            const originalName = cells[1].textContent;
            const file = uploadedFiles.find(f => f.name === originalName);
            if (file) {
                newOrder.push(file);
            }
        }
    });

    uploadedFiles = newOrder;
    applySortAndFilter();
}

function handleRowDragEnd(e) {
    if (draggedRow) {
        draggedRow.classList.remove('dragging');
        draggedRow = null;
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('tr:not(.dragging):not(.empty-message)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ============================================
// Preview Table
// ============================================
function updatePreviewTable(displayFiles = null) {
    const filesToShow = displayFiles || uploadedFiles;

    if (filesToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-8 py-12 text-center text-on-surface-variant dark:text-slate-400 italic">
                    No files uploaded yet. Drop files or click "Select Files" to begin.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filesToShow.map((file, index) => {
        const originalName = file.name;
        const renamedItem = renamedFiles.find(r => r.original === originalName);
        const newName = renamedItem ? renamedItem.newName : originalName;
        const fileSize = formatFileSize(file.size);
        const fileType = getFileCategory(file.name);

        return `
            <tr draggable="true" data-index="${index}" data-filename="${originalName}">
                <td class="px-8 py-5">
                    <div class="drag-handle flex items-center justify-center">
                        <span class="material-symbols-outlined text-on-surface-variant dark:text-slate-400">drag_indicator</span>
                    </div>
                </td>
                <td class="px-8 py-5 font-body text-sm text-on-surface dark:text-slate-200">${escapeHtml(originalName)}</td>
                <td class="px-8 py-5 font-body text-sm font-semibold text-primary dark:text-inverse-primary">${escapeHtml(newName)}</td>
                <td class="px-8 py-5 font-body text-sm text-on-surface-variant dark:text-slate-400">${fileSize}</td>
                <td class="px-8 py-5 font-body text-sm text-on-surface-variant dark:text-slate-400 capitalize">${fileType}</td>
            </tr>
        `;
    }).join('');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// File Renaming Logic
// ============================================
async function renameFiles() {
    if (uploadedFiles.length === 0) return;

    const baseName = baseNameInput.value.trim() || 'File';
    const dateFormat = dateFormatSelect.value;
    const totalFiles = uploadedFiles.length;
    const padding = totalFiles.toString().length;

    // Save current state for undo
    saveStateForUndo();

    showProgress('Renaming files...', 0);

    renamedFiles = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const fileNumber = (i + 1).toString().padStart(padding, '0');
        const dateStamp = getDateStamp(dateFormat);
        const newName = `${baseName}${dateStamp}_${fileNumber}${getFileExtension(file.name)}`;

        renamedFiles.push({
            original: file.name,
            newName: newName,
            file: file
        });

        const progress = Math.round(((i + 1) / totalFiles) * 100);
        updateProgress(progress, `Renaming ${i + 1} of ${totalFiles}...`);
        await sleep(30);
    }

    hideProgress();
    updatePreviewTable();
    enableButtons();
    showNotification('Files renamed successfully!', 'success');
}

async function convertCase(direction) {
    if (uploadedFiles.length === 0) return;

    saveStateForUndo();

    const totalFiles = uploadedFiles.length;
    showProgress(`Converting to ${direction}case...`, 0);

    renamedFiles = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const ext = getFileExtension(file.name);
        const nameWithoutExt = file.name.substring(0, file.name.length - ext.length);

        const newName = direction === 'upper'
            ? nameWithoutExt.toUpperCase() + ext
            : nameWithoutExt.toLowerCase() + ext;

        renamedFiles.push({
            original: file.name,
            newName: newName,
            file: file
        });

        const progress = Math.round(((i + 1) / totalFiles) * 100);
        updateProgress(progress, `Converting ${i + 1} of ${totalFiles}...`);
        await sleep(30);
    }

    hideProgress();
    updatePreviewTable();
    enableButtons();
    showNotification(`Files converted to ${direction}case!`, 'success');
}

function getDateStamp(format) {
    if (!format) return '';

    const now = new Date();

    switch (format) {
        case 'YYYY-MM-DD':
            return now.toISOString().split('T')[0]; // YYYY-MM-DD
        case 'DD-MM-YYYY':
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            return `_${day}-${month}-${year}`;
        case 'MM-DD-YYYY':
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const yyyy = now.getFullYear();
            return `_${mm}-${dd}-${yyyy}`;
        case 'timestamp':
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            return `_${hh}${min}${ss}`;
        case 'datetime':
            const H = String(now.getHours()).padStart(2, '0');
            const M = String(now.getMinutes()).padStart(2, '0');
            const S = String(now.getSeconds()).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const y = now.getFullYear();
            return `_${y}${m}${d}_${H}${M}${S}`;
        default:
            return '';
    }
}

function getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot);
}

// ============================================
// Undo Functionality
// ============================================
function saveStateForUndo() {
    // Save current renamedFiles state
    historyStack.push({
        renamedFiles: [...renamedFiles],
        timestamp: Date.now()
    });

    // Keep only last 50 states to prevent memory issues
    if (historyStack.length > 50) {
        historyStack.shift();
    }

    enableButtons();
}

function undoLastRename() {
    if (historyStack.length === 0) {
        showNotification('Nothing to undo', 'error');
        return;
    }

    const previousState = historyStack.pop();
    renamedFiles = previousState.renamedFiles;

    updatePreviewTable();
    enableButtons();
    showNotification('Undo successful', 'info');
}

// ============================================
// ZIP Download
// ============================================
async function downloadAsZip() {
    if (renamedFiles.length === 0) {
        showNotification('No renamed files to download!', 'error');
        return;
    }

    if (typeof JSZip === 'undefined') {
        showNotification('JSZip library not loaded. Check your internet connection.', 'error');
        return;
    }

    const zip = new JSZip();
    const totalFiles = renamedFiles.length;

    showProgress('Creating ZIP file...', 0);

    for (let i = 0; i < renamedFiles.length; i++) {
        const item = renamedFiles[i];

        const blob = item.file instanceof Blob
            ? item.file
            : new Blob([item.file], { type: item.file.type || 'application/octet-stream' });

        zip.file(item.newName, blob);

        const progress = Math.round(((i + 1) / totalFiles) * 100);
        updateProgress(progress, `Adding ${i + 1} of ${totalFiles} to ZIP...`);
        await sleep(20);
    }

    showProgress('Generating ZIP...', 100);

    try {
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'renamed_files.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        hideProgress();
        showNotification('ZIP file downloaded successfully!', 'success');
    } catch (error) {
        hideProgress();
        console.error('ZIP creation error:', error);
        showNotification('Error creating ZIP file', 'error');
    }
}

// ============================================
// Reset
// ============================================
function resetAll() {
    if (isProcessing) return;

    if (confirm('Are you sure you want to clear all files?')) {
        uploadedFiles = [];
        renamedFiles = [];
        historyStack = [];
        fileInput.value = '';
        updateFileCount();
        applySortAndFilter();
        enableButtons();
        showNotification('All files cleared', 'info');
    }
}

// ============================================
// Dark Mode
// ============================================
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ============================================
// Progress Indicator
// ============================================
function showProgress(message, initialProgress = 0) {
    isProcessing = true;
    progressContainer.style.display = 'block';
    progressContainer.style.opacity = '1';
    progressContainer.style.pointerEvents = 'auto';
    progressFill.style.width = `${initialProgress}%`;
    progressText.textContent = message;
}

function updateProgress(percent, message) {
    progressFill.style.width = `${percent}%`;
    if (message) {
        progressText.textContent = message;
    }
}

function hideProgress() {
    isProcessing = false;
    progressContainer.style.opacity = '0';
    progressContainer.style.pointerEvents = 'none';
    setTimeout(() => {
        progressContainer.style.display = 'none';
    }, 300);
}

// ============================================
// Notifications
// ============================================
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#2f1bc8'};
        color: ${type === 'warning' ? '#212529' : 'white'};
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// Utility Functions
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Initialize App
// ============================================
init();
