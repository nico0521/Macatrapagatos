// Macarena: Guardian of Cats - Modern 2D Game Engine

// Game State Management
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    MINIGAME: 'minigame',
    DIALOG: 'dialog',
    ALBUM: 'album'
};

let currentState = GameState.MENU;
let canvas, ctx;
let gameTime = 0;
let deltaTime = 0;
let lastTime = 0;

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 1000,
    CANVAS_HEIGHT: 700,
    PLAYER_SPEED: 3,
    CAT_DETECTION_RADIUS: 80,
    LEVEL_TIME: 90, // seconds
    TOTAL_CATS: 8
};

// Game Data
let gameData = {
    level: 1,
    timeLeft: CONFIG.LEVEL_TIME,
    catsRescued: 0,
    totalCats: CONFIG.TOTAL_CATS,
    energy: 100,
    selectedItem: null,
    rescuedCatsCollection: [],
    currentDialog: null
};

// Player Object
let player = {
    x: 500,
    y: 350,
    width: 40,
    height: 60,
    speed: CONFIG.PLAYER_SPEED,
    direction: 'down',
    isMoving: false,
    animationFrame: 0,
    animationTimer: 0,
    energy: 100
};

// Cat Definitions with Unique Personalities
const CAT_TYPES = {
    TOMAS: {
        name: 'Tomás',
        emoji: '😴',
        color: '#F5F5F5',
        personality: 'Gordo y blanco con gris, dormilón',
        story: 'Tomás es un gato muy perezoso que ama dormir todo el día. Necesita una manta suave para sentirse cómodo y moverse.',
        requiredItem: 'blanket',
        minigame: 'comfort',
        speed: 0.5,
        behavior: 'sleepy'
    },
    LUNA: {
        name: 'Luna',
        emoji: '🌙',
        color: '#2C2C2C',
        personality: 'Pequeña y negra, se esconde bajo autos',
        story: 'Luna es muy tímida y le gusta esconderse en lugares oscuros. Solo sale cuando huele su comida favorita.',
        requiredItem: 'food',
        minigame: 'hiding',
        speed: 1.5,
        behavior: 'hiding'
    },
    PELUSA: {
        name: 'Pelusa',
        emoji: '🧡',
        color: '#FF8C00',
        personality: 'Naranja y esponjoso, aventurero',
        story: 'Pelusa es muy juguetón y le encanta explorar. Te llevará por un pequeño laberinto antes de dejarse rescatar.',
        requiredItem: null,
        minigame: 'maze',
        speed: 2,
        behavior: 'playful'
    },
    COPITO: {
        name: 'Copito',
        emoji: '👁️',
        color: '#FFFFFF',
        personality: 'Blanco con ojos disparejos, nocturno',
        story: 'Copito solo aparece cuando está oscuro. Sus ojos brillan en la noche y necesitas una linterna para encontrarlo.',
        requiredItem: 'flashlight',
        minigame: 'night',
        speed: 1,
        behavior: 'nocturnal'
    },
    MOTE: {
        name: 'Mote',
        emoji: '🐅',
        color: '#8B4513',
        personality: 'Atigrado callejero, desconfiado',
        story: 'Mote ha vivido en las calles y es muy desconfiado. Debes acercarte muy lentamente para ganarte su confianza.',
        requiredItem: null,
        minigame: 'trust',
        speed: 1.8,
        behavior: 'cautious'
    },
    CHISPA: {
        name: 'Chispa',
        emoji: '⚡',
        color: '#808080',
        personality: 'Gris y juguetón, muy rápido',
        story: 'Chispa es increíblemente rápido y juguetón. Te retará a un juego de reflejos antes de dejarse atrapar.',
        requiredItem: null,
        minigame: 'reflex',
        speed: 3,
        behavior: 'energetic'
    },
    NUNOA: {
        name: 'Ñuñoa',
        emoji: '👵',
        color: '#D3D3D3',
        personality: 'Gata anciana con bufanda, sabia',
        story: 'Ñuñoa es una gata mayor muy sabia. Solo acepta ayuda si primero hablas con la señora del barrio.',
        requiredItem: null,
        minigame: 'wisdom',
        speed: 0.8,
        behavior: 'wise'
    },
    PUNKY: {
        name: 'Punky',
        emoji: '🎸',
        color: '#FF69B4',
        personality: 'Con mohawk rosado, rebelde',
        story: 'Punky es un gato rebelde con estilo punk. Solo se calma con música suave y melodiosa.',
        requiredItem: 'music',
        minigame: 'music',
        speed: 2.2,
        behavior: 'rebellious'
    }
};

