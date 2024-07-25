const mongoose = require('mongoose');
const Course = require('../models/course'); // Adjust the path if necessary
const { faker } = require('@faker-js/faker'); // using Faker.js for generating realistic data

mongoose.connect('mongodb://127.0.0.1:27017/scheduler');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected');
});

const courseTitles = [
    "Introduction to Psychology", "Calculus", "World History", "General Chemistry", "English Literature",
    "Physics for Engineers", "Microeconomics", "Macroeconomics", "Biology 101", "Introduction to Sociology",
    "Organic Chemistry", "Data Structures", "Algorithms", "Discrete Mathematics", "Environmental Science",
    "Philosophy 101", "Art History", "Political Science", "Public Speaking", "Creative Writing",
    "Human Anatomy", "Introduction to Programming", "Database Systems", "Operating Systems", "Linear Algebra",
    "Artificial Intelligence", "Machine Learning", "Ethics in Technology", "Digital Marketing", "Financial Accounting",
    "Managerial Accounting", "Business Law", "Corporate Finance", "Investment Analysis", "Marketing Principles",
    "Consumer Behavior", "Strategic Management", "Human Resource Management", "Operations Management", "Business Statistics",
    "Global Business", "Supply Chain Management", "Entrepreneurship", "Leadership and Teamwork", "Project Management",
    "Network Security", "Cybersecurity Fundamentals", "Software Engineering", "Mobile App Development", "Web Development",
    "Game Design", "Animation and Graphics", "Network Protocols", "Digital Logic Design", "Computer Architecture",
    "Quantum Computing", "Natural Language Processing", "Robotics", "Health Informatics", "Bioinformatics",
    "Genomics", "Neuroscience", "Psychopharmacology", "Clinical Psychology", "Cognitive Psychology",
    "Social Psychology", "Developmental Psychology", "Abnormal Psychology", "Behavioral Neuroscience", "Forensic Psychology",
    "Counseling Psychology", "Educational Psychology", "Industrial-Organizational Psychology", "School Psychology",
    "Multicultural Psychology", "Psychological Testing and Assessment", "Research Methods in Psychology", "Statistics for Psychology",
    "Biopsychology", "Psychology of Learning", "Motivation and Emotion", "Sensation and Perception", "Psychology of Personality",
    "Health Psychology", "Sports Psychology", "Environmental Psychology", "Positive Psychology", "Engineering Mathematics",
    "Thermodynamics", "Fluid Mechanics", "Control Systems", "Digital Signal Processing", "Computer Networks",
    "Wireless Communications", "Information Theory", "Analog Circuits", "Digital Circuits", "Microelectronics",
    "Embedded Systems", "VLSI Design", "Optical Engineering", "Renewable Energy Systems", "Nanotechnology",
    "Biomaterials", "Biomedical Imaging", "Medical Devices", "Tissue Engineering", "Biomechanics"
];

const professors = [
    "Professor Smith", "Professor Johnson", "Professor Williams", "Professor Jones", "Professor Brown",
    "Professor Davis", "Professor Miller", "Professor Wilson", "Professor Moore", "Professor Taylor",
    "Professor Anderson", "Professor Thomas", "Professor Jackson", "Professor White", "Professor Harris",
    "Professor Martin", "Professor Thompson", "Professor Garcia", "Professor Martinez", "Professor Robinson",
    "Professor Clark", "Professor Rodriguez", "Professor Lewis", "Professor Lee", "Professor Walker",
    "Professor Hall", "Professor Allen", "Professor Young", "Professor Hernandez", "Professor King",
    "Professor Wright", "Professor Lopez", "Professor Hill", "Professor Scott", "Professor Green",
    "Professor Adams", "Professor Baker", "Professor Gonzalez", "Professor Nelson", "Professor Carter",
    "Professor Mitchell", "Professor Perez", "Professor Roberts", "Professor Turner", "Professor Phillips",
    "Professor Campbell", "Professor Parker", "Professor Evans", "Professor Edwards", "Professor Collins"
];

const buildings = [
    "Building A", "Building B", "Building C", "Building D", "Building E", "Building F", "Building G",
    "Building H", "Building I", "Building J", "Building K", "Building L", "Building M", "Building N",
    "Building O", "Building P", "Building Q", "Building R", "Building S", "Building T", "Building U",
    "Building V", "Building W", "Building X", "Building Y", "Building Z"
];
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const generateRandomTime = (duration) => {
    const startHour = Math.floor(Math.random() * (17 - 8)) + 8;
    const startMinutes = Math.floor(Math.random() / 2) * 30;
    let endHour = startHour + Math.floor(duration / 60);
    let endMinutes = startMinutes + (duration % 60);
    if (endMinutes >= 60) {
        endHour += 1;
        endMinutes -= 60;
    }
    const pad = (n) => (n < 10 ? '0' : '') + n;
    return {
        start_time: `${pad(startHour)}:${pad(startMinutes)}`,
        end_time: `${pad(endHour)}:${pad(endMinutes)}`
    };
};

const generateCourseDurations = () => {
    const rand = Math.random();
    if (rand < 0.475) {
        return 50;
    } else if (rand < 0.95) {
        return 80;
    } else {
        return 180;
    }
};

const generateCourseTimes = (duration) => {
    const time = generateRandomTime(duration);
    const days = {
        50: [['Monday', 'Wednesday', 'Friday'], ['Monday', 'Wednesday'], ['Tuesday', 'Thursday']],
        80: [['Monday', 'Wednesday'], ['Tuesday', 'Thursday']],
        180: [['Monday'], ['Tuesday'], ['Wednesday'], ['Thursday'], ['Friday']]
    };
    const chosenDays = sample(days[duration]);

    return chosenDays.map(day => ({
        ...time,
        day
    }));
};

const seedDB = async () => {
    await Course.deleteMany({});

    for (let i = 0; i < 1000; i++) {
        const duration = generateCourseDurations();
        const courseTimes = generateCourseTimes(duration);
        const title = sample(courseTitles);
        const course_level = sample([100, 200, 300, 400, 500]);

        // Check if a course with the same title and level already exists
        const existingCourse = await Course.findOne({ title, course_level });
        if (existingCourse) {
            continue; // Skip creation of duplicate course
        }

        const course = new Course({
            author: '669b453b6e86c4027274c83f', // Replace with actual author ID
            title,
            description: faker.lorem.paragraph(),
            professor: sample(professors),
            credits: Math.floor(Math.random() * 4) + 1,
            location: sample(buildings),
            student_rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
            times: courseTimes,
            course_level
        });

        await course.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
