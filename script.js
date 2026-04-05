// ================= INTERACTIVE DOT GRID BACKGROUND =================
const canvas = document.getElementById('interactive-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

// Mouse interaction variables
let mouse = {
    x: null,
    y: null,
    radius: 120 // How far the mouse pushes the dots
};

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Reset mouse position when it leaves the screen
window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x; // Original starting position
        this.baseY = y;
        this.size = 1.5; // Size of the dots
        this.density = (Math.random() * 30) + 1; // Controls how fast they spring back
    }

    draw() {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)'; // Subtle blueish-grey for the dots
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Calculate distance between mouse and particle
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        
        // Calculate the force (closer mouse = stronger push)
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            // Push the particle away
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Spring back to original position smoothly
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10; 
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function init() {
    particlesArray = [];
    // Spacing between the dots - set to 18 for a denser, high-tech grid
    let spacing = 18; 
    
    // Create a grid of particles
    for (let y = 0; y < canvas.height; y += spacing) {
        for (let x = 0; x < canvas.width; x += spacing) {
            particlesArray.push(new Particle(x, y));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
    }
    requestAnimationFrame(animate);
}

// Handle window resizing
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Start the animation
init();
animate();

// ================= SMOOTH SCROLLING FOR NAVIGATION =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ================= SCROLL REVEAL ANIMATION OBSERVER =================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Triggers when 15% of the element is visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animates in when you scroll to it
            entry.target.classList.add('active');
        } else {
            // Resets the animation when you scroll away so it loops!
            entry.target.classList.remove('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// ================= MOBILE HAMBURGER MENU =================
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
        
if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
        const icon = menuBtn.querySelector('i');
        if(navLinks.classList.contains('nav-open')) {
            icon.classList.replace('ph-list', 'ph-x'); // Changes to an 'X'
        } else {
            icon.classList.replace('ph-x', 'ph-list'); // Changes back to menu icon
        }
    });

    // Close menu automatically when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-open');
            if(menuBtn.querySelector('i')) {
                menuBtn.querySelector('i').classList.replace('ph-x', 'ph-list');
            }
        });
    });
}

// ================= THREE.JS: BIM DATA CORE =================
function init3DHero() {
    const container = document.getElementById('hero-3d-canvas');
    if (!container) return;

    // Setup Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Group to hold the entire BIM structure
    const bimCore = new THREE.Group();
    scene.add(bimCore);

    // 1. Central "Revit Server/Core" (Solid Inner Cube + Wireframe Outer Cube)
    const coreGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const coreMatSolid = new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.2 });
    const coreMatWire = new THREE.MeshBasicMaterial({ color: 0x9d4edd, wireframe: true });
    
    const coreSolid = new THREE.Mesh(coreGeo, coreMatSolid);
    const coreWire = new THREE.Mesh(coreGeo, coreMatWire);
    
    bimCore.add(coreSolid);
    bimCore.add(coreWire);

    // 2. Orbiting "Parameter/Family" Nodes
    const nodeCount = 6;
    const radius = 3.5;
    const nodeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x4ea8de, wireframe: true });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4ea8de, transparent: true, opacity: 0.4 });

    for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        
        // Position nodes in a structural ring
        const angle = (i / nodeCount) * Math.PI * 2;
        node.position.x = Math.cos(angle) * radius;
        node.position.z = Math.sin(angle) * radius;
        node.position.y = (Math.random() - 0.5) * 2; // Slight vertical offset
        
        bimCore.add(node);

        // Draw structural connection lines from Center Core to Nodes
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0)); // Center
        points.push(node.position); // Node
        
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        bimCore.add(line);
    }

    camera.position.z = 6;

    let mouseX = 0;
    let mouseY = 0;
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouseY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
    });

    // Slow, Cinematic Animation Loop
    function animate3D() {
        requestAnimationFrame(animate3D);
        
        // Slow structural rotation
        bimCore.rotation.y += 0.002;
        bimCore.rotation.x += 0.001;
        
        // Very subtle parallax tilt based on mouse
        bimCore.rotation.x += (mouseY * 0.2 - bimCore.rotation.x) * 0.05;
        bimCore.rotation.y += (mouseX * 0.2 - bimCore.rotation.y) * 0.05;

        renderer.render(scene, camera);
    }
    animate3D();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
