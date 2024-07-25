console.log('optimizer.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const selectedCoursesData = document.getElementById('selectedCoursesData');
    if (!selectedCoursesData) {
        console.error('selectedCoursesData element not found');
        return;
    }

    console.log('selectedCoursesData content:', selectedCoursesData.textContent);

    try {
        let selectedCourses = JSON.parse(selectedCoursesData.textContent);
        console.log('Selected Courses:', selectedCourses);

        // Remove course event
        document.querySelectorAll('.remove-course-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const index = event.target.getAttribute('data-index');
                selectedCourses.splice(index, 1);

                try {
                    const response = await fetch('/courses/remove-course', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ courseIndex: index }),
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }

                    event.target.closest('.course-card').remove();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error: ' + error.message);
                }
            });
        });

        // Generate schedule event
        document.getElementById('generate-schedule-btn').addEventListener('click', async () => {
            console.log('Generate Best Schedule button clicked');

            try {
                const response = await fetch('/courses/generate-schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ courses: selectedCourses }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }

                const result = await response.json();
                console.log('Result:', result);

                // Clear previous schedule
                const scheduleGrid = document.getElementById('schedule-grid');
                scheduleGrid.querySelectorAll('.schedule-course').forEach(course => course.remove());

                const courseColorMap = {};

                result.schedule.forEach((item, index) => {
                    console.log('Schedule item:', item); // Debugging log

                    if (item.start && item.end && item.day) {
                        // Ensure item.start and item.end are strings and can be parsed
                        const startStr = item.start.toString().padStart(4, '0');
                        const endStr = item.end.toString().padStart(4, '0');
                        console.log(`Parsed times - start: ${startStr}, end: ${endStr}`);

                        const startHour = parseInt(startStr.slice(0, 2), 10);
                        const startMinute = parseInt(startStr.slice(2, 4), 10);
                        const endHour = parseInt(endStr.slice(0, 2), 10);
                        const endMinute = parseInt(endStr.slice(2, 4), 10);
                        const days = item.day.split(','); // Handle multiple days

                        console.log(`Parsed time details - startHour: ${startHour}, startMinute: ${startMinute}, endHour: ${endHour}, endMinute: ${endMinute}, days: ${days}`);

                        if (!isNaN(startHour) && !isNaN(startMinute) && !isNaN(endHour) && !isNaN(endMinute)) {
                            const startIndex = (startHour - 8) * 2 + (startMinute === 0 ? 0 : 1);
                            const endIndex = (endHour - 8) * 2 + (endMinute === 0 ? 0 : 1) + 1;

                            console.log(`startIndex: ${startIndex}, endIndex: ${endIndex}`);

                            if (startIndex >= 0 && endIndex > startIndex) {
                                days.forEach(day => {
                                    const courseCell = document.createElement('div');
                                    courseCell.className = 'schedule-course';
                                    courseCell.innerHTML = `<span>${selectedCourses[item.courseIndex].title} ${selectedCourses[item.courseIndex].course_level}</span>`;
                                    courseCell.style.gridRow = `${startIndex + 2} / ${endIndex + 2}`;
                                    courseCell.style.gridColumn = `${getDayColumn(day.trim())} / ${getDayColumn(day.trim()) + 1}`;
                                    courseCell.style.backgroundColor = getColor(item.courseIndex, courseColorMap);

                                    scheduleGrid.appendChild(courseCell);
                                });
                            } else {
                                console.error('Invalid time index for schedule item:', item);
                            }
                        } else {
                            console.error('Invalid time format for schedule item:', item);
                        }
                    } else {
                        console.error('Schedule item is missing start, end, or day:', item);
                    }
                });

            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        });

        // Function to get color for each course
        function getColor(courseIndex, courseColorMap) {
            const colors = ['#1abc9c', '#3498db', '#e74c3c', '#9b59b6', '#f39c12', '#d35400', '#2ecc71', '#e67e22', '#34495e', '#e91e63'];
            if (!courseColorMap[courseIndex]) {
                courseColorMap[courseIndex] = colors[Object.keys(courseColorMap).length % colors.length];
            }
            return courseColorMap[courseIndex];
        }

        // Function to get the grid column for each day
        function getDayColumn(day) {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            return days.indexOf(day) + 2; // Column starts from 2 (1 for time)
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});
