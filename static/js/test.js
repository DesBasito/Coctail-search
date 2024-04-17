const base_url = 'https://restcountries.com/v3.1/alpha';
window.addEventListener('load', onLoad)
async function makeRequest(url, method='GET') {
    let response = await fetch(url, {method});

    if (response.ok) {
        return await response.json();
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

async function onClick(event) {
    event.preventDefault();
    let url = `${base_url}/KGZ?fields=name,borders`;

    try {
        let { name, borders } = await makeRequest(url);

        let countryList = document.getElementById('country_list');
        countryList.innerHTML = '';

        let countryName = document.createElement('li');
        countryName.textContent = name.official;
        countryList.appendChild(countryName);

        let promises = borders.map(code => {
            let url = `${base_url}/${code}?fields=name`;
            return makeRequest(url);
        });
        let data = await Promise.all(promises);

        data.forEach(item => {
            let neighborCountry = document.createElement('li');
            neighborCountry.textContent = item.name.common;
            countryList.appendChild(neighborCountry);
        });
    } catch (error) {
        console.log(error);
    }
}

function onLoad(){
    let button = document.getElementById('click_me')
    button.onclick = onClick
}