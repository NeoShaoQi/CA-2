const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (db) => {

    const router = express.Router();

    // =====================
    // AUTH PAGE
    // =====================

    router.get('/auth', (req, res) => {
        res.render('auth');
    });

    // =====================
    // LOGIN PAGE
    // =====================

    router.get('/login', (req, res) => {
        res.render('login');
    });

    // =====================
    // REGISTER PAGE
    // =====================

    router.get('/register', (req, res) => {
        res.render('register');
    });

    // =====================
    // REGISTER USER
    // =====================

    router.post('/register', async (req, res) => {

        const {
            username,
            email,
            password,
            role
        } = req.body;

        try {

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO users
                (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    username,
                    email,
                    hashedPassword,
                    role || 'user'
                ],
                (err) => {

                    if (err) {
                        console.log(err);
                        return res.send('Registration failed');
                    }

                    res.redirect('/login');
                }
            );

        } catch (error) {

            console.log(error);
            res.send('Registration failed');

        }
    });

    // =====================
    // LOGIN USER
    // =====================

    router.post('/login', (req, res) => {

        const {
            email,
            password
        } = req.body;

        const sql =
            'SELECT * FROM users WHERE email = ?';

        db.query(
            sql,
            [email],
            async (err, results) => {

                if (err) {
                    console.log(err);
                    return res.send('Login failed');
                }

                if (results.length === 0) {
                    return res.send('Invalid email or password');
                }

                const user = results[0];

                const match =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!match) {
                    return res.send('Invalid email or password');
                }

                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };

                res.redirect('/');
            }
        );
    });

    // =====================
    // LOGOUT
    // =====================

    router.get('/logout', (req, res) => {

        req.session.destroy(() => {
            res.redirect('/');
        });

    });

    return router;
};