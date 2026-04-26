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

// --- EFEKTY ---
function startBarkaEffect() {
    stopBarkaEffect(); // Czyścimy stare procesy

    const audio = document.getElementById('barka-audio');
    let overlay = document.getElementById('party-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'party-overlay';
        document.body.appendChild(overlay);
    }

    // Miganie tła (Flashbang)
    if (isPartyMode) {
        let flash = false;
        strobeInterval = setInterval(() => {
            overlay.style.backgroundColor = flash ? "#ffffff" : "#f1c40f";
            flash = !flash;
        }, 100);
    } else {
        overlay.style.backgroundColor = "#f1c40f";
    }

    // Konfetti z dwóch boków
    confettiInterval = setInterval(() => {
        // Lewy bok
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.9 }
        });
        // Prawy bok
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.9 }
        });
    }, 300);

    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => console.log("Kliknij na stronę, by usłyszeć dźwięk."));
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
    if (!isPartyMode) {
        // Wyświetla komunikat tylko przy włączaniu
        alert("OSTRZEŻENIE: Tryb imprezy zawiera szybko migające światła, które mogą wywołać napad epilepsji u osób wrażliwych.");
    }
    
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    btn.innerText = `IMPREZA: ${isPartyMode ? "WŁĄCZONA" : "WYŁĄCZONA"}`;
    btn.style.backgroundColor = isPartyMode ? "#2ecc71" : "#495057";

    // Natychmiastowe zatrzymanie migania przy wyłączeniu w trakcie
    if (!isPartyMode && strobeInterval) {
        clearInterval(strobeInterval);
        strobeInterval = null;
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
    
    if(dane.autor === "SYSTEM") msg.style.color = "#f1c40f";
    else if(dane.autor === "BOT") msg.style.color = "#3498db";
    
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
