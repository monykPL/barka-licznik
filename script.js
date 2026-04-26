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
    const val = input.value.trim();
    
    if (val === "/test") {
        activatePapalMode(); // Odpalenie trybu 21:37 na żądanie
        input.value = "";
        return;
    }

    if (val !== "") {
        db.ref("wiadomosci").push({ tekst: val, czas: Date.now() });
        input.value = "";
    }
}

// --- NAPRAWIONY DŹWIĘK ---
document.getElementById('test-audio-btn').onclick = function() {
    const audio = document.getElementById('barka-audio');
    const btn = document.getElementById('test-audio-btn');
    
    btn.innerText = "GRA DŹWIĘK...";
    audio.volume = 1.0;
    
    audio.play().then(() => {
        // Graj przez 3 sekundy, żeby użytkownik wiedział, że działa
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            document.getElementById('audio-unlocker').style.display = 'none';
            
            const messages = document.getElementById('chat-messages');
            const systemMsg = document.createElement('p');
            systemMsg.className = 'system-msg';
            systemMsg.innerHTML = `<strong>System:</strong> Dźwięk działa! Barka zagra o 21:37.`;
            messages.appendChild(systemMsg);
        }, 3000);
    }).catch(err => {
        alert("BŁĄD! Przeglądarka zablokowała dźwięk. Spróbuj kliknąć jeszcze raz.");
    });
};

// --- LOGIKA CZASU ---
function activatePapalMode() {
    const audio = document.getElementById('barka-audio');
    document.getElementById('bg-body').classList.add('yellow-mode');
    audio.currentTime = 0;
    audio.play();
}

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

    // Automatyczny start o 21:37:00
    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) {
        activatePapalMode();
    }
}

setInterval(update, 1000);
update();

document.getElementById('chat-input').onkeypress = function(e) {
    if (e.key === 'Enter') sendMessage();
};