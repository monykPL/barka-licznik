function updateTimers() {
    const now = new Date();
    
    // 1. Aktualizacja małego zegara
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('small-clock').innerText = `${h}:${m}:${s}`;

    // 2. Logika odliczania do 21:37
    let target = new Date();
    target.setHours(21, 37, 0, 0);

    // Jeśli już jest po 21:37, odliczaj do jutra
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target - now; // różnica w milisekundach

    // Przeliczanie milisekund na H:M:S
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const displayH = String(hours).padStart(2, '0');
    const displayM = String(minutes).padStart(2, '0');
    const displayS = String(seconds).padStart(2, '0');

    const countdownElement = document.getElementById('countdown');
    countdownElement.innerText = `${displayH}:${displayM}:${displayS}`;

    // 3. Sprawdzanie czy wybila 21:37 (sekunda zero)
    if (now.getHours() === 21 && now.getMinutes() === 37 && now.getSeconds() === 0) {
        activatePapalMode();
    }
}

function activatePapalMode() {
    document.getElementById('bg-body').classList.add('yellow-mode');
    const audio = document.getElementById('barka-audio');
    audio.play().catch(e => console.log("Kliknij na stronę, aby muzyka mogła zagrać!"));
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (input.value.trim() !== "") {
        const msg = document.createElement('p');
        msg.innerHTML = `<strong>Ty:</strong> ${input.value}`;
        messages.appendChild(msg);
        input.value = "";
        messages.scrollTop = messages.scrollHeight;
    }
}

// Odświeżaj co sekundę
setInterval(updateTimers, 1000);
updateTimers();