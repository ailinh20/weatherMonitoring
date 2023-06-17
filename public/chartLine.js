let charts = [];

function handleResponse(response) {
    const data = response.data;
    const labels = data.map(item => moment(item.createdAt).format('HH:mm'));
    const temperatures = data.map(item => item.temp);
    const humidities = data.map(item => item.hum);

    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = '#c7b1b1';

    if (charts.length > 0) {
        charts.forEach(chart => chart.destroy());
        charts = [];
    }

    const ctx = document.getElementById('chartDHT').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature',
                    data: temperatures,
                    borderColor: '#fc3f3f',
                    backgroundColor: 'transparent',
                    tension: 0
                },
                {
                    label: 'Humidity',
                    data: humidities,
                    borderColor: '#5549fc',
                    backgroundColor: 'transparent',
                    tension: 0
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }   
        }
    });
    charts.push(chart);

    const ctxTemp = document.getElementById('chartTemp').getContext('2d');
    const chartTemp = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature',
                    data: temperatures,
                    borderColor: '#fc3f3f',
                    backgroundColor: 'transparent',
                    tension: 0
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f2d8d8'
                    }
                },
                x: {
                    grid: {
                        color: '#f2d8d8'
                    }
                }
            }   
        }
    });
    charts.push(chartTemp);

    const ctxHum = document.getElementById('chartHum').getContext('2d');
    const chartHum = new Chart(ctxHum, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Humidity',
                    data: humidities,
                    borderColor: '#5549fc',
                    backgroundColor: 'transparent',
                    tension: 0
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f2d8d8'
                    }
                },
                x: {
                    grid: {
                        color: '#f2d8d8'
                    }
                }
            }   
        }
    });
    charts.push(chartHum);
}

function loadData() {
    $.ajax({
        url: '/api/data',
        method: 'GET',
        cache: false, // Tắt cache
        success: handleResponse
    });
}

// Load initial data and create chart
loadData();

// Polling to update data and redraw chart every 100 milliseconds
const socket = io();
  socket.on('newData', function(data) {
    loadData();
    console.log(data.message);
  });

