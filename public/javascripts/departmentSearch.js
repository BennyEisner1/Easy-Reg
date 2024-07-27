document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const departmentsContainer = document.querySelector('.row');

    function filterDepartments(query) {
        const departments = departmentsContainer.querySelectorAll('.col-md-4');
        const lowercaseQuery = query.toLowerCase();

        departments.forEach(dept => {
            const departmentName = dept.querySelector('.card-title').textContent.toLowerCase();
            if (departmentName.includes(lowercaseQuery)) {
                dept.style.display = '';
            } else {
                dept.style.display = 'none';
            }
        });
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

    const debouncedFilter = debounce(filterDepartments, 300);

    searchInput.addEventListener('input', function() {
        debouncedFilter(this.value);
    });

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        filterDepartments(searchInput.value);
    });
});