// Portfolio Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const contentSections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Hide loading screen once the page has loaded (with a fallback in case an asset hangs)
    const loadingScreen = document.getElementById('loading');
    let loaderHidden = false;
    function hideLoader() {
        if (loaderHidden) return;
        loaderHidden = true;
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        animateSection(document.querySelector('.content-section.active'));
    }
    window.addEventListener('load', () => setTimeout(hideLoader, 300));
    setTimeout(hideLoader, 3000);

    // Background: drifting particle network that reacts to the cursor
    const canvas = document.getElementById('bgCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const mouse = { x: null, y: null };
        const linkDistance = 130;
        const mouseDistance = 180;
        let particles = [];
        let width = 0;
        let height = 0;

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const widthChanged = window.innerWidth !== width;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Only respawn when the width changes, so mobile address-bar resizes don't reshuffle the dots
            if (widthChanged) {
                const count = Math.min(80, Math.floor((width * height) / 18000));
                particles = Array.from({ length: count }, () => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 0.5
                }));
            }
            if (prefersReducedMotion) drawParticles();
        }

        function drawLine(a, b, alpha) {
            ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p, i) => {
                if (!prefersReducedMotion) {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 215, 0, 0.55)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const distance = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
                    if (distance < linkDistance) drawLine(p, particles[j], 0.12 * (1 - distance / linkDistance));
                }

                if (mouse.x !== null) {
                    const distance = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (distance < mouseDistance) drawLine(p, mouse, 0.35 * (1 - distance / mouseDistance));
                }
            });
        }

        function loop() {
            if (!document.hidden) drawParticles();
            requestAnimationFrame(loop);
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        document.addEventListener('mouseleave', () => {
            mouse.x = null;
        });

        resizeCanvas();
        if (!prefersReducedMotion) loop();
    }

    // Toast notifications
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    let toastTimer;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Count-up animation for stat numbers
    function animateCounter(el) {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        if (prefersReducedMotion) {
            el.textContent = target.toFixed(decimals) + suffix;
            return;
        }
        const duration = 1200;
        const start = performance.now();
        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = (target * eased).toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    // Staggered entrance for cards inside a section
    function animateSection(section) {
        if (!section) return;
        section.querySelectorAll('.timeline-item, .project-card, .stat-card').forEach((el, i) => {
            el.classList.remove('reveal');
            void el.offsetWidth; // restart the animation
            el.style.animationDelay = `${i * 90}ms`;
            el.classList.add('reveal');
        });
        section.querySelectorAll('.stat-number').forEach(animateCounter);
    }

    // Navigation: any in-page link to a section switches tabs, and the URL hash is kept in sync
    function showSection(id, updateHistory = true) {
        const target = document.getElementById(id);
        if (!target || !target.classList.contains('content-section')) return false;

        contentSections.forEach(section => section.classList.remove('active'));
        target.classList.add('active');
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));

        if (updateHistory) history.pushState(null, '', '#' + id);

        const main = document.querySelector('.main-content');
        const mainTop = main.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY > mainTop) {
            window.scrollTo({ top: mainTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }

        animateSection(target);
        return true;
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        if (showSection(link.getAttribute('href').substring(1))) e.preventDefault();
    });

    window.addEventListener('popstate', () => {
        showSection(location.hash.substring(1) || 'about', false);
    });

    if (location.hash) showSection(location.hash.substring(1), false);

    // Typing effect for the sidebar title
    const typed = document.querySelector('.typed-text');
    if (typed && !prefersReducedMotion) {
        const words = JSON.parse(typed.dataset.words);
        let wordIndex = 0;
        let charIndex = words[0].length;
        let deleting = true;

        function tick() {
            charIndex += deleting ? -1 : 1;
            typed.textContent = words[wordIndex].slice(0, charIndex);

            let delay = deleting ? 40 : 80;
            if (!deleting && charIndex === words[wordIndex].length) {
                deleting = true;
                delay = 2200;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                delay = 300;
            }
            setTimeout(tick, delay);
        }
        setTimeout(tick, 2500);
    }

    // Copy email to clipboard
    document.querySelectorAll('[data-copy]').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.copy);
                showToast('Email copied to clipboard');
            } catch {
                showToast(button.dataset.copy);
            }
        });
    });

    // Skill filters
    const skillFilters = document.querySelectorAll('.skill-filter');
    const skillChips = document.querySelectorAll('.skill-chip');
    skillFilters.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.filter;
            skillFilters.forEach(b => b.classList.toggle('active', b === button));
            skillChips.forEach(chip => {
                chip.classList.toggle('dimmed', category !== 'all' && chip.dataset.cat !== category);
            });
        });
    });

    // Project cards: subtle tilt and spotlight that follows the cursor
    if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                card.style.setProperty('--mx', `${x * 100}%`);
                card.style.setProperty('--my', `${y * 100}%`);
                card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-8px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Contact form opens the visitor's email app with the message filled in
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(contactForm);
            const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
            window.location.href = `mailto:sxd8483@mavs.uta.edu?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;
            showToast('Opening your email app…');
            contactForm.reset();
        });
    }

    // SnehalBot knowledge base. More specific topics come first so they win ties.
    const knowledge = [
        {
            keywords: ['rag', 'retrieval', 'pinecone', 'langchain', 'agent', 'genai', 'generative', 'llm'],
            answer: "The <strong>Multi-AI RAG Agent</strong> for insurance uses gte-base-en-v1.5 embeddings, Pinecone, GPT-4, Chain-of-Thought prompting and LangChain to improve insurance document retrieval and insight generation. There's a live demo and the code is on GitHub.",
            link: { section: 'projects', label: 'View projects' }
        },
        {
            keywords: ['house', 'price', 'regression', 'kaggle', 'xgboost', 'catboost'],
            answer: "The <strong>House Price Prediction</strong> project is an end-to-end pipeline with preprocessing, EDA, feature engineering and <strong>stacked regression</strong> (XGBoost, GradientBoosting, CatBoost).",
            link: { section: 'projects', label: 'View projects' }
        },
        {
            keywords: ['bank', 'mysql', 'swing', 'desktop'],
            answer: "The <strong>Bank Management System</strong> is a desktop app in Core Java (Swing & AWT) with MySQL: account creation, deposits, withdrawals, mini-statements and PIN management.",
            link: { section: 'projects', label: 'View projects' }
        },
        {
            keywords: ['farmers', 'intern', 'current', 'now', 'databricks', 'feature store', 'streaming', 'rocksdb', 'cancellation'],
            answer: "Snehal is currently a <strong>Data Science Intern at Farmers Group Inc</strong> (May 2026 – present): a Databricks streaming feature pipeline (Auto Loader, PySpark, CDF, SCD Type 2) producing <strong>30+ features</strong>, an Online Feature Store with <strong>130ms lookups</strong> for a cancellation prediction model, and RocksDB state management that cut batch time by <strong>3 hours per run</strong>.",
            link: { section: 'experience', label: 'See experience' }
        },
        {
            keywords: ['duck creek', 'duckcreek', 'ner', 'gpt', 'ocr', 'loss run', 'renewal', 'insurance', 'crm'],
            answer: "At <strong>Duck Creek Technologies</strong> (2022 – 2025), Snehal led a <strong>GPT-4 NER pipeline</strong> (prompt engineering, Azure Blob, Azure Functions, OCR) feeding Power BI, cutting loss-run report visualization costs by <strong>60%</strong>. Snehal also automated renewals across LOBs (~<strong>70%</strong> less underwriter effort) and wrote SQL batch scripts that prevented ~<strong>20 P3 incidents a week</strong>.",
            link: { section: 'experience', label: 'See experience' }
        },
        {
            keywords: ['accenture', 'monitoring', 'submission', 'rest api', 'api'],
            answer: "At <strong>Accenture</strong> (2019 – 2022), Snehal automated server monitoring with Python + SQL (<strong>10 hours saved weekly</strong>), built an ML model for P&C submission ranking, delivered Power BI KPI reporting for five departments (<strong>40%</strong> fewer errors), and built Java REST APIs to validate insurance data files. That work earned an <strong>ACE Award</strong> (FY21 Q4).",
            link: { section: 'experience', label: 'See experience' }
        },
        {
            keywords: ['experience', 'work', 'job', 'career', 'role', 'compan', 'years', 'background'],
            answer: "Snehal has <strong>5 years</strong> of industry experience: <strong>Farmers Group</strong> (Data Science Intern, 2026 – now), <strong>Duck Creek Technologies</strong> (Data & AI, 2022 – 2025) and <strong>Accenture</strong> (Senior Software Engineer, Data Insights, 2019 – 2022). Ask about any of them for details.",
            link: { section: 'experience', label: 'See experience' }
        },
        {
            keywords: ['project', 'built', 'github', 'demo', 'portfolio'],
            answer: "Featured projects: a <strong>Multi-AI RAG Agent</strong> for insurance (GPT-4, Pinecone, LangChain, with a live demo), <strong>stacked regression</strong> for house price prediction, and a <strong>Bank Management System</strong> in Java + MySQL.",
            link: { section: 'projects', label: 'View projects' }
        },
        {
            keywords: ['skill', 'stack', 'tech', 'tool', 'python', 'sql', 'azure', 'power bi', 'pytorch', 'java', 'language', 'know'],
            answer: "Core toolkit: <strong>Python, SQL and Java</strong>; PyTorch, Scikit-learn, LangChain and OpenAI for ML & GenAI; <strong>Databricks / PySpark</strong>, Azure Data Factory and Azure Functions for data engineering; <strong>Power BI</strong> for reporting; plus Docker, Kubernetes, CI/CD and vector databases.",
            link: { section: 'about', label: 'Explore the toolkit' }
        },
        {
            keywords: ['education', 'degree', 'university', 'uta', 'arlington', 'gpa', 'master', 'stud', 'school', 'college', 'mumbai', 'graduat'],
            answer: "Snehal is pursuing an <strong>M.S. in Business Analytics at UT Arlington</strong> (May 2025 – Dec 2026) with a <strong>4.0 GPA</strong>, and earned a <strong>B.E. in Information Technology</strong> from the University of Mumbai as a <strong>Gold Medalist</strong>.",
            link: { section: 'education', label: 'See education' }
        },
        {
            keywords: ['certif', 'safe', 'microsoft', 'ibm', 'credential'],
            answer: "Certifications: <strong>Duck Creek</strong> Billing, Policy & Insights; <strong>SAFe 5.0</strong> Practitioner; <strong>Microsoft</strong> Technology Associate (HTML5 Application Development); and <strong>IBM</strong> courses in Python for Data Science, NoSQL & DBaaS, and SQL & Relational Databases.",
            link: { section: 'certification', label: 'See certifications' }
        },
        {
            keywords: ['achiev', 'award', 'publication', 'paper', 'ieee', 'research', 'gold', 'medal', 'ace'],
            answer: "Highlights: <strong>Gold Medalist</strong> in B.E. Information Technology, the <strong>ACE Award</strong> at Accenture (FY21 Q4), and the IEEE paper <em>“Mirroroid: Enhancing Lifestyle Using IoT”</em> (2019).",
            link: { section: 'resume', label: 'See achievements' }
        },
        {
            keywords: ['contact', 'email', 'phone', 'reach', 'hire', 'hiring', 'connect', 'linkedin', 'call', 'available', 'opportunit', 'open to'],
            answer: "Snehal is open to data & AI roles, insurance tech and GenAI projects. Email <a href=\"mailto:sxd8483@mavs.uta.edu\">sxd8483@mavs.uta.edu</a>, call (682) 297-9689, or connect on <a href=\"https://www.linkedin.com/in/snehal-dhage-78820614b\" target=\"_blank\" rel=\"noopener\">LinkedIn</a>.",
            link: { section: 'contact', label: 'Send a message' }
        },
        {
            keywords: [/^(hi|hey|hello|hiya|yo)\b/, 'good morning', 'good afternoon', 'good evening'],
            answer: "Hi there! I'm SnehalBot. Ask me about Snehal's current internship at Farmers, the GPT-4 NER work at Duck Creek, projects, skills, education, or how to get in touch."
        }
    ];

    const fallbackAnswer = "I'm not sure about that one. Try asking about Snehal's <strong>current internship</strong>, <strong>GenAI projects</strong>, <strong>skills</strong>, <strong>education</strong> or <strong>how to get in touch</strong>.";

    const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    knowledge.forEach(entry => {
        entry.patterns = entry.keywords.map(k => k instanceof RegExp ? k : new RegExp('\\b' + escapeRegExp(k), 'i'));
    });

    function getBotResponse(userMessage) {
        const message = userMessage.trim().toLowerCase();
        let best = null;
        let bestScore = 0;
        knowledge.forEach(entry => {
            const score = entry.patterns.filter(pattern => pattern.test(message)).length;
            if (score > bestScore) {
                best = entry;
                bestScore = score;
            }
        });
        return best || { answer: fallbackAnswer };
    }

    // Chat UI
    const chatWindow = document.getElementById('chatWindow');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');

    function addMessage(sender, content, link) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (sender === 'user') {
            bubble.textContent = content; // never render visitor input as HTML
        } else {
            bubble.innerHTML = content;
            if (link) {
                const a = document.createElement('a');
                a.href = '#' + link.section;
                a.className = 'chat-link';
                a.innerHTML = `${link.label} <i class="fas fa-arrow-right"></i>`;
                bubble.appendChild(document.createElement('br'));
                bubble.appendChild(a);
            }
        }

        msg.append(avatar, bubble);
        chatWindow.appendChild(msg);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return msg;
    }

    let botBusy = false;
    function sendMessage(text) {
        const message = (text ?? chatInput.value).trim();
        if (!message || botBusy) return;
        botBusy = true;
        chatInput.value = '';
        addMessage('user', message);

        const typing = addMessage('bot', '<span class="typing-dots"><span></span><span></span><span></span></span>');
        setTimeout(() => {
            typing.remove();
            const response = getBotResponse(message);
            addMessage('bot', response.answer, response.link);
            botBusy = false;
        }, 700 + Math.random() * 500);
    }

    if (chatWindow && chatInput && sendButton) {
        sendButton.addEventListener('click', () => sendMessage());
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => sendMessage(chip.textContent));
        });
    }

    // Profile image click effect
    const profileImage = document.querySelector('.profile-image img');
    if (profileImage) {
        let clickCount = 0;
        profileImage.addEventListener('click', () => {
            clickCount++;
            profileImage.style.transform = `rotate(${clickCount * 90}deg) scale(1.05)`;

            if (clickCount >= 4) {
                clickCount = 0;
                setTimeout(() => {
                    profileImage.style.transform = 'rotate(0deg) scale(1)';
                }, 200);
            }
        });
    }
});
