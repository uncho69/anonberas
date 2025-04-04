document.addEventListener('DOMContentLoaded', () => {
    // Animazione del titolo principale
    const h1 = document.querySelector('h1');
    if (h1) {
        const text = h1.textContent;
        h1.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.animationDelay = `${i * 0.1}s`;
            span.style.animation = 'glitch 0.3s ease-in-out infinite alternate';
            span.style.display = 'inline-block';
            h1.appendChild(span);
        }
    }
    
    // Aggiungi l'effetto glitch al testo
    const glitchStyle = document.createElement('style');
    glitchStyle.textContent = `
        @keyframes glitch {
            0% {
                transform: translate(0);
                text-shadow: 0 0 0 #0f0;
            }
            30% {
                transform: translate(-1px, 1px);
                text-shadow: 1px 0 1px #0f0, -1px 0 #00f;
            }
            50% {
                transform: translate(1px, -1px);
                text-shadow: -1px 0 1px #0f0, 1px 0 #f00;
            }
            70% {
                transform: translate(-1px, -1px);
                text-shadow: 1px 0 1px #0f0, -1px 0 #0ff;
            }
            100% {
                transform: translate(0);
                text-shadow: -1px 0 1px #0f0;
            }
        }
    `;
    document.head.appendChild(glitchStyle);
    
    // Effetto terminale per i titoli delle sezioni (corretto)
    const sectionTitles = document.querySelectorAll('h2');
    sectionTitles.forEach(title => {
        // Salva il testo originale
        const originalText = title.textContent;
        title.dataset.originalText = originalText;
        
        // Attiva l'effetto typing solo al primo hover
        let hasAnimated = false;
        
        title.addEventListener('mouseenter', () => {
            // Previene l'animazione ripetuta
            if (hasAnimated) return;
            
            hasAnimated = true;
            let i = 0;
            title.textContent = '';
            
            const typing = setInterval(() => {
                if (i < originalText.length) {
                    title.textContent += originalText[i];
                    i++;
                } else {
                    clearInterval(typing);
                    // Reimposta lo stato dopo un po' di tempo
                    setTimeout(() => {
                        hasAnimated = false;
                    }, 5000);
                }
            }, 50);
        });
    });
    
    // Animazione per il pulsante di mint
    const mintButton = document.getElementById('mint-button');
    if (mintButton) {
        mintButton.addEventListener('click', () => {
            // Simula il collegamento al wallet
            mintButton.textContent = 'CONNECTING...';
            
            setTimeout(() => {
                mintButton.textContent = 'WALLET CONNECTED';
                
                // Dopo un po', cambia in MINT NOW
                setTimeout(() => {
                    mintButton.textContent = 'MINT NOW';
                    mintButton.classList.add('ready');
                }, 1500);
            }, 2000);
        });
    }
    
    // Aggiungi un indicatore di connessione TOR
    const createTorIndicator = () => {
        const header = document.querySelector('header');
        if (!header) return;
        
        const torStatus = document.createElement('div');
        torStatus.className = 'tor-status';
        torStatus.innerHTML = '<span class="tor-icon"></span><span class="tor-text">TOR CONNECTED</span>';
        
        // Genera un indirizzo IP fittizio
        const generateIP = () => {
            return Array.from({length: 4}, () => Math.floor(Math.random() * 255)).join('.');
        };
        
        // Indirizzo IP casuale e nodo di uscita
        const exitNode = document.createElement('div');
        exitNode.className = 'exit-node';
        exitNode.innerHTML = `Exit node: <span>${generateIP()}</span>`;
        
        // Aggiungere un tooltip al termine TOR
        const torText = torStatus.querySelector('.tor-text');
        torText.className = 'tor-text tooltip';
        torText.setAttribute('data-tooltip', 'The Onion Router - Anonymizing overlay network');
        
        torStatus.appendChild(exitNode);
        header.prepend(torStatus);
        
        // Cambia l'indirizzo IP ogni 10 secondi
        setInterval(() => {
            exitNode.querySelector('span').textContent = generateIP();
        }, 10000);
    };
    
    // Aggiungi tooltip per i termini tecnici
    const addTechTooltips = () => {
        const techTerms = [
            {element: '.timeline-item:nth-child(1) h3', tooltip: 'Cryptographic operation phase'},
            {element: '.timeline-item:nth-child(2) h3', tooltip: 'Network layer obfuscation'},
            {element: '.timeline-item:nth-child(3) h3', tooltip: 'Secure distributed consensus'},
        ];
        
        techTerms.forEach(term => {
            const element = document.querySelector(term.element);
            if (element) {
                element.className = 'tooltip';
                element.setAttribute('data-tooltip', term.tooltip);
            }
        });
    };
    
    // Applica le tooltip
    setTimeout(() => {
        createTorIndicator();
        addTechTooltips();
    }, 500);
    
    // Aggiungi un effetto matrix in background
    const createMatrixBackground = () => {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.18'; // Aumentato l'opacità da 0.1 a 0.18
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Caratteri per l'effetto Matrix (incluso asiatici)
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~'
            + '日月水火木金土年中出三本人大十二女小子山川田力円入八六下上口夕刀千士工'
            + '七九了又干土丁亡兀与万丈勺刃习'
            + '々丶个丿乀乁乂乃乄久乆乇么义乊乑乕乗乚乛乢亅'
            + '丼丽乏乐乑习乗书买乱乳乾亀亁亂亅亊';
        
        // Impostazioni colonne
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        
        // Array per tenere traccia della posizione Y di ogni colonna
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        // Funzione di disegno
        const draw = () => {
            // Sfondo semi-trasparente per creare l'effetto di dissolvenza
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Testo verde in stile Matrix
            ctx.fillStyle = '#0f0';
            ctx.font = `${fontSize}px monospace`;
            
            // Loop su ogni goccia
            for (let i = 0; i < drops.length; i++) {
                // Carattere casuale da stampare
                const text = characters[Math.floor(Math.random() * characters.length)];
                
                // Posizione x è i*fontSize, y è value of drops[i]*fontSize
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                // Invia la goccia di nuovo in alto casualmente dopo che è scesa abbastanza o quando tocca il fondo
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                // Incrementa y
                drops[i]++;
            }
        };
        
        // Anima l'effetto Matrix
        setInterval(draw, 35);
        
        // Ridimensiona il canvas quando la finestra cambia dimensione
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    };
    
    // Avvia l'effetto Matrix in background
    createMatrixBackground();
}); 