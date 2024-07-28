document.addEventListener('DOMContentLoaded', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navbarToggler.removeAttribute('data-bs-toggle');
    navbarToggler.removeAttribute('data-bs-target');

    let isOpen = false;

    navbarToggler.addEventListener('click', function(event) {
        event.stopPropagation(); 
        isOpen = !isOpen; 

        if (isOpen) {
            navbarCollapse.classList.add('show');
            setTimeout(() => {
                navbarCollapse.style.maxHeight = navbarCollapse.scrollHeight + 'px';
            }, 0);
        } else {
            navbarCollapse.style.maxHeight = '0px';
            setTimeout(() => {
                navbarCollapse.classList.remove('show');
            }, 300);
        }
    });

    document.addEventListener('click', function(event) {
        const isClickInsideNavbar = navbarCollapse.contains(event.target) || navbarToggler.contains(event.target);
        if (!isClickInsideNavbar && isOpen) {
            navbarCollapse.style.maxHeight = '0px';
            isOpen = false;
            setTimeout(() => {
                navbarCollapse.classList.remove('show');
            }, 300);
        }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992 && isOpen) {
                navbarCollapse.style.maxHeight = '0px';
                isOpen = false;
                setTimeout(() => {
                    navbarCollapse.classList.remove('show');
                }, 300);
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            navbarCollapse.style.maxHeight = 'none';
        } else if (isOpen) {
            navbarCollapse.style.maxHeight = navbarCollapse.scrollHeight + 'px';
        }
    });
});