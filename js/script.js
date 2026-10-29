// Portfolio Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen once the page (including images) has loaded
    const loadingScreen = document.getElementById('loading');
    const hideLoader = () => {
        if (!loadingScreen || loadingScreen.classList.contains('hidden')) return;
        window.scrollTo(0, 0); // undo the browser's jump to a #section anchor on first load
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    };
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
        setTimeout(hideLoader, 3000); // fallback if an image is slow
    }

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection || !targetSection.classList.contains('content-section')) return false;

        navLinks.forEach(nav => nav.classList.toggle('active', nav.getAttribute('href') === '#' + targetId));
        contentSections.forEach(section => section.classList.toggle('active', section === targetSection));
        return true;
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            if (showSection(targetId)) {
                history.pushState(null, '', '#' + targetId);
                // On mobile the nav sits below the sidebar, so bring the content into view
                if (window.innerWidth <= 768) {
                    document.querySelector('.navigation').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Support direct links (e.g. /#projects) and the browser back/forward buttons
    // Sections are tabs, so stop the browser jumping down to the anchor
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const showSectionFromHash = () => {
        const id = location.hash.substring(1);
        if (!id || !showSection(id)) showSection('about');
        window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', showSectionFromHash);
    showSectionFromHash();

    // Chatbot responses
    const chatResponses = {
        skills: [
            "Snehal works across Python, Java, C#, SQL and NoSQL, with ML frameworks like Scikit-learn, PyTorch and LangChain, and GenAI tools including OpenAI GPT-4 and vector databases.",
            "On the data and cloud side, Snehal uses Azure (Data Factory, Functions, Blob), Databricks with PySpark, Power BI, Docker, Kubernetes and Azure DevOps CI/CD."
        ],
        experience: [
            "Snehal is a Data Science Intern at Farmers Group Inc (since May 2026), building Databricks streaming feature pipelines with Auto Loader, PySpark, CDF and SCD Type 2 that generate 30+ features for a cancellation prediction model.",
            "From 2022 to 2025 Snehal was a Software Configuration Specialist, Data & AI at Duck Creek Technologies, leading a GPT-4 NER solution that cut loss-run report visualization costs by 60% and automating renewal transactions to reduce underwriter effort by ~70%.",
            "Before Duck Creek, Snehal spent nearly 3 years at Accenture as a Senior Software Engineer, Data Insights: automating server monitoring (10 hours saved weekly), building an ML model for P&C submission ranking, and delivering Power BI KPI reporting."
        ],
        duckcreek: [
            "At Duck Creek Technologies (2022–2025), Snehal led a GPT-4 NER pipeline with Azure and OCR, wrote SQL batch scripts that prevented ~20 P3 incidents a week, and automated renewal transactions across lines of business, cutting underwriter manual effort by ~70%.",
            "Snehal holds the Duck Creek Billing, Policy and Insights certification and has worked on Duck Creek integrations at both Accenture and Duck Creek Technologies."
        ],
        ner: [
            "Snehal's GPT-4 NER project used prompt engineering, Azure Blob Storage, Azure Functions and OCR to extract entities from insurance loss-run reports, then fed the results into Power BI, cutting visualization costs by 60%."
        ],
        projects: [
            "Featured projects: a Multi-AI RAG Agent for insurance (GPT-4, Pinecone, LangChain, gte-base embeddings), an advanced stacked-regression model for house price prediction (XGBoost, GradientBoosting, CatBoost), and a Java + MySQL bank management system.",
            "The Multi-AI RAG Agent combines Pinecone retrieval, GPT-4 and Chain-of-Thought prompting to improve insurance document retrieval. There's a live demo and the code is on GitHub. Check the Projects tab!"
        ],
        education: [
            "Snehal is pursuing an M.S. in Business Analytics at The University of Texas at Arlington (May 2025 – Dec 2026) with a 4.0/4.0 GPA.",
            "Snehal earned a B.E. in Information Technology from the University of Mumbai (2015–2019) as a Gold Medalist, with a 3.9/4.0 GPA."
        ],
        achievements: [
            "Snehal is a Gold Medalist in B.E. Information Technology from the University of Mumbai, received Accenture's ACE Award (FY21 Q4), and co-authored the IEEE paper \"Mirroroid: Enhancing Lifestyle Using IoT\" (2019).",
            "Certifications include Duck Creek Billing, Policy & Insights, SAFe 5.0 Practitioner, Microsoft Technology Associate (HTML5), and IBM courses in Python for Data Science, NoSQL and SQL."
        ],
        contact: [
            "You can reach Snehal at snehaldhage23@gmail.com or (682) 297-9689. Snehal is open to data and AI roles, insurance tech and GenAI projects.",
            "Connect with Snehal on LinkedIn or GitHub using the icons in the sidebar, or send a message from the Contact tab."
        ],
        default: [
            "I can tell you about Snehal's skills, experience (Farmers, Duck Creek, Accenture), projects, education at UT Arlington, or achievements and certifications. What would you like to know?",
            "Snehal is a Business Analytics grad student with nearly 6 years of experience in data, AI and insurance technology. Try asking about the GPT-4 NER project, the RAG agent, or Duck Creek work!"
        ]
    };

    // Checked in order; the first category with a matching keyword wins
    const chatKeywords = [
        ['contact', /\b(contact|email|e-mail|phone|call|reach|hire|linkedin)\b/],
        ['ner', /\b(ner|named entity|loss[- ]run|ocr)\b/],
        ['duckcreek', /\bduck ?creek\b/],
        ['projects', /\b(projects?|rag|pinecone|demo|house|regression|bank|portfolio)\b/],
        ['education', /\b(education|degree|study|studies|university|uta|arlington|mumbai|gpa|masters?|college)\b/],
        ['achievements', /\b(achievements?|awards?|publications?|paper|ieee|research|certifi\w*|medal\w*|ace)\b/],
        ['experience', /\b(experience|work|job|career|intern\w*|farmers|accenture|company|role)\b/],
        ['skills', /\b(skills?|tech\w*|tools?|stack|python|java|sql|azure|gpt|llm|pytorch|langchain|power ?bi|databricks)\b/]
    ];

    function getBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const match = chatKeywords.find(([, pattern]) => pattern.test(lowerMessage));
        const responses = chatResponses[match ? match[0] : 'default'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    const chatMessages = document.querySelector('.chat-messages');

    function addBotMessage(content) {
        const wrapper = document.createElement('div');
        wrapper.className = 'bot-message';
        const icon = document.createElement('i');
        icon.className = 'fas fa-robot';
        const text = document.createElement('p');
        if (content instanceof Node) {
            text.appendChild(content);
        } else {
            text.textContent = content;
        }
        wrapper.append(icon, text);
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return wrapper;
    }

    if (chatInput && sendButton && chatMessages) {
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;
            chatInput.value = '';

            const userBubble = document.createElement('div');
            userBubble.className = 'user-message';
            userBubble.textContent = message;
            chatMessages.appendChild(userBubble);

            const dots = document.createElement('span');
            dots.className = 'typing-dots';
            dots.innerHTML = '<span></span><span></span><span></span>';
            const typing = addBotMessage(dots);

            setTimeout(() => {
                typing.remove();
                addBotMessage(getBotResponse(message));
            }, 700);
        };

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Contact form: no backend on GitHub Pages, so open the visitor's email app
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.elements.name.value.trim();
            const email = contactForm.elements.email.value.trim();
            const subject = contactForm.elements.subject.value.trim();
            const body = `${contactForm.elements.message.value.trim()}\n\n- ${name} (${email})`;
            window.location.href = `mailto:snehaldhage23@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }

    // Background spotlight follows the cursor
    const bgFx = document.querySelector('.bg-fx');
    if (bgFx && window.matchMedia('(hover: hover)').matches) {
        let frame = null;
        window.addEventListener('mousemove', (e) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                bgFx.style.setProperty('--mx', e.clientX + 'px');
                bgFx.style.setProperty('--my', e.clientY + 'px');
                frame = null;
            });
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
