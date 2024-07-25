function toggleHr() {
        const hrElement = document.getElementById('navbarHr');
        if (window.getComputedStyle(hrElement).display === 'none') {
            hrElement.style.display = 'block';
        } else {
            hrElement.style.display = 'none';
        }
    }

    // Ensure the hr element is shown when the window is resized to a wider layout
    window.addEventListener('resize', () => {
        const hrElement = document.getElementById('navbarHr');
        if (window.innerWidth >= 992) { // Bootstrap's lg breakpoint
            hrElement.style.display = 'block';
        }
    });

    // Ensure the hr element is shown when the dropdown menu is closed
    document.addEventListener('click', (event) => {
        const isNavbarOpen = document.querySelector('.navbar-collapse').classList.contains('show');
        const hrElement = document.getElementById('navbarHr');
        if (!isNavbarOpen) {
            hrElement.style.display = 'block';
        }
    });
