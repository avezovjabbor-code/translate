// Dictionary & Offline Fallback Data
const DictionaryDB = {
    // Word definitions and synonyms (English, Uzbek, Russian)
    words: {
        "hello": {
            pos: "salomlashuv / noun",
            uz: "salom, assalomu alaykum",
            ru: "привет, здравствуйте",
            definition: "Used as a greeting or to begin a phone conversation.",
            synonyms: ["hi", "greetings", "hey", "welcome"],
            examples: [
                { src: "Hello! How are you doing today?", tr: "Salom! Bugun ahvollaringiz qanday?" },
                { src: "Say hello to your family.", tr: "Oilangizga salom ayting." }
            ]
        },
        "world": {
            pos: "ot / noun",
            uz: "dunyo, olam, yer yuzi",
            ru: "мир, Земля, свет",
            definition: "The earth, together with all of its countries, people, and natural features.",
            synonyms: ["earth", "globe", "planet", "realm"],
            examples: [
                { src: "Welcome to the online world.", tr: "Onlayn dunyoga xush kelibsiz." },
                { src: "Travel around the world.", tr: "Dunyo bo'ylab sayohat qiling." }
            ]
        },
        "love": {
            pos: "ot, fe'l / noun, verb",
            uz: "sevgi, muhabbat, sevmoq",
            ru: "любовь, любить",
            definition: "An intense feeling of deep affection or deep attraction.",
            synonyms: ["affection", "devotion", "adoration", "fondness"],
            examples: [
                { src: "I love reading books.", tr: "Men kitob o'qishni yaxshi ko'raman." },
                { src: "Love brings people together.", tr: "Sevgi insonlarni birlashtiradi." }
            ]
        },
        "friend": {
            pos: "ot / noun",
            uz: "do'st, o'rtoq, birodar",
            ru: "друг, товарищ",
            definition: "A person whom one knows and with whom one has a bond of mutual affection.",
            synonyms: ["companion", "buddy", "pal", "ally"],
            examples: [
                { src: "A true friend is always there for you.", tr: "Haqiqiy do'st har doim yonizda bo'ladi." }
            ]
        },
        "book": {
            pos: "ot / noun",
            uz: "kitob, daftar",
            ru: "книга",
            definition: "A written or printed work consisting of pages bound together.",
            synonyms: ["volume", "publication", "novel", "tome"],
            examples: [
                { src: "Knowledge is inside good books.", tr: "Bilim yaxshi kitoblar ichidadir." }
            ]
        },
        "computer": {
            pos: "ot / noun",
            uz: "kompyuter, elektron hisoblash mashinasi",
            ru: "компьютер, ЭВМ",
            definition: "An electronic device for storing and processing data.",
            synonyms: ["PC", "laptop", "processor", "workstation"],
            examples: [
                { src: "Modern computers process data rapidly.", tr: "Zamonaviy kompyuterlar ma'lumotlarni tez qayta ishlaydi." }
            ]
        },
        "salom": {
            pos: "salomlashuv",
            en: "hello, hi, greetings",
            ru: "привет, здравствуйте",
            definition: "Insonlar o'rtasidagi uchrashuvdagi samimiy murojaat.",
            synonyms: ["assalomu alaykum", "hush kelibsiz"],
            examples: [
                { src: "Salom! Qandaysiz?", tr: "Hello! How are you?" }
            ]
        },
        "katta rahmat": {
            pos: "ibora / phrase",
            en: "thank you very much, thanks a lot",
            ru: "большое спасибо",
            definition: "Minnatdorchilik bildirish iborasi.",
            synonyms: ["tashakkur", "tashakkur bildiraman"],
            examples: [
                { src: "Yordamingiz uchun katta rahmat!", tr: "Thank you very much for your help!" }
            ]
        }
    },

    // Offline common sentence mapping fallback
    offlineSentences: {
        "en-uz": {
            "hello": "Salom",
            "hello world": "Salom dunyo",
            "how are you": "Qandaysiz? / Ahvollaringiz qanday?",
            "good morning": "Xayrli tong",
            "good evening": "Xayrli kech",
            "good night": "Xayrli tun",
            "thank you": "Rahmat / Tashakkur",
            "thank you very much": "Katta rahmat",
            "you are welcome": "Arzimaydi",
            "please": "Iltimos",
            "yes": "Ha",
            "no": "Yo'q",
            "goodbye": "Xayr / Ko'rishguncha",
            "what is your name": "Ismingiz nima?",
            "my name is": "Mening ismim...",
            "nice to meet you": "Tanishganimdan xursandman",
            "where are you from": "Qayerdansiz?",
            "i love you": "Men seni sevaman",
            "help": "Yordam bering",
            "how much is this": "Bu qancha turadi?",
            "sorry": "Kechirasiz / Uzr"
        },
        "uz-en": {
            "salom": "Hello / Hi",
            "salom dunyo": "Hello world",
            "qandaysiz": "How are you?",
            "xayrli tong": "Good morning",
            "xayrli kech": "Good evening",
            "xayrli tun": "Good night",
            "rahmat": "Thank you",
            "katta rahmat": "Thank you very much",
            "arzimaydi": "You are welcome",
            "iltimos": "Please",
            "ha": "Yes",
            "yo'q": "No",
            "xayr": "Goodbye",
            "ismingiz nima": "What is your name?",
            "mening ismim": "My name is...",
            "tanishganimdan xursandman": "Nice to meet you",
            "qayerdansiz": "Where are you from?",
            "men seni sevaman": "I love you",
            "yordam bering": "Help me",
            "bu qancha turadi": "How much is this?",
            "kechirasiz": "Excuse me / Sorry"
        },
        "en-ru": {
            "hello": "Привет / Здравствуйте",
            "hello world": "Привет мир",
            "how are you": "Как дела?",
            "good morning": "Доброе утро",
            "good evening": "Добрый вечер",
            "good night": "Спокойной ночи",
            "thank you": "Спасибо",
            "thank you very much": "Большое спасибо",
            "you are welcome": "Пожалуйста",
            "please": "Пожалуйста",
            "yes": "Да",
            "no": "Нет",
            "goodbye": "До свидания",
            "what is your name": "Как вас зовут?",
            "nice to meet you": "Приятно познакомиться"
        },
        "ru-uz": {
            "привет": "Salom",
            "здравствуйте": "Assalomu alaykum / Salom",
            "как дела": "Qandaysiz? / Ishlar qanday?",
            "доброе утро": "Xayrli tong",
            "добрый вечер": "Xayrli kech",
            "спокойной ночи": "Xayrli tun",
            "спасибо": "Rahmat",
            "большое спасибо": "Katta rahmat",
            "пожалуйста": "Iltimos / Arzimaydi",
            "да": "Ha",
            "нет": "Yo'q",
            "до свидания": "Xayr / Ko'rishguncha",
            "как вас зовут": "Ismingiz nima?",
            "приятно познакомиться": "Tanishganimdan xursandman"
        }
    }
};