// Cats Array
let cats = [];
let npcs = [];
let currentMinigame = null;

// Input Handling
let keys = {};
let mousePos = { x: 0, y: 0 };

// Audio Context (for simple sound effects)
let audioContext;
let sounds = {};

// Initialize Game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Setup audio
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio not supported');
    }
    
    // Event Listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    // Initialize inventory
    setupInventory();
    
    // Load saved data
    loadGameData();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(currentTime) {
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    gameTime += deltaTime;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update Game State
function update(dt) {
    if (currentState === GameState.PLAYING) {
        updatePlayer(dt);
        updateCats(dt);
        updateTimer(dt);
        updateRadar();
        checkCatInteractions();
    } else if (currentState === GameState.MINIGAME && currentMinigame) {
        updateMinigame(dt);
    }
}

// Update Player
function updatePlayer(dt) {
    let wasMoving = player.isMoving;
    player.isMoving = false;
    
    // Movement
    if (keys['ArrowUp'] || keys['KeyW']) {
        player.y -= player.speed;
        player.direction = 'up';
        player.isMoving = true;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        player.y += player.speed;
        player.direction = 'down';
        player.isMoving = true;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
        player.direction = 'left';
        player.isMoving = true;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
        player.direction = 'right';
        player.isMoving = true;
    }
    
    // Boundary checking
    player.x = Math.max(20, Math.min(CONFIG.CANVAS_WIDTH - 60, player.x));
    player.y = Math.max(100, Math.min(CONFIG.CANVAS_HEIGHT - 80, player.y));
    
    // Animation
    if (player.isMoving) {
        player.animationTimer += dt;
        if (player.animationTimer > 200) {
            player.animationFrame = (player.animationFrame + 1) % 4;
            player.animationTimer = 0;
        }
    } else {
        player.animationFrame = 0;
    }
    
    // Energy regeneration
    if (player.energy < 100) {
        player.energy = Math.min(100, player.energy + dt * 0.01);
        updateEnergyBar();
    }
}

// Update Cats
function updateCats(dt) {
    cats.forEach(cat => {
        if (cat.rescued) return;
        
        // AI Movement based on behavior
        cat.moveTimer += dt;
        
        switch (cat.behavior) {
            case 'sleepy':
                // Barely moves
                if (cat.moveTimer > 3000) {
                    cat.targetX = cat.x + (Math.random() - 0.5) * 20;
                    cat.targetY = cat.y + (Math.random() - 0.5) * 20;
                    cat.moveTimer = 0;
                }
                break;
                
            case 'hiding':
                // Moves to corners and edges
                if (cat.moveTimer > 2000) {
                    const corners = [
                        {x: 50, y: 120}, {x: CONFIG.CANVAS_WIDTH - 50, y: 120},
                        {x: 50, y: CONFIG.CANVAS_HEIGHT - 50}, {x: CONFIG.CANVAS_WIDTH - 50, y: CONFIG.CANVAS_HEIGHT - 50}
                    ];
                    const corner = corners[Math.floor(Math.random() * corners.length)];
                    cat.targetX = corner.x;
                    cat.targetY = corner.y;
                    cat.moveTimer = 0;
                }
                break;
                
            case 'playful':
                // Random movement
                if (cat.moveTimer > 1000) {
                    cat.targetX = 100 + Math.random() * (CONFIG.CANVAS_WIDTH - 200);
                    cat.targetY = 150 + Math.random() * (CONFIG.CANVAS_HEIGHT - 200);
                    cat.moveTimer = 0;
                }
                break;
                
            case 'energetic':
                // Fast, erratic movement
                if (cat.moveTimer > 500) {
                    cat.targetX = cat.x + (Math.random() - 0.5) * 100;
                    cat.targetY = cat.y + (Math.random() - 0.5) * 100;
                    cat.moveTimer = 0;
                }
                break;
                
            default:
                // Standard movement
                if (cat.moveTimer > 1500) {
                    cat.targetX = 50 + Math.random() * (CONFIG.CANVAS_WIDTH - 100);
                    cat.targetY = 120 + Math.random() * (CONFIG.CANVAS_HEIGHT - 170);
                    cat.moveTimer = 0;
                }
        }
        
        // Move towards target
        if (cat.targetX !== undefined) {
            const dx = cat.targetX - cat.x;
            const dy = cat.targetY - cat.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                cat.x += (dx / distance) * cat.speed;
                cat.y += (dy / distance) * cat.speed;
            }
        }
        
        // Keep in bounds
        cat.x = Math.max(30, Math.min(CONFIG.CANVAS_WIDTH - 30, cat.x));
        cat.y = Math.max(120, Math.min(CONFIG.CANVAS_HEIGHT - 30, cat.y));
    });
}

