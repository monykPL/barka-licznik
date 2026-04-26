let strobeInterval = null;
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

let isPartyMode = false;
let confettiInterval = null;

// --- CZAT ---
db.ref("wiadomosci").limitToLast(50).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const messages = document.getElementById('chat-messages');
    const msg = document.createElement('p');
    // Jeśli autor to SYSTEM, dodajemy specjalną klasę
    if(dane.autor === "SYSTEM") {
        msg.className = "system-msg";
        msg.innerHTML = `<strong>${dane.autor}:</strong> ${dane.tekst}`;
    } else {
        msg.innerHTML = `<strong>${dane.autor || "Anonim"}:</strong> ${dane.tekst}`;
    }
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const val = input.value.trim();
    if (val === "/test") { activatePapalMode(); input.value = ""; return; }
    if (val !== "") {
        db.ref("wiadomosci").push({ autor: "Anonim", tekst: val, czas: Date.now() });
        input.value = "";
    }
}

// --- PRZYCISK IMPREZY ---
document.getElementById('epilepsy-btn').onclick = function() {
    const bg = document.getElementById('bg-body');
    if (!isPartyMode) {
        if (confirm("⚠️ OSTRZEŻENIE: Włączyć miganie światła?")) {
            isPartyMode = true;
            this.innerText = "IMPREZA: WŁĄCZONA";
            this.style.backgroundColor = "red";
            if (bg.classList.contains('yellow-mode')) bg.classList.add('party-mode');
        }
    } else {
        isPartyMode = false;
        this.innerText = "IMPREZA: WYŁĄCZONA";
        this.style.backgroundColor = "#555";
        bg.classList.remove('party-mode');
    }
};

// --- DŹWIĘK TEST ---
document.getElementById('test-audio-btn').onclick = function() {
    const audio = document.getElementById('barka-audio');
    audio.play().then(() => {
        setTimeout(() => {
            audio.pause(); audio.currentTime = 0;
            document.getElementById('audio-unlocker').style.display = 'none';
        }, 3000);
    });
};

// --- EFEKTY ---
function activatePapalMode() {
    const audio = document.getElementById('barka-audio');
    const bg = document.getElementById('bg-body');
    
    // Zawsze włączamy żółte tło
    bg.style.backgroundColor = "#f1c40f";

    // Jeśli tryb imprezy jest włączony, uruchamiamy "ręczne" miganie
    if (isPartyMode) {
        let isWhite = false;
        // Czyścimy stary interval, jeśli jakiś był
        if (strobeInterval) clearInterval(strobeInterval); 
        
        strobeInterval = setInterval(() => {
            bg.style.setProperty('background-color', isWhite ? '#f1c40f' : '#ffffff', 'important');
            isWhite = !isWhite;
        }, 100); // 100ms = bardzo szybkie miganie
    }

    // Wiadomość na czat
    db.ref("wiadomosci").push({
        autor: "SYSTEM",
        tekst: "Wybiła 21:37! Tryb Imprezy: " + (isPartyMode ? "ON ⚡" : "OFF"),
        czas: Date.now()
    });

    audio.currentTime = 0;
    audio.play();
}

    // 4. Konfetti
    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
    }, 250);

    audio.currentTime = 0;
    audio.play();
}

document.getElementById('barka-audio').onended = function() {
    const bg = document.getElementById('bg-body');
    bg.classList.remove('yellow-mode', 'party-mode');
    clearInterval(confettiInterval);
};

// --- ZEGAR ---
function update() {
    const now = new Date();
    document.getElementById('small-clock').innerText = now.toLocaleTimeString();
    let target = new Date();
    target.setHours(21, 37, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('countdown').innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) activatePapalMode();
}
setInterval(update, 1000);
update();
document.getElementById('chat-input').onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
