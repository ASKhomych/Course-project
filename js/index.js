
const startDateInput = document.querySelector('#start-date');
const endDateInput = document.querySelector('#end-date');
const presetSelect = document.querySelector('#preset');
const calcTypeSelect = document.querySelector('#calc-type');
const calcDayTypeSelect = document.querySelector('#day-type'); 
const resultDisplay = document.querySelector('#result');
const resultsTableBody = document.querySelector('#results-table tbody');
const calculateButton = document.querySelector('button');

// Функція для перевірки, чи є день вихідним
function isWeekend(day) {
    return day === 0 || day === 6; // 0 - неділя, 6 - субота
}

// Обчислення кількості вихідних днів
function getWeekendDays(start, end) {
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isWeekend(d.getDay())) {
            count++;
        }
    }
    return count;
}

// Обчислення кількості робочих днів
function getWorkdays(start, end) {
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (!isWeekend(d.getDay())) {
            count++;
        }
    }
    return count;
}

// Функція для обчислення різниці між датами
function calculateDateDifference(startDate, endDate, unit, dayType) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let differenceInSeconds = (end - start) / 1000; // Різниця в секундах

    switch (unit) {
        case 'days':
            switch (dayType) {
                case 'weekdays':
                    return getWorkdays(start, end);
                case 'weekends':
                    return getWeekendDays(start, end);
                case 'all':
                    return Math.floor(differenceInSeconds / 86400); // Ділення секунд на кількість секунд в одному дні
                default:
                    throw new Error('Невірний тип дня');
            }
        case 'hours':
        case 'minutes':
        case 'seconds':
            const secondsPerUnit = {
                'hours': 3600,
                'minutes': 60,
                'seconds': 1
            };
            let totalSeconds = 0;
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if ((dayType === 'weekdays' && !isWeekend(d.getDay())) ||
                    (dayType === 'weekends' && isWeekend(d.getDay())) ||
                    (dayType === 'all')) {
                    const nextDay = new Date(d);
                    nextDay.setDate(d.getDate() + 1);
                    const dayEnd = nextDay > end ? end : nextDay;
                    totalSeconds += (dayEnd - d) / 1000;
                }
            }
            return Math.floor(totalSeconds / secondsPerUnit[unit]);
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

function handleCalculateClick() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const unit = calcTypeSelect.value;
    const dayType = calcDayTypeSelect.value; // Виправлено ім'я змінної для відповідності
    const unitText = calcTypeSelect.options[calcTypeSelect.selectedIndex].text;

    let difference = calculateDateDifference(startDate, endDate, unit, dayType);
    difference = Math.round(difference); // Округлення результату

    const formattedResult = `${difference} ${unitText}`;
    resultDisplay.textContent = `Результат: ${formattedResult}`;

    saveResult(startDate, endDate, formattedResult);
}

// Обробник зміни пресету
function handlePresetChange() {
    const startDate = new Date(startDateInput.value);
    let presetDays = parseInt(presetSelect.value);
    
    if (!isNaN(presetDays) && startDateInput.value) {
        const endDate = new Date(startDate.getTime() + presetDays * 86400000); // Додавання днів до дати початку
        endDateInput.valueAsDate = endDate; // Встановлення нової дати завершення
        endDateInput.disabled = false; // Включення поля дати завершення, якщо воно було вимкнене
    }
}

// Назначення обробників подій
startDateInput.addEventListener('change', handleStartDateChange);
endDateInput.addEventListener('change', handleEndDateChange);
presetSelect.addEventListener('change', handlePresetChange);
calculateButton.addEventListener('click', handleCalculateClick);

loadResults(); // Завантажує результати з локального сховища при завантаженні сторінки
