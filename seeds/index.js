const mongoose = require("mongoose");
const Course = require('../models/course'); // Add this line
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/EasyReg";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
  seedDB()
    .then(() => {
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error("Seed error:", err);
      mongoose.connection.close();
    });
});

const courseTitles = [
  "Introduction to Psychology",
  "Calculus",
  "World History",
  "General Chemistry",
  "English Literature",
  "Physics for Engineers",
  "Microeconomics",
  "Macroeconomics",
  "Biology 101",
  "Introduction to Sociology",
  "Organic Chemistry",
  "Data Structures",
  "Algorithms",
  "Discrete Mathematics",
  "Environmental Science",
  "Philosophy 101",
  "Art History",
  "Political Science",
  "Public Speaking",
  "Creative Writing",
  "Human Anatomy",
  "Introduction to Programming",
  "Database Systems",
  "Operating Systems",
  "Linear Algebra",
  "Artificial Intelligence",
  "Machine Learning",
  "Ethics in Technology",
  "Digital Marketing",
  "Financial Accounting",
  "Managerial Accounting",
  "Business Law",
  "Corporate Finance",
  "Investment Analysis",
  "Marketing Principles",
  "Consumer Behavior",
  "Strategic Management",
  "Human Resource Management",
  "Operations Management",
  "Business Statistics",
  "Global Business",
  "Supply Chain Management",
  "Entrepreneurship",
  "Leadership and Teamwork",
  "Project Management",
  "Network Security",
  "Cybersecurity Fundamentals",
  "Software Engineering",
  "Mobile App Development",
  "Web Development",
  "Game Design",
  "Animation and Graphics",
  "Network Protocols",
  "Digital Logic Design",
  "Computer Architecture",
  "Quantum Computing",
  "Natural Language Processing",
  "Robotics",
  "Health Informatics",
  "Bioinformatics",
  "Genomics",
  "Neuroscience",
  "Psychopharmacology",
  "Clinical Psychology",
  "Cognitive Psychology",
  "Social Psychology",
  "Developmental Psychology",
  "Abnormal Psychology",
  "Behavioral Neuroscience",
  "Forensic Psychology",
  "Counseling Psychology",
  "Educational Psychology",
  "Industrial-Organizational Psychology",
  "School Psychology",
  "Multicultural Psychology",
  "Psychological Testing and Assessment",
  "Research Methods in Psychology",
  "Statistics for Psychology",
  "Biopsychology",
  "Psychology of Learning",
  "Motivation and Emotion",
  "Sensation and Perception",
  "Psychology of Personality",
  "Health Psychology",
  "Sports Psychology",
  "Environmental Psychology",
  "Positive Psychology",
  "Engineering Mathematics",
  "Thermodynamics",
  "Fluid Mechanics",
  "Control Systems",
  "Digital Signal Processing",
  "Computer Networks",
  "Wireless Communications",
  "Information Theory",
  "Analog Circuits",
  "Digital Circuits",
  "Microelectronics",
  "Embedded Systems",
  "VLSI Design",
  "Optical Engineering",
  "Renewable Energy Systems",
  "Nanotechnology",
  "Biomaterials",
  "Biomedical Imaging",
  "Medical Devices",
  "Tissue Engineering",
  "Biomechanics",
];

const professors = [
  "Professor Smith",
  "Professor Johnson",
  "Professor Williams",
  "Professor Jones",
  "Professor Brown",
  "Professor Davis",
  "Professor Miller",
  "Professor Wilson",
  "Professor Moore",
  "Professor Taylor",
  "Professor Anderson",
  "Professor Thomas",
  "Professor Jackson",
  "Professor White",
  "Professor Harris",
  "Professor Martin",
  "Professor Thompson",
  "Professor Garcia",
  "Professor Martinez",
  "Professor Robinson",
  "Professor Clark",
  "Professor Rodriguez",
  "Professor Lewis",
  "Professor Lee",
  "Professor Walker",
  "Professor Hall",
  "Professor Allen",
  "Professor Young",
  "Professor Hernandez",
  "Professor King",
  "Professor Wright",
  "Professor Lopez",
  "Professor Hill",
  "Professor Scott",
  "Professor Green",
  "Professor Adams",
  "Professor Baker",
  "Professor Gonzalez",
  "Professor Nelson",
  "Professor Carter",
  "Professor Mitchell",
  "Professor Perez",
  "Professor Roberts",
  "Professor Turner",
  "Professor Phillips",
  "Professor Campbell",
  "Professor Parker",
  "Professor Evans",
  "Professor Edwards",
  "Professor Collins",
];

