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

// --- ZMIENNE GLOBALNE ---
let isPartyMode = false;
let confettiInterval = null;

// --- CZAT ---
db.ref("wiadomosci").limitToLast(50).on("child_added", (snapshot) => {
    const dane = snapshot.val();
    const messages = document.getElementById('chat-messages');
    const msg = document.createElement('p');
    msg.innerHTML = `<strong>Anonim:</strong> ${dane.tekst}`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const val = input.value.trim();
    if (val === "/test") {
        activatePapalMode();
        input.value = "";
        return;
    }
    if (val !== "") {
        db.ref("wiadomosci").push({ tekst: val, czas: Date.now() });
        input.value = "";
    }
}

// --- NOWY PRZYCISK: EPILEPSJA / IMPREZA ---
document.getElementById('epilepsy-btn').onclick = function() {
    if (!isPartyMode) {
        // Okienko ostrzegawcze
        let zgoda = confirm("⚠️ OSTRZEŻENIE ⚠️\n\nWłączenie tej opcji spowoduje intensywne, szybkie miganie tła podczas utworu. Może to wywołać atak u osób cierpiących na padaczkę fotogenną.\n\nCzy na pewno chcesz włączyć tryb imprezowy?");
        
        if (zgoda) {
            isPartyMode = true;
            this.innerText = "IMPREZA: WŁĄCZONA";
            this.style.backgroundColor = "red";
            this.style.color = "white";
            
            // Jeśli muzyka właśnie gra, odpal miganie od razu
            if (document.getElementById('bg-body').classList.contains('yellow-mode')) {
                document.getElementById('bg-body').classList.add('party-mode');
            }
        }
    } else {
        // Wyłączanie
        isPartyMode = false;
        this.innerText = "IMPREZA: WYŁĄCZONA";
        this.style.backgroundColor = "#555";
        document.getElementById('bg-body').classList.remove('party-mode');
    }
};

// --- DŹWIĘK ---
document.getElementById('test-audio-btn').onclick = function() {
    const audio = document.getElementById('barka-audio');
    const btn = document.getElementById('test-audio-btn');
    btn.innerText = "GRA DŹWIĘK...";
    audio.volume = 1.0;
    
    audio.play().then(() => {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            // Ukrywamy cały div z przyciskiem testowania
            document.getElementById('audio-unlocker').style.display = 'none';
            
            const messages = document.getElementById('chat-messages');
            const systemMsg = document.createElement('p');
            systemMsg.className = 'system-msg';
            systemMsg.innerHTML = `<strong>System:</strong> Dźwięk działa! Oczekuj na godzinę zero.`;
            messages.appendChild(systemMsg);
        }, 3000);
    }).catch(err => alert("BŁĄD! Przeglądarka zablokowała dźwięk. Kliknij ponownie."));
};

// --- LOGIKA IMPREZY I POWROTU TŁA ---
function startConfetti() {
    // Strzela co 250 milisekund z lewego i prawego rogu
    confettiInterval = setInterval(() => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 }, zIndex: 9999 });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 }, zIndex: 9999 });
    }, 250);
}

function stopConfetti() {
    clearInterval(confettiInterval);
}

// Gdy Barka się skończy:
document.getElementById('barka-audio').onended = function() {
    // Usuwa żółte tło i stroboskop, wracając do domyślnego
    document.getElementById('bg-body').classList.remove('yellow-mode', 'party-mode');
    stopConfetti();
};

function activatePapalMode() {
    const audio = document.getElementById('barka-audio');
    const bg = document.getElementById('bg-body');
    
    // Najpierw dodajemy żółte tło
    bg.classList.add('yellow-mode');
    
    // Jeśli opcja imprezy jest włączona, dodajemy miganie
    if (isPartyMode) {
        console.log("Tryb imprezy aktywny!"); // Zobaczysz to w konsoli (F12)
        bg.classList.add('party-mode');
    }
    
    startConfetti();
    
    audio.currentTime = 0;
    audio.play().catch(err => console.log("Błąd autostartu: ", err));
}

// --- LOGIKA CZASU ---
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

    document.getElementById('countdown').innerText = 
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) {
        activatePapalMode();
    }
}

setInterval(update, 1000);
update();

document.getElementById('chat-input').onkeypress = function(e) {
    if (e.key === 'Enter') sendMessage();
};