window.addEventListener('DOMContentLoaded', init3DHero);

// ================= 3D PARALLAX TILT LOGIC =================
// Select all the new elements we want to tilt
const tiltElements = document.querySelectorAll('.bento-card, .pricing-card, .portrait-image, .contact-form-container, .hero-title');

tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        // Disable 3D tilt on mobile phones
        if (window.innerWidth < 900) return; 

        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt angles (Slightly softer at 6 degrees for larger elements)
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        
        // Apply the 3D transform
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.boxShadow = `${-rotateY}px ${rotateX}px 30px rgba(78, 168, 222, 0.15)`;
        
        el.classList.remove('tilt-reset');
    });

    el.addEventListener('mouseleave', () => {
        if (window.innerWidth < 900) return;
        
        // Snap back to flat
        el.style.transform = '';
        el.style.boxShadow = '';
        el.classList.add('tilt-reset');
        
        // Remove reset class after animation
        setTimeout(() => el.classList.remove('tilt-reset'), 500);
    });
});


// ================= LIVE API SIMULATOR LOGIC =================
const demoContainer = document.getElementById('demo-3d-canvas');
let demoScene, demoCamera, demoRenderer, demoElements = [];

if (demoContainer) {
    // Initialize 3D Scene
    demoScene = new THREE.Scene();
    demoCamera = new THREE.PerspectiveCamera(50, demoContainer.clientWidth / demoContainer.clientHeight, 0.1, 1000);
    demoRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    demoRenderer.setSize(demoContainer.clientWidth, demoContainer.clientHeight);
    demoContainer.appendChild(demoRenderer.domElement);
    
    // Add a grid helper to look like Revit
    const gridHelper = new THREE.GridHelper(10, 20, 0x4ea8de, 0x222222);
    gridHelper.position.y = -1.5;
    demoScene.add(gridHelper);

    demoCamera.position.set(4, 2, 5);
    demoCamera.lookAt(0, 0, 0);

    function animateDemo() {
        requestAnimationFrame(animateDemo);
        demoElements.forEach(el => el.rotation.y += 0.01); // Slowly spin the generated elements
        demoRenderer.render(demoScene, demoCamera);
    }
    animateDemo();

    window.addEventListener('resize', () => {
        if(demoContainer.clientWidth > 0) {
            demoCamera.aspect = demoContainer.clientWidth / demoContainer.clientHeight;
            demoCamera.updateProjectionMatrix();
            demoRenderer.setSize(demoContainer.clientWidth, demoContainer.clientHeight);
        }
    });
}

