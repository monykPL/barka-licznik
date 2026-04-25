// ==========================================
// 1. TWOJA KONFIGURACJA FIREBASE (Wklejona automatycznie)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDgn4ux6ZJyFbxbG-aB-kv9GjNqfPJUiSw",
  authDomain: "monyk-czat.firebaseapp.com",
  databaseURL: "https://monyk-czat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "monyk-czat",
  storageBucket: "monyk-czat.firebasestorage.app",
  messagingSenderId: "39641097299",
  appId: "1:39641097299:web:aac07712b25e2b501652a6",
  measurementId: "G-SZ8E653FZW"
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==========================================
// 2. FUNKCJA CZYSZCZENIA CZATU (Starsze niż 1h)
// ==========================================
function cleanupChat() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 60 minut

    db.ref("wiadomosci").once("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            if (now - msg.czas > oneHour) {
                childSnapshot.ref.remove();
            }
        });
    });
}

// ==========================================
// 3. LOGIKA CZATU NA ŻYWO
// ==========================================

// Słuchacz bazy: wyświetl wiadomość jak ktoś napisze
db.ref("wiadomosci").limitToLast(50).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const messages = document.getElementById('chat-messages');
    
    const msg = document.createElement('p');
    msg.style.margin = "5px 0";
    msg.style.wordBreak = "break-word";
    msg.innerHTML = `<strong>Anonim:</strong> ${dane.tekst}`;
    
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll
});

// Funkcja wysyłania
function sendMessage() {
    const input = document.getElementById('chat-input');
    if (input.value.trim() !== "") {
        cleanupChat(); // Posprzątaj przy okazji
        db.ref("wiadomosci").push({
            tekst: input.value,
            czas: Date.now()
        });
        input.value = "";
    }
}

// Obsługa klawisza ENTER
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if(input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

// ==========================================
// 4. NOWOŚĆ: TESTOWANIE I ODBLOKOWYWANIE DŹWIĘKU
// ==========================================
document.getElementById('test-audio-btn').addEventListener('click', function() {
    testAudio();
});

function testAudio() {
    const audio = document.getElementById('barka-audio');
    const btn = document.getElementById('test-audio-btn');
    
    // Próba odtworzenia dźwięku
    audio.play().then(() => {
        // Jeśli się udało, dźwięk jest ODBLOKOWANY.
        alert("Dźwięk przetestowany. Baza danych została połączona.");
        // Ukrywamy przycisk, bo już nie jest potrzebny
        btn.style.display = 'none';
        
        // Wykonujemy połączenie systemowe w czacie
        const messages = document.getElementById('chat-messages');
        const systemMsg = document.createElement('p');
        systemMsg.className = 'system-msg';
        systemMsg.innerHTML = `<strong>System:</strong> Połączono z czatem. Odblokowano dźwięk.`;
        messages.appendChild(systemMsg);
        
    }).catch((error) => {
        // Jeśli się nie udało (np. brak pliku)
        console.log("Błąd testu audio:", error);
        alert("Dźwięk nie działa! Sprawdź czy plik 'barka.mp3' jest na GitHubie.");
    });
}


// ==========================================
// 5. SYSTEM ZEGARA, ODLICZANIA I BARKI
// ==========================================

window.onload = function() {
    cleanupChat(); // Posprzątaj czat po wejściu
};

function updateEverything() {
    const now = new Date();
    
    // Mały zegarek
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const smallClock = document.getElementById('small-clock');
    if(smallClock) smallClock.innerText = `${h}:${m}:${s}`;

    // Odliczanie do 21:37
    let target = new Date();
    target.setHours(21, 37, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);

    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');
    if(countdownElement) {
        countdownElement.innerText = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // 21:37:00 - Aktywacja
    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) {
        activatePapalMode();
    }
}

function activatePapalMode() {
    const body = document.getElementById('bg-body');
    const audio = document.getElementById('barka-audio');
    
    if(body) body.classList.add('yellow-mode');
    if(audio) {
        // Ponieważ dźwięk został odblokowany przyciskiem testowym, to zadziała!
        audio.play().catch(() => {
            // Plan awaryjny - jeśli kliknięcie testowe zawiodło
            alert("Barka powinna grać! Kliknij 'OK' aby ją włączyć.");
            audio.play();
        });
    }
}

// Pętla odświeżająca
setInterval(updateEverything, 1000);
updateEverything();
