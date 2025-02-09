// Initialize jobs array from localStorage
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

// DOM Elements
const modal = document.getElementById("jobModal");
const jobForm = document.getElementById("jobForm");
const columns = document.querySelectorAll(".column");
const interviewDateModal = document.getElementById("interviewDateModal");
const interviewDateForm = document.getElementById("interviewDateForm");
const jobFieldSelect = document.getElementById('job-field-select');
const searchRecommendationsBtn = document.getElementById('search-recommendations');
const keywordInput = document.getElementById('keyword-input');
const keywordSearchBtn = document.getElementById('keyword-search-button');
const jobRecommendationsList = document.getElementById('job-recommendations-list');
let currentDraggedJob = null;
let draggedItem = null;

// API Configuration
const ADZUNA_API_ID = '2e26c206';
const ADZUNA_API_KEY = '4a5f49cd8d4d5561f95d5f38bad1b6f4';

// Modal Functions
function openModal() {
    const modal = document.getElementById("jobModal");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("jobModal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    jobForm.reset(); // Reset form when closing
    delete jobForm.dataset.editId; // Clear any edit ID
}

// Close modal when clicking outside
window.onclick = function(event) {
    const jobModal = document.getElementById("jobModal");
    const interviewModal = document.getElementById("interviewDateModal");
    
    if (event.target === jobModal) {
        closeModal();
    }
    if (event.target === interviewModal) {
        closeInterviewDateModal();
    }
};

// Form Submission Handler
jobForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const editId = this.dataset.editId;
    const jobData = {
        company: document.getElementById("company").value,
        position: document.getElementById("position").value,
        notes: document.getElementById("notes").value,
        dateAdded: new Date().toISOString()
    };

    if (editId) {
        // Editing existing job
        const index = jobs.findIndex(job => job.id === parseInt(editId));
        if (index !== -1) {
            jobs[index] = {
                ...jobs[index],
                ...jobData
            };
            delete this.dataset.editId; // Clear the edit ID
            showNotification('Job updated successfully!', 'success');
        }
    } else {
        // Adding new job
        const newJob = {
            id: Date.now(),
            status: "applied",
            ...jobData
        };
        jobs.push(newJob);
        showNotification('Job added successfully!', 'success');
    }

    saveJobs();
    renderJobs();
    updateStats();
    jobForm.reset();
    closeModal();
});

// Drag and Drop Functionality

document.addEventListener("dragstart", function(e) {
    if (e.target.classList.contains("card")) {
        draggedItem = e.target;
        e.target.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
    }
});

document.addEventListener("dragend", function(e) {
    if (e.target.classList.contains("card")) {
        e.target.classList.remove("dragging");
    }
});

columns.forEach((column) => {
    column.addEventListener("dragover", function(e) {
        e.preventDefault();
        this.classList.add("drag-over");
    });

    column.addEventListener("dragleave", function(e) {
        this.classList.remove("drag-over");
    });

    column.addEventListener("drop", function(e) {
        e.preventDefault();
        this.classList.remove("drag-over");
        
        if (draggedItem) {
            const jobId = parseInt(draggedItem.getAttribute("data-id"));
            const newStatus = this.id;

            const job = jobs.find((j) => j.id === jobId);
            if (job) {
                if (newStatus === "interview") {
                    currentDraggedJob = job;
                    openInterviewDateModal(); // Call the updated function
                    console.log("Dropped in interview column"); // Debug log
                } else {
                    job.status = newStatus;
                    saveJobs();
                    renderJobs();
                    updateStats();
                    showNotification(`Job moved to ${newStatus}`, 'success');
                }
            }
        }
    });
});

// Interview Date Modal Functions
function openInterviewDateModal() {
    const modal = document.getElementById("interviewDateModal");
    if (modal) {
        modal.style.display = "flex";
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        document.body.style.overflow = "hidden";
        const dateInput = document.getElementById("interviewDate");
        if (dateInput) dateInput.value = '';
    }
}

function closeInterviewDateModal() {
    const modal = document.getElementById("interviewDateModal");
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
            currentDraggedJob = null;
        }, 300);
    }
}

// Interview Date Form Handler
interviewDateForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const dateTime = document.getElementById("interviewDate").value;
    
    if (currentDraggedJob && dateTime) {
        // Update the job status and date
        currentDraggedJob.status = "interview";
        currentDraggedJob.dateAdded = new Date(dateTime).toISOString();
        currentDraggedJob.interviewDate = dateTime; // Add this line to store interview date
        
        // Save changes and update UI
        saveJobs();
        renderJobs();
        updateStats();
        
        // Close the modal
        closeInterviewDateModal();
        
        // Show success notification
        showNotification('Interview scheduled successfully!', 'success');
    }
});

