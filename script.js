function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    const clockElement = document.getElementById('clock');
    clockElement.innerText = `${h}:${m}:${s}`;

    // Sprawdzanie godziny 21:37
    if (h === "21" && m === "37") {
        activatePapalMode();
    }
}

function activatePapalMode() {
    document.getElementById('bg-body').classList.add('yellow-mode');
    const audio = document.getElementById('barka-audio');
    
    // Autoplay może być zablokowany przez przeglądarkę, dopóki użytkownik nie kliknie nic na stronie
    audio.play().catch(e => console.log("Odtwarzanie zablokowane - kliknij cokolwiek na stronie!"));
}

// Obsługa czatu (lokalna - widać tylko u Ciebie)
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

setInterval(updateClock, 1000);
updateClock();