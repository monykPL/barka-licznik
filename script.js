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
    if (input.value.trim() !== "") {
        db.ref("wiadomosci").push({ tekst: input.value, czas: Date.now() });
        input.value = "";
    }
}

// --- ODBLOKOWANIE DŹWIĘKU (Ciche) ---
document.getElementById('test-audio-btn').onclick = function() {
    const audio = document.getElementById('barka-audio');
    
    // Przeglądarka myśli, że puszczamy piosenkę...
    audio.play().then(() => {
        // ...ale my ją natychmiast pauzujemy, żeby czekała na 21:37!
        audio.pause();
        audio.currentTime = 0;
        document.getElementById('audio-unlocker').style.display = 'none';
        
        const messages = document.getElementById('chat-messages');
        const systemMsg = document.createElement('p');
        systemMsg.className = 'system-msg';
        systemMsg.innerHTML = `<strong>System:</strong> Dźwięk odblokowany. Poczekaj do godziny 21:37, aby zagrała pełna wersja!`;
        messages.appendChild(systemMsg);
        
    }).catch(err => {
        alert("Błąd przeglądarki! Kliknij przycisk jeszcze raz.");
    });
};

// --- ODLICZANIE ---
function update() {
    const now = new Date();
    document.getElementById('small-clock').innerText = now.toLocaleTimeString();

    let target = new Date();
    target.setHours(21, 37, 0, 0);
    // Jeśli jest po 21:37, celujemy w jutro
    if (now > target) target.setDate(target.getDate() + 1);

    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById('countdown').innerText = 
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    // Aktywacja dokładnie o 21:37:00
    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) {
        document.getElementById('bg-body').classList.add('yellow-mode');
        document.getElementById('barka-audio').play(); // Tutaj Barka leci do końca!
    }
}

setInterval(update, 1000);
update();

document.getElementById('chat-input').onkeypress = function(e) {
    if (e.key === 'Enter') sendMessage();
};