// Function triggered by the HTML buttons
function runDemo(type) {
    const terminal = document.getElementById('terminal-output');
    
    if (type === 'clear') {
        terminal.innerHTML = '<p class="text-muted">// Canvas cleared. Ready.</p>';
        demoElements.forEach(el => demoScene.remove(el));
        demoElements = [];
        return;
    }

    // Determine Code and Geometry based on button clicked
    let codeStr = "";
    let geometry, material, mesh;

    if (type === 'beam') {
        codeStr = `<p><span class="code-keyword">string</span> type = <span class="code-string">"9x12_CONC_BEAM"</span>;</p>
                   <p><span class="code-keyword">FamilySymbol</span> symbol = Doc.<span class="code-method">GetSymbol</span>(type);</p>
                   <p>Doc.Create.<span class="code-method">NewFamilyInstance</span>(curve, symbol, level, StructuralType.Beam);</p>
                   <p class="text-orange">// Execution Success: Beam Generated</p>`;
                   
        geometry = new THREE.BoxGeometry(3, 0.5, 0.5);
        material = new THREE.MeshBasicMaterial({ color: 0xfb8500, wireframe: true });
    } else if (type === 'column') {
        codeStr = `<p><span class="code-keyword">XYZ</span> location = <span class="code-keyword">new</span> XYZ(0, 0, 0);</p>
                   <p><span class="code-keyword">FamilySymbol</span> colType = Doc.<span class="code-method">GetSymbol</span>(<span class="code-string">"CONC_COL"</span>);</p>
                   <p>Doc.Create.<span class="code-method">NewFamilyInstance</span>(location, colType, level, StructuralType.Column);</p>
                   <p class="text-orange">// Execution Success: Column Placed</p>`;
                   
        geometry = new THREE.BoxGeometry(0.8, 3, 0.8);
        material = new THREE.MeshBasicMaterial({ color: 0x9d4edd, wireframe: true });
    }

    // Fake Typewriter effect for the terminal
    terminal.innerHTML = '<p class="text-muted">// Parsing NLP Command...</p>';
    setTimeout(() => {
        terminal.innerHTML += codeStr;
        
        // Add 3D Element to scene with a pop-in effect
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.01, 0.01, 0.01); // Start tiny
        demoScene.add(mesh);
        demoElements.push(mesh);
        
        // Simple pop-in animation
        let scale = 0;
        const popIn = setInterval(() => {
            scale += 0.1;
            mesh.scale.set(scale, scale, scale);
            if(scale >= 1) clearInterval(popIn);
        }, 16);

    }, 600); // 0.6 second delay to simulate "thinking"
}

// ================= NATIVE BROWSER SPEECH RECOGNITION =================
const micBtn = document.getElementById('mic-btn');
const micText = document.getElementById('mic-text');
const speechStatus = document.getElementById('speech-status');
const terminal = document.getElementById('terminal-output');

let isListening = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    // CHANGED: This tells the browser NOT to stop when you take a breath!
    recognition.continuous = true; 
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });

    recognition.onstart = function() {
        isListening = true;
        micBtn.classList.add('mic-active');
        micText.innerText = "LISTENING... (CLICK TO STOP)";
        speechStatus.innerText = "Speak your design intent now. You can pause, it will keep listening...";
        terminal.innerHTML += '<p class="text-blue">// System: Continuous microphone active. Awaiting audio stream...</p>';
        terminal.scrollTop = terminal.scrollHeight;
    };

    // Use onend instead of onspeechend to handle manual stopping
    recognition.onend = function() {
        isListening = false;
        micBtn.classList.remove('mic-active');
        micText.innerText = "START DICTATION";
        speechStatus.innerText = "Microphone paused.";
        terminal.innerHTML += '<p class="text-muted">// System: Microphone stream paused.</p>';
        terminal.scrollTop = terminal.scrollHeight;
    };

    recognition.onresult = function(event) {
        // Get the most recently spoken phrase
        const currentResultIndex = event.results.length - 1;
        const transcript = event.results[currentResultIndex][0].transcript.toLowerCase();
        
        speechStatus.innerText = `Heard: "${transcript}"`;
        terminal.innerHTML += `<br><p class="text-orange">// Audio Captured: "${transcript}"</p>`;
        terminal.scrollTop = terminal.scrollHeight;
        
        simulateNLP(transcript);
    };

    recognition.onerror = function(event) {
        if(event.error !== 'no-speech') {
            isListening = false;
            micBtn.classList.remove('mic-active');
            micText.innerText = "START DICTATION";
            speechStatus.innerText = `Error: ${event.error}`;
        }
    };
}

