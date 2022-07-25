
const api = {
    myKey: "e600d508a14d7982bb50b9fd7103a238",
    base: "https://api.openweathermap.org/data/2.5/onecall?",
    longLat: 'https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}',
    geoCodeUrl: 'http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}'
}


let searchData = document.getElementById('search-box');
searchData.addEventListener('keyup', getWeather);

let locs = [];
let cty = '';

window.addEventListener('load', function()
{
    let details = {
        enableHighAccuracy: true,
        timeout: 1000 * 5, // 5 secs
        maximumAge: 1000 * 60 * 3 // 3 mins
    };
    let fail = err => {console.log(err.code, err.message)};
    let success = async (pos) => {
        let lat = pos.coords.latitude.toFixed(2);
        let lng = pos.coords.longitude.toFixed(2);

        let result = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&appid=${api.myKey}`);

        if(result.ok) {
            let myCity = await result.json();
            cty = `${myCity[0].name}, ${myCity[0].state}, ${myCity[0].country}`;
            getData(lat, lng);
        }
    };
    navigator.geolocation.getCurrentPosition(success, fail, details);

})


function dateBuilder(dt) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];
    return {
        hour: hours[dt.getHours()],
        day : days[dt.getDay()],
        date: dt.getDate(),
        month: months[dt.getMonth()],
        year: dt.getFullYear()
    };
}


function showResults(data) {
    /* Start of current section */
    let city = document.querySelector('.location .city');
    city.innerText = `${cty}`;
    
    // let dt = new Date();
    let date = document.querySelector('.location .date');
    let dt = dateBuilder(new Date(data.current.dt * 1000));
    // date.innerText = new Date(data.current.dt * 1000).getHours();
    date.innerText = `${dt.day} ${dt.date} ${dt.month} ${dt.year}`;
    
    let temp = document.querySelector('.current .temp');
    temp.innerHTML = `${Math.round(data.current.temp)}<span>°c</span>`;
    
    let weather_el = document.querySelector('.current .weather');
    weather_el.innerText = data.current.weather[0].description;
    
    let icon = document.querySelector('.current img');
    icon.src = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png`;
    
    let feels = document.querySelector('.feels');
    feels.innerText = `Feels like: ${Math.round(data.current.feels_like)}°c`;
    /* End of current section */
    
    /* Start of hourly forecast section */
    hourly.innerHTML = data.hourly.map((hr, idx) => {
        if (idx >=1 && idx <= 5) {
            let dt = dateBuilder(new Date(hr.dt * 1000));

            return `<div class="card">
            <h2 class="time">${dt.hour}</h2>
            <p class="weather">${hr.weather[0].description}</p>
            <div class="temp">${Math.round(hr.temp)}°c</div>
            <img src="http://openweathermap.org/img/wn/${hr.weather[0].icon}@2x.png" alt="${hr.weather[0].description}">
            <div>Feel like: ${Math.round(hr.feels_like)}°c</div>
            </div>`
        }
    }).join('');
    /* End of hourly forecast section */
    
    /* Start of daily forecast section */
    let dly = document.querySelector('#daily');
    dly.innerHTML = data.daily.map((dy, idx) => {
        if (idx >= 1 && idx <= 5) {
            let dt = dateBuilder(new Date(dy.dt * 1000));

            return `<div class="card">
            <h2 class="date">${dt.day}</h2>
            <p class="weather">${dy.weather[0].description}</p>
            <div class="temp">${Math.round(dy.temp.day)}°c</div>
            <img src="http://openweathermap.org/img/wn/${dy.weather[0].icon}@2x.png" alt="${dy.weather[0].description}">
            <div class="low-hi">${Math.round(dy.temp.min)}°c / ${Math.round(dy.temp.max)}°c</div>
            </div>`
        }
    }).join('');
    /* End of daily forecast section */
}


async function getData(lat, lng) {
    try {
        let res = await fetch(`${api.base}lat=${lat}&lon=${lng}&units=metric&appid=${api.myKey}`);
        
        if (res.ok) {
            let hidden = document.querySelectorAll('.hidden');
            hidden.forEach(item => item.classList.remove('hidden'));
            // console.log(hidden)

            let data = await res.json();
            // console.log(data);
            showResults(data);
        }
    } catch (error) {
        alert(error);
    }
}


function selectLocation(e) {
    let idx = e.target.id;
    cty = e.target.innerText;
    e.target.parentNode.innerHTML ='';
    
    let lat = locs[idx].lat;
    let lng = locs[idx].lon;
    
    getData(lat, lng);
}


function createOption(location, idx) {
    let li = document.createElement('li');
    location.state?
    li.innerHTML = `${location.name},${location.state}, ${location.country}`:
    li.innerHTML = `${location.name}, ${location.country}`;

    li.classList.add('option');
    li.id = idx;
    li.addEventListener('click', selectLocation);
    
    let ul = document.getElementById('search-results');
    ul.append(li);
}


async function getWeather(e) {
    if (e.keyCode === 13) {
        let city = e.target.value;
        try {
            let res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${api.myKey}`);
            
            if (res.ok) {
                locs = await res.json();
                
                if (locs.length === 1) {
                    lat = locs[0].lat;
                    lng = locs[0].lon;
                    cty = `${locs[0].name}, ${locs[0].state}, ${locs[0].country}`;
                    
                    getData(lat, lng);
                    e.target.value = '';
                } else {
                    let ul = document.getElementById('search-results');
                    ul.innerHTML = '';
                    for (let i = 0; i < locs.length; i++) {
                        createOption(locs[i], i);
                        e.target.value = '';
                    }
                }
            }
        } catch (error) {
            alert(error);
        }
    }
}







// let hourly = document.querySelector('#hourly');

// for (let i = 1; i <= 5; i++) {
//     let card = document.createElement('div');
//     card.classList.add('card');
    
//     let dt = dateBuilder(new Date(data.hourly[i].dt * 1000));
//     let h2 = document.createElement('h2');
//     h2.classList.add('time');
//     h2.innerText = dt.hour;
//     card.append(h2);
    
//     let p = document.createElement('p');
//     p.classList.add('weather');
//     p.innerText = data.hourly[i].weather[0].description;
//     card.append(p);
    
//     let div = document.createElement('div');
//     div.classList.add('temp');
//     div.innerText = `${Math.round(data.hourly[i].temp)}°c`;
//     card.append(div);
    
//     let img = document.createElement('img');
//     img.src = `http://openweathermap.org/img/wn/${data.hourly[i].weather[0].icon}@2x.png`;
//     img.alt = `${data.hourly[i].weather[0].description}`;
//     card.append(img);

//     hourly.append(card);
// }