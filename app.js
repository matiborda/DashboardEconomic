document.addEventListener('DOMContentLoaded', async function () {
    const countrySelect = document.getElementById('country');
    const indicatorSelect = document.getElementById('indicator');
    const fetchDataButton = document.getElementById('fetchData');
    const summaryList = document.getElementById('summary-list');
    
    const ctx = document.getElementById('chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Fechas o períodos de tiempo
            datasets: [{
                label: 'Economic indicator',
                data: [],
                borderColor: '#4a90e2',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Value' } }
            }
        }
    });

    // Obtener y mostrar la lista de países
    async function fetchCountries() {
        try {
            const response = await fetch('http://api.worldbank.org/v2/country?format=json&per_page=300');
            if (!response.ok) throw new Error('Error getting list of countries');
            const data = await response.json();
            data[1].forEach(country => {
                const option = document.createElement('option');
                option.value = country.id;
                option.text = country.name;
                countrySelect.add(option);
            });
        } catch (error) {
            console.error(error);
            alert('There was a problem loading the list of countries.');
        }
    }

    // Obtener datos del indicador seleccionado y actualizar el gráfico
    async function fetchIndicator(countryCode, indicatorCode) {
        try {
            const response = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=100`);
            if (!response.ok) throw new Error('Error getting indicator data');
            const data = await response.json();
            if (!data[1]) {
                alert('No data was found for the selected country and indicator.');
                return;
            }

            // Limpia el resumen previo y actualiza con los nuevos datos
            summaryList.innerHTML = '';
            const summaryData = data[1].filter(item => item.value !== null).map(item => ({
                date: item.date,
                value: item.value
            }));

            if (summaryData.length === 0) {
                alert('No data available for the selected country and indicator.');
                chart.data.labels = [];
                chart.data.datasets[0].data = [];
                chart.update();
                return;
            }

            // Verificar si hay datos para el año 2024
            const data2024 = summaryData.find(item => item.date == '2024');
            if (data2024) {
                console.log(`Datos de 2024: ${data2024.value}`);
            } else {
                console.log('No data available for 2024');
            }

            // Actualizar el gráfico con los datos obtenidos
            chart.data.labels = summaryData.map(d => d.date);
            chart.data.datasets[0].data = summaryData.map(d => d.value);
            chart.data.datasets[0].label = indicatorSelect.options[indicatorSelect.selectedIndex].text;
            chart.update();

            // Muestra los datos en el resumen
            summaryData.forEach(d => {
                const listItem = document.createElement('li');
                listItem.textContent = `Year ${d.date}: ${d.value.toLocaleString()}`;
                summaryList.appendChild(listItem);
            });

            // Agregar una entrada especial para el año 2024 si está disponible
            if (data2024) {
                const listItem2024 = document.createElement('li');
                listItem2024.style.fontWeight = 'bold';
                listItem2024.textContent = `Year 2024: ${data2024.value.toLocaleString()} (Dato de 2024)`;
                summaryList.appendChild(listItem2024);
            } else {
                const listItemNoData2024 = document.createElement('li');
                listItemNoData2024.style.color = 'red';
                listItemNoData2024.textContent = 'No data available for 2024.';
                summaryList.appendChild(listItemNoData2024);
            }

        } catch (error) {
            console.error(error);
            alert('There was a problem loading the indicator data.');
        }
    }

    // Al hacer clic en el botón "Mostrar Datos"
    fetchDataButton.addEventListener('click', () => {
        const selectedCountry = countrySelect.value;
        const selectedIndicator = indicatorSelect.value;
        if (selectedCountry && selectedIndicator) {
            fetchIndicator(selectedCountry, selectedIndicator);
        } else {
            alert('Select a country and an economic indicator.');
        }
    });

    // Cargar la lista de países al inicio
    await fetchCountries();
});