// ================= FAKE NLP ENGINE & "INFINITE" 3D GENERATOR =================
function simulateNLP(text) {
    let codeStr = "";
    let geometry, material, mesh;
    
    setTimeout(() => {
        // 1. CLEAR COMMAND
        if (text.includes("clear") || text.includes("reset") || text.includes("delete")) {
            terminal.innerHTML += '<p class="text-green">// Canvas cleared.</p>';
            demoElements.forEach(el => demoScene.remove(el));
            demoElements = [];
            terminal.scrollTop = terminal.scrollHeight;
            return;
        }

        // 2. MATERIAL DETECTION
        let materialType = "Concrete";
        let hexColor = 0x9d4edd; // Default Purple

        if (text.includes("steel") || text.includes("metal")) { materialType = "Steel"; hexColor = 0x4ea8de; }
        else if (text.includes("wood") || text.includes("timber")) { materialType = "Timber"; hexColor = 0xd4a373; }
        else if (text.includes("glass")) { materialType = "Glass"; hexColor = 0x88ccff; }
        else if (text.includes("brick")) { materialType = "Brick"; hexColor = 0xfb8500; }

        let elementCategory = "Unknown";

        // 3. ARCHITECTURAL / MEP GEOMETRY MAPPING
        if (text.includes("beam")) {
            elementCategory = "Beam";
            geometry = new THREE.BoxGeometry(4, 0.4, 0.4);
        } 
        else if (text.includes("column") || text.includes("pillar")) {
            elementCategory = "Column";
            geometry = new THREE.BoxGeometry(0.8, 4, 0.8);
        } 
        else if (text.includes("wall")) {
            elementCategory = "Wall";
            geometry = new THREE.BoxGeometry(4, 3, 0.2);
        }
        else if (text.includes("floor") || text.includes("slab")) {
            elementCategory = "FloorSlab";
            geometry = new THREE.BoxGeometry(5, 0.2, 5);
        }
        else if (text.includes("pipe") || text.includes("tube")) {
            elementCategory = "MEP_Pipe";
            geometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
            geometry.rotateZ(Math.PI / 2); // Lay flat
        }
        else if (text.includes("duct")) {
            elementCategory = "MEP_Duct";
            geometry = new THREE.BoxGeometry(3, 0.6, 0.8);
        }
        else if (text.includes("window")) {
            elementCategory = "Window";
            geometry = new THREE.BoxGeometry(1.5, 2, 0.1);
            materialType = "Glass"; 
            hexColor = 0x88ccff;
        } 
        // 4. THE "INFINITE" FALLBACK (Catches anything else, like "mouse" or "chair")
        else {
            // Extracts the last meaningful word they said
            let words = text.trim().split(" ");
            let customNoun = words[words.length - 1].toUpperCase();
            elementCategory = `CUSTOM_${customNoun}`;
            
            // Generates a cool procedural tech-shape to represent the unknown item
            geometry = new THREE.IcosahedronGeometry(1, 1); 
            hexColor = 0x00ff00; // Bright green for custom objects
        }

        // Apply Material Settings
        material = new THREE.MeshBasicMaterial({ 
            color: hexColor, 
            wireframe: true,
            transparent: materialType === "Glass",
            opacity: materialType === "Glass" ? 0.3 : 1.0
        });

        // Generate the fake C# Revit API Code
        codeStr = `<p><span class="code-keyword">string</span> familyName = <span class="code-string">"SYS_${materialType.toUpperCase()}_${elementCategory.toUpperCase()}"</span>;</p>
                   <p><span class="code-keyword">FamilySymbol</span> symbol = Doc.<span class="code-method">GetSymbol</span>(familyName);</p>
                   <p>Doc.Create.<span class="code-method">NewFamilyInstance</span>(xyz, symbol, level, StructuralType.NonStructural);</p>
                   <p class="text-green">// Execution Success: ${elementCategory} Generated</p>`;

        // Output to terminal
        terminal.innerHTML += codeStr;
        terminal.scrollTop = terminal.scrollHeight;
        
        // Render 3D Mesh
        mesh = new THREE.Mesh(geometry, material);
        
        // Randomize placement so items don't stack directly on top of each other
        mesh.position.x = (Math.random() - 0.5) * 4;
        mesh.position.z = (Math.random() - 0.5) * 4;
        if(elementCategory === "Wall" || elementCategory === "Column") mesh.position.y = 1.5;
        
        mesh.scale.set(0.01, 0.01, 0.01);
        demoScene.add(mesh);
        demoElements.push(mesh);
        
        // Pop-in Animation
        let scale = 0;
        const popIn = setInterval(() => {
            scale += 0.1;
            mesh.scale.set(scale, scale, scale);
            if(scale >= 1) clearInterval(popIn);
        }, 16);

    }, 800); // 0.8 second processing delay
}

