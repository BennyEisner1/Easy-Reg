document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const coursesContainer = document.getElementById("courses-container");
  const coursesHeading = document.getElementById("courses-heading");

  coursesContainer.addEventListener("click", function (e) {
    const courseCard = e.target.closest(".course-item");
    if (courseCard) {
      const courseId = courseCard.dataset.id;
      if (e.target.classList.contains("add-to-dashboard-btn")) {
        e.preventDefault();
        e.stopPropagation();
        addToDashboard(courseId, e.target);
      } else {
        window.location.href = `/courses/${courseId}`;
      }
    }
  });

  function addToDashboard(courseId, button) {
    fetch("/courses/add-to-dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Course added to dashboard") {
          const courseCard = button.closest(".col-md-4");
          courseCard.remove();
        } else {
          console.error("Failed to add course to dashboard");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function showMessage(message, type) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = "alert";
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    document.querySelector(".container").prepend(alertDiv);

    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  function getCurrentDepartment() {
    const path = window.location.pathname;
    const match = path.match(/\/courses\/department\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function search(query) {
    const department = getCurrentDepartment();
    fetch(
      `/courses/search?q=${query}&department=${
        encodeURIComponent(department) || ""
      }`
    )
      .then((response) => response.json())
      .then((data) => {
        coursesContainer.innerHTML = "";
        if (data.length === 0) {
          coursesContainer.innerHTML = "<p>No courses found.</p>";
          return;
        }
        data.forEach((course) => {
          const card = createCourseCard(course);
          coursesContainer.appendChild(card);
        });
        updateCoursesHeading(data.length);
      })
      .catch((error) => {
        console.error("Error:", error);
        coursesContainer.innerHTML =
          "<p>An error occurred while searching for courses.</p>";
      });
  }

  function createCourseCard(course) {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
        <a href="/courses/${course._id}" class="text-decoration-none">
            <div class="card h-100 d-flex flex-column course-item" data-id="${course._id}">
                <div class="card-body flex-grow-1 d-flex flex-column">
                    <h5 class="card-title">${course.title} ${course.course_level}

                    </h5>
                    <p class="card-text flex-grow-1">${course.description}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-custom add-to-dashboard add-to-dashboard-btn" data-course-id="${course._id}">Add to Dashboard</button>
                </div>
            </div>
        </a>
    `;
    return col;
  }
  function updateCoursesHeading(count) {
    const department = getCurrentDepartment();
    coursesHeading.textContent = department
      ? `${department} Courses (${count} results)`
      : `All Courses (${count} results)`;
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedSearch = debounce(search, 300);

  searchInput.addEventListener("input", function () {
    debouncedSearch(this.value);
  });

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    search(searchInput.value);
  });

  search("");

  document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("add-to-dashboard-btn")) {
      e.preventDefault();
      const courseId = e.target.dataset.courseId;
      addToDashboard(courseId, e.target);
    }
  });
});