const buildings = [
  "Building A",
  "Building B",
  "Building C",
  "Building D",
  "Building E",
  "Building F",
  "Building G",
  "Building H",
  "Building I",
  "Building J",
  "Building K",
  "Building L",
  "Building M",
  "Building N",
  "Building O",
  "Building P",
  "Building Q",
  "Building R",
  "Building S",
  "Building T",
  "Building U",
  "Building V",
  "Building W",
  "Building X",
  "Building Y",
  "Building Z",
];

const departments = [
  "Department A",
  "Department B",
  "Department C",
  "Department D",
  "Department E",
  "Department F",
  "Department G",
  "Department H",
  "Department I",
  "Department J",
  "Department K",
  "Department L",
  "Department M",
  "Department N",
  "Department O",
  "Department P",
  "Department Q",
  "Department R",
  "Department S",
  "Department T",
  "Department U",
  "Department V",
  "Department W",
  "Department X",
  "Department Y",
  "Department Z",
];

const generateCourseDescription = (title) => {
  const descriptions = {
    "Introduction to Psychology":
      "This course provides a comprehensive overview of the fundamental principles of psychology, including the study of human behavior, cognition, and development. Students will explore key concepts such as perception, learning, memory, and social interaction.",
    Calculus:
      "An in-depth study of differential and integral calculus, covering limits, derivatives, and integrals. Students will learn to apply these concepts to solve real-world problems in physics, engineering, and economics.",
    "World History":
      "A survey of major historical events and trends from ancient civilizations to the modern era. This course examines the development of cultures, political systems, and global interactions throughout human history.",
    "General Chemistry":
      "An introduction to the fundamental principles of chemistry, including atomic structure, chemical bonding, stoichiometry, and thermodynamics. Laboratory experiments complement theoretical concepts.",
    "English Literature":
      "A comprehensive survey of major works in English literature from various periods and genres. Students will analyze texts, discuss literary techniques, and develop critical thinking skills.",
    "Physics for Engineers":
      "This course covers classical mechanics, thermodynamics, and electromagnetism with a focus on engineering applications. Problem-solving and laboratory work are emphasized.",
    Microeconomics:
      "An examination of economic decision-making at the individual and firm level. Topics include supply and demand, market structures, and resource allocation.",
    Macroeconomics:
      "Study of aggregate economic behavior, including national income, inflation, unemployment, and monetary and fiscal policies. International trade and finance are also covered.",
    "Biology 101":
      "An introduction to the principles of biology, covering cell structure, genetics, evolution, and ecology. Laboratory work includes microscopy and experimental design.",
    "Introduction to Sociology":
      "This course explores social structures, institutions, and processes. Students will learn about sociological theories and research methods used to analyze society.",
    "Organic Chemistry":
      "A study of the structure, properties, and reactions of organic compounds. Topics include nomenclature, stereochemistry, reaction mechanisms, and synthesis.",
    "Data Structures":
      "An exploration of fundamental data structures and algorithms, including arrays, linked lists, stacks, queues, trees, and graphs. Emphasis on implementation and analysis.",
    Algorithms:
      "Advanced study of algorithm design and analysis. Topics include sorting, searching, dynamic programming, graph algorithms, and computational complexity.",
    "Discrete Mathematics":
      "Introduction to mathematical structures fundamental to computer science, including logic, set theory, combinatorics, graph theory, and discrete probability.",
    "Environmental Science":
      "An interdisciplinary approach to understanding environmental systems, human impacts, and sustainability. Field studies and case analyses are included.",
    "Philosophy 101":
      "An introduction to major philosophical questions and schools of thought, covering ethics, metaphysics, epistemology, and logic.",
    "Art History":
      "Survey of visual arts from prehistoric times to the present, examining major artistic movements, techniques, and cultural contexts.",
    "Political Science":
      "Study of political systems, institutions, and processes. Topics include comparative politics, international relations, and political theory.",
    "Public Speaking":
      "Development of effective oral communication skills. Students will learn to prepare and deliver various types of speeches and presentations.",
    "Creative Writing":
      "Workshop-style course focusing on the craft of writing fiction, poetry, and creative non-fiction. Emphasis on developing voice and style.",
    "Human Anatomy":
      "Detailed study of human body structure and function. Laboratory work includes dissection and use of anatomical models.",
    "Introduction to Programming":
      "Fundamentals of computer programming, including problem-solving strategies, algorithm development, and basic programming constructs.",
    "Database Systems":
      "Design and implementation of database systems. Topics include data modeling, SQL, database architecture, and transaction management.",
    "Operating Systems":
      "Study of operating system principles, including process management, memory management, file systems, and distributed systems.",
    "Linear Algebra":
      "Introduction to vector spaces, linear transformations, matrices, and systems of linear equations. Applications in various fields are explored.",
    "Artificial Intelligence":
      "Survey of AI concepts and techniques, including knowledge representation, search algorithms, machine learning, and natural language processing.",
    "Machine Learning":
      "Study of algorithms that improve performance through experience. Topics include supervised and unsupervised learning, neural networks, and deep learning.",
    "Ethics in Technology":
      "Examination of ethical issues arising from technological advancements, including privacy, AI ethics, cybersecurity, and social media impacts.",
    "Digital Marketing":
      "Exploration of online marketing strategies, including search engine optimization, social media marketing, content marketing, and analytics.",
    "Financial Accounting":
      "Introduction to the principles of accounting, financial statements, and the accounting cycle. Emphasis on interpreting and using financial information.",
    "Managerial Accounting":
      "Focus on using accounting information for internal decision-making, including cost behavior, budgeting, and performance evaluation.",
    "Business Law":
      "Overview of legal principles affecting business operations, including contracts, torts, intellectual property, and business organizations.",
    "Corporate Finance":
      "Study of financial decision-making in corporations, including capital budgeting, risk management, and capital structure decisions.",
    "Investment Analysis":
      "Examination of investment vehicles, strategies, and portfolio management. Topics include stock valuation, bond pricing, and risk assessment.",
    "Marketing Principles":
      "Introduction to marketing concepts, consumer behavior, market research, and the development of marketing strategies.",
    "Consumer Behavior":
      "Analysis of factors influencing consumer decision-making processes and the implications for marketing strategy.",
    "Strategic Management":
      "Capstone course integrating business functions to develop and implement organizational strategies in competitive environments.",
    "Human Resource Management":
      "Study of HR practices, including recruitment, selection, training, compensation, and employee relations.",
    "Operations Management":
      "Analysis of systems and processes used in producing goods and services, focusing on efficiency, quality, and continuous improvement.",
    "Business Statistics":
      "Application of statistical methods to business problems, including probability, hypothesis testing, regression analysis, and forecasting.",
    "Global Business":
      "Examination of international business practices, including cross-cultural management, global strategy, and international trade.",
    "Supply Chain Management":
      "Study of the flow of goods, services, and information from suppliers to end customers, emphasizing coordination and optimization.",
    Entrepreneurship:
      "Exploration of the process of starting and managing new ventures, including opportunity recognition, business planning, and resource acquisition.",
    "Leadership and Teamwork":
      "Development of leadership skills and effective team management strategies in organizational contexts.",
    "Project Management":
      "Study of techniques for planning, executing, and controlling projects, including scheduling, risk management, and stakeholder communication.",
    "Network Security":
      "Examination of network vulnerabilities and defense mechanisms, including firewalls, encryption, and intrusion detection systems.",
    "Cybersecurity Fundamentals":
      "Overview of principles and practices for securing information systems, including threat analysis, cryptography, and security policies.",
    "Software Engineering":
      "Study of systematic approaches to software development, including requirements analysis, design, testing, and project management.",
    "Mobile App Development":
      "Hands-on course in creating applications for mobile devices, covering user interface design, data management, and platform-specific features.",
    "Web Development":
      "Introduction to web technologies and development practices, including HTML, CSS, JavaScript, and server-side programming.",
    "Game Design":
      "Exploration of principles and techniques for creating engaging video games, including game mechanics, level design, and user experience.",
    "Animation and Graphics":
      "Study of computer graphics principles and techniques for creating 2D and 3D animations and visual effects.",
    "Network Protocols":
      "Detailed examination of communication protocols used in computer networks, including TCP/IP, HTTP, and wireless protocols.",
    "Digital Logic Design":
      "Introduction to the design of digital circuits and systems, including Boolean algebra, logic gates, and sequential circuits.",
    "Computer Architecture":
      "Study of the organization and design of computer systems, including processor architecture, memory hierarchy, and I/O systems.",
    "Quantum Computing":
      "Introduction to quantum mechanics principles applied to computation, including quantum algorithms and potential applications.",
    "Natural Language Processing":
      "Exploration of computational techniques for analyzing and generating human language, including parsing, sentiment analysis, and machine translation.",
    Robotics:
      "Study of robot design, control, and programming, covering kinematics, perception, and artificial intelligence applications.",
    "Health Informatics":
      "Examination of information technology applications in healthcare, including electronic health records, clinical decision support, and data analytics.",
    Bioinformatics:
      "Application of computational methods to biological data analysis, including sequence alignment, genomics, and protein structure prediction.",
    Genomics:
      "Study of genome structure, function, and evolution, including techniques for DNA sequencing and analysis.",
    Neuroscience:
      "Interdisciplinary exploration of nervous system structure and function, covering cellular neurobiology, cognitive neuroscience, and neurological disorders.",
    Psychopharmacology:
      "Study of how drugs affect behavior and mental processes, including mechanisms of action and therapeutic applications.",
    "Clinical Psychology":
      "Introduction to the assessment, diagnosis, and treatment of mental health disorders, emphasizing evidence-based practices.",
    "Cognitive Psychology":
      "Examination of mental processes such as perception, attention, memory, and problem-solving, including experimental methods and theories.",
    "Social Psychology":
      "Study of how individuals think, feel, and behave in social contexts, including topics such as attitudes, group dynamics, and social influence.",
    "Developmental Psychology":
      "Exploration of human development across the lifespan, covering physical, cognitive, and social-emotional changes from infancy to late adulthood.",
    "Abnormal Psychology":
      "Study of psychological disorders, their causes, symptoms, and treatments, emphasizing current diagnostic criteria and research findings.",
    "Behavioral Neuroscience":
      "Examination of the biological basis of behavior, including neural mechanisms of learning, memory, emotion, and mental disorders.",
    "Forensic Psychology":
      "Application of psychological principles to legal and criminal justice systems, including criminal profiling and eyewitness testimony.",
    "Counseling Psychology":
      "Introduction to theories and techniques of psychological counseling, emphasizing ethical practice and diverse client populations.",
    "Educational Psychology":
      "Study of psychological principles applied to educational settings, including learning theories, motivation, and classroom management.",
    "Industrial-Organizational Psychology":
      "Application of psychological principles to workplace settings, including employee selection, training, and organizational behavior.",
    "School Psychology":
      "Examination of psychological services in educational settings, including assessment, intervention, and consultation for students' academic and behavioral needs.",
    "Multicultural Psychology":
      "Exploration of cultural influences on human behavior, cognition, and development, emphasizing diversity and cross-cultural psychology.",
    "Psychological Testing and Assessment":
      "Study of principles and practices of psychological measurement, including test construction, validity, and interpretation.",
    "Research Methods in Psychology":
      "Introduction to scientific methods used in psychological research, including experimental design, data collection, and statistical analysis.",
    "Statistics for Psychology":
      "Application of statistical techniques to psychological data, including descriptive statistics, hypothesis testing, and regression analysis.",
    Biopsychology:
      "Study of biological bases of behavior, including brain structure and function, hormones, and genetics.",
    "Psychology of Learning":
      "Examination of theories and principles of learning and behavior, including classical and operant conditioning, and cognitive approaches.",
    "Motivation and Emotion":
      "Exploration of factors that drive behavior and influence emotional experiences, including physiological, cognitive, and social aspects.",
    "Sensation and Perception":
      "Study of how sensory information is detected, processed, and interpreted, covering visual, auditory, and other sensory systems.",
    "Psychology of Personality":
      "Examination of major theories and research on personality development, structure, and assessment.",
    "Health Psychology":
      "Study of psychological factors in health, illness, and healthcare, including stress management, health behaviors, and patient-provider relationships.",
    "Sports Psychology":
      "Application of psychological principles to sports and exercise, including performance enhancement, team dynamics, and motivation.",
    "Environmental Psychology":
      "Exploration of interactions between people and their physical environments, including topics such as environmental attitudes and behavior.",
    "Positive Psychology":
      "Study of factors that contribute to well-being and flourishing, including happiness, resilience, and personal strengths.",
    "Engineering Mathematics":
      "Advanced mathematical concepts and techniques used in engineering, including differential equations, complex analysis, and numerical methods.",
    Thermodynamics:
      "Study of heat, energy, and their transformations, with applications in engineering systems and processes.",
    "Fluid Mechanics":
      "Examination of fluid behavior and its applications in engineering, covering topics such as fluid statics, dynamics, and flow analysis.",
    "Control Systems":
      "Study of feedback control systems in engineering, including system modeling, stability analysis, and controller design.",
    "Digital Signal Processing":
      "Analysis and manipulation of discrete-time signals, covering topics such as Fourier analysis, filtering, and sampling theory.",
    "Computer Networks":
      "Study of network architectures, protocols, and applications, including local and wide area networks, and the Internet.",
    "Wireless Communications":
      "Examination of wireless communication systems, including cellular networks, Wi-Fi, and satellite communications.",
    "Information Theory":
      "Study of quantification, storage, and communication of information, with applications in data compression and error correction coding.",
    "Analog Circuits":
      "Design and analysis of analog electronic circuits, including amplifiers, filters, and oscillators.",
    "Digital Circuits":
      "Design and implementation of digital logic circuits, including combinational and sequential circuits, and digital system design.",
    Microelectronics:
      "Study of semiconductor devices and integrated circuits, including fabrication processes and circuit design.",
    "Embedded Systems":
      "Design of computer systems embedded in larger devices, covering hardware-software integration and real-time operating systems.",
    "VLSI Design":
      "Very Large Scale Integration circuit design, including chip architecture, layout techniques, and design automation tools.",
    "Optical Engineering":
      "Study of optical systems and devices, including lens design, fiber optics, and laser technology.",
    "Renewable Energy Systems":
      "Exploration of renewable energy technologies, including solar, wind, and hydroelectric power systems.",
    Nanotechnology:
      "Study of materials and devices at the nanoscale, including fabrication techniques and applications in various fields.",
    Biomaterials:
      "Examination of materials used in medical applications, including their properties, interactions with biological systems, and design considerations.",
    "Biomedical Imaging":
      "Study of medical imaging technologies, including X-ray, CT, MRI, and ultrasound, and their clinical applications.",
    "Medical Devices":
      "Design and development of medical devices, covering regulatory requirements, safety considerations, and emerging technologies.",
    "Tissue Engineering":
      "Interdisciplinary field combining engineering and life sciences to develop biological substitutes for restoring, maintaining, or improving tissue function.",
    Biomechanics:
      "Application of mechanical principles to biological systems, including the study of motion, deformation, and stress analysis in living organisms.",
  };
  return (
    descriptions[title] ||
    `This course provides an in-depth exploration of ${title}, covering fundamental concepts, current research, and practical applications in the field.`
  );
};

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
  const pad = (n) => (n < 10 ? "0" : "") + n;
  return {
    start_time: `${pad(startHour)}:${pad(startMinutes)}`,
    end_time: `${pad(endHour)}:${pad(endMinutes)}`,
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
    50: [
      ["Monday", "Wednesday", "Friday"],
      ["Monday", "Wednesday"],
      ["Tuesday", "Thursday"],
    ],
    80: [
      ["Monday", "Wednesday"],
      ["Tuesday", "Thursday"],
    ],
    180: [["Monday"], ["Tuesday"], ["Wednesday"], ["Thursday"], ["Friday"]],
  };
  const chosenDays = sample(days[duration]);

  return chosenDays.map((day) => ({
    ...time,
    day,
  }));
};

const seedDB = async () => {
  try {
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
        author: "669b453b6e86c4027274c83f", // Replace with actual author ID
        title,
        description: generateCourseDescription(title),
        professor: sample(professors),
        credits: Math.floor(Math.random() * 4) + 1,
        location: sample(buildings),
        student_rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
        times: courseTimes,
        course_level,
        department: sample(departments),
      });

      await course.save();
      console.log("Seeding completed");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
