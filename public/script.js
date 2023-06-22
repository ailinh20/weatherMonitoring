let charts = [];
let oldWeather = '';
let flagFirstSetup = true;
function handleResponse(response) {
    const data = response.data;
    const labels = data.map(item => moment(item.createdAt).format('HH:mm'));
    const temperatures = data.map(item => item.temp);
    const humidities = data.map(item => item.hum);

    //Creat chart

    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = '#ffffff';

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
                }
            }   
        }
    });
    charts.push(chartHum);

    //Set background
    oldWeather = data[data.length - 1].weather;
    setBackground(data[data.length - 1].weather);
    //Set current date time
    setCurrentDateTime();
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

function addData(data){
    //Chart temp+hum
    charts[0].data.datasets[0].data.shift();
    charts[0].data.datasets[0].data.push(data.temp);
    charts[0].data.datasets[1].data.shift();
    charts[0].data.datasets[1].data.push(data.hum);
    charts[0].data.labels.shift();
    charts[0].data.labels.push(moment(data.createdAt).format('HH:mm'));
    charts[0].update();

    //Chart temp
    charts[1].data.datasets[0].data.shift();
    charts[1].data.datasets[0].data.push(data.temp);
    charts[1].data.labels.shift();
    charts[1].data.labels.push(moment(data.createdAt).format('HH:mm'));
    charts[1].update();

    //Chart hum
    charts[2].data.datasets[0].data.shift();
    charts[2].data.datasets[0].data.push(data.hum);
    charts[2].data.labels.shift();
    charts[2].data.labels.push(moment(data.createdAt).format('HH:mm'));
    charts[2].update();
}

function setBackground(weather) {
    const body = document.querySelector('body');
    const chartElements = document.querySelectorAll('#chartDHT, #chartTemp, #chartHum');
    const h1 = document.querySelector('h1');
    const value = document.getElementById('value');

    if (oldWeather !== weather || flagFirstSetup) {
        body.classList.add('fade-out');
        console.log ("updateBG");
        setTimeout(() => {
            if (weather === 'Rainy') {
                body.style.backgroundImage = "url('./images/rainy.jpg')";
                chartElements.forEach(chart => chart.style.backgroundColor = 'rgba(123, 148, 145, 0.538)');
                h1.style.color = 'rgb(79, 110, 106)';
                value.style.backgroundColor = 'rgba(123, 148, 145, 0.538)';
            } else if (weather === 'Sunny') {
                body.style.backgroundImage = "url('./images/sunny.jpg')";
                chartElements.forEach(chart => chart.style.backgroundColor = 'rgba(227, 219, 149, 0.538)');
                h1.style.color = 'rgb(227, 219, 149)';
                value.style.backgroundColor = 'rgba(227, 219, 149, 0.538)';
            }
            oldWeather = weather;
            flagFirstSetup = false;
    
            body.classList.remove('fade-out'); // Xóa lớp fade-out để hoàn thành hiệu ứng
            body.classList.add('fade-in'); // Áp dụng lớp fade-in để hiển thị dần background mới
    
            setTimeout(() => {
                body.classList.remove('fade-in'); // Xóa lớp fade-in sau khi hoàn thành hiệu ứng
            }, 250);
        }, 250);
    } else {}
}

function setCurrentDateTime() {
    const currentDateTimeElement = document.getElementById('currentDateTime');
    const currentDateTime = moment();

    const formattedDateTime = currentDateTime.format('HH:mm:ss, ddd, MMMM DD, YYYY');

    currentDateTimeElement.innerHTML = `${formattedDateTime}`;
}

function updateValue(data){
    const newValue = document.getElementById('inforSensor');

    if (newValue) {
        if (data) {
            newValue.innerHTML = `
                <p><i class="fas fa-temperature-low"></i> Temperature: ${data.temp}&deg;C</p>
                <p><i class="fas fa-tint"></i> Humidity: ${data.hum}%</p>
                <p><i class="fas fa-cloud-sun"></i> Weather: ${data.weather}</p>
            `;
        } else {
            newValue.innerHTML = `
                <p>No data available.</p>
            `;
        }
    }
}

// Socket io
const socket = io();
socket.on('newData', function(data) {
    addData(data.dht11);
    updateValue(data.dht11)
    setBackground(data.dht11.weather);
    console.log(data.dht11);
});

setInterval(setCurrentDateTime, 500)



