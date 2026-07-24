const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'c237_029_teamuniqueandshort'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});


// =====================
// HOME PAGE
// =====================

app.get('/', (req, res) => {
    res.render('index');
});


// =====================
// WORKOUT ROUTES
// =====================

// Show Add Workout Form
app.get('/addWorkout', (req, res) => {
    res.render('addWorkout');
});

// Create Workout
app.post('/addWorkout', (req, res) => {

    const {
    workoutName,
    workoutType,
    duration,
    calories
} = req.body;

    const sql = `
        INSERT INTO workouts
        (workoutName, workoutType, duration, calories)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [ workoutName,workoutType,duration,calories],
        (err, result) => {

            if (err) throw err;

            res.redirect('/workouts');
        }
    );
});

// View Workouts
app.get('/workouts', (req, res) => {

    const search = req.query.search || '';

    const sql = `
        SELECT *
        FROM workouts
        WHERE workoutName LIKE ?
           OR workoutType LIKE ?
    `;

    db.query(
        sql,
        [`%${search}%`, `%${search}%`],
        (err, results) => {

            if (err) throw err;

            res.render('workouts', {
                workouts: results,
                search: search
            });

        }
    );

});


// =====================
// CALORIE ROUTES
// =====================

// Show Add Calories Form
app.get('/addCalories', (req, res) => {
    res.render('addCalories');
});

// Add Calories
app.post('/addCalories', (req, res) => {

    const { foodName, calories, mealType } = req.body;

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

    db.query(
        'SELECT * FROM calories',
        (err, results) => {

            if (err) throw err;

            let totalCalories = 0;

            results.forEach(item => {
                totalCalories += Number(item.calories);
            });

            res.render('calories', {
                calories: results,
                totalCalories: totalCalories
            });
        }
    );
});


// =====================
// BMI ROUTES
// =====================

// Display BMI Form
app.get('/bmi', (req, res) => {

    res.render('bmi', {
        bmi: null,
        category: null
    });

});

// Calculate BMI
app.post('/bmi', (req, res) => {

    const { weight, height } = req.body;

    const bmi = (
        weight / ((height / 100) * (height / 100))
    ).toFixed(2);

    let category = '';

    if (bmi < 18.5) {
        category = 'Underweight';
    }
    else if (bmi < 25) {
        category = 'Normal Weight';
    }
    else if (bmi < 30) {
        category = 'Overweight';
    }
    else {
        category = 'Obese';
    }

    res.render('bmi', {
        bmi: bmi,
        category: category
    });

});


// =====================
// SERVER
// =====================

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
