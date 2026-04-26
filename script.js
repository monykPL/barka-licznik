// --- ZMIENNE GLOBALNE ---
let strobeInterval = null;
let confettiInterval = null;
let isPartyMode = false;

// --- 1. KONFIGURACJA FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDgn4ux6ZJyFbxbG-aB-kv9GjNqfPJUiSw",
    authDomain: "monyk-czat.firebaseapp.com",
    databaseURL: "https://monyk-czat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "monyk-czat",
    storageBucket: "monyk-czat.firebasestorage.app",
    messagingSenderId: "39641097299",
    appId: "1:39641097299:web:aac07712b25e2b501652a6"
};

// Bezpieczna inicjalizacja Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (e) {
    console.error("Błąd Firebase:", e);
}
const db = firebase.database();

// --- 2. FUNKCJE EFEKTÓW ---
function startBarkaEffect() {
    const audio = document.getElementById('barka-audio');
    const bg = document.getElementById('bg-body');
    
    // Tworzenie warstwy migającej (Overlay)
    let overlay = document.getElementById('party-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'party-overlay';
        overlay.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;zIndex:-1;pointerEvents:none;";
        document.body.appendChild(overlay);
    }

    if (bg) bg.classList.add('yellow-mode');
    overlay.style.backgroundColor = "#f1c40f";

    if (isPartyMode) {
        if (strobeInterval) clearInterval(strobeInterval);
        let flash = false;
        strobeInterval = setInterval(() => {
            overlay.style.backgroundColor = flash ? "#ffffff" : "#f1c40f";
            flash = !flash;
        }, 100);
    }

    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => {
        if (typeof confetti === 'function') {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
        }
    }, 250);

    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio wymaga kliknięcia na stronie"));
    }
}

function stopBarkaEffect() {
    if (strobeInterval) clearInterval(strobeInterval);
    if (confettiInterval) clearInterval(confettiInterval);
    const overlay = document.getElementById('party-overlay');
    if (overlay) overlay.style.backgroundColor = "transparent";
    const bg = document.getElementById('bg-body');
    if (bg) bg.classList.remove('yellow-mode');
}

// --- 3. OBSŁUGA CZATU ---
db.ref("wiadomosci").limitToLast(15).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
        const msg = document.createElement("div");
        msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Obsługa komendy /test
    if (dane.tekst === "/test" && (Date.now() - dane.czas < 5000)) {
        startBarkaEffect();
    }
});

// Funkcja wysyłania (dostępna globalnie)
window.sendMsg = function() {
    const nickEl = document.getElementById("nick");
    const tekstEl = document.getElementById("tekst");
    if (!tekstEl || !tekstEl.value) return;

    db.ref("wiadomosci").push({
        autor: nickEl ? (nickEl.value || "Anonim") : "Anonim",
        tekst: tekstEl.value,
        czas: Date.now()
    });
    tekstEl.value = "";
};

// --- 4. LICZNIK I PRZYCISKI ---
window.toggleParty = function() {
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    if (btn) {
        btn.innerText = `Impreza: ${isPartyMode ? "ON" : "OFF"}`;
        btn.style.background = isPartyMode ? "#2ecc71" : "#e74c3c";
    }
};

function updateTimer() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return; // Jeśli nie ma timera w HTML, nie rób nic (zapobiega crashowi)

    const now = new Date();
    const polandTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Warsaw"}));
    let target = new Date(polandTime);
    target.setHours(21, 37, 0, 0);

    if (polandTime > target) target.setDate(target.getDate() + 1);

    const diff = target - polandTime;
    if (diff > 0 && diff < 1000) startBarkaEffect();

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    timerEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Uruchomienie pętli
setInterval(updateTimer, 1000);

// Obsługa piosenki
const audioEl = document.getElementById('barka-audio');
if (audioEl) audioEl.onended = stopBarkaEffect;
