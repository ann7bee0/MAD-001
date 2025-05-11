const express = require('express');
const profileController = require('./../controllers/profileContoller');
const authController = require('./../controllers/authController');
const router = express.Router();

// Create profile using user ID (from logged-in user)
router
    .route('/')
    .post(
        profileController.createProfileByUserId
    );

// Get all profiles (admin use case, optional restriction)
router
    .route('/all')
    .get(profileController.getAllProfiles);

// Get, update, delete profile by user ID
router
    .route('/:userId')
    .get(profileController.getProfileByUserId)
    .patch(
        profileController.updateProfileByUserId
    )
    .delete(
        profileController.deleteProfileByUserId
    );

module.exports = router;
