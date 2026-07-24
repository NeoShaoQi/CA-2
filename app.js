const express = require('express');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));

// EJS
app.set('view engine', 'ejs');

// Database Connection
const db = mysql.createConnection({
    host: 'c237-eaint-mysql.mysql.database.azure.com',
    user: 'c237_029',
    password: 'c237029@2026!',
    database: 'c237_029_teamuniqueandshort',
});

db.connect((err) => {
    if (err) {
        throw err;
    }

    console.log('Connected to MySQL');
});


// ====================
// HOME
// ====================

app.get('/', (req, res) => {
    res.render('index');
});


// ====================
// WORKOUT ROUTES
// ====================

// Display Add Workout Form
app.get('/addWorkout', (req, res) => {
    res.render('addWorkout');
});

// Create Workout
app.post('/addWorkout', (req, res) => {

    const {
        workoutName,
        workoutType,
        duration
    } = req.body;

    const sql = `
        INSERT INTO workouts
        (workoutName, workoutType, duration)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [workoutName, workoutType, duration],
        (err, result) => {

            if (err) throw err;

            res.redirect('/workouts');
        }
    );
});

// View All Workouts
app.get('/workouts', (req, res) => {

    // Get the search text from the URL
    const search = req.query.search || '';

    // SQL query
    const sql = `
        SELECT *
        FROM workouts
        WHERE workoutName LIKE ?
    `;

    db.query(sql, [`%${search}%`], (err, results) => {

        if (err) throw err;

        res.render('workouts', {
            workouts: results,
            search: search
        });

    });

});


// ====================
// CALORIE ROUTES
// ====================

// Display Add Calories Form
app.get('/addCalories', (req, res) => {
    res.render('addCalories');
});

// Create Calorie Entry
app.post('/addCalories', (req, res) => {

    const {
        foodName,
        calories,
        mealType
    } = req.body;

    const sql = `
        INSERT INTO calories
        (foodName, calories, mealType)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [foodName, calories, mealType],
        (err, result) => {

            if (err) throw err;

            res.redirect('/calories');
        }
    );
});

// View Calories
app.get('/calories', (req, res) => {

    const sql = 'SELECT * FROM calories';

    db.query(sql, (err, results) => {

        if (err) throw err;

        let totalCalories = 0;

        results.forEach(item => {
            totalCalories += item.calories;
        });

        res.render('calories', {
            calories: results,
            totalCalories: totalCalories
        });
    });
});


// ====================
// SERVER
// ====================

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