// Update Timer
function updateTimer(dt) {
    gameData.timeLeft -= dt / 1000;
    
    if (gameData.timeLeft <= 0) {
        gameOver(false);
        return;
    }
    
    // Update UI
    document.getElementById('timer').textContent = Math.ceil(gameData.timeLeft) + 's';
    document.getElementById('catsCounter').textContent = `🐱 ${gameData.catsRescued}/${gameData.totalCats}`;
    document.getElementById('levelNumber').textContent = gameData.level;
}

// Update Radar
function updateRadar() {
    const radar = document.getElementById('radar');
    const radarDot = document.getElementById('radarDot');
    
    let nearestDistance = Infinity;
    let nearestCat = null;
    
    cats.forEach(cat => {
        if (!cat.rescued) {
            const distance = Math.sqrt(
                Math.pow(player.x - cat.x, 2) + Math.pow(player.y - cat.y, 2)
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestCat = cat;
            }
        }
    });
    
    if (nearestCat) {
        const intensity = Math.max(0, 1 - (nearestDistance / 200));
        radar.style.boxShadow = `0 0 ${intensity * 30}px rgba(78, 205, 196, ${intensity})`;
        
        const dotSize = 12 + intensity * 8;
        radarDot.style.width = dotSize + 'px';
        radarDot.style.height = dotSize + 'px';
        radarDot.style.background = `rgba(255, ${255 - intensity * 200}, ${255 - intensity * 200}, ${0.7 + intensity * 0.3})`;
        
        if (intensity > 0.8) {
            radarDot.classList.add('pulse');
        } else {
            radarDot.classList.remove('pulse');
        }
    }
}

// Check Cat Interactions
function checkCatInteractions() {
    cats.forEach(cat => {
        if (cat.rescued) return;
        
        const distance = Math.sqrt(
            Math.pow(player.x - cat.x, 2) + Math.pow(player.y - cat.y, 2)
        );
        
        if (distance < CONFIG.CAT_DETECTION_RADIUS) {
            if (keys['Space'] || keys['Enter']) {
                attemptCatRescue(cat);
                keys['Space'] = false;
                keys['Enter'] = false;
            }
        }
    });
}

// Attempt Cat Rescue
function attemptCatRescue(cat) {
    // Check if required item is selected
    if (cat.requiredItem && gameData.selectedItem !== cat.requiredItem) {
        showDialog(`${cat.name} necesita: ${getItemName(cat.requiredItem)}`, '🐱');
        return;
    }
    
    // Special case for Ñuñoa - needs NPC interaction first
    if (cat.type === 'NUNOA' && !cat.npcTalked) {
        showDialog('Ñuñoa solo acepta ayuda si primero hablas con la señora del barrio.', '👵');
        return;
    }
    
    // Start minigame
    startMinigame(cat);
}

