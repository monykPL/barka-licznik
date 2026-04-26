// --- KONFIGURACJA I ZMIENNE ---
let strobeInterval = null;
let confettiInterval = null;
let isPartyMode = false;

const firebaseConfig = {
    apiKey: "AIzaSyDgn4ux6ZJyFbxbG-aB-kv9GjNqfPJUiSw",
    authDomain: "monyk-czat.firebaseapp.com",
    databaseURL: "https://monyk-czat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "monyk-czat",
    storageBucket: "monyk-czat.firebasestorage.app",
    messagingSenderId: "39641097299",
    appId: "1:39641097299:web:aac07712b25e2b501652a6"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- FUNKCJA MIGANIA (STROBOSKOP) ---
function startBarkaEffect() {
    const audio = document.getElementById('barka-audio');
    const bg = document.getElementById('bg-body');
    
    // Usuwamy stary overlay jeśli istnieje
    let overlay = document.getElementById('party-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'party-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.zIndex = '-1'; // Pod spodem wszystkiego
        overlay.style.pointerEvents = 'none'; // Nie blokuje kliknięć
        document.body.appendChild(overlay);
    }

    // 1. Ustawiamy bazowy żółty
    overlay.style.backgroundColor = "#f1c40f";
    bg.classList.add('yellow-mode');

    // 2. Jeśli impreza jest ON - wymuszamy miganie przez JavaScript
    if (isPartyMode) {
        if (strobeInterval) clearInterval(strobeInterval);
        let flash = false;
        strobeInterval = setInterval(() => {
            overlay.style.backgroundColor = flash ? "#ffffff" : "#f1c40f";
            flash = !flash;
        }, 100);
        console.log("⚡ Stroboskop startuje!");
    }

    // 3. Konfetti
    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
    }, 250);

    audio.currentTime = 0;
    audio.play();
}

// --- STOPOWANIE EFEKTÓW ---
function stopBarkaEffect() {
    if (strobeInterval) clearInterval(strobeInterval);
    if (confettiInterval) clearInterval(confettiInterval);
    
    const overlay = document.getElementById('party-overlay');
    if (overlay) overlay.style.backgroundColor = "transparent";
    
    const bg = document.getElementById('bg-body');
    bg.classList.remove('yellow-mode');
    console.log("🛑 Efekty zatrzymane.");
}

document.getElementById('barka-audio').onended = stopBarkaEffect;

// --- OBSŁUGA CZATU I KOMENDY /test ---
db.ref("wiadomosci").limitToLast(1).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const chatBox = document.getElementById("chat-box");
    
    if (chatBox) {
        const msg = document.createElement("div");
        msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // KOMENDA /test (Zignoruj jeśli wiadomość jest starsza niż 5 sekund)
    if (dane.tekst === "/test" && (Date.now() - dane.czas < 5000)) {
        console.log("🛠 Wykryto komendę /test");
        startBarkaEffect();
    }
});

// Wysyłanie wiadomości
window.sendMsg = function() {
    const nick = document.getElementById("nick").value || "Anonim";
    const tekstInput = document.getElementById("tekst");
    const tekst = tekstInput.value;
    if (!tekst) return;

    db.ref("wiadomosci").push({
        autor: nick,
        tekst: tekst,
        czas: Date.now()
    });
    tekstInput.value = "";
};

// --- PRZYCISK TRYBU IMPREZY ---
window.toggleParty = function() {
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    if (btn) {
        btn.innerText = `Impreza: ${isPartyMode ? "ON" : "OFF"}`;
        btn.style.background = isPartyMode ? "#2ecc71" : "#e74c3c";
    }
    console.log("Tryb imprezy:", isPartyMode);
};

// --- LICZNIK DO 21:37 ---
function updateTimer() {
    const now = new Date();
    const polandTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Warsaw"}));
    
    let target = new Date(polandTime);
    target.setHours(21, 37, 0, 0);

    if (polandTime > target) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target - polandTime;
    
    // Jeśli wybije dokładnie 21:37:00
    if (diff > 0 && diff < 1000) {
        startBarkaEffect();
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const timerEl = document.getElementById("timer");
    if (timerEl) {
        timerEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
}

setInterval(updateTimer, 1000);
