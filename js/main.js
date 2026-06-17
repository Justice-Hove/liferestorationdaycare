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

    
    /* ENQUIRY FORM VALIDATION + EMAILJS*/
    const enquiryForm = document.querySelector('#enquiry-form-section form');
    if (enquiryForm) {
        // Toggle card field visibility based on purpose selection
        const purposeSelect = document.getElementById('purpose');
        const cardGroup = document.getElementById('card-group');
        const donateBtn = document.querySelector('button[value="donate"]');

        if (purposeSelect && cardGroup) {
            cardGroup.style.display = 'none'; // hidden by default
            if (donateBtn) donateBtn.style.display = 'none';

            purposeSelect.addEventListener('change', function () {
                if (this.value === 'donate') {
                    cardGroup.style.display = 'block';
                    if (donateBtn) donateBtn.style.display = 'inline-block';
                } else {
                    cardGroup.style.display = 'none';
                    if (donateBtn) donateBtn.style.display = 'none';
                }
            });
        }

        // Form submission
        enquiryForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateEnquiryForm()) return;

            const submitBtn = enquiryForm.querySelector('button[value="enquire"]');
            const originalText = submitBtn ? submitBtn.textContent : 'ENQUIRE';
            if (submitBtn) {
                submitBtn.textContent = 'Sending…';
                submitBtn.disabled = true;
            }

            const formData = {
                from_name: document.getElementById('name').value.trim() + ' ' + document.getElementById('surname').value.trim(),
                from_cell: document.getElementById('cell').value.trim(),
                from_email: document.getElementById('email').value.trim(),
                purpose: document.getElementById('purpose').value,
                card_number: document.getElementById('card') ? document.getElementById('card').value.trim() : 'N/A',
                message: document.getElementById('enquiry_text').value.trim(),
                to_email: 'liferestoration337@gmail.com'
            };

            // EmailJS send
            emailjs.send('service_liferestoration', 'template_enquiry', formData)
                .then(function () {
                    showFormMessage(enquiryForm, 'success', '✅ Thank you! Your enquiry has been sent successfully. We will be in touch shortly.');
                    enquiryForm.reset();
                    if (cardGroup) cardGroup.style.display = 'none';
                    if (donateBtn) donateBtn.style.display = 'none';
                })
                .catch(function (error) {
                    console.error('EmailJS error:', error);
                    showFormMessage(enquiryForm, 'error', '❌ Sorry, something went wrong. Please email us directly at liferestoration337@gmail.com');
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                });
        });

        // Donate button handler
        if (donateBtn) {
            donateBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (!validateEnquiryForm()) return;

                const cardValue = document.getElementById('card') ? document.getElementById('card').value.trim() : '';
                if (!cardValue) {
                    showFieldError('card', 'Please enter your card number to donate.');
                    return;
                }

                const donateData = {
                    from_name: document.getElementById('name').value.trim() + ' ' + document.getElementById('surname').value.trim(),
                    from_cell: document.getElementById('cell').value.trim(),
                    from_email: document.getElementById('email').value.trim(),
                    purpose: 'DONATION',
                    card_number: cardValue,
                    message: document.getElementById('enquiry_text').value.trim(),
                    to_email: 'liferestoration337@gmail.com'
                };

                donateBtn.textContent = 'Processing…';
                donateBtn.disabled = true;

                emailjs.send('service_liferestoration', 'template_enquiry', donateData)
                    .then(function () {
                        showFormMessage(enquiryForm, 'success', '💚 Thank you for your generous donation! We will process your payment and contact you shortly.');
                        enquiryForm.reset();
                    })
                    .catch(function () {
                        showFormMessage(enquiryForm, 'error', '❌ Donation submission failed. Please email us at liferestoration337@gmail.com');
                    })
                    .finally(function () {
                        donateBtn.textContent = 'DONATE (When selected Donate)';
                        donateBtn.disabled = false;
                    });
            });
        }
    }

    /*  CONTACT FORM VALIDATION + EMAILJS */
    const contactForm = document.querySelector('#contact-form-section form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateContactForm()) return;

            const submitBtn = contactForm.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.textContent = 'Sending…';
                submitBtn.disabled = true;
            }

            const contactData = {
                from_name: document.getElementById('fullName').value.trim(),
                from_email: document.getElementById('contactEmail').value.trim(),
                message_type: document.getElementById('messageType').value,
                message: document.getElementById('fullMessage').value.trim(),
                to_email: 'liferestoration337@gmail.com'
            };

            emailjs.send('service_liferestoration', 'template_contact', contactData)
                .then(function () {
                    showFormMessage(contactForm, 'success', '✅ Message sent! We will respond within 1–2 business days.');
                    contactForm.reset();
                })
                .catch(function (error) {
                    console.error('EmailJS error:', error);
                    showFormMessage(contactForm, 'error', '❌ Message failed to send. Please email us at liferestoration337@gmail.com');
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.textContent = 'Send Message';
                        submitBtn.disabled = false;
                    }
                });
        });
    }