// Render Jobs in Columns
function renderJobs() {
    columns.forEach((column) => {
        const status = column.id;
        const statusJobs = jobs.filter((job) => job.status === status);
        const columnContent = column.querySelector('.column-content');
        const counter = column.querySelector('.column-counter');

        let jobsHTML = "";
        statusJobs.forEach((job) => {
            jobsHTML += `
                <div class="card" draggable="true" data-id="${job.id}">
                    <h3>${job.company}</h3>
                    <p class="position">${job.position}</p>
                    <p class="date">${formatDate(job.dateAdded)}</p>
                    ${job.notes ? `<p class="notes">${job.notes}</p>` : ''}
                    <div class="card-actions">
                        <button class="edit-job-button" data-id="${job.id}">Edit</button>
                        <button class="delete-job-button" data-id="${job.id}">Delete</button>
                    </div>
                </div>
            `;
        });

        if (columnContent) {
            columnContent.innerHTML = jobsHTML;
            // Add event listeners after rendering the content
            const editButtons = columnContent.querySelectorAll('.edit-job-button');
            const deleteButtons = columnContent.querySelectorAll('.delete-job-button');

            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const jobId = parseInt(this.dataset.id);
                    editJob(jobId);
                });
            });

            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const jobId = parseInt(this.dataset.id);
                    deleteJob(jobId);
                });
            });
        }
        if (counter) {
            counter.textContent = statusJobs.length;
        }
    });
}

// Helper Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Job Recommendations API
// Replace your existing fetchJobRecommendations() function

async function fetchJobRecommendations(field = "software developer") {
    try {
        const jobRecommendationsList = document.getElementById("job-recommendations-list");
        jobRecommendationsList.innerHTML = '<div class="loading">Loading recommendations...</div>';

        const response = await fetch(
            `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=2e26c206&app_key=4a5f49cd8d4d5561f95d5f38bad1b6f4&results_per_page=5&what=${field}`
        );
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            jobRecommendationsList.innerHTML = '<div class="error">No jobs found for this search.</div>';
            return;
        }

        jobRecommendationsList.innerHTML = "";
        data.results.forEach((job) => {
            const jobCard = document.createElement("div");
            jobCard.className = "job-recommendation-card fade-in";
            jobCard.innerHTML = `
                <h3 class="job-recommendation-title">${job.title}</h3>
                <p class="job-recommendation-company">${job.company.display_name}</p>
                <p class="job-recommendation-location">${job.location.display_name}</p>
                <div class="job-recommendation-actions">
                    <a href="${job.redirect_url}" class="btn btn-primary" target="_blank">Apply Now</a>
                    <button class="btn btn-secondary add-to-kanban-button"
                            data-position="${job.title}"
                            data-company="${job.company.display_name}">
                        Add to Kanban
                    </button>
                </div>
            `;
            jobRecommendationsList.appendChild(jobCard);
        });
        
        addAddToKanbanEventListeners();
    } catch (error) {
        console.error("Error fetching job recommendations:", error);
        jobRecommendationsList.innerHTML = '<div class="error">Error fetching jobs. Please try again.</div>';
        showNotification('Failed to fetch jobs', 'error');
    }
}

// Add this after fetchJobRecommendations function
function addAddToKanbanEventListeners() {
    const addToKanbanButtons = document.querySelectorAll('.add-to-kanban-button');
    addToKanbanButtons.forEach(button => {
        button.addEventListener('click', function() {
            const position = this.dataset.position;
            const company = this.dataset.company;
            
            // Check if job already exists in Kanban board
            const isDuplicate = jobs.some(job => 
                job.company.toLowerCase() === company.toLowerCase() && 
                job.position.toLowerCase() === position.toLowerCase()
            );

            if (isDuplicate) {
                showNotification('This job is already on your board!', 'error');
                return;
            }

            // If not a duplicate, add the new job
            const newJob = {
                id: Date.now(),
                company: company,
                position: position,
                status: "applied",
                dateAdded: new Date().toISOString()
            };

            jobs.push(newJob);
            saveJobs();
            renderJobs();
            updateStats();
            showNotification('Job added to board successfully!', 'success');
        });
    });
}

// Add after your existing renderJobs() function

function addEditEventListeners() {
    const editButtons = document.querySelectorAll(".edit-job-button");
    editButtons.forEach((button) => {
        button.addEventListener("click", function() {
            const jobId = parseInt(this.getAttribute("data-id"));
            editJob(jobId);
        });
    });
}

function addDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".delete-job-button");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", function() {
            const jobId = parseInt(this.getAttribute("data-id"));
            deleteJob(jobId);
        });
    });
}
// Update statistics
function updateStats() {
    const totalApps = jobs.length;
    const interviewCount = jobs.filter(
        (job) => job.status === "interview" || job.status === "offer"
    ).length;
    const offerCount = jobs.filter((job) => job.status === "offer").length;

    document.getElementById("total-apps").textContent = totalApps;
    document.getElementById("interview-rate").textContent = totalApps
        ? Math.round((interviewCount / totalApps) * 100) + "%"
        : "0%";
    document.getElementById("offer-rate").textContent = totalApps
        ? Math.round((offerCount / totalApps) * 100) + "%"
        : "0%";
}

// Save jobs to localStorage
function saveJobs() {
    localStorage.setItem("jobs", JSON.stringify(jobs));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Add this style tag to the head to prevent FOUC (Flash of Unstyled Content)
    const style = document.createElement('style');
    style.textContent = `
        #interviewDateModal, #jobModal {
            display: none !important;
            visibility: hidden;
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Rest of your initialization code
    renderJobs();
    updateStats();
    addEditEventListeners();
    addDeleteEventListeners();
});

// Refresh job recommendations periodically
setInterval(fetchJobRecommendations, 3600000);

// Add these functions after your existing renderJobs() function
function editJob(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // Get form elements
    const companyInput = document.getElementById("company");
    const positionInput = document.getElementById("position");
    const notesInput = document.getElementById("notes");
    
    // Check if elements exist
    if (!companyInput || !positionInput || !notesInput) {
        console.error("Form elements not found");
        showNotification('Error opening edit form', 'error');
        return;
    }

    try {
        // Fill the form with existing job data
        companyInput.value = job.company;
        positionInput.value = job.position;
        notesInput.value = job.notes || '';
        
        // Store the job ID being edited
        jobForm.dataset.editId = jobId;
        
        // Open the modal
        openModal();
    } catch (error) {
        console.error("Error editing job:", error);
        showNotification('Error editing job', 'error');
    }
}

function deleteJob(jobId) {
    if (confirm("Are you sure you want to delete this job?")) {
        jobs = jobs.filter(job => job.id !== jobId);
        saveJobs();
        renderJobs();
        updateStats();
        showNotification('Job deleted successfully!', 'success');
    }
}

// Job Search and Recommendations

// Event Listeners for Search
searchRecommendationsBtn.addEventListener('click', () => {
    const selectedField = jobFieldSelect.value;
    fetchJobRecommendations(selectedField);
});

keywordSearchBtn.addEventListener('click', () => {
    const keyword = keywordInput.value.trim();
    if (keyword) {
        fetchJobRecommendations(keyword);
    } else {
        showNotification('Please enter a search keyword', 'error');
    }
});

// Fetch Job Recommendations
async function fetchJobRecommendations(searchTerm = 'software developer') {
    try {
        // Show loading state
        jobRecommendationsList.innerHTML = '<div class="loading">Searching for jobs...</div>';

        const response = await fetch(
            `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${ADZUNA_API_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=6&what=${encodeURIComponent(searchTerm)}&content-type=application/json`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            jobRecommendationsList.innerHTML = '<div class="no-results">No jobs found. Try different keywords.</div>';
            return;
        }

        // Clear previous results
        jobRecommendationsList.innerHTML = '';

        // Render job cards
        data.results.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.className = "job-recommendation-card fade-in";
            jobCard.innerHTML = `
                <h3 class="job-recommendation-title">${job.title}</h3>
                <p class="job-recommendation-company">${job.company.display_name}</p>
                <p class="job-recommendation-location">${job.location.display_name}</p>
                <div class="job-recommendation-actions">
                    <a href="${job.redirect_url}" class="btn btn-primary" target="_blank">Apply Now</a>
                    <button class="btn btn-secondary add-to-kanban-button"
                            data-position="${job.title}"
                            data-company="${job.company.display_name}">
                        Add to Kanban
                    </button>
                </div>
            `;
            jobRecommendationsList.appendChild(jobCard);
        });
        
        addAddToKanbanEventListeners();
    } catch (error) {
        console.error("Error fetching job recommendations:", error);
        jobRecommendationsList.innerHTML = '<div class="error">Error fetching jobs. Please try again.</div>';
        showNotification('Failed to fetch jobs', 'error');
    }
}