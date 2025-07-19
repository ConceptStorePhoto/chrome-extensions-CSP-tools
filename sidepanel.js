document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('csvFileInput').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target.result;
            const rows = text.trim().split('\n').map(row => row.split(';'));
            afficherTableau(rows);
        };
        reader.readAsText(file);
    });

    function afficherTableau(data) {
        const container = document.getElementById('tableContainer');
        const table = document.createElement('table');

        data.forEach((row, i) => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const cellElement = document.createElement(i === 0 ? 'th' : 'td');
                cellElement.textContent = cell.trim();
                tr.appendChild(cellElement);
            });
            table.appendChild(tr);
        });

        container.innerHTML = ''; // Nettoyer avant affichage
        container.appendChild(table);
    }

});