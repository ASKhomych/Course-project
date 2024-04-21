const API_KEY = 'iFfulYZRwlaJcR7NURnw0Oe2ZG7OIyCR';
const API_URL = 'https://calendarific.com/api/v2';

export async function fetchCountries() {
    const url = `${API_URL}/countries?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch countries from API');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Network response was not ok: ' + error.message);
    }
}

export async function fetchHolidays(country, year) {
    const url = `${API_URL}/holidays?api_key=${API_KEY}&country=${country}&year=${year}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch holidays from API');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Network response was not ok: ' + error.message);
    }
}

