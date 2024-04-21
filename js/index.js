import { fetchCountries, fetchHolidays } from '../js/api.js';

const startDateInput = document.querySelector('#start-date');
const endDateInput = document.querySelector('#end-date');
const presetSelect = document.querySelector('#preset');
const calcTypeSelect = document.querySelector('#calc-type');
const calcDayTypeSelect = document.querySelector('#day-type'); 
const resultDisplay = document.querySelector('#result');
const resultsTableBody = document.querySelector('#results-table tbody');
const calculateButton = document.querySelector('button');

calculateButton.disabled = true; // Вимикаємо кнопку на початку

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
    let milliseconds = 0;

    switch (dayType) {
        case 'weekdays':
            let workdays = getWorkdays(start, end);
            milliseconds = workdays * 86400000; // 86400000 мілісекунд в одному дні
            break;
        case 'weekends':
            let weekendDays = getWeekendDays(start, end);
            milliseconds = weekendDays * 86400000;
            break;
        case 'all':
            milliseconds = end - start;
            break;
        default:
            throw new Error('Невірний тип дня');
    }

    switch (unit) {
        case 'days':
            return Math.floor(milliseconds / 86400000);
        case 'hours':
            return Math.floor(milliseconds / 3600000);
        case 'minutes':
            return Math.floor(milliseconds / 60000);
        case 'seconds':
            return Math.floor(milliseconds / 1000);
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
    updateButtonState(); // Оновлюємо стан кнопки
}

// Обробник зміни дати закінчення
function handleEndDateChange() {
    if (new Date(endDateInput.value) < new Date(startDateInput.value)) {
        endDateInput.value = startDateInput.value;
    }
    updateButtonState(); // Оновлюємо стан кнопки
}

// Оновлення стану кнопки на основі валідності дат
function updateButtonState() {
    calculateButton.disabled = !startDateInput.value || !endDateInput.value || new Date(startDateInput.value) > new Date(endDateInput.value);
}

// Обробник натискання на кнопку "Розрахувати"
function handleCalculateClick() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const unit = calcTypeSelect.value;
    const dayType = calcDayTypeSelect.value;
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
        const endDate = new Date(startDate.getTime() + presetDays * 86400000);
        endDateInput.valueAsDate = endDate;
        endDateInput.disabled = false;
    }
    updateButtonState(); // Оновлюємо стан кнопки
}

startDateInput.addEventListener('change', handleStartDateChange);
endDateInput.addEventListener('change', handleEndDateChange);
presetSelect.addEventListener('change', handlePresetChange);
calculateButton.addEventListener('click', handleCalculateClick);

loadResults(); // Завантажує результати при завантаженні сторінки


// --------------------------------------------------------------------------------------------
// the second tab 

let countryDataLoaded = false;

function switchTab(tabIndex) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    tabs[tabIndex].classList.add('active');
    contents[tabIndex].classList.add('active');

    if (tabIndex === 1 && !countryDataLoaded) {
        fetchCountries().then(data => {
            updateCountryOptions(data.response.countries);
            countryDataLoaded = true;
        }).catch(error => {
            console.error('Error fetching countries:', error);
            displayError(error);
        });
    }
}

document.querySelectorAll('.tab').forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(index));
});

function updateCountryOptions(countries) {
    const countryInput = document.getElementById('country');
    countryInput.innerHTML = '<option value="">Виберіть країну</option>';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.iso2;
        option.textContent = country.country_name;
        countryInput.appendChild(option);
    });
    document.getElementById('year').disabled = true;
    updateYearOptions();
}

function updateYearOptions() {
    const yearInput = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    yearInput.innerHTML = '';
    for (let year = 2001; year <= 2049; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearInput.appendChild(option);
        if (year === currentYear) {
            option.selected = true;
        }
    }
}

document.getElementById('country').addEventListener('change', function() {
    const yearInput = document.getElementById('year');
    const country = this.value;
    const year = yearInput.value;

    yearInput.disabled = !country;
    if (country && year) {
        fetchHolidays(country, year).then(data => {
            displayHolidays(data.response.holidays);
        }).catch(error => {
            console.error('Failed to fetch holidays:', error);
            displayError(error);
        });
    }
});

function displayHolidays(holidays) {
    const holidaysList = document.getElementById('holidays-list');
    holidaysList.innerHTML = '';
    holidays.forEach(holiday => {
        const item = document.createElement('li');
        item.textContent = holiday.name;
        holidaysList.appendChild(item);
    });
}

function displayError(error) {
    console.error(error);
    const errorBox = document.getElementById('error-box');
    errorBox.textContent = error.message;
    errorBox.style.display = 'block';
}