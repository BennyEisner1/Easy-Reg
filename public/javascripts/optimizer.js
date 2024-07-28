let globalColorMap = {};
let isFirstSchedule = true;
let selectedCourses;

document.addEventListener("DOMContentLoaded", () => {
  const selectedCoursesData = document.getElementById("selectedCoursesData");
  if (!selectedCoursesData) {
    console.error("selectedCoursesData element not found");
    return;
  }
  try {
    selectedCourses = JSON.parse(selectedCoursesData.textContent);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }

  addEventListeners();
  const generateScheduleBtn = document.getElementById("generate-schedule-btn");
  const pageHeader = document.getElementById("page-header");
  generateScheduleBtn.addEventListener("click", generateSchedule);
});

function addEventListeners() {
  document.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (!event.target.classList.contains("remove-course-btn")) {
        const courseId = event.currentTarget.dataset.courseId;
        window.location.href = `/courses/${courseId}`;
      }
    });
  });

  document.querySelectorAll(".remove-course-btn").forEach((button) => {
    button.addEventListener("click", removeCourse);
  });
}
async function removeCourse(event) {
  event.stopPropagation();

  const courseId = event.target.getAttribute("data-course-id");

  try {
    const response = await fetch("/courses/remove-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: courseId }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }

    delete selectedCourses[courseId];
    event.target.closest(".course-card").remove();
    document.getElementById("selectedCoursesData").textContent =
      JSON.stringify(selectedCourses);
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  }
}

async function generateSchedule() {
  try {
    const response = await fetch("/courses/generate-schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courses: selectedCourses,
        isRandomized: !isFirstSchedule,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Network response was not ok");
    }

    const result = await response.json();

    displaySchedule(result.schedule);

    const generateScheduleBtn = document.getElementById(
      "generate-schedule-btn"
    );
    const pageHeader = document.getElementById("page-header");
    const scheduledCourseIndices = new Set(
      result.schedule.map((item) => item.courseIndex)
    );
    const hasConflicts =
      scheduledCourseIndices.size < Object.keys(selectedCourses).length;

    generateScheduleBtn.textContent = hasConflicts
      ? "Generate New Schedule"
      : "Best Schedule (No Conflicts)";
    isFirstSchedule = false;
    pageHeader.textContent = "EasyReg Optimized Schedule";

    document
      .querySelector(".optimizer-container")
      .classList.add("schedule-generated");
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  }
}

function displaySchedule(schedule) {
  const scheduleGrid = document.getElementById("schedule-grid");
  scheduleGrid
    .querySelectorAll(".schedule-course")
    .forEach((course) => course.remove());

  schedule.forEach((item) => {
    if (item.start && item.end && item.day) {
      const startStr = item.start.toString().padStart(4, "0");
      const endStr = item.end.toString().padStart(4, "0");

      const startHour = parseInt(startStr.slice(0, 2), 10);
      const startMinute = parseInt(startStr.slice(2, 4), 10);
      const endHour = parseInt(endStr.slice(0, 2), 10);
      const endMinute = parseInt(endStr.slice(2, 4), 10);

      if (
        !isNaN(startHour) &&
        !isNaN(startMinute) &&
        !isNaN(endHour) &&
        !isNaN(endMinute)
      ) {
        const startIndex = (startHour - 8) * 2 + (startMinute === 0 ? 0 : 1);
        const endIndex = (endHour - 8) * 2 + (endMinute === 0 ? 0 : 1) + 1;

        if (startIndex >= 0 && endIndex > startIndex) {
          const courseCell = document.createElement("div");
          courseCell.className = "schedule-course";

          const course = Object.values(selectedCourses)[item.courseIndex];
          courseCell.innerHTML = `<span>${course.title} ${course.course_level}</span>`;

          courseCell.style.gridRow = `${startIndex + 2} / ${endIndex + 2}`;
          courseCell.style.gridColumn = `${getDayColumn(item.day.trim())} / ${
            getDayColumn(item.day.trim()) + 1
          }`;
          courseCell.style.backgroundColor = getColor(course._id);

          courseCell.style.cursor = "pointer";
          courseCell.addEventListener("click", () => {
            window.location.href = `/courses/${course._id}`;
          });

          scheduleGrid.appendChild(courseCell);
        }
      }
    }
  });
}

function getDayColumn(day) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return days.indexOf(day) + 2;
}

function getColor(courseId) {
  const colors = [
    "#1abc9c",
    "#3498db",
    "#e74c3c",
    "#9b59b6",
    "#f39c12",
    "#d35400",
    "#2ecc71",
    "#e67e22",
    "#34495e",
    "#e91e63",
  ];
  if (!globalColorMap[courseId]) {
    globalColorMap[courseId] =
      colors[Object.keys(globalColorMap).length % colors.length];
  }
  return globalColorMap[courseId];
}

async function addCourseToDashboard(courseId) {
  try {
    const response = await fetch("/courses/add-to-dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add course to dashboard");
    }

    const result = await response.json();

    selectedCourses[courseId] = result.course;
    updateCourseCards();
  } catch (error) {
    console.error("Error adding course to dashboard:", error);
    alert("Error adding course to dashboard: " + error.message);
  }
}

async function removeCourse(event) {
  event.stopPropagation();

  const courseId = event.target.getAttribute("data-course-id");

  try {
    const response = await fetch("/courses/remove-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: courseId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to remove course");
    }

    const result = await response.json();

    delete selectedCourses[courseId];
    event.target.closest(".course-card").remove();
    document.getElementById("selectedCoursesData").textContent =
      JSON.stringify(selectedCourses);
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  }
}

function updateCourseCards() {
  const courseCardsContainer = document.querySelector(
    ".course-cards-container"
  );
  courseCardsContainer.innerHTML = "";

  Object.values(selectedCourses).forEach((course) => {
    const courseCard = document.createElement("div");
    courseCard.className = "course-card";
    courseCard.dataset.courseId = course._id;
    courseCard.innerHTML = `
            <p class="course-title">${course.title} ${course.course_level}</p>
            <button type="button" class="remove-course-btn btn btn-danger" data-course-id="${course._id}">Remove</button>
        `;
    courseCardsContainer.appendChild(courseCard);
  });

  document.getElementById("selectedCoursesData").textContent =
    JSON.stringify(selectedCourses);
  addEventListeners();
}
