document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // LOADER
    // ==========================================
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('progress-bar');

    if (loader && progressBar) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 10;
            if (progress > 100) progress = 100;
            progressBar.style.width = `${progress}%`;
            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => { loader.classList.add('loader-hidden'); }, 400);
            }
        }, 150);
    }

    // ==========================================
    // CINEMATIC INTRO OVERLAY
    // ==========================================
    const introOverlay = document.getElementById('intro-overlay');
    const typedCmd = document.getElementById('typed-cmd');
    const termCursor = document.getElementById('term-cursor');
    const termOutput = document.getElementById('terminal-output');
    const scrollHint = document.getElementById('intro-scroll-hint');

    const CMD_TEXT = 'createFuture();';
    let cmdTyped = false;
    let scrollReady = false;
    let introActive = true;

    // --- Particle canvas inside overlay ---
    const canvas = document.getElementById('intro-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 1.5 + 0.3,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.4 + 0.1,
            });
        }

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,200,255,${p.alpha})`;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            });
            if (introActive) requestAnimationFrame(drawParticles);
        };
        drawParticles();
    }

    // --- Type the command letter by letter ---
    const typeCommand = () => {
        let i = 0;
        const interval = setInterval(() => {
            if (typedCmd) typedCmd.textContent = CMD_TEXT.slice(0, i + 1);
            i++;
            if (i >= CMD_TEXT.length) {
                clearInterval(interval);
                cmdTyped = true;
                // Show scroll hint and enter button after a short pause
                setTimeout(() => {
                    if (scrollHint) scrollHint.classList.add('hint-visible');
                    const enterBtn = document.getElementById('btn-terminal-enter');
                    if (enterBtn) enterBtn.classList.add('btn-visible');
                    scrollReady = true;
                }, 800);
            }
        }, 85);
    };

    // Start typing after loader disappears (≈1.5s)
    setTimeout(typeCommand, 1600);

    // --- Execute on first scroll ---
    const executeIntro = () => {
        if (!scrollReady || !introActive) return;
        introActive = false;

        // Remove scroll hint and enter button
        if (scrollHint) scrollHint.classList.remove('hint-visible');
        const enterBtn = document.getElementById('btn-terminal-enter');
        if (enterBtn) enterBtn.classList.remove('btn-visible');

        // Hide blinking cursor while "executing"
        if (termCursor) termCursor.style.display = 'none';

        // Print output lines
        const lines = [
            { text: '> createFuture();', cls: 'out-success', delay: 0 },
            { text: '', cls: 'out-dim', delay: 280 },
            { text: 'Initializing portfolio...', cls: '', delay: 450 },
            { text: 'Loading modules...        ██████████ 100%', cls: 'out-dim', delay: 820 },
            { text: '✓ Portfolio ready.', cls: 'out-success', delay: 1200 },
        ];

        lines.forEach(({ text, cls, delay }) => {
            setTimeout(() => {
                const span = document.createElement('span');
                span.classList.add('out-line');
                if (cls) span.classList.add(cls);
                span.textContent = text;
                termOutput.appendChild(span);
            }, delay);
        });

        // Dismiss overlay after all lines shown
        setTimeout(() => {
            introOverlay.classList.add('overlay-exit');
            document.body.classList.remove('scroll-locked');
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 900);
        }, 2000);
    };

    // Capture scroll / wheel / touch events while overlay is active
    const onScrollAttempt = (e) => {
        if (!introActive) return;
        if (!scrollReady) return; // still typing
        e.preventDefault();
        executeIntro();
    };

    // Click event for the initialize button
    const enterBtn = document.getElementById('btn-terminal-enter');
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            executeIntro();
        });
    }

    window.addEventListener('wheel', onScrollAttempt, { passive: false });
    window.addEventListener('touchmove', onScrollAttempt, { passive: false });
    window.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'PageDown', 'Space', ' '].includes(e.key)) onScrollAttempt(e);
    });

    // ==========================================
    // SECTION TERMINAL REVEAL SYSTEM
    // ==========================================
    const sectionRevealData = [
        {
            headerId: 'about-terminal-header',
            textId: 'about-sth-text',
            checkId: 'about-sth-check',
            sectionId: 'about',
            message: 'Generating About Me section...',
        },
        {
            headerId: 'skills-terminal-header',
            textId: 'skills-sth-text',
            checkId: 'skills-sth-check',
            sectionId: 'skills',
            message: 'Generating Skills section...',
        },
        {
            headerId: 'projects-terminal-header',
            textId: 'projects-sth-text',
            checkId: 'projects-sth-check',
            sectionId: 'projects',
            message: 'Generating projects section...',
        },
    ];

    // Helper: type text into an element
    const typeInto = (el, text, speed, cb) => {
        let i = 0;
        el.textContent = '';
        const iv = setInterval(() => {
            el.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(iv);
                if (cb) cb();
            }
        }, speed);
    };

    // Trigger for each section
    const triggerSectionReveal = (data) => {
        const header = document.getElementById(data.headerId);
        const textEl = document.getElementById(data.textId);
        const checkEl = document.getElementById(data.checkId);
        const section = document.getElementById(data.sectionId);

        if (!header || !textEl || !checkEl || !section) return;

        // Show terminal header
        header.classList.add('sth-active');

        // Type the message
        typeInto(textEl, data.message, 38, () => {
            // After typing completes, show ✓ Complete
            setTimeout(() => {
                checkEl.textContent = '✓ Complete';
                // Reveal section
                setTimeout(() => {
                    section.classList.add('section-revealed');
                }, 200);
            }, 300);
        });
    };

    // IntersectionObserver – fires when terminal header enters viewport
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            const data = sectionRevealData.find(d => d.headerId === id);
            if (data) {
                triggerSectionReveal(data);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sectionRevealData.forEach(data => {
        const header = document.getElementById(data.headerId);
        if (header) revealObserver.observe(header);
    });

    // ==========================================
    // FINAL CINEMATIC SCENE TYPEWRITER
    // ==========================================
    const finalTagline = document.getElementById('final-tagline');
    const FINAL_TEXT = 'Built from curiosity.\nPowered by code.';

    if (finalTagline) {
        const finalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                finalObserver.disconnect();
                let i = 0;
                finalTagline.textContent = '';
                const iv = setInterval(() => {
                    const ch = FINAL_TEXT[i];
                    if (ch === '\n') {
                        finalTagline.appendChild(document.createElement('br'));
                    } else {
                        finalTagline.insertAdjacentText('beforeend', ch);
                    }
                    i++;
                    if (i >= FINAL_TEXT.length) clearInterval(iv);
                }, 48);
            });
        }, { threshold: 0.4 });
        finalObserver.observe(finalTagline);
    }

    // ==========================================
    // STARFIELD GENERATION
    // ==========================================
    const starfield = document.getElementById('starfield');
    if (starfield) {
        for (let i = 0; i < 70; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const size = Math.random() * 2.5 + 0.5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.setProperty('--twinkle-duration', `${Math.random() * 4 + 2}s`);
            star.style.setProperty('--base-opacity', Math.random() * 0.5 + 0.2);
            starfield.appendChild(star);
        }
    }

    // ==========================================
    // SKILLS GALAXY INTERACTIONS
    // ==========================================
    const planets = document.querySelectorAll('.skill-planet');
    const infoPanel = document.getElementById('galaxy-info-panel');
    const closeBtn = document.getElementById('panel-close-btn');
    const orbits = document.querySelectorAll('.orbit-path');

    const skillUniverseData = {
        'java': {
            name: 'Java',
            icon: 'fa-brands fa-java',
            color: '#f89820',
            experience: '2+ years of learning and building robust applications.',
            projects: ['DocuMind AI', 'Command Line RPG Games', 'Library Management System'],
            tech: ['OOP Principles', 'Collections Framework', 'File Handling', 'Exception Handling', 'Multithreading']
        },
        'python': {
            name: 'Python',
            icon: 'fa-brands fa-python',
            color: '#3776ab',
            experience: '2+ years of scripting, automation, and data handling.',
            projects: ['Automated Web Scrapers', 'Data Visualization Dashboard', 'System Scripting Utilities'],
            tech: ['Automation & Scripting', 'Data Analysis (Pandas/NumPy)', 'APIs & Web Scraping', 'File Parsing']
        },
        'cpp': {
            name: 'C++',
            icon: 'fa-solid fa-code',
            color: '#00599c',
            experience: '1.5+ years of algorithmic problem solving.',
            projects: ['DSA Library', 'Graphics Utilities', 'Embedded System Logic'],
            tech: ['OOP Design', 'STL', 'Memory Management', 'Pointers & References']
        },
        'htmlcss': {
            name: 'HTML & CSS',
            icon: 'fa-brands fa-html5',
            color: '#e34f26',
            experience: '3+ years crafting fully responsive, animation-heavy interfaces.',
            projects: ['Interactive Portfolio', 'Inbox OS Web UI', 'DocuMind AI UI'],
            tech: ['Responsive Web Design', 'Tailwind CSS', 'Flexbox / Grid', 'Glassmorphism']
        },
        'javascript': {
            name: 'JavaScript & TS',
            icon: 'fa-brands fa-js',
            color: '#f7df1e',
            experience: '2+ years of frontend & fullstack web application development.',
            projects: ['Inbox OS (Fullstack)', 'Dynamic Portfolio', 'DocuMind AI Chat Logic'],
            tech: ['React 19 & TypeScript', 'Node.js & Express', 'Socket.io', 'Async Programming']
        },
        'git': {
            name: 'Git & GitHub',
            icon: 'fa-brands fa-git-alt',
            color: '#f05032',
            experience: '2+ years of team collaboration and version control.',
            projects: ['Hackathon Collaborative Repos', 'Open Source Contributions', 'Portfolio Deployment'],
            tech: ['Branching & Merging', 'Conflict Resolution', 'Pull Requests', 'GitHub Pages']
        }
    };

    const showSkillDetails = (skillId) => {
        const data = skillUniverseData[skillId];
        if (!data) return;

        document.getElementById('panel-skill-name').textContent = data.name;
        document.getElementById('panel-skill-experience').textContent = data.experience;

        const iconWrap = document.getElementById('panel-skill-icon-wrap');
        iconWrap.innerHTML = `<i class="${data.icon}" style="color:${data.color};font-size:2rem"></i>`;
        iconWrap.style.borderColor = `${data.color}44`;

        const projectsList = document.getElementById('panel-skill-projects');
        projectsList.innerHTML = '';
        data.projects.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p;
            projectsList.appendChild(li);
        });

        const techWrap = document.getElementById('panel-skill-tech');
        techWrap.innerHTML = '';
        data.tech.forEach(t => {
            const span = document.createElement('span');
            span.textContent = t;
            techWrap.appendChild(span);
        });

        infoPanel.classList.add('panel-open');
    };

    planets.forEach(planet => {
        planet.addEventListener('click', (e) => {
            e.stopPropagation();
            const skillId = planet.getAttribute('data-skill');
            showSkillDetails(skillId);

            planets.forEach(p => { p.classList.remove('active-planet'); p.classList.add('orbit-paused'); });
            planet.classList.add('active-planet');
            planet.classList.remove('orbit-paused');

            orbits.forEach(o => o.classList.remove('orbit-glow-active'));
            const parentOrbit = planet.closest('.orbit-path');
            if (parentOrbit) parentOrbit.classList.add('orbit-glow-active');
        });
    });

    // Grid skill cards interactions
    const gridCards = document.querySelectorAll('.skill-card-new');
    gridCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const skillId = card.getAttribute('data-skill');
            showSkillDetails(skillId);
            
            gridCards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');
        });
    });

    // View toggling (Galaxy vs Grid)
    const btnGalaxy = document.getElementById('skills-btn-galaxy');
    const btnGrid = document.getElementById('skills-btn-grid');
    const universeContainer = document.querySelector('.universe-container');
    const skillsGridView = document.getElementById('skills-grid-view');

    const closePanel = () => {
        if (infoPanel) infoPanel.classList.remove('panel-open');
        planets.forEach(p => { p.classList.remove('active-planet'); p.classList.remove('orbit-paused'); });
        orbits.forEach(o => o.classList.remove('orbit-glow-active'));
        gridCards.forEach(c => c.classList.remove('active-card'));
    };

    if (btnGalaxy && btnGrid && universeContainer && skillsGridView) {
        btnGalaxy.addEventListener('click', () => {
            btnGalaxy.classList.add('active');
            btnGrid.classList.remove('active');
            universeContainer.style.display = 'flex';
            skillsGridView.style.display = 'none';
            closePanel();
        });

        btnGrid.addEventListener('click', () => {
            btnGrid.classList.add('active');
            btnGalaxy.classList.remove('active');
            universeContainer.style.display = 'none';
            skillsGridView.style.display = 'block';
            closePanel();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePanel(); });

    document.addEventListener('click', (e) => {
        if (infoPanel && infoPanel.classList.contains('panel-open')) {
            const clickOnPlanet = Array.from(planets).some(p => p.contains(e.target));
            const clickOnGridCard = Array.from(gridCards).some(c => c.contains(e.target));
            if (!infoPanel.contains(e.target) && !clickOnPlanet && !clickOnGridCard) {
                closePanel();
            }
        }
    });

    // ==========================================
    // PROJECTS CAROUSEL BEHAVIOR
    // ==========================================
    const carousel = document.getElementById('projects-carousel');
    const prevBtn = document.getElementById('project-prev-btn');
    const nextBtn = document.getElementById('project-next-btn');

    if (carousel) {
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const card = carousel.querySelector('.project-carousel-card');
                const w = card ? card.offsetWidth + 40 : 420;
                carousel.scrollBy({ left: -w, behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                const card = carousel.querySelector('.project-carousel-card');
                const w = card ? card.offsetWidth + 40 : 420;
                carousel.scrollBy({ left: w, behavior: 'smooth' });
            });
        }
        carousel.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) { e.preventDefault(); carousel.scrollLeft += e.deltaY; }
        }, { passive: false });

        const checkArrows = () => {
            if (!prevBtn || !nextBtn) return;
            const max = carousel.scrollWidth - carousel.clientWidth;
            prevBtn.style.opacity = carousel.scrollLeft <= 5 ? '0.4' : '1';
            nextBtn.style.opacity = carousel.scrollLeft >= max - 5 ? '0.4' : '1';
        };
        carousel.addEventListener('scroll', checkArrows);
        window.addEventListener('resize', checkArrows);
        setTimeout(checkArrows, 500);
    }

    // Viewport fade-in for project cards & 3D Holographic Tilt Reaction
    const projectCards = document.querySelectorAll('.project-carousel-card');
    if (projectCards.length > 0) {
        const cardObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    cardObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        projectCards.forEach(c => {
            cardObs.observe(c);

            // Add dynamic 3D Holographic Glare overlay
            if (!c.querySelector('.project-card-glare')) {
                const glare = document.createElement('div');
                glare.className = 'project-card-glare';
                c.appendChild(glare);
            }

            const glare = c.querySelector('.project-card-glare');
            const img = c.querySelector('.project-card-image');
            const title = c.querySelector('.project-card-title');

            c.addEventListener('mousemove', (e) => {
                const rect = c.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const maxTilt = 14;
                const rotateX = -((y - centerY) / centerY) * maxTilt;
                const rotateY = ((x - centerX) / centerX) * maxTilt;

                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;

                const parallaxX = -((x - centerX) / centerX) * 8;
                const parallaxY = -((y - centerY) / centerY) * 8;

                c.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.04)`;
                c.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
                c.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);

                if (img) {
                    img.style.transform = `scale(1.08) translate3d(${parallaxX.toFixed(1)}px, ${parallaxY.toFixed(1)}px, 12px)`;
                }
                if (title) {
                    title.style.transform = `translate3d(${-parallaxX.toFixed(1) * 0.3}px, ${-parallaxY.toFixed(1) * 0.3}px, 6px)`;
                }
            });

            c.addEventListener('mouseleave', () => {
                c.style.transform = '';
                c.style.setProperty('--glare-x', `50%`);
                c.style.setProperty('--glare-y', `50%`);
                if (img) img.style.transform = '';
                if (title) title.style.transform = '';
            });
        });

        // Dynamic active-card detection on scroll (Center focus & smooth recede)
        const updateActiveCard = () => {
            if (!carousel) return;
            const carouselRect = carousel.getBoundingClientRect();
            const carouselCenterX = carouselRect.left + carouselRect.width / 2;

            let minDistance = Infinity;
            let activeCard = null;

            projectCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(carouselCenterX - cardCenterX);

                if (distance < minDistance) {
                    minDistance = distance;
                    activeCard = card;
                }
            });

            if (activeCard) {
                carousel.classList.add('has-active');
                projectCards.forEach(c => {
                    if (c === activeCard) {
                        c.classList.add('card-active');
                    } else {
                        c.classList.remove('card-active');
                    }
                });
            }
        };

        if (carousel) {
            carousel.addEventListener('scroll', updateActiveCard);
            window.addEventListener('resize', updateActiveCard);
            setTimeout(updateActiveCard, 300);
        }

        // Hover override: focus hovered card and dim others
        projectCards.forEach(c => {
            c.addEventListener('mouseenter', () => {
                if (carousel) carousel.classList.add('has-active');
                projectCards.forEach(other => {
                    if (other === c) {
                        other.classList.add('card-active');
                    } else {
                        other.classList.remove('card-active');
                    }
                });
            });
            c.addEventListener('mouseleave', () => {
                updateActiveCard();
            });
        });
    }

    // ==========================================
    // JOURNEY SECTION: Map Interactions & Boat
    // ==========================================
    const journeyDetails = document.getElementById('journey-details');
    const journeyTitle = document.getElementById('journey-title');
    const islands = document.querySelectorAll('.island:not(.locked)');
    const viewExpBtn = document.getElementById('view-experiences-btn');
    const hackathonsList = document.getElementById('hackathons-list');

    const journeyData = {
        'island-10th': { title: 'Completed School', text: 'My best 10 years — school ranker with 3rd place, 95% in SSC boards.' },
        'island-12th': { title: 'Completed 12th', text: 'Cracked JEE & CET — 94.11 percentile in CET, 80.5% in 12th boards HSC.' },
        'island-college': { title: 'Pursuing B.Tech', text: 'Pursuing AI & Data Science at VESIT. Grabbing every opportunity that helps me grow.' },
    };

    islands.forEach(island => {
        island.addEventListener('click', () => {
            const id = island.id;
            const data = journeyData[id];
            if (data) {
                journeyTitle.innerHTML = data.title;
                journeyDetails.innerHTML = `<p>${data.text}</p>`;
                const boat = document.getElementById('map-boat');
                if (boat) { boat.style.top = island.style.top; boat.style.left = island.style.left; }
            }
        });
    });

    if (viewExpBtn && hackathonsList) {
        viewExpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const visible = hackathonsList.style.display === 'block';
            hackathonsList.style.display = visible ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!viewExpBtn.contains(e.target) && !hackathonsList.contains(e.target)) {
                hackathonsList.style.display = 'none';
            }
        });
    }

    // ==========================================
    // MUMBAI LOCAL CLOCK
    // ==========================================
    // ==========================================
    // INSTAGRAM-LIKE FLOATING TAGS SYSTEM
    // ==========================================
    const initFloatingTags = () => {
        const container = document.getElementById('floating-tags-container');
        if (!container) return;

        const tagsData = [
            { text: 'Engineer', icon: 'fa-solid fa-user-gear', color: '#ff5e62' },
            { text: 'Guitarist', icon: 'fa-solid fa-guitar', color: '#ff9966' },
            { text: 'Bookworm', icon: 'fa-solid fa-book-open', color: '#4ca1af' },
            { text: 'Experimenter', icon: 'fa-solid fa-flask', color: '#00f0ff' },
            { text: 'Learner', icon: 'fa-solid fa-graduation-cap', color: '#11998e' },
            { text: 'Athlete', icon: 'fa-solid fa-running', color: '#ff416c' },
            { text: 'Gym', icon: 'fa-solid fa-dumbbell', color: '#f857a6' },
            { text: 'AI / ML', icon: 'fa-solid fa-brain', color: '#00f0ff' },
            { text: 'Data Science', icon: 'fa-solid fa-chart-simple', color: '#bd53ff' },
            { text: 'Web Dev', icon: 'fa-solid fa-laptop-code', color: '#00f0ff' },
            { text: 'Problem Solver', icon: 'fa-solid fa-code', color: '#bd53ff' },
            // New keyword entries requested by user (deduplicated)
            { text: 'Software Engineering', icon: 'fa-solid fa-gear', color: '#ff5e62' },
            { text: 'Innovation', icon: 'fa-solid fa-lightbulb', color: '#00f0ff' },
            { text: 'AI Enthusiast', icon: 'fa-solid fa-robot', color: '#bd53ff' },
            { text: 'UI/UX Design', icon: 'fa-solid fa-palette', color: '#ff007f' },
            { text: 'Problem Solving', icon: 'fa-solid fa-puzzle-piece', color: '#11998e' },
            { text: 'Continuous Learning', icon: 'fa-solid fa-graduation-cap', color: '#11998e' },
            { text: 'Full-Stack Dev', icon: 'fa-solid fa-layer-group', color: '#00f0ff' },
            { text: 'Entrepreneurship', icon: 'fa-solid fa-briefcase', color: '#ff9966' },
            { text: 'System Design', icon: 'fa-solid fa-network-wired', color: '#f857a6' },
            { text: 'Automation', icon: 'fa-solid fa-bolt', color: '#00f0ff' },
            { text: 'Emerging Tech', icon: 'fa-solid fa-rocket', color: '#bd53ff' },
            { text: 'Digital Transformation', icon: 'fa-solid fa-circle-nodes', color: '#ff5e62' },
            { text: 'Tech Leadership', icon: 'fa-solid fa-users-gear', color: '#ff416c' },
            { text: 'OOP', icon: 'fa-solid fa-cubes', color: '#00f0ff' },
            { text: 'Clean Code Advocate', icon: 'fa-solid fa-wand-magic-sparkles', color: '#4ca1af' },
            { text: 'Scalable Solutions', icon: 'fa-solid fa-chart-line', color: '#11998e' },
            { text: 'Application Dev', icon: 'fa-solid fa-mobile-screen-button', color: '#bd53ff' },
            { text: 'Software Architecture', icon: 'fa-solid fa-sitemap', color: '#bd53ff' },
            { text: 'Debugging & Optimization', icon: 'fa-solid fa-bug-slash', color: '#ff5e62' },
            { text: 'Agile Development', icon: 'fa-solid fa-repeat', color: '#ff9966' },
            { text: 'Engineering Excellence', icon: 'fa-solid fa-award', color: '#bd53ff' },
            { text: 'Lifelong Learner', icon: 'fa-solid fa-book-reader', color: '#4ca1af' },
            { text: 'Tech Enthusiast', icon: 'fa-solid fa-desktop', color: '#00f0ff' },
            { text: 'Creative Thinker', icon: 'fa-solid fa-brain', color: '#ff007f' },
            { text: 'Detail Oriented', icon: 'fa-solid fa-magnifying-glass', color: '#11998e' },
            { text: 'Growth Mindset', icon: 'fa-solid fa-seedling', color: '#11998e' },
            { text: 'Solution Architect', icon: 'fa-solid fa-compass', color: '#ff9966' },
            { text: 'Curious Explorer', icon: 'fa-solid fa-binoculars', color: '#00f0ff' },
            { text: 'Self-Motivated', icon: 'fa-solid fa-fire', color: '#ff416c' },
            { text: 'Builder', icon: 'fa-solid fa-hammer', color: '#ff9966' },
            { text: 'Entrepreneurial Thinker', icon: 'fa-solid fa-lightbulb', color: '#00f0ff' }
        ];

        let activeTimer = null;
        let lastSelectedIndexes = []; // track recently used tags to prevent direct duplicates

        const spawnTag = (delay = 0, forcedDuration = null) => {
            if (document.hidden) return; // Tab in background

            // Select index ensuring it wasn't one of the last 15 spawned to maximize variety
            let randomIndex;
            let attempts = 0;
            do {
                randomIndex = Math.floor(Math.random() * tagsData.length);
                attempts++;
            } while (lastSelectedIndexes.includes(randomIndex) && attempts < 15);

            lastSelectedIndexes.push(randomIndex);
            if (lastSelectedIndexes.length > 15) {
                lastSelectedIndexes.shift();
            }

            const tag = tagsData[randomIndex];
            const tagEl = document.createElement('div');
            tagEl.className = 'insta-float-tag';

            // Randomize variables for the premium drift & float effect - narrower on mobile to prevent clipping
            const isMobile = window.innerWidth <= 600;
            const spawnX = isMobile ? (Math.random() * 40 + 30) : (Math.random() * 70 + 15); // 15% to 85% width (desktop) or 30% to 70% width (mobile)
            const scale = Math.random() * 0.3 + 0.8; // scale 0.8 to 1.1
            const duration = forcedDuration || (Math.random() * 3.5 + 4.5); // 4.5s to 8.0s

            const sway1 = `${Math.random() * 40 - 20}px`;
            const sway2 = `${Math.random() * 60 - 30}px`;
            const sway3 = `${Math.random() * 40 - 20}px`;

            const rot1 = `${Math.random() * 20 - 10}deg`;
            const rot2 = `${Math.random() * 30 - 15}deg`;
            const rot3 = `${Math.random() * 20 - 10}deg`;

            tagEl.style.setProperty('--spawn-x', `${spawnX}%`);
            tagEl.style.setProperty('--scale', scale);
            tagEl.style.setProperty('--float-duration', `${duration}s`);
            tagEl.style.setProperty('--float-delay', `${delay}s`);
            tagEl.style.setProperty('--sway-1', sway1);
            tagEl.style.setProperty('--sway-2', sway2);
            tagEl.style.setProperty('--sway-3', sway3);
            tagEl.style.setProperty('--rot-1', rot1);
            tagEl.style.setProperty('--rot-2', rot2);
            tagEl.style.setProperty('--rot-3', rot3);

            // Set dynamic aesthetic border and subtle box shadow based on the brand color
            tagEl.style.borderColor = `${tag.color}3a`;
            tagEl.style.boxShadow = `0 4px 15px rgba(0, 0, 0, 0.2), 0 0 12px ${tag.color}18, inset 0 0 6px ${tag.color}10`;

            tagEl.innerHTML = `<i class="${tag.icon}" style="color:${tag.color};margin-right:6px"></i>${tag.text}`;

            container.appendChild(tagEl);

            // Clean up DOM after animation completes
            tagEl.addEventListener('animationend', () => {
                tagEl.remove();
            });
        };

        // Spawning cycle with slight random delay variations
        const startSpawner = () => {
            if (activeTimer) return;

            const runCycle = () => {
                // Spawn 1 or 2 tags at a time to create a busier, organic look
                const batchSize = Math.random() > 0.6 ? 2 : 1;
                for (let b = 0; b < batchSize; b++) {
                    spawnTag(0);
                }
                // Random interval between 200ms and 500ms for a busier, cluttered stream
                const nextInterval = Math.random() * 300 + 200;
                activeTimer = setTimeout(runCycle, nextInterval);
            };
            runCycle();
        };

        const stopSpawner = () => {
            if (activeTimer) {
                clearTimeout(activeTimer);
                activeTimer = null;
            }
        };

        // Optimization: IntersectionObserver to run spawner ONLY when hero card is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startSpawner();
                } else {
                    stopSpawner();
                }
            });
        }, { threshold: 0.15 });

        observer.observe(container);

        // Pre-populate multiple tags immediately with negative delays to populate the screen instantly
        for (let i = 0; i < 15; i++) {
            const randomDuration = Math.random() * 3.5 + 4.5;
            const negativeDelay = -(Math.random() * randomDuration);
            spawnTag(negativeDelay, randomDuration);
        }
    };
    initFloatingTags();

    // ==========================================
    // MUMBAI LOCAL CLOCK
    // ==========================================
    const updateClock = () => {
        const clockEl = document.getElementById('mumbai-clock');
        if (!clockEl) return;

        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        // Mumbai is UTC + 5.5
        const mumbaiTime = new Date(utc + (3600000 * 5.5));

        let hours = mumbaiTime.getHours();
        let minutes = mumbaiTime.getMinutes();
        let seconds = mumbaiTime.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    };
    setInterval(updateClock, 1000);
    updateClock();

    // ==========================================
    // MOBILE HAMBURGER MENU & DRAWER
    // ==========================================
    const navHamburger = document.getElementById('nav-hamburger');
    const navRightDrawer = document.getElementById('nav-right-drawer');
    const navLinksList = document.querySelectorAll('.nav-links a');

    if (navHamburger && navRightDrawer) {
        navHamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navHamburger.classList.toggle('active');
            navRightDrawer.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu on link clicks
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                navHamburger.classList.remove('active');
                navRightDrawer.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navRightDrawer.contains(e.target) && !navHamburger.contains(e.target)) {
                navHamburger.classList.remove('active');
                navRightDrawer.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
});
