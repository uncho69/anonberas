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
        document.addEventListener('keydown', handleKeydown);
        
        // Aggiorna il prompt
        document.querySelector('.prompt').textContent = `root@anonberas:${terminalState.currentDir}# `;
        
        // Aggiungi tap handler per dispositivi mobili
        setupMobileSupport();
    };
    
    // Configurazione per dispositivi mobili
    const setupMobileSupport = () => {
        // Tap sul terminale per attivare input
        terminal.addEventListener('click', () => {
            if (terminalState.inputEnabled) {
                hiddenInput.focus();
            }
        });
        
        // Gestisci input da dispositivi mobili
        hiddenInput.addEventListener('input', (e) => {
            if (!terminalState.inputEnabled) return;
            commandInput.textContent = e.target.value;
        });
        
        // Gestisci invio da dispositivi mobili
        hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (terminalState.inputEnabled) {
                    executeCommand(commandInput.textContent);
                    commandInput.textContent = '';
                    hiddenInput.value = '';
                }
            }
        });
    };

    // Gestisci i tasti premuti
    const handleKeydown = (e) => {
        if (!terminalState.inputEnabled) return;
        
        // Ignora alcuni tasti di controllo
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        if (e.key === 'Enter') {
            // Esegui il comando quando si preme Enter
            executeCommand(commandInput.textContent);
            commandInput.textContent = '';
            hiddenInput.value = '';
        } else if (e.key === 'Backspace') {
            // Gestisci il tasto backspace
            if (commandInput.textContent.length > 0) {
                commandInput.textContent = commandInput.textContent.slice(0, -1);
                hiddenInput.value = commandInput.textContent;
            }
            // Non prevenire il default qui per permettere il funzionamento su mobile
        } else if (e.key.length === 1) {
            // Aggiungi il carattere digitato
            commandInput.textContent += e.key;
            hiddenInput.value = commandInput.textContent;
        }
        
        // Auto-scroll alla fine del terminale
        terminalContent.scrollTop = terminalContent.scrollHeight;
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
        
        // Rimetti il focus sull'input nascosto per dispositivi mobili
        hiddenInput.focus();
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
            document.removeEventListener('keydown', handleKeydown);
            
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
    `;
    document.head.appendChild(style);

    // Avvia la sequenza quando il documento è pronto
    runWelcomeSequence();
}); 