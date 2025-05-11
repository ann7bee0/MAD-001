const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    info: {
        name: { type: String, required: true, trim: true, default: 'Your Name' },
        bio: { type: String, trim: true, default: 'Founder S.G.Codes | Developer@M.I.Solutions | React-Native Developer' },
        profile_picture: { type: String, required: true, default: '../utils/Images.PROFILE_PICTURE' },
        banner: { type: String, default: '../utils/Images.BANNERS.BANNER7' },
        talksAbout: [{ type: String, default: 'reactjs' }],
        followers: { type: Number, default: 3256 },
        connections: { type: Number, default: 2165 }
    },
    analytics: {
        total_quiz: { type: Number, default: 1065 },
        highest_score: { type: Number, default: 6589 },
        average: { type: Number, default: 471 }
    },
    about: { type: String, trim: true, default: 'Cupidatat mollit non est excepteur ut laborum Lorem fugiat laborum...' },
    experience: [{ 
        title: { type: String, required: true },
        company: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String, trim: true }
    }],
    education: [{ 
        institution: { type: String, required: true, default: 'Your College Name' },
        degree: { type: String, default: "Bachelor's Degree, Computer Science" },
        time: { type: String, default: '2018-2022' },
        CGPA: { type: Number, default: 9.4 }
    }],
    licenses: [{ 
        title: { type: String },
        issuer: { type: String },
        date: { type: Date }
    }],
    skills: [{ type: String }],
    courses: [{ 
        title: { type: String },
        provider: { type: String },
        date: { type: Date }
    }],
    projects: [{ 
        title: { type: String },
        description: { type: String },
        link: { type: String }
    }],
    contact: [{ 
        email: { type: String },
        website: { type: String },
        phone: { type: String },
        address: { type: String }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Profile must belong to a User.'],
        index: true
    }
});

profileSchema.pre(/^find/, function(next) {
    this.populate({ path: 'user', select: 'name email' });
    next();
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
