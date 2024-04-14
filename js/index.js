const startDateInput = document.querySelector('#start-date');
const endDateInput = document.querySelector('#end-date');
const presetSelect = document.querySelector('#preset');
const calcTypeSelect = document.querySelector('#calc-type');
const resultDisplay = document.querySelector('#result');
const resultsTableBody = document.querySelector('#results-table tbody');
const calculateButton = document.querySelector('button');

// Функція для обчислення різниці між датами
function calculateDateDifference(startDate, endDate, unit) {
    let difference = (new Date(endDate) - new Date(startDate)) / 1000; // Різниця в секундах

    switch (unit) {
        case 'days':
            return difference / 86400;
        case 'hours':
            return difference / 3600;
        case 'minutes':
            return difference / 60;
        case 'seconds':
            return difference;
        default:
            throw new Error('Невірна одиниця для обчислення різниці між датами');
    }
}

// Завантажує результати з локального сховища
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

// Зберігає результат в локальне сховище
function saveResult(startDate, endDate, result) {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    results.unshift({ startDate, endDate, result });
    if (results.length > 10) {
        results.pop();
    }
    localStorage.setItem('results', JSON.stringify(results));
    loadResults();
}

// Обробник зміни дати початку
function handleStartDateChange() {
    endDateInput.disabled = false;
    endDateInput.min = startDateInput.value;
}

// Обробник зміни дати закінчення
function handleEndDateChange() {
    if (new Date(endDateInput.value) < new Date(startDateInput.value)) {
        endDateInput.value = startDateInput.value;
    }
}

// Обробник події кліка
function handleCalculateClick() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const unit = calcTypeSelect.value;
    const unitText = calcTypeSelect.options[calcTypeSelect.selectedIndex].text;

    let difference = calculateDateDifference(startDate, endDate, unit);
    difference = Math.round(difference); // Округлення результату

    const formattedResult = `${difference} ${unitText}`;
    resultDisplay.textContent = `Результат: ${formattedResult}`;

    saveResult(startDate, endDate, formattedResult);
}

// Назначення обробників подій
startDateInput.addEventListener('change', handleStartDateChange);
endDateInput.addEventListener('change', handleEndDateChange);
calculateButton.addEventListener('click', handleCalculateClick);

loadResults(); // Завантажує результати з локального сховища при завантаженні сторінки