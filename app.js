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
    database: 'c237_029_teamuniqueandshort',
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
// ==========================================================
// (ALTON) - CREATE WORKOUT
// Added calories field into workout creation.
// ==========================================================

app.post('/addWorkout', isAuthenticated, (req, res) => {

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
        [
            workoutName,
            workoutType,
            duration,
            calories
        ],
        (err) => {

            if (err) throw err;

            res.redirect('/workouts');

        }
    );

});


// View Workouts
app.get('/workouts', (req, res) => {

    const sql = 'SELECT * FROM workouts';

    db.query(sql, (err, results) => {

        if (err) throw err;

        res.render('workouts', {
            workouts: results
        });

    });

});


// ==========================================================
// (ALTON) - EDIT WORKOUT
// Displays selected workout for editing.
// ==========================================================

app.get('/editWorkout/:id', isAuthenticated, isAdmin , (req, res) => {

    db.query(
        'SELECT * FROM workouts WHERE id=?',
        [req.params.id],
        (err, results) => {

            if (err) throw err;

            res.render('editWorkout', {
                workout: results[0]
            });

        });

});


// ==========================================================
// (ALTON) - UPDATE WORKOUT
// Updates workout information.
// ==========================================================

app.post('/editWorkout/:id', isAuthenticated, isAdmin, (req, res) => {

    const {
        workoutName,
        workoutType,
        duration,
        calories
    } = req.body;

    db.query(
        `
        UPDATE workouts
        SET
            workoutName=?,
            workoutType=?,
            duration=?,
            calories=?
        WHERE id=?
        `,
        [
            workoutName,
            workoutType,
            duration,
            calories,
            req.params.id
        ],
        (err) => {

            if (err) throw err;

            res.redirect('/workouts');

        });

});


// ==========================================================
// (ALTON) - DELETE WORKOUT
// Deletes selected workout.
// ==========================================================

app.get('/deleteWorkout/:id', isAuthenticated, isAdmin, (req, res) => {

    db.query(
        'DELETE FROM workouts WHERE id=?',
        [req.params.id],
        (err) => {

            if (err) throw err;

            res.redirect('/workouts');

        });

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
        [
            foodName,
            calories,
            mealType
        ],
        (err) => {

            if (err) throw err;

            res.redirect('/calories');

        }
    );

});


// View Calories
app.get('/calories', isAuthenticated,(req, res) => {

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


// ==========================================================
// (ALTON) - EDIT CALORIE ENTRY
// Displays the selected calorie entry for editing.
// ==========================================================

app.get('/editCalories/:id', isAuthenticated, isAdmin,(req, res) => {

    db.query(
        'SELECT * FROM calories WHERE id=?',
        [req.params.id],
        (err, results) => {

            if (err) throw err;

            res.render('editCalories', {
                calorie: results[0]
            });

        }
    );

});


// ==========================================================
// (ALTON) - UPDATE CALORIE ENTRY
// Updates an existing calorie record.
// ==========================================================

app.post('/editCalories/:id', isAuthenticated,isAdmin, (req, res) => {

    const {
        foodName,
        calories,
        mealType
    } = req.body;

    const sql = `
        UPDATE calories
        SET
            foodName=?,
            calories=?,
            mealType=?
        WHERE id=?
    `;

    db.query(
        sql,
        [
            foodName,
            calories,
            mealType,
            req.params.id
        ],
        (err) => {

            if (err) throw err;

            res.redirect('/calories');

        }
    );

});


// ==========================================================
// (ALTON) - DELETE CALORIE ENTRY
// Deletes the selected calorie record.
// ==========================================================

app.get('/deleteCalories/:id', isAuthenticated, isAdmin,(req, res) => {

    db.query(
        'DELETE FROM calories WHERE id=?',
        [req.params.id],
        (err) => {

            if (err) throw err;

            res.redirect('/calories');

        }
    );

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
// ADMIN ADD WORKOUT
// ====================

// Show Add Workout Form
app.get('/admin/addWorkout',
    isAuthenticated,
    isAdmin,
    (req, res) => {

        res.render('addWorkout');

});

// Save Preset Workout
app.post('/admin/addWorkout',
    isAuthenticated,
    isAdmin,
    (req, res) => {

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
            [
                workoutName,
                workoutType,
                duration,
                calories
            ],
            (err) => {

                if (err) throw err;

                res.redirect('/workouts');

            });

});

// ====================
// SERVER
// ====================

app.listen(3000, () => {
    console.log('========================================');
    console.log('Gym Tracker Server Started Successfully');
    console.log('Running at: http://localhost:3000');
    console.log('========================================');
});
