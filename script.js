/**
 * Bulk Rename & Clean Tool
 * A client-side file renaming utility with ZIP download capability
 */

// ============================================
// Global Variables
// ============================================
let uploadedFiles = [];          // Array of File objects
let renamedFiles = [];           // Array of renamed file info { original, newName, file }
let isProcessing = false;        // Prevent multiple operations

// ============================================
// DOM Elements
// ============================================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileCount = document.getElementById('fileCount');
const baseNameInput = document.getElementById('baseName');
const renameBtn = document.getElementById('renameBtn');
const uppercaseBtn = document.getElementById('uppercaseBtn');
const lowercaseBtn = document.getElementById('lowercaseBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const tableBody = document.getElementById('tableBody');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// ============================================
// Event Listeners
// ============================================

// Drag and drop events
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
dropZone.addEventListener('click', () => fileInput.click());

// File input change
fileInput.addEventListener('change', handleFileSelect);

// Button events
renameBtn.addEventListener('click', renameFiles);
uppercaseBtn.addEventListener('click', () => convertCase('upper'));
lowercaseBtn.addEventListener('click', () => convertCase('lower'));
downloadBtn.addEventListener('click', downloadAsZip);
resetBtn.addEventListener('click', resetAll);

// ============================================
// Drag & Drop Handlers
// ============================================

/**
 * Prevent default behavior and add visual feedback
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
}

/**
 * Remove visual feedback
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
}

/**
 * Process dropped files
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        addFiles(files);
    }
}

/**
 * Handle file input selection
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        addFiles(files);
    }
}

// ============================================
// File Management
// ============================================

/**
 * Add files to the uploaded files array
 */
function addFiles(files) {
    // Convert FileList to array and filter out duplicates
    const newFiles = Array.from(files).filter(file => {
        // Check if file already exists by name and size
        return !uploadedFiles.some(existing =>
            existing.name === file.name && existing.size === file.size
        );
    });

    if (newFiles.length === 0) {
        alert('All selected files are already added!');
        return;
    }

    uploadedFiles.push(...newFiles);
    updateFileCount();
    enableButtons();
    updatePreviewTable();
    fileInput.value = ''; // Reset input
}

/**
 * Update the file count display
 */
function updateFileCount() {
    const count = uploadedFiles.length;
    fileCount.textContent = count === 1
        ? '1 file selected'
        : `${count} files selected`;
}

/**
 * Enable/disable buttons based on file count
 */
function enableButtons() {
    const hasFiles = uploadedFiles.length > 0;
    renameBtn.disabled = !hasFiles;
    uppercaseBtn.disabled = !hasFiles;
    lowercaseBtn.disabled = !hasFiles;
    resetBtn.disabled = !hasFiles;
    downloadBtn.disabled = renamedFiles.length === 0;
}

// ============================================
// Preview Table
// ============================================

/**
 * Update the preview table with current files
 */
function updatePreviewTable() {
    if (uploadedFiles.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="empty-message">No files uploaded yet</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = uploadedFiles.map((file, index) => {
        const originalName = file.name;
        const newName = renamedFiles[index]
            ? renamedFiles[index].newName
            : originalName;

        return `
            <tr>
                <td>${escapeHtml(originalName)}</td>
                <td>${escapeHtml(newName)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// File Renaming Logic
// ============================================

/**
 * Rename all files with sequential numbering
 */
async function renameFiles() {
    if (uploadedFiles.length === 0) return;

    const baseName = baseNameInput.value.trim() || 'File';
    const totalFiles = uploadedFiles.length;
    const padding = totalFiles.toString().length; // Dynamic padding based on file count

    showProgress('Renaming files...', 0);

    renamedFiles = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const fileNumber = (i + 1).toString().padStart(padding, '0');
        const newName = `${baseName}_${fileNumber}${getFileExtension(file.name)}`;

        renamedFiles.push({
            original: file.name,
            newName: newName,
            file: file
        });

        // Update progress
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        updateProgress(progress, `Renaming ${i + 1} of ${totalFiles}...`);

        // Small delay for visual effect
        await sleep(50);
    }

    hideProgress();
    updatePreviewTable();
    downloadBtn.disabled = false;

    showNotification('Files renamed successfully!', 'success');
}

/**
 * Get file extension including the dot
 */
function getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot);
}

/**
 * Convert filenames to uppercase or lowercase
 */
async function convertCase(direction) {
    if (uploadedFiles.length === 0) return;

    const totalFiles = uploadedFiles.length;
    showProgress(`Converting to ${direction}...`, 0);

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
        await sleep(50);
    }

    hideProgress();
    updatePreviewTable();
    downloadBtn.disabled = false;
    showNotification(`Files converted to ${direction}case!`, 'success');
}

// ============================================
// ZIP Download
// ============================================

/**
 * Download renamed files as a ZIP archive
 */
async function downloadAsZip() {
    if (renamedFiles.length === 0) {
        alert('No renamed files to download!');
        return;
    }

    // Check if JSZip is loaded
    if (typeof JSZip === 'undefined') {
        alert('JSZip library not loaded. Please check your internet connection.');
        return;
    }

    const zip = new JSZip();
    const totalFiles = renamedFiles.length;

    showProgress('Creating ZIP file...', 0);

    // Add each renamed file to the ZIP
    for (let i = 0; i < renamedFiles.length; i++) {
        const item = renamedFiles[i];

        // Read file as blob
        const blob = item.file instanceof Blob
            ? item.file
            : new Blob([item.file], { type: item.file.type || 'application/octet-stream' });

        zip.file(item.newName, blob);

        const progress = Math.round(((i + 1) / totalFiles) * 100);
        updateProgress(progress, `Adding ${i + 1} of ${totalFiles} to ZIP...`);
        await sleep(30);
    }

    showProgress('Generating ZIP...', 100);

    try {
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // Trigger download
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
        alert('Error creating ZIP file. Please try again.');
    }
}

// ============================================
// Reset
// ============================================

/**
 * Reset all files and state
 */
function resetAll() {
    if (isProcessing) return;

    if (confirm('Are you sure you want to clear all files?')) {
        uploadedFiles = [];
        renamedFiles = [];
        fileInput.value = '';
        updateFileCount();
        updatePreviewTable();
        enableButtons();
        showNotification('All files cleared', 'info');
    }
}

// ============================================
// Progress Indicator
// ============================================

/**
 * Show progress bar
 */
function showProgress(message, initialProgress = 0) {
    isProcessing = true;
    progressContainer.style.display = 'block';
    progressFill.style.width = `${initialProgress}%`;
    progressText.textContent = message;
}

/**
 * Update progress bar
 */
function updateProgress(percent, message) {
    progressFill.style.width = `${percent}%`;
    if (message) {
        progressText.textContent = message;
    }
}

/**
 * Hide progress bar
 */
function hideProgress() {
    isProcessing = false;
    setTimeout(() => {
        progressContainer.style.display = 'none';
    }, 500);
}

// ============================================
// Notifications
// ============================================

/**
 * Show a simple notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// Utility Functions
// ============================================

/**
 * Sleep utility for animation delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Initialization
// ============================================

// Log initialization
console.log('Bulk Rename & Clean Tool initialized');
