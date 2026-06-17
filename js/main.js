/**
 * main.js — Life Restoration Day Care
 * Part 3: JavaScript Functionality
 * Student: Justice Hove | ST10537282
 * 
 * Covers:
 *  1. Active navigation highlighting
 *  2. Scroll-to-top button
 *  3. Cookie consent banner
 *  4. Hero section animated counter (index)
 *  5. Service card fade-in on scroll (IntersectionObserver)
 *  6. Enquiry form validation + EmailJS submission
 *  7. Contact form validation + EmailJS submission
 *  8. Donation card toggle on enquiry page
 *  9. Image gallery lightbox (services)
 * 10. Current year auto-update in footer
 */

/* ============================================================
   1. ACTIVE NAV LINK — highlight current page in navigation
   ============================================================ */
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

    /* ============================================================
       2. SCROLL-TO-TOP BUTTON
       ============================================================ */
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

    /* ============================================================
       3. COOKIE CONSENT BANNER
       ============================================================ */
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

    /* ============================================================
       4. ANIMATED STAT COUNTERS — index.html only
       ============================================================ */
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

    /* ============================================================
       5. FADE-IN ON SCROLL — service cards & sections
       ============================================================ */
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

    /* ============================================================
       6. ENQUIRY FORM VALIDATION + EMAILJS
       ============================================================ */
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

    /* ============================================================
       7. CONTACT FORM VALIDATION + EMAILJS
       ============================================================ */
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

    /* ============================================================
       8. AUTO-UPDATE FOOTER YEAR
       ============================================================ */
    const yearSpans = document.querySelectorAll('.footer-year');
    yearSpans.forEach(function (span) {
        span.textContent = new Date().getFullYear();
    });

    /* ============================================================
       9. SERVICES PAGE — IMAGE LIGHTBOX
       ============================================================ */
    const galleryImages = document.querySelectorAll('#activities-grid .service-card img');
    if (galleryImages.length > 0) {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.innerHTML = `
            <button id="lightbox-close" aria-label="Close lightbox">&times;</button>
            <button id="lightbox-prev" aria-label="Previous image">&#10094;</button>
            <img id="lightbox-img" src="" alt="Enlarged gallery image">
            <button id="lightbox-next" aria-label="Next image">&#10095;</button>
        `;
        document.body.appendChild(lightbox);

        let currentIndex = 0;
        const imgSrcs = Array.from(galleryImages).map(function (img) { return img.src; });
        const imgAlts = Array.from(galleryImages).map(function (img) { return img.alt; });

        function openLightbox(index) {
            currentIndex = index;
            document.getElementById('lightbox-img').src = imgSrcs[currentIndex];
            document.getElementById('lightbox-img').alt = imgAlts[currentIndex];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        galleryImages.forEach(function (img, i) {
            img.style.cursor = 'pointer';
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', 'Click to enlarge: ' + img.alt);
            img.addEventListener('click', function () { openLightbox(i); });
            img.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
            });
        });

        document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
        document.getElementById('lightbox-prev').addEventListener('click', function () {
            currentIndex = (currentIndex - 1 + imgSrcs.length) % imgSrcs.length;
            document.getElementById('lightbox-img').src = imgSrcs[currentIndex];
            document.getElementById('lightbox-img').alt = imgAlts[currentIndex];
        });
        document.getElementById('lightbox-next').addEventListener('click', function () {
            currentIndex = (currentIndex + 1) % imgSrcs.length;
            document.getElementById('lightbox-img').src = imgSrcs[currentIndex];
            document.getElementById('lightbox-img').alt = imgAlts[currentIndex];
        });
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
            if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
        });
    }

}); // end DOMContentLoaded


/* ============================================================
   HELPER: FORM VALIDATION — ENQUIRY
   ============================================================ */
function validateEnquiryForm() {
    clearAllErrors();
    let valid = true;

    const name = document.getElementById('name');
    const surname = document.getElementById('surname');
    const cell = document.getElementById('cell');
    const email = document.getElementById('email');
    const purpose = document.getElementById('purpose');
    const enquiryText = document.getElementById('enquiry_text');

    if (!name || name.value.trim() === '') {
        showFieldError('name', 'Please enter your first name.');
        valid = false;
    }
    if (!surname || surname.value.trim() === '') {
        showFieldError('surname', 'Please enter your surname.');
        valid = false;
    }
    if (!cell || !/^[\d\s\+\-\(\)]{7,15}$/.test(cell.value.trim())) {
        showFieldError('cell', 'Please enter a valid phone number.');
        valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showFieldError('email', 'Please enter a valid email address.');
        valid = false;
    }
    if (!purpose || purpose.value === '') {
        showFieldError('purpose', 'Please select a purpose.');
        valid = false;
    }
    if (!enquiryText || enquiryText.value.trim().length < 10) {
        showFieldError('enquiry_text', 'Please provide more detail (minimum 10 characters).');
        valid = false;
    }

    return valid;
}

/* ============================================================
   HELPER: FORM VALIDATION — CONTACT
   ============================================================ */
function validateContactForm() {
    clearAllErrors();
    let valid = true;

    const fullName = document.getElementById('fullName');
    const contactEmail = document.getElementById('contactEmail');
    const messageType = document.getElementById('messageType');
    const fullMessage = document.getElementById('fullMessage');

    if (!fullName || fullName.value.trim() === '') {
        showFieldError('fullName', 'Please enter your full name.');
        valid = false;
    }
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value.trim())) {
        showFieldError('contactEmail', 'Please enter a valid email address.');
        valid = false;
    }
    if (!messageType || messageType.value === '') {
        showFieldError('messageType', 'Please select a message type.');
        valid = false;
    }
    if (!fullMessage || fullMessage.value.trim().length < 10) {
        showFieldError('fullMessage', 'Please enter a message (minimum 10 characters).');
        valid = false;
    }

    return valid;
}

/* ============================================================
   HELPER: SHOW ERROR UNDER A FIELD
   ============================================================ */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('input-error');
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error-msg';
    errorSpan.textContent = message;
    errorSpan.setAttribute('role', 'alert');

    // Insert after the field
    field.parentNode.insertBefore(errorSpan, field.nextSibling);
}

/* ============================================================
   HELPER: CLEAR ALL FIELD ERRORS
   ============================================================ */
function clearAllErrors() {
    document.querySelectorAll('.field-error-msg').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
}

/* ============================================================
   HELPER: SHOW FORM SUCCESS / ERROR MESSAGE BANNER
   ============================================================ */
function showFormMessage(form, type, message) {
    // Remove any existing message
    const existing = document.getElementById('form-status-msg');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.id = 'form-status-msg';
    msg.className = 'form-status ' + type;
    msg.textContent = message;
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');

    form.parentNode.insertBefore(msg, form);

    // Auto-remove after 8 seconds
    setTimeout(function () {
        if (msg.parentNode) msg.remove();
    }, 8000);

    // Scroll to message
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
