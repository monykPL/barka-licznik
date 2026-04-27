let strobeInterval = null;
let confettiInterval = null;
let isPartyMode = false;
let hasTriggeredToday = false; // Zapobiega wielokrotnemu odpaleniu w tej samej minucie

const firebaseConfig = {
    apiKey: "AIzaSyDgn4ux6ZJyFbxbG-aB-kv9GjNqfPJUiSw",
    authDomain: "monyk-czat.firebaseapp.com",
    databaseURL: "https://monyk-czat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "monyk-czat",
    storageBucket: "monyk-czat.firebasestorage.app",
    messagingSenderId: "39641097299",
    appId: "1:39641097299:web:aac07712b25e2b501652a6"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function startBarkaEffect() {
    stopBarkaEffect();
    const audio = document.getElementById('barka-audio');
    let overlay = document.getElementById('party-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'party-overlay';
        document.body.appendChild(overlay);
    }

    if (isPartyMode) {
        let flash = false;
        strobeInterval = setInterval(() => {
            overlay.style.backgroundColor = flash ? "#ffffff" : "#f1c40f";
            flash = !flash;
        }, 100);
    } else {
        overlay.style.backgroundColor = "#f1c40f";
    }

    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.9 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.9 } });
    }, 300);

    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => console.log("Wymagana interakcja użytkownika."));
    }
}

function stopBarkaEffect() {
    clearInterval(strobeInterval);
    clearInterval(confettiInterval);
    strobeInterval = null;
    confettiInterval = null;
    const overlay = document.getElementById('party-overlay');
    if (overlay) overlay.style.backgroundColor = "transparent";
}

window.toggleParty = function() {
    if (!isPartyMode) alert("OSTRZEŻENIE: Tryb imprezy może wywołać napad epilepsji.");
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    btn.innerText = `IMPREZA: ${isPartyMode ? "WŁĄCZONA" : "WYŁĄCZONA"}`;
    btn.style.backgroundColor = isPartyMode ? "#2ecc71" : "#495057";
    if (!isPartyMode) stopBarkaEffect();
};

window.checkSound = function() {
    const audio = document.getElementById('barka-audio');
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => audio.pause(), 3000);
};

// --- LOGIKA CZATU Z UKRYWANIEM /TEST ---
window.sendMsg = function() {
    const nickInput = document.getElementById("user-nick");
    const tekstInput = document.getElementById("tekst");
    const nick = nickInput.value.trim() || "Anonim";
    const tekst = tekstInput.value.trim();
    if (!tekst) return;

    db.ref("wiadomosci").push({ autor: nick, tekst: tekst, czas: Date.now() });
    tekstInput.value = "";
};

db.ref("wiadomosci").limitToLast(20).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    
    // Jeśli to /test, odpal efekty i ZAKOŃCZ (nie dodawaj do HTML)
    if (dane.tekst === "/test") {
        if (Date.now() - dane.czas < 10000) { // Tylko jeśli wiadomość jest świeża (max 10s)
            startBarkaEffect();
        }
        return; 
    }

    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    if(dane.autor === "SYSTEM") msg.style.color = "#f1c40f";
    msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// --- TIMER I AUTOMATYCZNY SYSTEM ---
function updateTimer() {
    const now = new Date();
    const polandTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Warsaw"}));
    let target = new Date(polandTime);
    target.setHours(21, 37, 0, 0);

    if (polandTime > target) target.setDate(target.getDate() + 1);
    const diff = target - polandTime;

    // AUTOMATYCZNE WYZWALANIE O 21:37:00
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    if (h === 0 && m === 0 && s === 0 && !hasTriggeredToday) {
        hasTriggeredToday = true;
        // System wysyła ukryte /test do bazy, by u każdego startło równo
        db.ref("wiadomosci").push({ autor: "SYSTEM", tekst: "/test", czas: Date.now() });
    }

    // Resetuj flage wyzwalacza po minucie, by zadziałało jutro
    if (m > 1) hasTriggeredToday = false;

    document.getElementById("timer").innerText = 
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);
document.getElementById('barka-audio').onended = stopBarkaEffect;
