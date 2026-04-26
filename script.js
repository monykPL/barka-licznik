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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- NAPRAWIONA FUNKCJA EFEKTÓW ---
function startBarkaEffect() {
    stopBarkaEffect(); // Najpierw czyścimy wszystko, żeby uniknąć nakładania się

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
        confetti({ particleCount: 7, spread: 60, origin: { y: 0.9 } });
    }, 250);

    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => console.log("Interakcja wymagana do audio"));
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

// --- LOGIKA PRZYCISKÓW ---
window.toggleParty = function() {
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    btn.innerText = `IMPREZA: ${isPartyMode ? "WŁĄCZONA" : "WYŁĄCZONA"}`;
    btn.style.backgroundColor = isPartyMode ? "#2ecc71" : "#495057";
    
    // Jeśli wyłączasz w trakcie trwania efektów, od razu przestań migać
    if (!isPartyMode) {
        clearInterval(strobeInterval);
        const overlay = document.getElementById('party-overlay');
        if (overlay) overlay.style.backgroundColor = "#f1c40f"; 
    }
};

window.checkSound = function() {
    const audio = document.getElementById('barka-audio');
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => audio.pause(), 3000);
};

// --- CZAT ---
window.sendMsg = function() {
    const nickInput = document.getElementById("user-nick");
    const tekstInput = document.getElementById("tekst");
    const nick = nickInput.value.trim() || "Anonim";
    const tekst = tekstInput.value.trim();

    if (!tekst) return;

    db.ref("wiadomosci").push({
        autor: nick,
        tekst: tekst,
        czas: Date.now()
    });
    tekstInput.value = "";
};

db.ref("wiadomosci").limitToLast(20).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    
    if(dane.autor === "SYSTEM") msg.className = "system-msg";
    else if(dane.autor === "BOT") msg.className = "bot-msg";
    
    msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (dane.tekst === "/test" && (Date.now() - dane.czas < 5000)) {
        startBarkaEffect();
    }
});

// --- TIMER ---
function updateTimer() {
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

    document.getElementById("timer").innerText = 
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);
document.getElementById('barka-audio').onended = stopBarkaEffect;
