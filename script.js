// ==========================================
// 1. TWOJA KONFIGURACJA FIREBASE (BEZ ZMIAN)
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==========================================
// 2. FUNKCJA CZYSZCZENIA STARYCH WIADOMOŚCI (NOWOŚĆ)
// ==========================================
function cleanupChat() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 60 minut w milisekundach

    db.ref("wiadomosci").once("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            // Jeśli wiadomość jest starsza niż godzina, usuń ją
            if (now - msg.czas > oneHour) {
                childSnapshot.ref.remove();
            }
        });
    });
}

// ==========================================
// 3. LOGIKA CZATU NA ŻYWO
// ==========================================

// Wyświetlanie wiadomości
db.ref("wiadomosci").limitToLast(50).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const messages = document.getElementById('chat-messages');
    
    const msg = document.createElement('p');
    msg.style.margin = "5px 0";
    msg.style.wordBreak = "break-word";
    msg.innerHTML = `<strong>Anonim:</strong> ${dane.tekst}`;
    
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
});

// Wysyłanie wiadomości
function sendMessage() {
    const input = document.getElementById('chat-input');
    if (input.value.trim() !== "") {
        cleanupChat(); // Posprzątaj przy okazji wysyłania
        db.ref("wiadomosci").push({
            tekst: input.value,
            czas: Date.now()
        });
        input.value = "";
    }
}

// Obsługa ENTER
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if(input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

// ==========================================
// 4. SYSTEM ZEGARA, ODLICZANIA I BARKI
// ==========================================

window.onload = function() {
    cleanupChat(); // Posprzątaj zaraz po wejściu na stronę
    
    const messages = document.getElementById('chat-messages');
    const systemMsg = document.createElement('p');
    systemMsg.className = 'system-msg';
    systemMsg.innerHTML = `<strong>System:</strong> Połączono. Wiadomości starsze niż 1h są usuwane.`;
    messages.appendChild(systemMsg);
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
        audio.play().catch(() => console.log("Kliknij na stronę!"));
    }
}

setInterval(updateEverything, 1000);
updateEverything();