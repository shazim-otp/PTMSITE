/* ==========================================================================
   PTMHSS Thrikkadeeri - Javascript Interactions (Multi-Page & Secured Version)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic Announcements Database Logic ---
    const defaultAnnouncements = [
        { id: "1", text: "Admissions Open for High School (8th, 9th, 10th) and HSE (Science, Commerce) for the Academic Year 2026-27. Enquire Now!", urgent: true },
        { id: "2", text: "Outstanding results achieved by our Higher Secondary students in the Kerala State Board Examination!", urgent: false },
        { id: "3", text: "PTMHSS National Service Scheme (NSS) special camp dates announced for upcoming winter holidays.", urgent: false },
        { id: "4", text: "Registration begins for Little KITES IT Club's advanced coding bootcamp.", urgent: false }
    ];

    // Get announcements from localStorage or set defaults
    function getAnnouncements() {
        const stored = localStorage.getItem('school_announcements');
        if (!stored) {
            localStorage.setItem('school_announcements', JSON.stringify(defaultAnnouncements));
            return defaultAnnouncements;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            return defaultAnnouncements;
        }
    }

    // Save announcements to localStorage
    function saveAnnouncements(announcements) {
        localStorage.setItem('school_announcements', JSON.stringify(announcements));
    }

    // Render announcements in the home page ticker
    const tickerTrack = document.getElementById('ticker-track');
    if (tickerTrack) {
        const announcements = getAnnouncements();
        tickerTrack.innerHTML = ''; // clear static placeholders
        
        if (announcements.length === 0) {
            tickerTrack.innerHTML = '<span class="ticker-item">ℹ️ No active announcements at the moment. Check back soon!</span>';
        } else {
            // Duplicate items to ensure smooth continuous scrolling loop if list is short
            const renderList = announcements.length < 4 ? [...announcements, ...announcements] : announcements;
            
            renderList.forEach(item => {
                const span = document.createElement('span');
                span.className = 'ticker-item';
                const prefix = item.urgent ? '🔴 ' : 'ℹ️ ';
                span.textContent = `${prefix}${item.text}`;
                tickerTrack.appendChild(span);
            });
        }
    }

    // --- Staff Portal Passcode Authentication Security ---
    const loginOverlay = document.getElementById('admin-login-overlay');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const passcodeInput = document.getElementById('admin-passcode');
    const loginErrorMsg = document.getElementById('admin-login-error');
    const logoutBtn = document.getElementById('admin-logout-btn');

    function checkAuth() {
        if (sessionStorage.getItem('staff_logged_in') === 'true') {
            if (loginOverlay) loginOverlay.classList.add('hidden');
            if (adminDashboard) adminDashboard.classList.remove('hidden');
        } else {
            if (loginOverlay) loginOverlay.classList.remove('hidden');
            if (adminDashboard) adminDashboard.classList.add('hidden');
        }
    }

    // Run auth check on load if admin panel elements are present
    if (loginOverlay || adminDashboard) {
        checkAuth();
    }

    // Bind Passcode Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passcode = passcodeInput.value.trim();
            // Passcode: PTM9137 (case-insensitive, school email prefix)
            if (passcode.toLowerCase() === 'ptm9137') {
                sessionStorage.setItem('staff_logged_in', 'true');
                passcodeInput.value = '';
                if (loginErrorMsg) loginErrorMsg.style.display = 'none';
                checkAuth();
                // Render list on unlock
                if (adminAnnouncementsList) {
                    renderAdminAnnouncements();
                }
            } else {
                if (loginErrorMsg) {
                    loginErrorMsg.style.display = 'block';
                    loginErrorMsg.textContent = 'Incorrect passcode. Please try again.';
                }
                passcodeInput.focus();
            }
        });
    }

    // Bind Logout Button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('staff_logged_in');
            window.location.reload();
        });
    }


    // Render announcements in the admin panel list
    const adminAnnouncementsList = document.getElementById('admin-announcements-list');
    
    function renderAdminAnnouncements() {
        if (!adminAnnouncementsList) return;
        
        const announcements = getAnnouncements();
        adminAnnouncementsList.innerHTML = '';
        
        if (announcements.length === 0) {
            adminAnnouncementsList.innerHTML = '<li class="no-announcements">No announcements active. Use the form above to add one.</li>';
            return;
        }

        announcements.forEach(item => {
            const li = document.createElement('li');
            li.className = `admin-announcement-item ${item.urgent ? 'item-urgent' : ''}`;
            
            li.innerHTML = `
                <div class="announcement-item-content">
                    <span class="urgency-badge ${item.urgent ? 'badge-urgent' : 'badge-normal'}">
                        ${item.urgent ? 'Urgent' : 'Normal'}
                    </span>
                    <p class="announcement-item-text">${item.text}</p>
                </div>
                <button class="btn-delete-announcement" data-id="${item.id}" aria-label="Delete announcement">
                    <i class="fa-solid fa-trash-can"></i> Delete
                </button>
            `;
            adminAnnouncementsList.appendChild(li);
        });

        // Bind delete events
        const deleteButtons = adminAnnouncementsList.querySelectorAll('.btn-delete-announcement');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = btn.getAttribute('data-id');
                let announcements = getAnnouncements();
                announcements = announcements.filter(item => item.id !== idToDelete);
                saveAnnouncements(announcements);
                renderAdminAnnouncements();
            });
        });
    }

    // Load admin panel dashboard list if authorized
    if (adminAnnouncementsList && sessionStorage.getItem('staff_logged_in') === 'true') {
        renderAdminAnnouncements();
    }

    // Handle Add Announcement Form
    const uploadForm = document.getElementById('upload-announcement-form');
    const announcementTextInput = document.getElementById('announcement-text');
    const announcementUrgentCheckbox = document.getElementById('announcement-urgent');
    const uploadSuccessMsg = document.getElementById('upload-success-msg');

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const textVal = announcementTextInput.value.trim();
            const isUrgent = announcementUrgentCheckbox.checked;

            if (textVal === '') {
                announcementTextInput.parentElement.classList.add('invalid');
                return;
            } else {
                announcementTextInput.parentElement.classList.remove('invalid');
            }

            const newAnnouncement = {
                id: Date.now().toString(),
                text: textVal,
                urgent: isUrgent
            };

            const announcements = getAnnouncements();
            announcements.unshift(newAnnouncement); // Add to beginning of list
            saveAnnouncements(announcements);
            
            // Reset form
            uploadForm.reset();
            
            // Show success notice
            if (uploadSuccessMsg) {
                uploadSuccessMsg.style.display = 'flex';
                setTimeout(() => {
                    uploadSuccessMsg.style.display = 'none';
                }, 3000);
            }

            renderAdminAnnouncements();
        });

        // Clean error on input
        if (announcementTextInput) {
            announcementTextInput.addEventListener('input', () => {
                if (announcementTextInput.value.trim() !== '') {
                    announcementTextInput.parentElement.classList.remove('invalid');
                }
            });
        }
    }

    // Handle Reset Button
    const resetBtn = document.getElementById('reset-announcements-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to restore default announcements? This will clear all custom added announcements.')) {
                localStorage.setItem('school_announcements', JSON.stringify(defaultAnnouncements));
                renderAdminAnnouncements();
            }
        });
    }


    // --- Theme Toggle (Dark / Light Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const bodyEl = document.body;

    if (themeToggleBtn) {
        // Load persisted theme
        const savedTheme = localStorage.getItem('theme') || 'light-theme';
        bodyEl.className = savedTheme;
        updateThemeIcon(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            if (bodyEl.classList.contains('light-theme')) {
                bodyEl.classList.remove('light-theme');
                bodyEl.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
                updateThemeIcon('dark-theme');
            } else {
                bodyEl.classList.remove('dark-theme');
                bodyEl.classList.add('light-theme');
                localStorage.setItem('theme', 'light-theme');
                updateThemeIcon('light-theme');
            }
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            if (theme === 'dark-theme') {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        }
    }


    // --- Sticky Header on Scroll ---
    const header = document.getElementById('main-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }


    // --- Mobile Menu Navigation ---
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileNavEnquiryBtn = document.getElementById('mobile-nav-enquiry-btn');

    function openMobileMenu() {
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('active');
            bodyEl.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
            bodyEl.style.overflow = '';
        }
    }

    if (mobileNavToggle) mobileNavToggle.addEventListener('click', openMobileMenu);
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    if (mobileNavEnquiryBtn) {
        mobileNavEnquiryBtn.addEventListener('click', closeMobileMenu);
    }


    // --- Animated Statistics Counter ---
    const statsSection = document.getElementById('stats-grid');
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function startCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds
            const stepTime = 30; // ms
            const steps = Math.ceil(duration / stepTime);
            const increment = target / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current += increment;
                if (step >= steps) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, stepTime);
        });
    }

    if (statsSection && statNumbers.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.1
        };

        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    startCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        statsObserver.observe(statsSection);
    }


    // --- Academics Division Tabs ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const activeContent = document.getElementById(targetTab);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }


    // --- Clubs Search & Category Filter ---
    const clubSearchInput = document.getElementById('club-search-input');
    const clubFilterButtons = document.querySelectorAll('#club-filter-buttons .filter-btn');
    const clubCards = document.querySelectorAll('.club-card');

    if (clubSearchInput && clubCards.length > 0) {
        let activeCategory = 'all';
        let searchQuery = '';

        const filterClubs = () => {
            clubCards.forEach(card => {
                const matchesCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
                const clubName = card.querySelector('h3').textContent.toLowerCase();
                const clubDesc = card.querySelector('p').textContent.toLowerCase();
                const matchesSearch = clubName.includes(searchQuery) || clubDesc.includes(searchQuery);

                if (matchesCategory && matchesSearch) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        };

        clubSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterClubs();
        });

        clubFilterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                clubFilterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-filter');
                filterClubs();
            });
        });
    }


    // --- Media Gallery Tabs & Lightbox Modal ---
    const galleryTabButtons = document.querySelectorAll('.gallery-tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightbox-modal');

    if (galleryItems.length > 0 && lightboxModal) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');

        // Tab switching
        galleryTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                galleryTabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-gallery-filter');
                
                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-group') === filterValue) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });

        // Get active (visible) items list to enable proper carousel nav
        const getVisibleGalleryItems = () => {
            return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
        };

        let currentPhotoIndex = 0;

        const openLightbox = (index) => {
            const visibleItems = getVisibleGalleryItems();
            if (index < 0 || index >= visibleItems.length) return;
            
            currentPhotoIndex = index;
            const targetItem = visibleItems[index];
            const img = targetItem.querySelector('img');
            const captionText = targetItem.querySelector('.gallery-info h4').textContent;
            const subText = targetItem.querySelector('.gallery-info span').textContent;

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.innerHTML = `<strong>${captionText}</strong> — ${subText}`;
            
            lightboxModal.classList.add('active');
            lightboxModal.setAttribute('aria-hidden', 'false');
            bodyEl.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightboxModal.classList.remove('active');
            lightboxModal.setAttribute('aria-hidden', 'true');
            bodyEl.style.overflow = '';
        };

        // Attach click events to gallery items
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const visibleItems = getVisibleGalleryItems();
                const idx = visibleItems.indexOf(item);
                openLightbox(idx);
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // Carousel controls
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                const visibleItems = getVisibleGalleryItems();
                let prevIndex = currentPhotoIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = visibleItems.length - 1;
                }
                openLightbox(prevIndex);
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                const visibleItems = getVisibleGalleryItems();
                let nextIndex = currentPhotoIndex + 1;
                if (nextIndex >= visibleItems.length) {
                    nextIndex = 0;
                }
                openLightbox(nextIndex);
            });
        }

        // Keyboard support for Lightbox
        window.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && lightboxPrev) {
                lightboxPrev.click();
            } else if (e.key === 'ArrowRight' && lightboxNext) {
                lightboxNext.click();
            }
        });
    }


    // --- Admission Enquiry Form Validation & Submission ---
    const enquiryForm = document.getElementById('admission-enquiry-form');

    if (enquiryForm) {
        const studentNameInput = document.getElementById('student-name');
        const parentNameInput = document.getElementById('parent-name');
        const applyGradeSelect = document.getElementById('apply-grade');
        const phoneNumberInput = document.getElementById('phone-number');
        const emailAddressInput = document.getElementById('email-address');

        // Success Modal elements
        const successModal = document.getElementById('success-modal');
        const successStudentName = document.getElementById('success-student-name');
        const successPhone = document.getElementById('success-phone');
        const successCloseBtn = document.getElementById('success-close-btn');

        // Live validation helpers
        const setInvalid = (inputField) => {
            inputField.parentElement.classList.add('invalid');
        };

        const setValid = (inputField) => {
            inputField.parentElement.classList.remove('invalid');
        };

        // Realtime cleanup / validation triggers
        if (studentNameInput) {
            studentNameInput.addEventListener('input', () => {
                if (studentNameInput.value.trim() !== '') setValid(studentNameInput);
            });
        }
        if (parentNameInput) {
            parentNameInput.addEventListener('input', () => {
                if (parentNameInput.value.trim() !== '') setValid(parentNameInput);
            });
        }
        if (applyGradeSelect) {
            applyGradeSelect.addEventListener('change', () => {
                if (applyGradeSelect.value !== '') setValid(applyGradeSelect);
            });
        }

        if (phoneNumberInput) {
            phoneNumberInput.addEventListener('input', () => {
                const phoneVal = phoneNumberInput.value.replace(/\D/g, ''); // strip non-digits
                phoneNumberInput.value = phoneVal.slice(0, 10); // cap at 10 chars
                if (phoneNumberInput.value.length === 10) {
                    setValid(phoneNumberInput);
                }
            });
        }

        if (emailAddressInput) {
            emailAddressInput.addEventListener('input', () => {
                const emailVal = emailAddressInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailVal === '' || emailRegex.test(emailVal)) {
                    setValid(emailAddressInput);
                }
            });
        }

        // Form Submit handling
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isFormValid = true;

            // Validate Student Name
            if (studentNameInput && studentNameInput.value.trim() === '') {
                setInvalid(studentNameInput);
                isFormValid = false;
            } else if (studentNameInput) {
                setValid(studentNameInput);
            }

            // Validate Parent Name
            if (parentNameInput && parentNameInput.value.trim() === '') {
                setInvalid(parentNameInput);
                isFormValid = false;
            } else if (parentNameInput) {
                setValid(parentNameInput);
            }

            // Validate Class Selection
            if (applyGradeSelect && applyGradeSelect.value === '') {
                setInvalid(applyGradeSelect);
                isFormValid = false;
            } else if (applyGradeSelect) {
                setValid(applyGradeSelect);
            }

            // Validate Phone
            const phoneRegex = /^[6-9]\d{9}$/;
            if (phoneNumberInput && !phoneRegex.test(phoneNumberInput.value)) {
                setInvalid(phoneNumberInput);
                isFormValid = false;
            } else if (phoneNumberInput) {
                setValid(phoneNumberInput);
            }

            // Validate Email
            if (emailAddressInput && emailAddressInput.value.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailAddressInput.value.trim())) {
                    setInvalid(emailAddressInput);
                    isFormValid = false;
                } else if (emailAddressInput) {
                    setValid(emailAddressInput);
                }
            }

            if (isFormValid && successModal) {
                // Populate success card details
                if (successStudentName && studentNameInput) {
                    successStudentName.textContent = studentNameInput.value.trim();
                }
                if (successPhone && phoneNumberInput) {
                    successPhone.textContent = phoneNumberInput.value.trim();
                }
                
                // Show Success Dialog
                successModal.classList.add('active');
                successModal.setAttribute('aria-hidden', 'false');
                
                // Reset Form fields
                enquiryForm.reset();
            }
        });

        // Close Success Modal
        if (successCloseBtn && successModal) {
            successCloseBtn.addEventListener('click', () => {
                successModal.classList.remove('active');
                successModal.setAttribute('aria-hidden', 'true');
            });
        }
    }

});
