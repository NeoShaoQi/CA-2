const express = require('express');
const mysql = require('mysql2');

// Keevan: Require Session and Auth Middleware
const session = require('express-session');
const { isAuthenticated, isAdmin } = require('./middleware/auth');

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
    database: 'c237_029_teamuniqueandshort'
});

db.connect((err) => {
    if (err) {
        throw err;
    }

    console.log('Connected to MySQL');
});


// ====================
// SESSION SETUP
// ====================

app.use(session({
    secret: 'c237_gym_tracker_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));

// Make user session data available in all EJS pages
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// Auth Routes
const authRoutes = require('./routes/auth')(db);
app.use('/', authRoutes);


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
app.get('/addWorkout', isAuthenticated, (req, res) => {
    res.render('addWorkout');
});

// Create Workout
app.post('/addWorkout', isAuthenticated, (req, res) => {

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

// View Workouts
app.get('/workouts', isAuthenticated, (req, res) => {

    const search = req.query.search || '';

    const sql = `
        SELECT *
        FROM workouts
        WHERE workoutName LIKE ?
    `;

    db.query(
        sql,
        [`%${search}%`],
        (err, results) => {

            if (err) throw err;

            res.render('workouts', {
                workouts: results,
                search: search
            });
        }
    );
});


// ====================
// CALORIE ROUTES
// ====================

// Display Add Calories Form
app.get('/addCalories', isAuthenticated, (req, res) => {
    res.render('addCalories');
});

// Create Calorie Entry
app.post('/addCalories', isAuthenticated, (req, res) => {

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
app.get('/calories', isAuthenticated, (req, res) => {

    const sql = 'SELECT * FROM calories';

    db.query(sql, (err, results) => {

        if (err) throw err;

        let totalCalories = 0;

        results.forEach(item => {
            totalCalories += Number(item.calories);
        });

        res.render('calories', {
            calories: results,
            totalCalories: totalCalories
        });
    });
});


// ====================
// BMI ROUTES
// ====================

// Display BMI Calculator
app.get('/bmi', isAuthenticated, (req, res) => {

    res.render('bmi', {
        bmi: null,
        category: null
    });

});

// Calculate BMI
app.post('/bmi', isAuthenticated, (req, res) => {

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
        bmi,
        category
    });

});

// ====================
// ADMIN ROUTES
// ====================

app.get('/admin',
    isAuthenticated,
    isAdmin,
    (req, res) => {

        res.render('admin');

});


app.get('/users',
    isAuthenticated,
    isAdmin,
    (req, res) => {

        const sql = 'SELECT * FROM users';

        db.query(sql, (err, results) => {

            if (err) throw err;

            res.render('users', {
                users: results
            });

        });

});

// ====================
// SERVER
// ====================

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});