// ================= FAKE NLP ENGINE & 3D GENERATOR =================
// ================= MANUAL TEXT INPUT LOGIC =================
const manualInput = document.getElementById('manual-command');
const sendBtn = document.getElementById('send-command-btn');

function handleManualInput() {
    const text = manualInput.value.trim();
    if (text !== "") {
        const terminal = document.getElementById('terminal-output');
        terminal.innerHTML += `<br><p class="text-orange">// Text Entered: "${text}"</p>`;
        simulateNLP(text.toLowerCase());
        manualInput.value = ''; // clear input after sending
    }
}

if (sendBtn && manualInput) {
    sendBtn.addEventListener('click', handleManualInput);
    manualInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleManualInput();
    });
}

// ================= FAKE NLP ENGINE & "INFINITE" 3D GENERATOR =================
function simulateNLP(text) {
    const terminal = document.getElementById('terminal-output');
    let codeStr = "";
    let geometry, material, mesh;
    
    // 1. THE NEW "CLEAR ALL" LOGIC
    if (text.includes("clear") || text.includes("reset") || text.includes("delete")) {
        // Wipes the terminal completely
        terminal.innerHTML = '<p class="text-green">// System: Canvas and console cleared. Ready for new commands.</p>';
        // Removes all 3D elements
        demoElements.forEach(el => demoScene.remove(el));
        demoElements = [];
        // Clears the typing bar
        if(document.getElementById('manual-command')) document.getElementById('manual-command').value = '';
        return;
    }

    setTimeout(() => {
        // 2. MATERIAL DETECTION
        let materialType = "Concrete";
        let hexColor = 0x9d4edd; // Default Purple

        if (text.includes("steel") || text.includes("metal")) { materialType = "Steel"; hexColor = 0x4ea8de; }
        else if (text.includes("wood") || text.includes("timber")) { materialType = "Timber"; hexColor = 0xd4a373; }
        else if (text.includes("glass")) { materialType = "Glass"; hexColor = 0x88ccff; }
        else if (text.includes("brick")) { materialType = "Brick"; hexColor = 0xfb8500; }

        let elementCategory = "Unknown";

        // 3. ARCHITECTURAL / MEP GEOMETRY MAPPING
        if (text.includes("beam")) {
            elementCategory = "Beam";
            geometry = new THREE.BoxGeometry(4, 0.4, 0.4);
        } 
        else if (text.includes("column") || text.includes("pillar")) {
            elementCategory = "Column";
            geometry = new THREE.BoxGeometry(0.8, 4, 0.8);
        } 
        else if (text.includes("wall")) {
            elementCategory = "Wall";
            geometry = new THREE.BoxGeometry(4, 3, 0.2);
        }
        else if (text.includes("floor") || text.includes("slab")) {
            elementCategory = "FloorSlab";
            geometry = new THREE.BoxGeometry(5, 0.2, 5);
        }
        else if (text.includes("pipe") || text.includes("tube")) {
            elementCategory = "MEP_Pipe";
            geometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
            geometry.rotateZ(Math.PI / 2); // Lay flat
        }
        else if (text.includes("duct")) {
            elementCategory = "MEP_Duct";
            geometry = new THREE.BoxGeometry(3, 0.6, 0.8);
        }
        else if (text.includes("window")) {
            elementCategory = "Window";
            geometry = new THREE.BoxGeometry(1.5, 2, 0.1);
            materialType = "Glass"; 
            hexColor = 0x88ccff;
        } 
        // 4. THE "INFINITE" FALLBACK (Catches unknown words)
        else {
            let words = text.trim().split(" ");
            let customNoun = words[words.length - 1].toUpperCase();
            // Fallback safety if empty
            if(!customNoun) customNoun = "OBJECT";
            
            elementCategory = `CUSTOM_${customNoun}`;
            geometry = new THREE.IcosahedronGeometry(1, 1); 
            hexColor = 0x00ff00; // Bright green for custom objects
        }

        // Apply Material Settings
        material = new THREE.MeshBasicMaterial({ 
            color: hexColor, 
            wireframe: true,
            transparent: materialType === "Glass",
            opacity: materialType === "Glass" ? 0.3 : 1.0
        });

        // Generate the C# Revit API Code
        codeStr = `<p><span class="code-keyword">string</span> familyName = <span class="code-string">"SYS_${materialType.toUpperCase()}_${elementCategory.toUpperCase()}"</span>;</p>
                   <p><span class="code-keyword">FamilySymbol</span> symbol = Doc.<span class="code-method">GetSymbol</span>(familyName);</p>
                   <p>Doc.Create.<span class="code-method">NewFamilyInstance</span>(xyz, symbol, level, StructuralType.NonStructural);</p>
                   <p class="text-green">// Execution Success: ${elementCategory} Generated</p><br>`;

        // Output to terminal
        terminal.innerHTML += codeStr;
        terminal.scrollTop = terminal.scrollHeight;
        
        // Render 3D Mesh
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 4;
        mesh.position.z = (Math.random() - 0.5) * 4;
        if(elementCategory === "Wall" || elementCategory === "Column") mesh.position.y = 1.5;
        
        mesh.scale.set(0.01, 0.01, 0.01);
        demoScene.add(mesh);
        demoElements.push(mesh);
        
        // Pop-in Animation
        let scale = 0;
        const popIn = setInterval(() => {
            scale += 0.1;
            mesh.scale.set(scale, scale, scale);
            if(scale >= 1) clearInterval(popIn);
        }, 16);

    }, 500); // Faster 0.5s processing delay
}

