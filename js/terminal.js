document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const cursor = document.getElementById('cursor');
    const terminal = document.getElementById('terminal');
    const mainContent = document.getElementById('main-content');
    const terminalContent = document.getElementById('terminal-content');
    
    // Aggiungi input nascosto per dispositivi mobili
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.className = 'hidden-input';
    hiddenInput.autocapitalize = 'none';
    hiddenInput.autocomplete = 'off';
    hiddenInput.spellcheck = false;
    document.getElementById('input-line').appendChild(hiddenInput);
    
    // Verifica se è un dispositivo mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Comando di benvenuto e sequenza di inizializzazione
    const welcomeSequence = [
        { text: "Starting anonymous session...", delay: 500 },
        { text: "Initializing TOR connection...", delay: 800 },
        { text: "Configuring TOR network connection...", delay: 1200 },
        { text: "Starting TOR circuit...", delay: 800 },
        { text: "Setting up proxy chain...", delay: 1000 },
        { text: "Starting proxy #1... [OK]", delay: 400 },
        { text: "Starting proxy #2... [OK]", delay: 400 },
        { text: "Starting proxy #3... [OK]", delay: 400 },
        { text: "Routing traffic through proxy chains...", delay: 1000 },
        { text: "Encrypting connection... [OK]", delay: 800 },
        { text: "Masking IP address... [OK]", delay: 800 },
        { text: "Anonymization complete.", delay: 1000 },
        { text: "Welcome to The Anon Beras Project terminal.", delay: 1500 },
        { text: "Check the folder and run the secret file to continue...", delay: 1000 },
    ];

    // Stato del terminale
    let terminalState = {
        currentDir: '~',
        dirs: {
            '~': ['anon-beras-project'],
            '~/anon-beras-project': ['secret.sh']
        },
        activeTerminal: true,
        inputEnabled: false
    };

    // Funzione per simulare la digitazione
    const typeWriter = (text, element, speed = 50) => {
        return new Promise((resolve) => {
            let i = 0;
            const typing = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    // Auto-scroll alla fine del terminale ad ogni carattere
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                } else {
                    clearInterval(typing);
                    resolve();
                }
            }, speed);
        });
    };

    // Funzione per aggiungere una nuova riga nel terminale
    const addLine = (text) => {
        const line = document.createElement('div');
        line.classList.add('terminal-line');
        output.appendChild(line);
        // Auto-scroll alla fine del terminale quando si aggiunge una nuova riga
        terminalContent.scrollTop = terminalContent.scrollHeight;
        return typeWriter(text, line);
    };

    // Funzione per eseguire la sequenza di inizializzazione
    const runWelcomeSequence = async () => {
        for (const item of welcomeSequence) {
            await addLine(item.text);
            await new Promise(resolve => setTimeout(resolve, item.delay));
            // Auto-scroll alla fine del terminale dopo ogni linea completata
            terminalContent.scrollTop = terminalContent.scrollHeight;
        }
        
        // Abilitare l'input dell'utente dopo la sequenza di benvenuto
        terminalState.inputEnabled = true;
        
        // Configurazione dell'input (desktop e mobile)
        setupInputHandlers();
        
        // Aggiorna il prompt
        document.querySelector('.prompt').textContent = `root@anonberas:${terminalState.currentDir}# `;
        
        // Su mobile, apri automaticamente la tastiera
        if (isMobile) {
            setTimeout(() => {
                scrollToInput();
                hiddenInput.focus();
            }, 500);
        }
    };
    
    // Funzione per scorrere alla fine del terminale (utile su mobile con tastiera aperta)
    const scrollToInput = () => {
        setTimeout(() => {
            terminalContent.scrollTop = terminalContent.scrollHeight;
            // Aggiungi una piccola animazione per attirare l'attenzione sull'input
            if (isMobile) {
                cursor.style.animation = 'none';
                setTimeout(() => {
                    cursor.style.animation = 'blink 1s step-end infinite';
                }, 100);
            }
        }, 300);
    };
    
    // Configura handler di input unificato per evitare duplicazioni
    const setupInputHandlers = () => {
        // Utilizza solo l'input nascosto per la digitazione e previeni eventi duplicati
        hiddenInput.addEventListener('input', (e) => {
            if (!terminalState.inputEnabled) return;
            
            // Aggiorna solo il contenuto visibile
            commandInput.textContent = e.target.value;
            scrollToInput();
        });
        
        // Gestisci invio con l'input nascosto
        hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (terminalState.inputEnabled) {
                    const command = hiddenInput.value;
                    executeCommand(command);
                    commandInput.textContent = '';
                    hiddenInput.value = '';
                }
            }
        });
        
        // Tap sul terminale per attivare input
        terminal.addEventListener('click', () => {
            if (terminalState.inputEnabled) {
                hiddenInput.focus();
                scrollToInput();
            }
        });
        
        // Stili speciali per mobile
        if (isMobile) {
            terminal.classList.add('mobile-terminal');
            document.body.classList.add('mobile-device');
            
            // Gestisci focus/blur dell'input nascosto
            hiddenInput.addEventListener('focus', () => {
                // Quando l'input ottiene il focus, scorri in basso dopo un po'
                setTimeout(() => {
                    scrollToInput();
                }, 300);
            });
        }
    };

    // Esegui il comando inserito
    const executeCommand = async (command) => {
        // Aggiungi il comando all'output
        await addLine(`root@anonberas:${terminalState.currentDir}# ${command}`);
        
        // Dividi il comando in parti
        const parts = command.trim().split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        // Gestisci i diversi comandi
        switch (cmd) {
            case 'ls':
                handleLs();
                break;
            case 'cd':
                handleCd(args[0]);
                break;
            case 'bash':
            case './':
                handleBash(args[0] || '');
                break;
            case 'help':
                await addLine("Available commands: ls, cd, bash, help, clear");
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case '':
                // Ignora comando vuoto
                break;
            default:
                await addLine(`Command not found: ${cmd}`);
        }
        
        // Aggiorna il prompt dopo ogni comando
        document.querySelector('.prompt').textContent = `root@anonberas:${terminalState.currentDir}# `;
        
        // Rimetti il focus sull'input nascosto
        setTimeout(() => {
            hiddenInput.focus();
            scrollToInput();
        }, 100);
    };
    
    // Gestisce il comando ls
    const handleLs = async () => {
        const currentDirContent = terminalState.dirs[terminalState.currentDir] || [];
        if (currentDirContent.length > 0) {
            await addLine(currentDirContent.join('  '));
        }
    };
    
    // Gestisce il comando cd
    const handleCd = async (dir) => {
        if (!dir || dir === '~') {
            terminalState.currentDir = '~';
            return;
        }
        
        const currentDirContent = terminalState.dirs[terminalState.currentDir] || [];
        if (dir === '..') {
            if (terminalState.currentDir !== '~') {
                terminalState.currentDir = terminalState.currentDir.split('/').slice(0, -1).join('/');
            }
        } else if (currentDirContent.includes(dir)) {
            const newDir = terminalState.currentDir === '~' 
                ? `~/${dir}` 
                : `${terminalState.currentDir}/${dir}`;
            
            if (terminalState.dirs[newDir]) {
                terminalState.currentDir = newDir;
            } else {
                await addLine(`cd: ${dir}: Not a directory`);
            }
        } else {
            await addLine(`cd: ${dir}: No such file or directory`);
        }
    };
    
    // Gestisce il comando bash (o ./)
    const handleBash = async (file) => {
        const currentDirContent = terminalState.dirs[terminalState.currentDir] || [];
        
        // Controlla per il file secret.sh o anon-beras-project
        if (file === 'secret.sh' && currentDirContent.includes('secret.sh')) {
            await addLine("Executing secret script...");
            await new Promise(resolve => setTimeout(resolve, 800));
            await addLine("Unlocking secure content...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Termina il terminale e mostra il contenuto principale
            terminalState.inputEnabled = false;
            
            // Transizione al contenuto principale
            setTimeout(() => {
                terminal.style.transition = 'opacity 0.8s ease-out';
                terminal.style.opacity = '0';
                
                mainContent.classList.remove('hidden');
                mainContent.style.animation = 'fadeIn 1s ease-in-out';
                
                setTimeout(() => {
                    terminal.style.display = 'none';
                }, 800);
            }, 1000);
        } else if (file === 'anon-beras-project' && terminalState.currentDir === '~') {
            await addLine("Error: anon-beras-project is a directory, not an executable.");
            await addLine("Try 'cd anon-beras-project' to enter the directory.");
        } else {
            await addLine(`bash: ${file}: No such file or directory`);
        }
    };

    // Aggiungi stile per l'animazione di fade in
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .hidden-input {
            position: absolute;
            top: -9999px;
            left: -9999px;
            opacity: 0;
            height: 0;
        }
        
        /* Stili per il supporto mobile */
        .mobile-device #terminal-content {
            padding-bottom: 60px; /* Spazio extra per la tastiera */
        }
        
        .mobile-terminal #input-line {
            position: sticky;
            bottom: 0;
            background-color: #0d0d0d;
            padding: 10px 0;
            border-top: 1px solid #222;
            z-index: 10;
        }
    `;
    document.head.appendChild(style);

    // Avvia la sequenza quando il documento è pronto
    runWelcomeSequence();
}); 