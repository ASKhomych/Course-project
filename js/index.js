
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const presetSelect = document.getElementById('preset');
    const calcTypeSelect = document.getElementById('calc-type');
    const resultDisplay = document.getElementById('result');
    const resultsTableBody = document.getElementById('results-table').getElementsByTagName('tbody')[0];

    function loadResults() {
        const results = JSON.parse(localStorage.getItem('results')) || [];
        resultsTableBody.innerHTML = results.map(result => `
            <tr>
                <td>${result.startDate}</td>
                <td>${result.endDate}</td>
                <td>${result.result}</td>
            </tr>
        `).join('');
    }

    function saveResult(startDate, endDate, result) {
        const results = JSON.parse(localStorage.getItem('results')) || [];
        results.unshift({ startDate, endDate, result }); // Додаємо на початок масиву
        if (results.length > 10) {
            results.pop(); // Видаляємо найстаріший результат у кінці, щоб тримати тільки останні 10
        }
        localStorage.setItem('results', JSON.stringify(results));
        loadResults();
    }

    startDateInput.addEventListener('change', function() {
        endDateInput.disabled = false;
        endDateInput.min = startDateInput.value;
    });

    endDateInput.addEventListener('change', function() {
        if (new Date(endDateInput.value) < new Date(startDateInput.value)) { //Кінцева дата не може бути раніше початкової дати
            endDateInput.value = startDateInput.value;
        }
    });

    document.querySelector('button').addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        let difference = (new Date(endDate) - new Date(startDate)) / 1000; // Difference in seconds

        if (presetSelect.value) {
            difference = parseInt(presetSelect.value) * 86400; // Override difference if preset is selected
        }

        switch (calcTypeSelect.value) {
            case 'days':
                difference /= 86400;
                break;
            case 'hours':
                difference /= 3600;
                break;
            case 'minutes':
                difference /= 60;
                break;
            case 'seconds':
                break;
        }

        let formattedResult = `${Math.round(difference)} ${calcTypeSelect.options[calcTypeSelect.selectedIndex].text}`;
        resultDisplay.textContent = `Результат: ${formattedResult}`;

        saveResult(startDate, endDate, formattedResult);
    });

    loadResults(); // Load results from localStorage on page load
