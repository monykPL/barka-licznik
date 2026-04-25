// Akcja po wejściu na stronę
window.onload = function() {
    const messages = document.getElementById('chat-messages');
    const systemMsg = document.createElement('p');
    systemMsg.className = 'system-msg';
    systemMsg.innerHTML = `<strong>System:</strong> ktoś wszedł na stronę`;
    messages.appendChild(systemMsg);
};

// Funkcja odświeżająca zegary i odliczanie
function updateEverything() {
    const now = new Date();
    
    // 1. Mały zegarek przy czacie
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('small-clock').innerText = `${h}:${m}:${s}`;

    // 2. Odliczanie do 21:37
    let target = new Date();
    target.setHours(21, 37, 0, 0);

    // Jeśli już po 21:37, ustaw cel na jutro
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerText = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // 3. Sprawdzenie godziny zero (21:37:00)
    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) {
        activatePapalMode();
    }
}

function activatePapalMode() {
    const body = document.getElementById('bg-body');
    const audio = document.getElementById('barka-audio');
    
    body.classList.add('yellow-mode');
    audio.play().catch(() => {
        console.log("Kliknij na stronę, by odblokować dźwięk!");
    });
}

// Funkcja wysyłania wiadomości
function sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    
    if (input.value.trim() !== "") {
        const msg = document.createElement('p');
        msg.style.margin = "5px 0";
        msg.innerHTML = `<strong>Ty:</strong> ${input.value}`;
        messages.appendChild(msg);
        input.value = "";
        messages.scrollTop = messages.scrollHeight;
    }
}

// Uruchomienie pętli co sekundę
setInterval(updateEverything, 1000);
updateEverything();