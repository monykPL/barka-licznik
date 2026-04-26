// --- ZMIENNE GLOBALNE ---
let strobeInterval = null;
let confettiInterval = null;
let isPartyMode = false;

// --- KONFIGURACJA FIREBASE ---
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

// --- FUNKCJA STARTUJĄCA EFEKTY (Barka/Test) ---
function startBarkaEffect() {
    const audio = document.getElementById('barka-audio');
    const bg = document.getElementById('bg-body');
    
    // 1. Zawsze żółte tło
    bg.style.backgroundColor = "#f1c40f";
    bg.classList.add('yellow-mode');

    // 2. Jeśli impreza jest ON - włączamy miganie (stroboskop)
    if (isPartyMode) {
        if (strobeInterval) clearInterval(strobeInterval); // Czyścimy jeśli już działało
        let isWhite = false;
        strobeInterval = setInterval(() => {
            bg.style.setProperty('background-color', isWhite ? '#f1c40f' : '#ffffff', 'important');
            isWhite = !isWhite;
        }, 100);
    }

    // 3. Konfetti
    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
    }, 250);

    // 4. Audio
    audio.currentTime = 0;
    audio.play();
}

// --- FUNKCJA KOŃCZĄCA EFEKTY ---
function stopBarkaEffect() {
    const bg = document.getElementById('bg-body');
    
    // Zatrzymujemy miganie
    if (strobeInterval) {
        clearInterval(strobeInterval);
        strobeInterval = null;
    }
    
    // Zatrzymujemy konfetti
    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }

    // Resetujemy tło i klasy
    bg.style.backgroundColor = ""; 
    bg.classList.remove('yellow-mode', 'party-mode');
}

// Obsługa końca piosenki
document.getElementById('barka-audio').onended = stopBarkaEffect;

// --- OBSŁUGA CZATU (W tym komenda /test) ---
db.ref("wiadomosci").limitToLast(15).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const chatBox = document.getElementById("chat-box");
    
    const msg = document.createElement("div");
    msg.innerHTML = `<b>${dane.autor}:</b> ${dane.tekst}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Komenda /test - tylko jeśli Ty ją wpiszesz (lub ktokolwiek)
    if (dane.tekst === "/test" && dane.autor !== "SYSTEM") {
        startBarkaEffect();
    }
});

// Wysyłanie wiadomości
function sendMsg() {
    const nick = document.getElementById("nick").value || "Anonim";
    const tekst = document.getElementById("tekst").value;
    if (!tekst) return;

    db.ref("wiadomosci").push({
        autor: nick,
        tekst: tekst,
        czas: Date.now()
    });
    document.getElementById("tekst").value = "";
}

// --- PRZYCISK TRYBU IMPREZY ---
function toggleParty() {
    isPartyMode = !isPartyMode;
    const btn = document.getElementById("party-btn");
    btn.innerText = `Impreza: ${isPartyMode ? "ON" : "OFF"}`;
    btn.style.background = isPartyMode ? "#2ecc71" : "#e74c3c";
}

// --- LICZNIK CZASU DO 21:37 ---
function updateTimer() {
    const now = new Date();
    const polandTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Warsaw"}));
    
    let target = new Date(polandTime);
    target.setHours(21, 37, 0, 0);

    if (polandTime > target) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target - polandTime;
    
    // Sprawdzenie czy wybiła 21:37 (dokładnie co do sekundy)
    if (diff <= 1000 && diff > 0) {
        startBarkaEffect();
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById("timer").innerText = 
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

setInterval(updateTimer, 1000);
