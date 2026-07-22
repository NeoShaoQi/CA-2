const express = require('express');
const mysql = require('mysql2');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

// Database connection
const db = mysql.createConnection({
    host: 'c237-eaint-mysql.mysql.database.azure.com',
    user: 'c237_029',
    password: 'c237029@2026!',
    database: 'c237_029_teamunqiueandshort'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// Display Add Exercise Form
app.get('/addExercise', (req, res) => {
    res.render('addExercise');
});

// CREATE
app.post('/addExercise', (req, res) => {

    const {
        exerciseName,
        muscleGroup,
        sets,
        reps
    } = req.body;

    const sql = `
        INSERT INTO exercises
        (exerciseName, muscleGroup, sets, reps)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [exerciseName, muscleGroup, sets, reps],
        (err, result) => {

            if (err) throw err;

            res.redirect('/exercises');
        }
    );
});

// READ
app.get('/exercises', (req, res) => {

    const sql = "SELECT * FROM exercises";

    db.query(sql, (err, results) => {

        if (err) throw err;

        res.render('exercises', {
            exercises: results
        });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});