// ================= SECURE CONTACT FORM HANDLING =================
const contactForm = document.getElementById('custom-contact-form');
const formStatus = document.getElementById('form-status-message');
const submitBtn = document.getElementById('form-submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        // Prevent the page from reloading
        e.preventDefault(); 
        
        // Change button text to show it's working
        submitBtn.innerText = 'SENDING...';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        // Gather the form data
        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        // Send the data securely to Web3Forms
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                // Success!
                formStatus.innerText = "✓ MESSAGE SENT SUCCESSFULLY. WE WILL BE IN TOUCH.";
                formStatus.style.color = "var(--neon-green, #27c93f)"; // Make it green
                formStatus.style.display = "block";
                
                // Reset the form inputs
                contactForm.reset();
            } else {
                console.log(response);
                formStatus.innerText = "⚠ ERROR SENDING MESSAGE. PLEASE TRY AGAIN.";
                formStatus.style.color = "var(--neon-orange)";
                formStatus.style.display = "block";
            }
        })
        .catch(error => {
            console.log(error);
            formStatus.innerText = "⚠ SOMETHING WENT WRONG. CHECK YOUR CONNECTION.";
            formStatus.style.color = "var(--neon-orange)";
            formStatus.style.display = "block";
        })
        .then(function() {
            // Reset the button back to normal
            submitBtn.innerText = 'SEND MESSAGE';
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;
            
            // Hide the status message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = "none";
            }, 5000);
        });
    });
}



