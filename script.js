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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- START EFEKTÓW ---
function startBarkaEffect() {
    const audio = document.getElementById('barka-audio');
    let overlay = document.getElementById('party-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'party-overlay';
        overlay.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;";
        document.body.appendChild(overlay);
    }

    overlay.style.backgroundColor = "#f1c40f";

    // Miganie TYLKO jeśli impreza jest ON
    if (isPartyMode) {
        if (strobeInterval) clearInterval(strobeInterval);
        let flash = false;
        strobeInterval = setInterval(() => {
            overlay.style.backgroundColor = flash ? "#ffffff" : "#f1c40f";
            flash = !flash;
        }, 100);
    }

    // Konfetti
    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, origin: { y: 1 } });
    }, 300);

    if (audio) { audio.currentTime = 0; audio.play(); }
}

// --- STOP EFEKTÓW ---
function stopBarkaEffect() {
    if (strobeInterval) clearInterval(strobeInterval);
    if (confettiInterval) clearInterval(confettiInterval);
    strobeInterval = null;
    confettiInterval = null;
    const overlay = document.getElementById('party-overlay');
    if (overlay) overlay.style.backgroundColor = "transparent";
}

// Obsługa przycisku Impreza
window.toggleParty = function() {
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    btn.innerText = `Impreza: ${isPartyMode ? "ON" : "OFF"}`;
    btn.style.background = isPartyMode ? "#2ecc71" : "#e74c3c";

    // JEŚLI WYŁĄCZYSZ W TRAKCIE - zatrzymaj miganie natychmiast
    if (!isPartyMode) {
        if (strobeInterval) {
            clearInterval(strobeInterval);
            strobeInterval = null;
            const overlay = document.getElementById('party-overlay');
            if (overlay) overlay.style.backgroundColor = "#f1c40f"; // Zostaje tylko żółty (bez migania)
        }
    }
};

// Czat
db.ref("wiadomosci").limitToLast(15).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
        const msg = document.createElement("div");
        msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    if (dane.tekst === "/test" && (Date.now() - dane.czas < 5000)) {
        startBarkaEffect();
    }
});

window.sendMsg = function() {
    const nick = document.getElementById("nick").value || "Anonim";
    const tekst = document.getElementById("tekst").value;
    if (!tekst) return;
    db.ref("wiadomosci").push({ autor: nick, tekst: tekst, czas: Date.now() });
    document.getElementById("tekst").value = "";
};

// Licznik
function updateTimer() {
    const timerEl = document.getElementById("timer");
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
setInterval(updateTimer, 1000);
document.getElementById('barka-audio').onended = stopBarkaEffect;
