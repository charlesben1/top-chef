var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();


var allPages = [];

process.stdout.write('loading');

for (var $i = 1; $i <= 2; $i++) {

//for (var $i = 1; $i <= 35; $i++) {

    allPages.push("https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-" + $i.toString());

}

function scrapPage(url) {

    var result = [];
    return new Promise(function (resolve, reject) {
        request(url, function (error, response, html) {

            if (!error) {
                var $ = cheerio.load(html);
                $('.poi-card-link').filter(function () {

                    var data = $(this);
                    var currentRestaurant = {
                        url: "https://restaurant.michelin.fr" + data.first().attr()["href"]
                    };
                    result.push(currentRestaurant);

process.stdout.write('.');
                })
            }
            return resolve(result);
        });
    });
}

const promisesGetUrl = allPages.map(function (page) {
    return scrapPage(page);

});

Promise.all(promisesGetUrl).then(function (content) {
    var result = [];
    content.forEach(function (element) {
        if (Array.isArray(element)) {

            element.forEach(function (restaurant) {

                result.push(restaurant.url);
            });
        }
    });


    const promisesGetDataRestaurant = result.map(function (url) {

        return GetRestaurantDetail(url);
    });

    Promise.all(promisesGetDataRestaurant).then(function (content) {
        result = [];
        content.forEach(function (element) {

            if (Array.isArray(element)) {

                element.forEach(function (restaurant) {

                    result.push(restaurant);



                });
            }
        });
        fs.writeFile('resultatRestaurants.json', JSON.stringify(result, null, 4), function (err) {
            console.log("✅");
        });
    });
});

function GetRestaurantDetail(url) {
    var result = [];
    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            if (!error) {
                var restaurant = {};
                var $ = cheerio.load(body);
                $('.street-block').filter(function () {
                    var data = $(this);
                    restaurant.adress = data.children().first().text();
                });
                $('.poi_intro-display-title').filter(function () {
                    var data = $(this);
                    var title = data.first().text();
                    title = title.replace('\n      ', '');
                    title = title.replace('    ', '');
                    restaurant.title = title;
                });
                $('.postal-code').filter(function () {
                    var data = $(this);
                    restaurant.postalcode = data.first().text();
                });
                $('.locality').filter(function () {
                    var data = $(this);
                    restaurant.locality = data.first().text();
                });
                $('.country').filter(function () {
                    var data = $(this);
                    restaurant.country = data.first().text();
                });
                result.push(restaurant);
            }
            return resolve(result);
        });
    });
}

exports = module.exports = app;
