document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const coursesContainer = document.getElementById('courses-container');
    const coursesHeading = document.getElementById('courses-heading');

    // Function to get the rating color based on the rating value
    const getRatingColor = (rating) => {
        const green = Math.min(255, Math.floor((rating - 1) * 63.75));
        const red = Math.min(255, Math.floor((5 - rating) * 63.75));
        return `rgb(${red}, ${green}, 0)`;
    };

    // Function to fetch courses based on the search query
    const fetchCourses = async (query) => {
        try {
            const response = await fetch(`/courses/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const results = await response.json();
            console.log('Results:', results);

            // Clear existing courses
            coursesContainer.innerHTML = '';

            if (results.length > 0) {
                results.forEach(course => {
                    // Create course card element
                    const courseElement = document.createElement('div');
                    courseElement.classList.add('col-md-4', 'mb-4', 'course-item');
                    courseElement.innerHTML = `
                        <div class="card h-100 d-flex flex-column">
                            <div class="card-body flex-grow-1 d-flex flex-column">
                                <h5 class="card-title">
                                    ${course.title} ${course.course_level}
                                    <span class="badge badge-rating" style="background-color: ${getRatingColor(course.student_rating)};">
                                        ${course.student_rating}
                                    </span>
                                </h5>
                                <p class="card-text flex-grow-1">${course.description}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-custom add-to-dashboard" data-course-id="${course._id}">Add to Dashboard</button>
                            </div>
                        </div>
                    `;

                    // Make the card clickable
                    courseElement.addEventListener('click', (event) => {
                        if (event.target.classList.contains('add-to-dashboard')) return;
                        window.location.href = `/courses/${course._id}`;
                    });

                    // Add event listener for the "Add to Dashboard" button
                    courseElement.querySelector('.add-to-dashboard').addEventListener('click', async (event) => {
                        event.stopPropagation(); // Prevent the click from propagating to the card
                        try {
                            const response = await fetch('/courses/add-to-dashboard', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ courseId: course._id })
                            });
                            if (response.status === 401) {
                                // User is not authenticated, redirect to login page
                                window.location.href = '/login';
                                return;
                            }
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            const addedCourse = await response.json();
                            // Notify the optimizer to add the course
                            window.dispatchEvent(new CustomEvent('course-added', { detail: addedCourse }));
                            // Remove the course from the "All Courses" page
                            courseElement.remove();
                        } catch (error) {
                            console.error('Error adding course to dashboard:', error);
                        }
                    });

                    coursesContainer.appendChild(courseElement);
                });
            } else {
                coursesContainer.innerHTML = '<p>No courses found.</p>';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        fetchCourses(query);

        // Show or hide the courses heading based on the input
        if (query.trim().length === 0) {
            coursesHeading.style.display = 'block';
        } else {
            coursesHeading.style.display = 'none';
        }
    });

    // Initial render of courses
    fetchCourses('');
});
