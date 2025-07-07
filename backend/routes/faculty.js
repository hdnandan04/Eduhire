// backend/routes/faculty.js
const express = require('express');
const jwt = require('jsonwebtoken'); // Import JWT
const User = require('../models/User'); // Assuming you have a User model for user data

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Secret for JWT

// Middleware to authenticate user using JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
    if (!token) return res.sendStatus(403); // Forbidden if no token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user; // Attach user information to request
        next();
    });
};

// GET /faculty
router.get('/faculties', authenticateJWT, async (req, res) => {
    try {
        // Fetch faculties related to the authenticated user
        const userId = req.user.userId;
        console.log("Fetching faculty data for user:", userId);
        
        // Get only the faculty array for the authenticated user, excluding the _id field
        const data = await User.findById(userId).select({ faculty: 1, _id: 0 });

        // Check if data or faculty field is missing
        if (!data || !data.faculty) {
            return res.status(404).json({ error: 'Faculty data not found for this user' });
        }

        const currentDate = new Date();

        // Update the retirement status and filter out retired faculty
        const updatedFaculty = data.faculty.map(facultyMember => {
            const retDate = new Date(facultyMember.retDate);
            facultyMember.retired = retDate < currentDate; // Set 'retaired' to true if retirement date is past

            return facultyMember; // Return the updated faculty member
        });

        // Update the user's faculty array in the database with the new retirement statuses
        await User.findByIdAndUpdate(userId, { faculty: updatedFaculty }, { new: true });

        // Filter out retired faculty members and only return non-retired ones
        const nonRetiredFaculty = updatedFaculty.filter(facultyMember => !facultyMember.retired);

        console.log("Non-retired faculty data:", nonRetiredFaculty);

        // Respond with only the non-retired faculty array
        res.json(nonRetiredFaculty);
    } catch (error) {
        console.error("Error fetching faculties:", error); // Log the error
        res.status(500).json({ error: 'Server error' }); // Send server error response
    }
});

//GET / VACANCY
router.get('/vacancy', authenticateJWT, async (req, res) => {
    try {
        // Get the authenticated user's ID from the JWT token
        const userId = req.user.userId;
        console.log("Fetching data for user:", userId);

        // Fetch the vacancy data (apply field)
        const vacancyData = await User.findById(userId).select('apply');
        console.log("Vacancy data:", vacancyData.apply);

        // Fetch all the retired faculty members using $filter to get all faculty where retired is true
        const retiredFacultyData = await User.findOne(
            { _id: userId }, // Match the user by ID
            {
                faculty: {
                    $filter: {
                        input: "$faculty", // The array to be filtered
                        as: "facultyMember", // A name for each element in the input array
                        cond: { $eq: ["$$facultyMember.retired", true] } // Condition to match retired members
                    }
                }
            }
        );

        // Check if retired faculty data exists
        if (!retiredFacultyData || !retiredFacultyData.faculty) {
            return res.status(404).json({ error: 'No retired faculty data found for this user' });
        }

        console.log("Retired faculty data:", retiredFacultyData.faculty);

        // Prepare the retired faculty data to match the apply array structure
        const retiredFacultyToApply = retiredFacultyData.faculty.map(faculty => ({
            position: faculty.position,
            department: faculty.department,
            expertise: faculty.expertise,
            deadline: faculty.retDate // or any custom deadline you want to set
        }));

        // Update the user's apply array by adding the retired faculty data and remove retired faculty from the faculty array
        const updateResult = await User.updateOne(
            { _id: userId },
            {
                $push: { apply: { $each: retiredFacultyToApply } }, // Add retired faculty to apply array
                $pull: { faculty: { retired: true } } // Remove retired faculty from faculty array
            }
        );

        // Check if the update was successful
        if (updateResult.nModified === 0) {
            return res.status(400).json({ error: 'No faculty data was updated' });
        }

        // Combine both apply and retired faculty data into a single array
        const combinedData = [...vacancyData.apply, ...retiredFacultyToApply];

        // Send the combined array as the response
        res.json(combinedData);

    } catch (error) {
        console.error('Error fetching or updating data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});






//POST /MYAPPLY


//TEST HERE

// POST /myapply 
router.post('/myapply', authenticateJWT, async (req, res) => {
    try {
        console.log("ALL DATA", req.body);

        // Extract data from the request body
        const { coverLetter, department, email, expertise, jdate, name, phone, position, rdate, v_id } = req.body;

        // Get userId from the JWT token (from req.user)
        const userId = req.user.userId;

        // Create a new faculty object
        const newFacultyMember = {
            name,
            email,
            phone,
            coverLetter,
            position,
            department,
            expertise,
            joinDate: new Date(jdate),  // Convert to Date object
            retDate: new Date(rdate),   // Convert to Date object
            retired: false  // Assuming the faculty member is not retired yet
        };

        // Update the user by adding the new faculty member to the faculty array
        const updatedUser = await User.findByIdAndUpdate(
            userId,  // Find user by _id
            { $push: { faculty: newFacultyMember } },  // Add new faculty member to faculty array
            { new: true, useFindAndModify: false }  // Return the updated document
        );

        // If user not found, return a 404 error
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("TEST",v_id)
        // Now remove the vacancy by the provided vacancyId
        const result = await User.findByIdAndUpdate(
            userId,
            { $pull: { apply: { _id: v_id } } },  // Remove the specific vacancy by its ID
            { new: true, useFindAndModify: false }
        );

        // If the vacancy ID was not found, return an error
        if (!result) {
            return res.status(404).json({ message: 'Vacancy not found or already deleted' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Application submitted and vacancy deleted successfully', user: result });

    } catch (error) {
        console.error("Error in /myapply:", error);
        res.status(500).json({ message: 'Failed to submit application or delete vacancy' });
    }
});









module.exports = router;
