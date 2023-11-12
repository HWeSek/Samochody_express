const express = require('express')
const app = express()
const PORT = 3000;
const path = require("path")

const hbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');                           // określenie nazwy silnika szablonów



const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const Datastore = require('nedb')

const cars_database = new Datastore({
    filename: 'cars_database.db',
    autoload: true
});


app.get("/", function (req, res) {
    res.render('index.hbs');
})

app.get("/addCars", function (req, res) {
    res.render('add.hbs');
})

app.post("/addCars", function (req, res) {
    const new_car = {
        insurance: req.body.insurance == 'TAK' ? 'TAK' : 'NIE',
        gasoline: req.body.gasoline == 'TAK' ? 'TAK' : 'NIE',
        damaged: req.body.damaged == 'TAK' ? 'TAK' : 'NIE',
        IVwd: req.body.IVwd == 'TAK' ? 'TAK' : 'NIE',
    }
    cars_database.insert(new_car, function (err, the_car) {
        res.render('add.hbs', the_car);
    })
})

app.get("/ListCars", function (req, res) {
    cars_database.find({}, function (err, all_cars) {
        res.render('list.hbs', { all_cars });
    })
})

////DELETE CARS
app.get("/delCars", function (req, res) {
    cars_database.find({}, function (err, all_cars) {
        res.render('del.hbs', { all_cars });
    })
})

app.get("/delSingle", function (req, res) {
    cars_database.remove({ _id: req.query.del_id }, function (err, removed) {
        console.log(removed);
        cars_database.find({}, function (err, all_cars) {
            res.render('del.hbs', { removed, all_cars });
        })
    })
})

app.get("/delAll", function (req, res) {
    cars_database.remove({}, { multi: true }, function (err, removed) {
        console.log(removed);
        cars_database.find({}, function (err, all_cars) {
            res.render('del.hbs', { removed, all_cars });
        })
    })
})

app.get("/delSelected", function (req, res) {
    let removed = 0;
    //console.log(req.query);
    err_message = 'No cars selected!'
    if (req.query.select == undefined) {
        cars_database.find({}, function (err, all_cars) {
            res.render('del.hbs', { err_message, all_cars });
        })
    }
    else {
        for (id of req.query.select) {
            cars_database.remove({ _id: id }, function (err, removed_now) {
                removed += removed_now
                console.log(removed);
            })
        }
        cars_database.find({}, function (err, all_cars) {
            res.render('del.hbs', { removed, all_cars });
        })
    }
})
//////DELETE CARS END

app.get("/editCars", function (req, res) {
    cars_database.find({}, function (err, all_cars) {
        res.render('edit.hbs', { all_cars });
    })
})

app.get("/editCar", function (req, res) {
    cars_database.find({}, function (err, all_cars) {
        for (car of all_cars) {
            if (req.query.car_id == car._id) {
                car['edited'] = true;
            }
        }
        res.render('edit.hbs', { id: req.query.car_id, all_cars });
    })
})

app.get("/editSave", function (req, res) {
    const new_car = {
        insurance: req.query.insurance,
        gasoline: req.query.gasoline,
        damaged: req.query.damaged,
        IVwd: req.query.IVwd
    }
    cars_database.update({ _id: req.query.car_id }, { $set: new_car }, {});
    res.redirect("/editCars")
})


app.use(express.static('static'));
app.listen(PORT, function () {
    console.log(`Serwer działa na porcie: ${PORT}`)
})