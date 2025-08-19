
        /* =====================================================
           Animated Lines Background (Canvas "constellation")
           - Pure JS, mouse‑reactive, performant with DPR scaling
           - Lines connect nearby particles; mouse repels/attracts
        ===================================================== */
        (() => {
            const canvas = document.getElementById('bg-canvas');
            const ctx = canvas.getContext('2d');
            let width, height, dpr, particles, mouse, rafId;

            const CONFIG = {
                COUNT_BASE: 110,           // particle count baseline
                SPEED: 0.3,                // base velocity
                LINK_DIST: 120,            // max distance for line linking
                MOUSE_RADIUS: 140,         // mouse influence radius
                MOUSE_STRENGTH: 0.08,      // mouse repulsion strength
                LINE_ALPHA: 0.28,          // line opacity
            };

            function resize() {
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                width = canvas.clientWidth = window.innerWidth;
                height = canvas.clientHeight = window.innerHeight;
                canvas.width = Math.floor(width * dpr);
                canvas.height = Math.floor(height * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                initParticles();
            }

            function initParticles() {
                const count = Math.floor(CONFIG.COUNT_BASE * (width * height) / (1280 * 720));
                particles = new Array(Math.max(60, Math.min(220, count))).fill(0).map(() => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * CONFIG.SPEED,
                    vy: (Math.random() - 0.5) * CONFIG.SPEED,
                    size: Math.random() * 1.2 + 0.3
                }));
            }

            mouse = { x: width / 2, y: height / 2, inside: false };
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX; mouse.y = e.clientY; mouse.inside = true;
            });
            window.addEventListener('mouseleave', () => { mouse.inside = false; });
            window.addEventListener('touchmove', (e) => {
                const t = e.touches[0]; if (!t) return; mouse.x = t.clientX; mouse.y = t.clientY; mouse.inside = true;
            }, { passive: true });

            function step() {
                ctx.clearRect(0, 0, width, height);

                // Update + draw particles
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];

                    // Mouse interaction (repel)
                    if (mouse.inside) {
                        const dx = p.x - mouse.x;
                        const dy = p.y - mouse.y;
                        const dist2 = dx * dx + dy * dy;
                        const r2 = CONFIG.MOUSE_RADIUS * CONFIG.MOUSE_RADIUS;
                        if (dist2 < r2) {
                            const force = (1 - dist2 / r2) * CONFIG.MOUSE_STRENGTH;
                            p.vx += (dx / Math.sqrt(dist2 + 0.001)) * force;
                            p.vy += (dy / Math.sqrt(dist2 + 0.001)) * force;
                        }
                    }

                    p.x += p.vx; p.y += p.vy;
                    // Wrap around edges for continuous motion
                    if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
                    if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;

                    // draw point
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(148,163,184,0.65)';
                    ctx.fill();
                }

                // Draw linking lines between close particles
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const p1 = particles[i], p2 = particles[j];
                        const dx = p1.x - p2.x, dy = p1.y - p2.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist < CONFIG.LINK_DIST) {
                            const a = (1 - dist / CONFIG.LINK_DIST) * CONFIG.LINE_ALPHA;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `rgba(96,165,250,${a})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }

                rafId = requestAnimationFrame(step);
            }

            resize();
            window.addEventListener('resize', resize);
            cancelAnimationFrame(rafId); rafId = requestAnimationFrame(step);
        })();

        /* =====================================================
           Lightweight 3D Tilt for elements with .tilt
           - Uses transform based on cursor position within element
           - Adds a glow hotspot via CSS custom props
        ===================================================== */
        (() => {
            const tiltEls = Array.from(document.querySelectorAll('.tilt, [data-tilt]'));
            const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

            tiltEls.forEach((el) => {
                const state = { rect: null };

                function onEnter() { state.rect = el.getBoundingClientRect(); }
                function onMove(e) {
                    if (!state.rect) state.rect = el.getBoundingClientRect();
                    const isTouch = e.type.startsWith('touch');
                    const p = isTouch ? e.touches[0] : e;
                    const x = p.clientX - state.rect.left;
                    const y = p.clientY - state.rect.top;
                    const rx = clamp(((y / state.rect.height) - 0.5) * -14, -14, 14);
                    const ry = clamp(((x / state.rect.width) - 0.5) * 14, -14, 14);
                    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
                    el.style.setProperty('--mx', `${(x / state.rect.width) * 100}%`);
                    el.style.setProperty('--my', `${(y / state.rect.height) * 100}%`);
                }
                function onLeave() {
                    el.style.transform = 'rotateX(0) rotateY(0)';
                }

                el.addEventListener('mouseenter', onEnter);
                el.addEventListener('mousemove', onMove);
                el.addEventListener('mouseleave', onLeave);
                el.addEventListener('touchstart', onEnter, { passive: true });
                el.addEventListener('touchmove', onMove, { passive: true });
                el.addEventListener('touchend', onLeave);
            });
        })();

        // Year in footer
        document.getElementById('year').textContent = new Date().getFullYear();
        const typed = new Typed('.multiple-text', {
            strings: ['Frontend Developer', 'Backend Developer', 'Freelancer', 'Graphic Designer', 'Blogger'],
            typeSpeed: 100,
            backSpeed: 100,
            backDelay: 1000,
            loop: true
        });

        // Hamburger toggle
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("nav-links");

        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });

        // Highlight active nav link on scroll
        const sections = document.querySelectorAll("section");
        const navItems = document.querySelectorAll(".nav-links a");

        window.addEventListener("scroll", () => {
            let current = "";

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 80;
                if (pageYOffset >= sectionTop) {
                    current = section.getAttribute("id");
                }
            });

            navItems.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${current}`) {
                    link.classList.add("active");
                }
            });
        });
        // Section fade-in animation on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.15 }
        );

        document.querySelectorAll("section").forEach(section => {
            observer.observe(section);
        });



    