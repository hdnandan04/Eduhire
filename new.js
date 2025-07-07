// Get required elements
const vacanciesTable = document.getElementById('vacanciesTable');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('applicationModal');
const closeBtn = document.getElementsByClassName('close')[0];

const positionTitle = document.getElementById('positionTitle');
let selectedVacancyId = null; // To store the ID of the vacancy being applied for

// Populate vacancies table
function populateVacanciesTable(data) {
    const tableBody = vacanciesTable.getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear previous data

    data.forEach(vacancy => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${vacancy.position}</td>
            <td>${vacancy.department}</td>
            <td>${vacancy.expertise}</td>
            <td>${vacancy.deadline}</td>
            <td><button class="apply-btn" data-id="${vacancy._id}">Apply</button></td>
        `;
        console.log(vacancy._id);
    });
    
    // Add event listeners to apply buttons
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', () => openApplicationModal(button.getAttribute('data-id'), data));
    });
}

// Open application modal
function openApplicationModal(vacancyId,vacancyData) {
    console.log("THIS ID",vacancyId);
    console.log("THIS DATA",vacancyData);
    const vacancy = vacancyData.find(v => v._id === vacancyId);
    console.log("TEST VACANCY",vacancy)
    positionTitle.textContent = `${vacancy.position} (${vacancy.department})`;
    cur_pos = vacancy.position;
    cur_dep = vacancy.department;
    cur_exp = vacancy.expertise;
    selectedVacancyId = vacancy._id; // Store the selected vacancy ID
    modal.style.display = 'block';
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = vacancyData.filter(vacancy => 
        vacancy.position.toLowerCase().includes(searchTerm) ||
        vacancy.department.toLowerCase().includes(searchTerm) ||
        vacancy.expertise.toLowerCase().includes(searchTerm)
    );
    populateVacanciesTable(filteredData);
});

// Close modal
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Handle form submission
applicationForm.onsubmit = async function(e) {
    e.preventDefault();
    const applicationForm = document.getElementById('applicationForm');

    if (!selectedVacancyId) {
        alert('No vacancy selected.');
        return;
    }

    const formData = {
        name: applicationForm.fullName.value,
        email: applicationForm.email.value,
        phone: applicationForm.phone.value,
        expertise: cur_exp,
        jdate: applicationForm.jdate.value,
        rdate: applicationForm.rdate.value,
        coverLetter: applicationForm.coverLetter.value,
        v_id: selectedVacancyId,
        position: cur_pos,
        department: cur_dep
    };

    console.log(formData);

    try {
        const response = await fetch('http://localhost:5000/faculty/myapply', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'  // Set the content type to JSON
            },
            body: JSON.stringify(formData)  // Convert form data to JSON
        });

        if (!response.ok) {
            throw new Error('Failed to submit application: ' + response.statusText);
        }

        alert('Application submitted successfully!');
        modal.style.display = 'none';
        // applicationForm.reset();

    } catch (error) {
        console.error('Error submitting application:', error);
        alert('Failed to submit application. Please try again.');
    }
}

// Fetch vacancies from backend
async function fetchVacancies() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found, please log in first.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/faculty/vacancy', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch vacancies: ' + response.statusText);
        }

        const data = await response.json();
        console.log("TEST HERE",data);
        populateVacanciesTable(data); // Populate the vacancies table

    } catch (error) {
        console.error('Error fetching vacancies:', error);
    }
}

// Call the function to fetch vacancies on page load
fetchVacancies();

// Animation for page elements
gsap.from('.vacancies-list h1', { opacity: 0, y: -20, duration: 1, ease: 'power3.out' });
gsap.from('.search-container', { opacity: 0, y: 20, duration: 1, delay: 0.3, ease: 'power3.out' });
gsap.from('#vacanciesTable', { opacity: 0, y: 20, duration: 1, delay: 0.6, ease: 'power3.out' });
