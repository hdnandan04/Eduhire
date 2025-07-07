// backend/models/User.js
const mongoose = require('mongoose');

const faculties = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    coverLetter: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    expertise: {
      type: String,
      required: true,
    },
    joinDate: {
        type: Date,
        required: true,
    },
    retDate: {
        type: Date,
        required: true,
    },
    retired:{
        type : Boolean,
        default: false
    },
}, { _id: true });


  const opening = new mongoose.Schema({
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    expertise: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    retired:{
        type : Boolean,
        default: false
    }
  }, { _id: true });  


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    faculty : {
        type: [faculties]
    },
    apply : {
        type : [opening]
    }
});

module.exports = mongoose.model('User', userSchema);
