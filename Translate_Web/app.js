// Application Logic for Translate Web App

document.addEventListener('DOMContentLoaded', () => {
    // Language Codes & Names
    const LANGUAGES = {
        'auto': 'Avto Aniqlash (Auto)',
        'uz': 'O\'zbekcha',
        'en': 'English (Inglizcha)',
        'ru': 'Русский (Ruscha)',
        'tr': 'Türkçe (Turkcha)',
        'de': 'Deutsch (Nemischa)',
        'fr': 'Français (Fransuzcha)',
        'es': 'Español (Ispancha)',
        'it': 'Italiano (Italyancha)',
        'ko': '한국어 (Koreyscha)',
        'ja': '日本語 (Yaponcha)',
        'zh': '中文 (Xitoycha)',
        'ar': 'العربية (Arabcha)',
        'pt': 'Português (Portugalcha)',
        'hi': 'हिन्दी (Hindcha)',
        'fa': 'فارسی (Forscha)',
        'kk': 'Қазақша (Qozoqcha)',
        'ky': 'Кыргызча (Qirg\'izcha)',
        'tg': 'Тоҷикӣ (Tojikcha)'
    };

    // DOM Elements
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceSelect = document.getElementById('sourceLangSelect');
    const targetSelect = document.getElementById('targetLangSelect');
    const swapBtn = document.getElementById('swapBtn');
    const charCounter = document.getElementById('charCounter');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const speakSourceBtn = document.getElementById('speakSourceBtn');
    const speakTargetBtn = document.getElementById('speakTargetBtn');
    const micBtn = document.getElementById('micBtn');
    const starBtn = document.getElementById('starBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const themeBtn = document.getElementById('themeBtn');
    const historyList = document.getElementById('historyList');
    const historySearch = document.getElementById('historySearch');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const fileInput = document.getElementById('fileInput');

    // State Variables
    let currentSourceLang = 'auto';
    let currentTargetLang = 'en';
    let debounceTimer = null;
    let historyData = JSON.parse(localStorage.getItem('tr_history') || '[]');
    let favoritesData = JSON.parse(localStorage.getItem('tr_favorites') || '[]');

    // Initialize Dropdowns
    function initLanguageDropdowns() {
        sourceSelect.innerHTML = '';
        targetSelect.innerHTML = '';

        Object.entries(LANGUAGES).forEach(([code, name]) => {
            const optSource = document.createElement('option');
            optSource.value = code;
            optSource.textContent = name;
            if (code === currentSourceLang) optSource.selected = true;
            sourceSelect.appendChild(optSource);

            if (code !== 'auto') {
                const optTarget = document.createElement('option');
                optTarget.value = code;
                optTarget.textContent = name;
                if (code === currentTargetLang) optTarget.selected = true;
                targetSelect.appendChild(optTarget);
            }
        });
    }

    // Set Active Quick Tab Highlight
    function updateActiveTabs() {
        document.querySelectorAll('#sourceTabs .lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentSourceLang);
        });
        document.querySelectorAll('#targetTabs .lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentTargetLang);
        });
        sourceSelect.value = currentSourceLang;
        targetSelect.value = currentTargetLang;
    }

    // Main Translation Engine
    async function translateText() {
        const text = sourceText.value.trim();
        if (!text) {
            targetText.textContent = '';
            targetText.classList.add('placeholder');
            targetText.textContent = 'Tarjima shu yerda paydo bo\'ladi...';
            clearDictionaryCard();
            return;
        }

        targetText.classList.remove('placeholder');
        targetText.innerHTML = '<span class="loading-spinner">⏳ Tarjima qilinmoqda...</span>';

        const src = currentSourceLang === 'auto' ? 'autodetect' : currentSourceLang;
        const tgt = currentTargetLang;

        // Try Online API (MyMemory)
        try {
            const langpair = `${src === 'autodetect' ? 'en' : src}|${tgt}`;
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`);
            const data = await res.json();

            if (data && data.responseData && data.responseData.translatedText) {
                let resultText = data.responseData.translatedText;
                
                // Clean HTML entities if any
                const txtDoc = new DOMParser().parseFromString(resultText, 'text/html');
                resultText = txtDoc.body.textContent;

                targetText.textContent = resultText;
                saveToHistory(text, resultText, currentSourceLang, currentTargetLang);
                checkDictionaryWord(text);
                return;
            }
        } catch (err) {
            console.warn('Online API 1 failed, trying fallback...', err);
        }

        // Try Fallback Online API (Google GTX)
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src === 'autodetect' ? 'auto' : src}&tl=${tgt}&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            if (data && data[0]) {
                const resultText = data[0].map(item => item[0]).join('');
                targetText.textContent = resultText;
                saveToHistory(text, resultText, currentSourceLang, currentTargetLang);
                checkDictionaryWord(text);
                return;
            }
        } catch (err) {
            console.warn('Online API 2 failed, trying offline database...', err);
        }

        // Fallback to Offline Dictionary Match
        const offlineKey = `${src === 'autodetect' ? 'en' : src}-${tgt}`;
        const lowerText = text.toLowerCase();
        if (typeof DictionaryDB !== 'undefined' && DictionaryDB.offlineSentences[offlineKey] && DictionaryDB.offlineSentences[offlineKey][lowerText]) {
            const resultText = DictionaryDB.offlineSentences[offlineKey][lowerText];
            targetText.textContent = resultText;
            saveToHistory(text, resultText, currentSourceLang, currentTargetLang);
            checkDictionaryWord(text);
            return;
        }

        targetText.textContent = text + ' (Oflayn rejimda tarjima topilmadi)';
    }

    // Dictionary Lookup Feature
    function checkDictionaryWord(text) {
        if (typeof DictionaryDB === 'undefined') return;
        const cleanWord = text.trim().toLowerCase();
        const wordInfo = DictionaryDB.words[cleanWord];

        const dictContainer = document.getElementById('dictCardBody');
        if (!dictContainer) return;

        if (wordInfo) {
            let synHTML = '';
            if (wordInfo.synonyms) {
                synHTML = wordInfo.synonyms.map(s => `<span class="synonym-chip">${s}</span>`).join(' ');
            }

            let exHTML = '';
            if (wordInfo.examples) {
                exHTML = wordInfo.examples.map(ex => `
                    <div class="example-item">
                        <div class="src">${ex.src}</div>
                        <div class="tr">${ex.tr}</div>
                    </div>
                `).join('');
            }

            dictContainer.innerHTML = `
                <div class="dict-word-title">${cleanWord}</div>
                <div class="dict-pos">${wordInfo.pos}</div>
                <div class="dict-def">${wordInfo.definition}</div>
                ${synHTML ? `<div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:4px;">Sinonimlar:</div><div class="synonyms-list">${synHTML}</div>` : ''}
                ${exHTML ? `<div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:4px;">Misollar:</div><div class="examples-list">${exHTML}</div>` : ''}
            `;
        } else {
            clearDictionaryCard();
        }
    }

    function clearDictionaryCard() {
        const dictContainer = document.getElementById('dictCardBody');
        if (dictContainer) {
            dictContainer.innerHTML = `
                <div style="color:var(--text-dim); font-size:0.9rem; font-style:italic; padding-top:20px;">
                    So'z yoki qisqa ibora kiritsangiz, uning sinonimlari, izohli lug'ati va misollari shu yerda ko'rinadi.
                </div>
            `;
        }
    }

    // Save & Render History
    function saveToHistory(srcTxt, trTxt, srcL, tgtL) {
        if (!srcTxt || !trTxt) return;
        const existingIndex = historyData.findIndex(h => h.src === srcTxt && h.tgtL === tgtL);
        if (existingIndex > -1) {
            historyData.splice(existingIndex, 1);
        }

        historyData.unshift({
            id: Date.now(),
            src: srcTxt,
            tr: trTxt,
            srcL: srcL,
            tgtL: tgtL,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        if (historyData.length > 50) historyData.pop();
        localStorage.setItem('tr_history', JSON.stringify(historyData));
        renderHistory();
    }

    function renderHistory(query = '') {
        if (!historyList) return;
        historyList.innerHTML = '';

        const filtered = historyData.filter(item => 
            item.src.toLowerCase().includes(query.toLowerCase()) || 
            item.tr.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            historyList.innerHTML = `
                <div style="color:var(--text-dim); text-align:center; padding:20px; font-size:0.9rem;">
                    Tarjimolar tarixi bo'sh.
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="history-content">
                    <div class="history-src">${escapeHTML(item.src)}</div>
                    <div class="history-tr">${escapeHTML(item.tr)}</div>
                    <div class="history-meta">${item.srcL.toUpperCase()} ➔ ${item.tgtL.toUpperCase()} • ${item.time}</div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="action-btn" title="Kiritish" onclick="insertFromHistory('${escapeHTML(item.src)}')">📋</button>
                </div>
            `;
            historyList.appendChild(card);
        });
    }

    window.insertFromHistory = (txt) => {
        sourceText.value = txt;
        charCounter.textContent = `${txt.length} / 5000`;
        translateText();
        showToast('Matn kiritildi!');
    };

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // Text to Speech
    function speakText(text, langCode) {
        if (!('speechSynthesis' in window)) {
            showToast('Brauzeringizda ovozli o\'qish qo\'llab-quvvatlanmaydi.');
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode === 'auto' ? 'en-US' : langCode;
        window.speechSynthesis.speak(utterance);
        showToast('Ovozli o\'qilmoqda... 🔊');
    }

    // Speech Recognition (Microphone)
    function startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast('Brauzeringiz ovozli kirishni (Microphone) qo\'llab-quvvatlamaydi.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = currentSourceLang === 'auto' ? 'en-US' : currentSourceLang;
        recognition.interimResults = false;

        micBtn.classList.add('active-mic');
        showToast('Eshitilmoqda... Ovoz bering 🎙️');

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            sourceText.value = transcript;
            charCounter.textContent = `${transcript.length} / 5000`;
            micBtn.classList.remove('active-mic');
            translateText();
        };

        recognition.onerror = () => {
            micBtn.classList.remove('active-mic');
            showToast('Ovozni aniqlab bo\'lmadi.');
        };

        recognition.onend = () => {
            micBtn.classList.remove('active-mic');
        };

        recognition.start();
    }

    // Toast Notification System
    function showToast(msg) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `✨ ${msg}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    }

    // Event Listeners
    initLanguageDropdowns();
    updateActiveTabs();
    renderHistory();

    sourceText.addEventListener('input', () => {
        const len = sourceText.value.length;
        charCounter.textContent = `${len} / 5000`;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(translateText, 350);
    });

    // Language Selection Tabs
    document.querySelectorAll('#sourceTabs .lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSourceLang = btn.dataset.lang;
            updateActiveTabs();
            translateText();
        });
    });

    document.querySelectorAll('#targetTabs .lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTargetLang = btn.dataset.lang;
            updateActiveTabs();
            translateText();
        });
    });

    sourceSelect.addEventListener('change', (e) => {
        currentSourceLang = e.target.value;
        updateActiveTabs();
        translateText();
    });

    targetSelect.addEventListener('change', (e) => {
        currentTargetLang = e.target.value;
        updateActiveTabs();
        translateText();
    });

    // Swap Languages
    swapBtn.addEventListener('click', () => {
        if (currentSourceLang === 'auto') {
            currentSourceLang = 'uz';
        }
        const temp = currentSourceLang;
        currentSourceLang = currentTargetLang;
        currentTargetLang = temp;

        const tempTxt = sourceText.value;
        sourceText.value = targetText.textContent !== 'Tarjima shu yerda paydo bo\'ladi...' ? targetText.textContent : '';
        
        updateActiveTabs();
        translateText();
        showToast('Tillar almashindi!');
    });

    // Action Buttons
    clearBtn.addEventListener('click', () => {
        sourceText.value = '';
        targetText.textContent = 'Tarjima shu yerda paydo bo\'ladi...';
        targetText.classList.add('placeholder');
        charCounter.textContent = '0 / 5000';
        clearDictionaryCard();
    });

    copyBtn.addEventListener('click', () => {
        const txt = targetText.textContent;
        if (txt && txt !== 'Tarjima shu yerda paydo bo\'ladi...') {
            navigator.clipboard.writeText(txt);
            showToast('Nusxalandi! 📋');
        }
    });

    speakSourceBtn.addEventListener('click', () => {
        if (sourceText.value) speakText(sourceText.value, currentSourceLang);
    });

    speakTargetBtn.addEventListener('click', () => {
        const txt = targetText.textContent;
        if (txt && txt !== 'Tarjima shu yerda paydo bo\'ladi...') {
            speakText(txt, currentTargetLang);
        }
    });

    micBtn.addEventListener('click', startVoiceInput);

    // Download TXT
    downloadBtn.addEventListener('click', () => {
        const txt = targetText.textContent;
        if (!txt || txt === 'Tarjima shu yerda paydo bo\'ladi...') return;
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tarjima_${Date.now()}.txt`;
        a.click();
        showToast('Fayl yuklab olindi! 📥');
    });

    // Upload Text File
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    sourceText.value = evt.target.result;
                    charCounter.textContent = `${evt.target.result.length} / 5000`;
                    translateText();
                    showToast('Fayl matni yuklandi! 📁');
                };
                reader.readAsText(file);
            }
        });
    }

    // History Actions
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            historyData = [];
            localStorage.removeItem('tr_history');
            renderHistory();
            showToast('Tarix tozalandi!');
        });
    }

    if (historySearch) {
        historySearch.addEventListener('input', (e) => {
            renderHistory(e.target.value);
        });
    }

    // Theme Toggle
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        showToast(`${newTheme === 'dark' ? 'Qorong\'u' : 'Yorug\''} rejim yoqildi`);
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateText();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            swapBtn.click();
        } else if (e.key === 'Escape' && document.activeElement === sourceText) {
            clearBtn.click();
        }
    });

    // Render Phrasebook Categories
    function renderPhrasebook() {
        const categoryContainer = document.getElementById('phraseCatList');
        const phraseContainer = document.getElementById('phraseItemsList');

        if (!categoryContainer || !phraseContainer || typeof PhrasebookData === 'undefined') return;

        categoryContainer.innerHTML = '';
        PhrasebookData.forEach((cat, idx) => {
            const btn = document.createElement('button');
            btn.className = `cat-btn ${idx === 0 ? 'active' : ''}`;
            btn.textContent = cat.category;
            btn.onclick = () => {
                document.querySelectorAll('#phraseCatList .cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPhrasesList(cat.items);
            };
            categoryContainer.appendChild(btn);
        });

        renderPhrasesList(PhrasebookData[0].items);
    }

    function renderPhrasesList(items) {
        const phraseContainer = document.getElementById('phraseItemsList');
        phraseContainer.innerHTML = '';

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'phrase-item';
            div.innerHTML = `
                <div>
                    <div class="phrase-txt">${item.text}</div>
                    <div class="phrase-tr">EN: ${item.en} | RU: ${item.ru}</div>
                </div>
                <button class="action-btn" title="Tarjimaga joylash">➡️</button>
            `;
            div.onclick = () => {
                sourceText.value = item.text;
                charCounter.textContent = `${item.text.length} / 5000`;
                translateText();
                showToast('Ibora matnga joylandi!');
            };
            phraseContainer.appendChild(div);
        });
    }

    renderPhrasebook();
});
