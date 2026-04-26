// --- USTAWIENIA ---
let strobeInterval = null;
let confettiInterval = null;
let isPartyMode = false;

// Twoja konfiguracja Firebase (Czat)
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

// --- FUNKCJA STARTUJĄCA IMPREZĘ ---
window.startBarkaEffect = function() {
    const audio = document.getElementById('barka-audio');
    
    // Tworzymy warstwę migającą, jeśli jej nie ma
    let overlay = document.getElementById('party-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'party-overlay';
        overlay.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;";
        document.body.appendChild(overlay);
    }

    overlay.style.backgroundColor = "#f1c40f"; // Najpierw żółty

    // STROBOSKOP (Miganie)
    if (isPartyMode) {
        if (strobeInterval) clearInterval(strobeInterval);
        let flash = false;
        strobeInterval = setInterval(() => {
            overlay.style.backgroundColor = flash ? "#ffffff" : "#f1c40f";
            flash = !flash;
        }, 80); // Prędkość: 80ms
    }

    // KONFETTI
    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
    }, 250);

    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => console.log("Kliknij na stronę, aby odtworzyć dźwięk!"));
    }
}

// STOP EFEKTÓW
window.stopBarkaEffect = function() {
    if (strobeInterval) clearInterval(strobeInterval);
    if (confettiInterval) clearInterval(confettiInterval);
    const overlay = document.getElementById('party-overlay');
    if (overlay) overlay.style.backgroundColor = "transparent";
}

// KONIEC AUDIO -> STOP EFEKTÓW
const audioTag = document.getElementById('barka-audio');
if (audioTag) audioTag.onended = window.stopBarkaEffect;

// --- CZAT ---
db.ref("wiadomosci").limitToLast(15).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
        const msg = document.createElement("div");
        msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    // Komenda /test na czacie
    if (dane.tekst === "/test" && (Date.now() - dane.czas < 5000)) {
        window.startBarkaEffect();
    }
});

window.sendMsg = function() {
    const nick = document.getElementById("nick").value || "Anonim";
    const tekst = document.getElementById("tekst").value;
    if (!tekst) return;
    db.ref("wiadomosci").push({ autor: nick, tekst: tekst, czas: Date.now() });
    document.getElementById("tekst").value = "";
}

// --- LOGIKA IMPREZY I TIMERA ---
window.toggleParty = function() {
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    btn.innerText = `Impreza: ${isPartyMode ? "ON" : "OFF"}`;
    btn.style.background = isPartyMode ? "#2ecc71" : "#e74c3c";
}

function updateTimer() {
    const timerEl = document.getElementById("timer");
    const now = new Date();
    const polandTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Warsaw"}));
    
    let target = new Date(polandTime);
    target.setHours(21, 37, 0, 0);
    if (polandTime > target) target.setDate(target.getDate() + 1);

    const diff = target - polandTime;
    if (diff > 0 && diff < 1000) window.startBarkaEffect();

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timerEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);
