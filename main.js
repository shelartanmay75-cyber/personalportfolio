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
    const introOverlay  = document.getElementById('intro-overlay');
    const typedCmd      = document.getElementById('typed-cmd');
    const termCursor    = document.getElementById('term-cursor');
    const termOutput    = document.getElementById('terminal-output');
    const scrollHint    = document.getElementById('intro-scroll-hint');

    const CMD_TEXT      = 'createFuture();';
    let cmdTyped        = false;
    let scrollReady     = false;
    let introActive     = true;

    // --- Particle canvas inside overlay ---
    const canvas = document.getElementById('intro-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        const resizeCanvas = () => {
            canvas.width  = window.innerWidth;
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
                if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
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
                // Show scroll hint after a short pause
                setTimeout(() => {
                    if (scrollHint) scrollHint.classList.add('hint-visible');
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

        // Remove scroll hint
        if (scrollHint) scrollHint.classList.remove('hint-visible');

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

    window.addEventListener('wheel',      onScrollAttempt, { passive: false });
    window.addEventListener('touchmove',  onScrollAttempt, { passive: false });
    window.addEventListener('keydown', (e) => {
        if (['ArrowDown','PageDown','Space',' '].includes(e.key)) onScrollAttempt(e);
    });

    // ==========================================
    // SECTION TERMINAL REVEAL SYSTEM
    // ==========================================
    const sectionRevealData = [
        {
            headerId:  'about-terminal-header',
            textId:    'about-sth-text',
            checkId:   'about-sth-check',
            sectionId: 'about',
            message:   'Generating About Section...',
        },
        {
            headerId:  'skills-terminal-header',
            textId:    'skills-sth-text',
            checkId:   'skills-sth-check',
            sectionId: 'skills',
            message:   'Generating Skills...',
        },
        {
            headerId:  'projects-terminal-header',
            textId:    'projects-sth-text',
            checkId:   'projects-sth-check',
            sectionId: 'projects',
            message:   'Generating Projects...',
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
        const header  = document.getElementById(data.headerId);
        const textEl  = document.getElementById(data.textId);
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
    const FINAL_TEXT   = 'Built from curiosity.\nPowered by code.';

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
            star.style.width  = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top    = `${Math.random() * 100}%`;
            star.style.left   = `${Math.random() * 100}%`;
            star.style.setProperty('--twinkle-duration', `${Math.random() * 4 + 2}s`);
            star.style.setProperty('--base-opacity', Math.random() * 0.5 + 0.2);
            starfield.appendChild(star);
        }
    }

    // ==========================================
    // SKILLS GALAXY INTERACTIONS
    // ==========================================
    const planets   = document.querySelectorAll('.skill-planet');
    const infoPanel = document.getElementById('galaxy-info-panel');
    const closeBtn  = document.getElementById('panel-close-btn');
    const orbits    = document.querySelectorAll('.orbit-path');

    const skillUniverseData = {
        'java': {
            name: 'Java',
            icon: 'fa-brands fa-java',
            color: '#f89820',
            experience: '2+ years of learning and building robust applications.',
            projects: ['Restaurant Ordering Website','Command Line RPG Games','Library Management System'],
            tech: ['OOP Principles','Collections Framework','File Handling','Exception Handling','Multithreading']
        },
        'python': {
            name: 'Python',
            icon: 'fa-brands fa-python',
            color: '#3776ab',
            experience: '2+ years of scripting, automation, and data handling.',
            projects: ['Automated Web Scrapers','Data Visualization Dashboard','System Scripting Utilities'],
            tech: ['Automation & Scripting','Data Analysis (Pandas/NumPy)','APIs & Web Scraping','File Parsing']
        },
        'cpp': {
            name: 'C++',
            icon: 'fa-solid fa-code',
            color: '#00599c',
            experience: '1.5+ years of algorithmic problem solving.',
            projects: ['Arduino Automation Projects','DSA Library','Graphics Utilities'],
            tech: ['OOP Design','STL','Memory Management','Pointers & References']
        },
        'htmlcss': {
            name: 'HTML & CSS',
            icon: 'fa-brands fa-html5',
            color: '#e34f26',
            experience: '3+ years crafting fully responsive, animation-heavy interfaces.',
            projects: ['Interactive Portfolio','Restaurant Ordering UI','Hackathon Landing Pages'],
            tech: ['Responsive Web Design','Flexbox / Grid','Keyframe Animations','Glassmorphism']
        },
        'javascript': {
            name: 'JavaScript',
            icon: 'fa-brands fa-js',
            color: '#f7df1e',
            experience: '2+ years of frontend application state and DOM orchestration.',
            projects: ['Dynamic Portfolio','Interactive Game Engines','Restaurant Cart Logic'],
            tech: ['ES6+ Syntax','DOM Manipulation','Async Programming','JSON & LocalStorage']
        },
        'git': {
            name: 'Git & GitHub',
            icon: 'fa-brands fa-git-alt',
            color: '#f05032',
            experience: '2+ years of team collaboration and version control.',
            projects: ['Hackathon Collaborative Repos','Open Source Contributions','Portfolio Deployment'],
            tech: ['Branching & Merging','Conflict Resolution','Pull Requests','GitHub Pages']
        }
    };

    planets.forEach(planet => {
        planet.addEventListener('click', (e) => {
            e.stopPropagation();
            const skillId = planet.getAttribute('data-skill');
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

            planets.forEach(p => { p.classList.remove('active-planet'); p.classList.add('orbit-paused'); });
            planet.classList.add('active-planet');
            planet.classList.remove('orbit-paused');

            orbits.forEach(o => o.classList.remove('orbit-glow-active'));
            const parentOrbit = planet.closest('.orbit-path');
            if (parentOrbit) parentOrbit.classList.add('orbit-glow-active');

            infoPanel.classList.add('panel-open');
        });
    });

    const closePanel = () => {
        if (infoPanel) infoPanel.classList.remove('panel-open');
        planets.forEach(p => { p.classList.remove('active-planet'); p.classList.remove('orbit-paused'); });
        orbits.forEach(o => o.classList.remove('orbit-glow-active'));
    };

    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePanel(); });

    document.addEventListener('click', (e) => {
        if (infoPanel && infoPanel.classList.contains('panel-open')) {
            if (!infoPanel.contains(e.target) && !Array.from(planets).some(p => p.contains(e.target))) {
                closePanel();
            }
        }
    });

    // ==========================================
    // PROJECTS CAROUSEL BEHAVIOR
    // ==========================================
    const carousel = document.getElementById('projects-carousel');
    const prevBtn  = document.getElementById('project-prev-btn');
    const nextBtn  = document.getElementById('project-next-btn');

    if (carousel) {
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const w = carousel.querySelector('.project-carousel-card').offsetWidth;
                carousel.scrollBy({ left: -(w + 32), behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                const w = carousel.querySelector('.project-carousel-card').offsetWidth;
                carousel.scrollBy({ left: w + 32, behavior: 'smooth' });
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

    // Viewport fade-in for project cards
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
        projectCards.forEach(c => cardObs.observe(c));
    }

    // ==========================================
    // JOURNEY SECTION: Map Interactions & Boat
    // ==========================================
    const journeyDetails = document.getElementById('journey-details');
    const journeyTitle   = document.getElementById('journey-title');
    const islands        = document.querySelectorAll('.island:not(.locked)');
    const viewExpBtn     = document.getElementById('view-experiences-btn');
    const hackathonsList = document.getElementById('hackathons-list');

    const journeyData = {
        'island-10th':    { title: 'Completed School',  text: 'My best 10 years — school ranker with 3rd place, 95% in SSC boards.' },
        'island-12th':    { title: 'Completed 12th',    text: 'Cracked JEE & CET — 94.11 percentile in CET, 80.5% in 12th boards HSC.' },
        'island-college': { title: 'Pursuing B.Tech',   text: 'Pursuing AI & Data Science at VESIT. Grabbing every opportunity that helps me grow.' },
    };

    islands.forEach(island => {
        island.addEventListener('click', () => {
            const id   = island.id;
            const data = journeyData[id];
            if (data) {
                journeyTitle.innerHTML  = data.title;
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

});