// Start Minigame
function startMinigame(cat) {
    currentState = GameState.MINIGAME;
    currentMinigame = {
        cat: cat,
        type: cat.minigame,
        progress: 0,
        completed: false,
        data: {}
    };
    
    document.getElementById('minigameOverlay').style.display = 'flex';
    document.getElementById('minigameTitle').textContent = `Rescatando a ${cat.name}...`;
    
    setupMinigame(cat.minigame);
}

// Setup Specific Minigames
function setupMinigame(type) {
    const area = document.getElementById('minigameArea');
    area.innerHTML = '';
    
    switch (type) {
        case 'comfort':
            area.innerHTML = `
                <p>Tomás necesita sentirse cómodo. Haz clic en la manta para arroparlo.</p>
                <div style="width: 200px; height: 150px; background: #8B4513; margin: 20px auto; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 40px;" onclick="progressMinigame()">🛏️</div>
            `;
            break;
            
        case 'hiding':
            area.innerHTML = `
                <p>Luna se está escondiendo. Encuentra dónde está.</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px auto; max-width: 300px;">
                    ${Array.from({length: 9}, (_, i) => 
                        `<div style="width: 80px; height: 60px; background: #333; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="checkHiding(${i})">${i === 4 ? '🌙' : '📦'}</div>`
                    ).join('')}
                </div>
            `;
            break;
            
        case 'maze':
            area.innerHTML = `
                <p>Sigue a Pelusa por el laberinto. Usa las flechas del teclado.</p>
                <canvas id="mazeCanvas" width="300" height="200" style="border: 2px solid #ccc; margin: 20px auto; display: block;"></canvas>
            `;
            setupMazeGame();
            break;
            
        case 'reflex':
            area.innerHTML = `
                <p>¡Chispa es muy rápido! Haz clic cuando veas el destello.</p>
                <div id="reflexTarget" style="width: 200px; height: 200px; background: #ddd; margin: 20px auto; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 60px;" onclick="reflexClick()">⚡</div>
            `;
            startReflexGame();
            break;
            
        case 'trust':
            area.innerHTML = `
                <p>Acércate lentamente a Mote. Mantén presionado el botón.</p>
                <div style="text-align: center; margin: 20px;">
                    <div id="trustMeter" style="width: 200px; height: 20px; background: #ddd; margin: 20px auto; border-radius: 10px; overflow: hidden;">
                        <div id="trustProgress" style="width: 0%; height: 100%; background: linear-gradient(45deg, #4ecdc4, #44a08d); transition: width 0.1s;"></div>
                    </div>
                    <button onmousedown="startTrust()" onmouseup="stopTrust()" ontouchstart="startTrust()" ontouchend="stopTrust()">Acercarse Lentamente</button>
                </div>
            `;
            break;
            
        case 'music':
            area.innerHTML = `
                <p>Toca una melodía suave para calmar a Punky.</p>
                <div style="display: flex; justify-content: center; gap: 10px; margin: 20px;">
                    ${['Do', 'Re', 'Mi', 'Fa', 'Sol'].map((note, i) => 
                        `<button style="padding: 20px; background: #4ecdc4; color: white; border: none; border-radius: 10px; cursor: pointer;" onclick="playNote(${i})">${note}</button>`
                    ).join('')}
                </div>
                <div id="melody" style="text-align: center; margin: 20px; font-size: 18px;">Melodía: </div>
            `;
            currentMinigame.data.melody = [];
            currentMinigame.data.targetMelody = [0, 2, 4, 2, 0]; // Do Mi Sol Mi Do
            break;
            
        default:
            area.innerHTML = `
                <p>Interactúa con ${currentMinigame.cat.name}</p>
                <button onclick="completeMinigame()">Rescatar</button>
            `;
    }
}

// Minigame Functions
function progressMinigame() {
    currentMinigame.progress += 25;
    if (currentMinigame.progress >= 100) {
        completeMinigame();
    }
}

function checkHiding(index) {
    if (index === 4) { // Luna is hiding in the middle box
        completeMinigame();
    } else {
        // Wrong box, show feedback
        event.target.style.background = '#ff6b6b';
        setTimeout(() => {
            event.target.style.background = '#333';
        }, 500);
    }
}

let trustInterval;
function startTrust() {
    trustInterval = setInterval(() => {
        currentMinigame.progress += 2;
        document.getElementById('trustProgress').style.width = currentMinigame.progress + '%';
        if (currentMinigame.progress >= 100) {
            completeMinigame();
        }
    }, 100);
}

function stopTrust() {
    clearInterval(trustInterval);
    // Slowly decrease progress if not holding
    setTimeout(() => {
        if (currentMinigame.progress > 0) {
            currentMinigame.progress = Math.max(0, currentMinigame.progress - 10);
            document.getElementById('trustProgress').style.width = currentMinigame.progress + '%';
        }
    }, 200);
}

function startReflexGame() {
    const target = document.getElementById('reflexTarget');
    const delay = 1000 + Math.random() * 3000;
    
    setTimeout(() => {
        target.style.background = '#ffff00';
        target.textContent = '⚡';
        currentMinigame.data.canClick = true;
        
        setTimeout(() => {
            if (currentMinigame.data.canClick) {
                target.style.background = '#ff6b6b';
                target.textContent = '❌';
                currentMinigame.data.canClick = false;
                // Restart after failure
                setTimeout(() => startReflexGame(), 1000);
            }
        }, 1000);
    }, delay);
}

function reflexClick() {
    if (currentMinigame.data.canClick) {
        completeMinigame();
    }
}

function playNote(noteIndex) {
    currentMinigame.data.melody.push(noteIndex);
    document.getElementById('melody').textContent = 'Melodía: ' + 
        currentMinigame.data.melody.map(i => ['Do', 'Re', 'Mi', 'Fa', 'Sol'][i]).join(' ');
    
    // Check if melody matches
    if (currentMinigame.data.melody.length === currentMinigame.data.targetMelody.length) {
        if (JSON.stringify(currentMinigame.data.melody) === JSON.stringify(currentMinigame.data.targetMelody)) {
            completeMinigame();
        } else {
            // Wrong melody, reset
            currentMinigame.data.melody = [];
            document.getElementById('melody').textContent = 'Melodía: (Inténtalo de nuevo)';
            setTimeout(() => {
                document.getElementById('melody').textContent = 'Melodía: ';
            }, 1000);
        }
    }
}

// Complete Minigame
function completeMinigame() {
    if (!currentMinigame) return;
    
    const cat = currentMinigame.cat;
    cat.rescued = true;
    gameData.catsRescued++;
    
    // Add to collection
    const catData = {
        ...CAT_TYPES[cat.type],
        rescueDate: new Date().toLocaleDateString(),
        level: gameData.level
    };
    
    gameData.rescuedCatsCollection.push(catData);
    saveGameData();
    
    // Close minigame
    document.getElementById('minigameOverlay').style.display = 'none';
    currentState = GameState.PLAYING;
    currentMinigame = null;
    
    // Show success dialog
    showDialog(`¡Has rescatado a ${cat.name}! ${cat.story}`, cat.emoji);
    
    // Check win condition
    if (gameData.catsRescued >= gameData.totalCats) {
        setTimeout(() => {
            gameOver(true);
        }, 2000);
    }
}

// Render Game
function render() {
    if (currentState !== GameState.PLAYING) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw background
    drawBackground();
    
    // Draw cats
    cats.forEach(cat => {
        if (!cat.rescued) {
            drawCat(cat);
        }
    });
    
    // Draw NPCs
    npcs.forEach(npc => {
        drawNPC(npc);
    });
    
    // Draw player
    drawPlayer();
    
    // Draw interaction hints
    drawInteractionHints();
}

// Draw Background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Buildings
    drawBuildings();
    
    // Streets
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 100, CONFIG.CANVAS_WIDTH, 100);
    
    // Street lines
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.CANVAS_HEIGHT - 50);
    ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - 50);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw Buildings
function drawBuildings() {
    const buildings = [
        {x: 50, y: 200, width: 120, height: 200, color: '#FF6B6B'},
        {x: 200, y: 150, width: 100, height: 250, color: '#4ECDC4'},
        {x: 350, y: 180, width: 140, height: 220, color: '#45B7D1'},
        {x: 520, y: 160, width: 110, height: 240, color: '#96CEB4'},
        {x: 670, y: 190, width: 130, height: 210, color: '#FFEAA7'},
        {x: 830, y: 170, width: 120, height: 230, color: '#DDA0DD'}
    ];
    
    buildings.forEach(building => {
        // Building body
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Building outline
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.strokeRect(building.x, building.y, building.width, building.height);
        
        // Windows
        ctx.fillStyle = '#2C3E50';
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                const windowX = building.x + 20 + col * 30;
                const windowY = building.y + 30 + row * 40;
                ctx.fillRect(windowX, windowY, 15, 20);
            }
        }
    });
}

// Draw Player (Macarena)
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.ellipse(x + 20, y + 55, 15, 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Body
    ctx.fillStyle = '#FFFFFF'; // White shirt
    ctx.fillRect(x + 10, y + 25, 20, 25);
    
    // Jacket
    ctx.fillStyle = '#4ECDC4'; // Light jacket
    ctx.fillRect(x + 8, y + 23, 24, 15);
    
    // Jeans
    ctx.fillStyle = '#4169E1'; // Blue jeans
    ctx.fillRect(x + 12, y + 35, 16, 20);
    
    // Head
    ctx.fillStyle = '#FDBCB4'; // Skin tone
    ctx.beginPath();
    ctx.arc(x + 20, y + 15, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = '#8B4513'; // Brown hair
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 14, 0, Math.PI);
    ctx.fill();
    
    // Glasses
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 16, y + 15, 4, 0, 2 * Math.PI);
    ctx.arc(x + 24, y + 15, 4, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Glasses bridge
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 15);
    ctx.lineTo(x + 20, y + 15);
    ctx.stroke();
    
    // Backpack
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 28, y + 20, 8, 12);
    
    // Legs (walking animation)
    ctx.fillStyle = '#4169E1';
    if (player.isMoving) {
        const offset = Math.sin(gameTime * 0.01) * 2;
        ctx.fillRect(x + 14, y + 50, 6, 10 + offset);
        ctx.fillRect(x + 20, y + 50, 6, 10 - offset);
    } else {
        ctx.fillRect(x + 14, y + 50, 6, 10);
        ctx.fillRect(x + 20, y + 50, 6, 10);
    }
    
    // Shoes
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(x + 12, y + 58, 8, 4);
    ctx.fillRect(x + 20, y + 58, 8, 4);
}

// Draw Cat
function drawCat(cat) {
    const x = cat.x;
    const y = cat.y;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.ellipse(x + 15, y + 25, 12, 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Body
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 15, 12, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(x + 15, y + 5, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 2);
    ctx.lineTo(x + 12, y - 3);
    ctx.lineTo(x + 16, y + 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 2);
    ctx.lineTo(x + 18, y - 3);
    ctx.lineTo(x + 22, y + 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(x + 12, y + 5, 2, 0, 2 * Math.PI);
    ctx.arc(x + 18, y + 5, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(x + 15, y + 7, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Tail
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.arc(x + 25, y + 12, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cat name above
    ctx.fillStyle = '#2C3E50';
    ctx.font = '12px Comfortaa';
    ctx.textAlign = 'center';
    ctx.fillText(cat.name, x + 15, y - 10);
    
    // Required item indicator
    if (cat.requiredItem) {
        ctx.font = '16px Arial';
        ctx.fillText(getItemEmoji(cat.requiredItem), x + 25, y - 5);
    }
}

// Draw NPCs
function drawNPC(npc) {
    const x = npc.x;
    const y = npc.y;
    
    // Simple NPC representation
    ctx.fillStyle = npc.color;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#2C3E50';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(npc.emoji, x, y + 5);
}

// Draw Interaction Hints
function drawInteractionHints() {
    cats.forEach(cat => {
        if (cat.rescued) return;
        
        const distance = Math.sqrt(
            Math.pow(player.x - cat.x, 2) + Math.pow(player.y - cat.y, 2)
        );
        
        if (distance < CONFIG.CAT_DETECTION_RADIUS) {
            // Draw interaction circle
            ctx.strokeStyle = '#4ECDC4';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(cat.x + 15, cat.y + 15, CONFIG.CAT_DETECTION_RADIUS, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw prompt
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(cat.x - 20, cat.y - 40, 70, 25);
            
            ctx.fillStyle = '#2C3E50';
            ctx.font = '12px Comfortaa';
            ctx.textAlign = 'center';
            ctx.fillText('Presiona ESPACIO', cat.x + 15, cat.y - 25);
        }
    });
}

// Utility Functions
function getItemName(item) {
    const names = {
        blanket: 'Manta',
        food: 'Comida',
        flashlight: 'Linterna',
        music: 'Música'
    };
    return names[item] || item;
}

function getItemEmoji(item) {
    const emojis = {
        blanket: '🛏️',
        food: '🐟',
        flashlight: '🔦',
        music: '🎵'
    };
    return emojis[item] || '❓';
}

// Game State Functions
function startGame() {
    currentState = GameState.PLAYING;
    gameData.level = 1;
    gameData.timeLeft = CONFIG.LEVEL_TIME;
    gameData.catsRescued = 0;
    gameData.energy = 100;
    
    // Hide menu, show game
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameUI').style.display = 'flex';
    document.getElementById('radar').style.display = 'flex';
    document.getElementById('inventory').style.display = 'flex';
    
    // Initialize level
    initLevel();
}

function initLevel() {
    // Reset player
    player.x = 500;
    player.y = 350;
    player.energy = 100;
    
    // Create cats
    cats = [];
    const catTypes = Object.keys(CAT_TYPES);
    
    for (let i = 0; i < gameData.totalCats; i++) {
        const type = catTypes[i % catTypes.length];
        const catData = CAT_TYPES[type];
        
        cats.push({
            type: type,
            name: catData.name,
            emoji: catData.emoji,
            color: catData.color,
            personality: catData.personality,
            story: catData.story,
            requiredItem: catData.requiredItem,
            minigame: catData.minigame,
            speed: catData.speed,
            behavior: catData.behavior,
            x: 100 + Math.random() * (CONFIG.CANVAS_WIDTH - 200),
            y: 150 + Math.random() * (CONFIG.CANVAS_HEIGHT - 200),
            targetX: undefined,
            targetY: undefined,
            moveTimer: 0,
            rescued: false,
            npcTalked: false
        });
    }
    
    // Create NPCs
    npcs = [
        {
            x: 200,
            y: 300,
            emoji: '👵',
            color: '#DDA0DD',
            name: 'Señora del Barrio',
            dialog: 'Ñuñoa es una gata muy especial. Ha vivido aquí toda su vida y solo confía en quienes realmente se preocupan por los animales.'
        }
    ];
}

function gameOver(won) {
    currentState = GameState.MENU;
    
    if (won) {
        showDialog(`¡Felicitaciones! Has rescatado a todos los gatos del nivel ${gameData.level}. ¡Eres una verdadera guardiana de gatos!`, '🎉');
    } else {
        showDialog(`Se acabó el tiempo. Rescataste ${gameData.catsRescued} de ${gameData.totalCats} gatos. ¡Inténtalo de nuevo!`, '⏰');
    }
    
    setTimeout(() => {
        returnToMenu();
    }, 3000);
}

function returnToMenu() {
    currentState = GameState.MENU;
    document.getElementById('menuScreen').style.display = 'flex';
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('radar').style.display = 'none';
    document.getElementById('inventory').style.display = 'none';
    closeDialog();
}

// Dialog System
function showDialog(text, emoji = '👩') {
    document.getElementById('dialogText').textContent = text;
    document.getElementById('dialogPortrait').textContent = emoji;
    document.getElementById('dialogBox').style.display = 'block';
}

function closeDialog() {
    document.getElementById('dialogBox').style.display = 'none';
}

// Inventory System
function setupInventory() {
    const items = document.querySelectorAll('.inventory-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            // Remove selection from all items
            items.forEach(i => i.classList.remove('selected'));
            
            // Select clicked item
            item.classList.add('selected');
            gameData.selectedItem = item.dataset.item;
        });
    });
}

function updateEnergyBar() {
    document.getElementById('energyFill').style.width = player.energy + '%';
}

// Album Functions
function showAlbum() {
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('catAlbum').style.display = 'block';
    
    const catCards = document.getElementById('catCards');
    catCards.innerHTML = '';
    
    if (gameData.rescuedCatsCollection.length === 0) {
        catCards.innerHTML = '<p style="text-align: center; color: #666; font-size: 18px; margin: 50px;">¡Aún no has rescatado ningún gato! Ve a jugar para comenzar tu colección.</p>';
    } else {
        gameData.rescuedCatsCollection.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'cat-card';
            card.innerHTML = `
                <div class="cat-sprite">${cat.emoji}</div>
                <h3>${cat.name}</h3>
                <p style="font-size: 14px; opacity: 0.9; margin: 10px 0;">${cat.personality}</p>
                <p style="font-size: 12px; opacity: 0.8; line-height: 1.4;">${cat.story}</p>
                <div style="margin-top: 15px; font-size: 11px; opacity: 0.7;">
                    <div>Rescatado: ${cat.rescueDate}</div>
                    <div>Nivel: ${cat.level}</div>
                </div>
            `;
            catCards.appendChild(card);
        });
    }
}

function hideAlbum() {
    document.getElementById('catAlbum').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'flex';
}

function showInstructions() {
    showDialog(`
        🎮 CONTROLES:
        • Flechas o WASD para mover a Macarena
        • ESPACIO para interactuar con gatos
        • Haz clic en los ítems del inventario para seleccionarlos
        
        🐱 OBJETIVO:
        Rescata a todos los gatos antes de que se acabe el tiempo. Cada gato tiene una personalidad única y requiere una interacción especial.
        
        💡 CONSEJOS:
        • Usa el radar para encontrar gatos cercanos
        • Algunos gatos necesitan ítems específicos
        • Habla con los NPCs para obtener pistas
    `, '📖');
}

// Save/Load System
function saveGameData() {
    localStorage.setItem('macarenaGuardianCats', JSON.stringify({
        rescuedCatsCollection: gameData.rescuedCatsCollection,
        highestLevel: gameData.level
    }));
}

function loadGameData() {
    const saved = localStorage.getItem('macarenaGuardianCats');
    if (saved) {
        const data = JSON.parse(saved);
        gameData.rescuedCatsCollection = data.rescuedCatsCollection || [];
    }
}

// Input Event Handlers
function handleKeyDown(e) {
    keys[e.code] = true;
    e.preventDefault();
}

function handleKeyUp(e) {
    keys[e.code] = false;
    e.preventDefault();
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
}

function handleClick(e) {
    if (currentState === GameState.PLAYING) {
        // Check NPC interactions
        npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(mousePos.x - npc.x, 2) + Math.pow(mousePos.y - npc.y, 2)
            );
            
            if (distance < 30) {
                showDialog(npc.dialog, npc.emoji);
                // Special case for Ñuñoa's NPC
                if (npc.name === 'Señora del Barrio') {
                    const nunoa = cats.find(cat => cat.type === 'NUNOA');
                    if (nunoa) nunoa.npcTalked = true;
                }
            }
        });
    }
}

// Initialize game when page loads
window.addEventListener('load', init);