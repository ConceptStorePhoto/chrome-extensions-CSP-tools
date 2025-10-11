console.log("✅ Script injecté !  functions/function-displayNotif.js");

function displayNotif(message, duree) {
    duree = duree || 2500;
    // Vérifie si le conteneur existe déjà
    let container = document.getElementById('CSP_tools-notif-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'CSP_tools-notif-container';
        document.body.appendChild(container);

        // Injecte le CSS si pas déjà présent
        if (!document.getElementById('CSP_tools-notif-style')) {
            const style = document.createElement('style');
            style.id = 'CSP_tools-notif-style';
            style.textContent = `
              #CSP_tools-notif-container {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
                pointer-events: none;
              }
              .CSP_tools-custom-notif {
                background-color: #323232;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(-10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
              }
              .CSP_tools-custom-notif.show {
                opacity: 1;
                transform: translateY(0);
              }
            `;
            document.head.appendChild(style);
        }
    }
    // Si une notification avec le même message existe déjà, on ne fait rien
    if (document.querySelector('.CSP_tools-custom-notif')?.textContent === message) return;

    // Crée une notification individuelle
    const notif = document.createElement('div');
    notif.className = 'CSP_tools-custom-notif';
    notif.textContent = message;
    container.appendChild(notif);

    // Animation d'apparition
    setTimeout(() => notif.classList.add('show'), 10);

    // Disparition au bout de 2.5 secondes
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, duree);
}