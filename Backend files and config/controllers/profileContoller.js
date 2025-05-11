const Profile = require('../models/profileModels');

exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).json({
            status: 'success',
            results: profiles.length,
            data: {
                profiles,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId });
        if (!profile) throw new Error('Profile not found');

        res.status(200).json({
            status: 'success',
            data: {
                profile,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.createProfileByUserId = async (req, res) => {
    try {
        // Get user ID either from params or body
        const userId = req.params.userId || req.body.user;
        
        if (!userId) {
            return res.status(400).json({
                status: 'fail',
                message: 'User ID is required'
            });
        }

        // Check if user exists (assuming you have a User model)
        // const userExists = await User.exists({ _id: userId });
        // if (!userExists) {
        //     return res.status(404).json({
        //         status: 'fail', 
        //         message: 'User not found'
        //     });
        // }

        // Check if profile already exists for this user
        const existingProfile = await Profile.findOne({ user: userId });
        if (existingProfile) {
            return res.status(409).json({
                status: 'fail',
                message: 'Profile already exists for this user',
                data: {
                    profile: existingProfile
                }
            });
        }

        // Create new profile
        const newProfile = await Profile.create({ user: userId });

        res.status(201).json({
            status: 'success',
            data: {
                profile: newProfile,
            },
        });
    } catch (err) {
        console.log(err);
        
        // Better error handling
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid data provided',
                errors: err.errors
            });
        }
        
        if (err.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.updateProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!profile) throw new Error('Profile not found');

        res.status(200).json({
            status: 'success',
            data: {
                profile,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.deleteProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOneAndDelete({ user: req.params.userId });
        if (!profile) throw new Error('Profile not found');

        res.status(200).json({
            status: 'success',
            data: {
                profile,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};
