document.addEventListener('DOMContentLoaded', function() {
    const learnMoreBtn = document.querySelector('#learn-more');
    const processSection = document.getElementById('process-section');
    const navbar = document.querySelector('.custom-navbar');

    if (learnMoreBtn && processSection && navbar) {
        learnMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const navbarHeight = navbar.offsetHeight;
            const y = processSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

            window.scrollTo({top: y, behavior: 'smooth'});
        });
    }
});