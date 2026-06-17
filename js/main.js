/* ACTIVE NAV LINK — highlight current page in navigation*/
document.addEventListener('DOMContentLoaded', function () {

    // --- Active Nav Link ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(function (link) {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active-nav');
        }
    });

    /* SCROLL-TO-TOP BUTTON*/

    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollTopBtn';
    scrollBtn.title = 'Back to top';
    scrollBtn.innerHTML = '&#8679;';
    scrollBtn.setAttribute('aria-label', 'Scroll back to top');
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    scrollBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    
    /* COOKIE CONSENT BANNER */
    if (!localStorage.getItem('cookieConsent')) {
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.innerHTML = `
            <p>🍪 We use cookies to enhance your experience on our website. By continuing, you agree to our use of cookies.</p>
            <button id="cookieAccept">Accept</button>
            <button id="cookieDecline">Decline</button>
        `;
        document.body.appendChild(banner);

        document.getElementById('cookieAccept').addEventListener('click', function () {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.remove();
        });
        document.getElementById('cookieDecline').addEventListener('click', function () {
            localStorage.setItem('cookieConsent', 'declined');
            banner.remove();
        });
    }

    /* ANIMATED STAT COUNTERS — index.html only */
    const counters = document.querySelectorAll('.stat-counter');
    if (counters.length > 0) {
        counters.forEach(function (counter) {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(function () {
                current += step;
                if (current >= target) {
                    counter.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 16);
        });
    }

        /*FADE-IN ON SCROLL — service cards & sections*/
    const fadeTargets = document.querySelectorAll('.service-card, .dashboard-card, #our-staff article, #staff-grid article');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        fadeTargets.forEach(function (el) {
            el.classList.add('fade-in-hidden');
            observer.observe(el);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        fadeTargets.forEach(function (el) {
            el.classList.add('fade-in-visible');
        });
    }
