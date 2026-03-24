// Configuração da API (LibreTranslate - gratuito)
const API_URL = 'https://translate.googleapis.com/translate_a/single';

// Elementos DOM
const textoOrigem = document.getElementById('textoOrigem');
const textoDestino = document.getElementById('textoDestino');
const idiomaOrigem = document.getElementById('idiomaOrigem');
const idiomaDestino = document.getElementById('idiomaDestino');
const btnTrocar = document.getElementById('btnTrocar');
const btnLimpar = document.getElementById('btnLimpar');
const btnCopiar = document.getElementById('btnCopiar');
const btnMicrofoneOrigem = document.getElementById('btnMicrofoneOrigem');
const btnOuvir = document.getElementById('btnOuvir');
const contadorCaracteres = document.getElementById('contadorCaracteres');
const loading = document.getElementById('loading');

let timeoutId = null;

// Função para traduzir usando API do Google Translate
async function traduzir(texto, origem, destino) {
    if (!texto || texto.trim() === '') {
        textoDestino.innerHTML = 'Tradução aparecerá aqui...';
        return;
    }

    try {
        loading.classList.add('active');
        
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${origem}&tl=${destino}&dt=t&q=${encodeURIComponent(texto)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data[0]) {
            const traducao = data[0].map(item => item[0]).join('');
            textoDestino.innerHTML = traducao;
        } else {
            textoDestino.innerHTML = 'Erro na tradução. Tente novamente.';
        }
    } catch (error) {
        console.error('Erro na tradução:', error);
        textoDestino.innerHTML = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } finally {
        loading.classList.remove('active');
    }
}

// Função com debounce para tradução automática
function traduzirComDelay() {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
        const texto = textoOrigem.value;
        const origem = idiomaOrigem.value;
        const destino = idiomaDestino.value;
        
        if (texto.trim() !== '') {
            traduzir(texto, origem, destino);
        } else {
            textoDestino.innerHTML = 'Tradução aparecerá aqui...';
        }
    }, 500);
}

// Evento de digitação (tradução automática)
textoOrigem.addEventListener('input', () => {
    // Contador de caracteres
    const contagem = textoOrigem.value.length;
    contadorCaracteres.textContent = `${contagem} / 5000`;
    
    // Limite de 5000 caracteres
    if (contagem > 5000) {
        textoOrigem.value = textoOrigem.value.substring(0, 5000);
        contadorCaracteres.textContent = '5000 / 5000';
    }
    
    traduzirComDelay();
});

// Trocar idiomas
btnTrocar.addEventListener('click', () => {
    const origemTemp = idiomaOrigem.value;
    const destinoTemp = idiomaDestino.value;
    
    idiomaOrigem.value = destinoTemp;
    idiomaDestino.value = origemTemp;
    
    // Reverte os textos também
    const textoAtual = textoOrigem.value;
    const traducaoAtual = textoDestino.innerHTML;
    
    if (textoAtual && traducaoAtual && traducaoAtual !== 'Tradução aparecerá aqui...') {
        textoOrigem.value = traducaoAtual;
        textoDestino.innerHTML = textoAtual;
    }
    
    traduzirComDelay();
});

// Limpar texto
btnLimpar.addEventListener('click', () => {
    textoOrigem.value = '';
    textoDestino.innerHTML = 'Tradução aparecerá aqui...';
    contadorCaracteres.textContent = '0 / 5000';
    traduzirComDelay();
});

// Copiar tradução
btnCopiar.addEventListener('click', async () => {
    const textoParaCopiar = textoDestino.innerText;
    
    if (textoParaCopiar && textoParaCopiar !== 'Tradução aparecerá aqui...') {
        try {
            await navigator.clipboard.writeText(textoParaCopiar);
            
            // Feedback visual
            const originalText = btnCopiar.textContent;
            btnCopiar.textContent = '✓ Copiado!';
            setTimeout(() => {
                btnCopiar.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
            alert('Não foi possível copiar o texto.');
        }
    }
});

// Microfone (reconhecimento de voz)
function iniciarReconhecimentoVoz() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Define o idioma baseado no idioma de origem selecionado
        const idiomas = {
            'pt': 'pt-BR',
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ru': 'ru-RU'
        };
        
        recognition.lang = idiomas[idiomaOrigem.value] || 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Feedback visual
        btnMicrofoneOrigem.style.background = '#e9ecef';
        btnMicrofoneOrigem.style.transform = 'scale(1.1)';
        
        recognition.start();
        
        recognition.onresult = (event) => {
            const fala = event.results[0][0].transcript;
            textoOrigem.value = fala;
            traduzirComDelay();
            
            // Atualiza contador
            contadorCaracteres.textContent = `${fala.length} / 5000`;
        };
        
        recognition.onerror = (event) => {
            console.error('Erro no reconhecimento:', event.error);
            if (event.error !== 'not-allowed') {
                alert('Não foi possível capturar o áudio. Verifique o microfone e tente novamente.');
            }
        };
        
        recognition.onend = () => {
            btnMicrofoneOrigem.style.background = '';
            btnMicrofoneOrigem.style.transform = '';
        };
    } else {
        alert('Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.');
    }
}

btnMicrofoneOrigem.addEventListener('click', iniciarReconhecimentoVoz);

// Texto para voz (ouvir tradução)
function falarTraducao() {
    const texto = textoDestino.innerText;
    
    if (!texto || texto === 'Tradução aparecerá aqui...') {
        alert('Nada para ouvir. Traduza um texto primeiro.');
        return;
    }
    
    if ('speechSynthesis' in window) {
        // Para qualquer fala em andamento
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(texto);
        
        // Define o idioma da fala baseado no idioma de destino
        const idiomasVoz = {
            'pt': 'pt-BR',
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ru': 'ru-RU'
        };
        
        utterance.lang = idiomasVoz[idiomaDestino.value] || 'pt-BR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Feedback visual
        btnOuvir.style.background = '#e9ecef';
        
        utterance.onend = () => {
            btnOuvir.style.background = '';
        };
        
        utterance.onerror = () => {
            btnOuvir.style.background = '';
            alert('Erro ao reproduzir áudio.');
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Seu navegador não suporta síntese de voz.');
    }
}

btnOuvir.addEventListener('click', falarTraducao);

// Atalho de teclado (Ctrl + Enter para traduzir manualmente)
textoOrigem.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        const texto = textoOrigem.value;
        const origem = idiomaOrigem.value;
        const destino = idiomaDestino.value;
        traduzir(texto, origem, destino);
    }
});

// Detectar mudança de idioma
idiomaOrigem.addEventListener('change', () => {
    traduzirComDelay();
});

idiomaDestino.addEventListener('change', () => {
    traduzirComDelay();
});

// Inicialização
console.log('Tradutor pronto!');