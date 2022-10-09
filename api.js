var rootURL = 'http://167.71.206.17/'

export default function (code, city_or_latlong) {
    if (city_or_latlong) {
        var url = `${rootURL}cityname?name=${code}`;
    } else {
        var url = `${rootURL}latlong?latlong=${code}`;
    }
    console.log(url)
    // return fetch('http://167.71.206.17/cityname?name=BKK').then(function (response) {
    //     console.log('ye');
    //     return response.text();
    // }).then(function (text) {
    //     console.log(text);
    //     let json = JSON.parse(text);
    //     console.log(json);
    //     return json;
    // })
    return fetch(url)
    .then((response) => response.text())
    .then((result) => JSON.parse(result))
    .catch((error) => console.log('error',error));
}