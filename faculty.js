// Sample faculty data (replace with actual data from your backend)
const facultyData = [
    { id: 1, name: "Dr. Anil Kumar", expertise: "Computer Science", joiningDate: "2010-08-15", retirementDate: "2035-08-14", department: "Computer Engineering", contact: "anil.kumar@kkwagh.edu.in" },
    { id: 2, name: "Prof. Sunita Patil", expertise: "Electrical Engineering", joiningDate: "2012-06-01", retirementDate: "2037-05-31", department: "Electrical Engineering", contact: "sunita.patil@kkwagh.edu.in" },
    { id: 3, name: "Dr. Rajesh Sharma", expertise: "Mechanical Engineering", joiningDate: "2008-07-01", retirementDate: "2033-06-30", department: "Mechanical Engineering", contact: "rajesh.sharma@kkwagh.edu.in" },
    { id: 4, name: "Prof. Priya Deshmukh", expertise: "Civil Engineering", joiningDate: "2015-01-15", retirementDate: "2040-01-14", department: "Civil Engineering", contact: "priya.deshmukh@kkwagh.edu.in" },
    { id: 5, name: "Dr. Amit Joshi", expertise: "Electronics", joiningDate: "2011-09-01", retirementDate: "2036-08-31", department: "Electronics & Telecommunication", contact: "amit.joshi@kkwagh.edu.in" }
];


const facultyTable = document.getElementById('facultyTable');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('facultyModal');
const closeBtn = document.getElementsByClassName('close')[0];


// Populate faculty table
function populateFacultyTable(data) {
    const tableBody = facultyTable.getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear any existing rows

    const currentDate = new Date(); // Get the current date

    data.forEach(faculty => {
        // Convert retDate string to Date object for comparison
        const retDate = new Date(faculty.retDate);

        // Check if the retDate has passed
        if (retDate >= currentDate) {
            const row = tableBody.insertRow();

            // Format the dates to a human-readable format (e.g., MM/DD/YYYY)
            const joinDateFormatted = new Date(faculty.joinDate).toLocaleDateString();
            const retDateFormatted = retDate.toLocaleDateString();

            // Insert data into the row
            row.innerHTML = `
                <td>${faculty.name}</td>
                <td>${faculty.expertise}</td>
                <td>${joinDateFormatted}</td>
                <td>${retDateFormatted}</td>
            `;

            // Add an event listener for row clicks (optional)
            row.addEventListener('click', () => showFacultyDetails(faculty));
        }
    });
}



// Search functionality
searchInput.addEventListener('input', (e) => {
    const  searchTerm = e.target.value.toLowerCase();
    const filteredData = facultyData.filter(faculty => 
        faculty.name.toLowerCase().includes(searchTerm) ||
        faculty.expertise.toLowerCase().includes(searchTerm)
    );
    populateFacultyTable(filteredData);
});

// Show faculty details in modal
function showFacultyDetails(faculty) {
    document.getElementById('facultyName').textContent = faculty.name;
    document.getElementById('facultyExpertise').textContent = faculty.expertise;
    document.getElementById('facultyJoiningDate').textContent = faculty.joinDate;
    document.getElementById('facultyRetirementDate').textContent = faculty.retDate;
    document.getElementById('facultyDepartment').textContent = faculty.department;
    document.getElementById('facultyContact').textContent = faculty.phone;
    modal.style.display = 'block';
}

// Close modal
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


// frontend/script.js

// Function to fetch faculties for the logged-in user
async function fetchFaculties() {
    const token = localStorage.getItem('token'); // Get token from local storage
    if (!token) {
        console.log('No token found, please log in first.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/faculty/faculties', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch faculties: ' + response.statusText);
        }

        const data = await response.json();

        console.log('Fetched faculties:', data);
        populateFacultyTable(data);
        
        // Log the fetched faculties
    } catch (error) {
        console.error('Error fetching faculties:', error);
    }
}

// Call the function to fetch faculties
fetchFaculties();
// Initial population of faculty table


// Animation for page elements
gsap.from('.faculty-list h1', { opacity: 0, y: -20, duration: 1, ease: 'power3.out' });
gsap.from('.search-container', { opacity: 0, y: 20, duration: 1, delay: 0.3, ease: 'power3.out' });
gsap.from('#facultyTable', { opacity: 0, y: 20, duration: 1, delay: 0.6, ease: 'power3.out' });