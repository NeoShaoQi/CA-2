// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (db) => {

    // ==========================
    // REGISTER
    // ==========================

    router.get('/register', (req, res) => {
        res.render('register', { error: null });
    });

    router.post('/register', async (req, res) => {

        const { username, email, password } = req.body;

        try {

            db.query(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username],
                async (err, results) => {

                    if (err) throw err;

                    if (results.length > 0) {
                        return res.render('register', {
                            error: 'Username or Email is already registered!'
                        });
                    }

                    // Hash Password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    // Every new account is a MEMBER
                    const userRole = 'member';

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
                            userRole
                        ],
                        (err) => {

                            if (err) throw err;

                            res.redirect('/login');

                        }
                    );

                }
            );

        } catch (err) {

            console.error(err);
            res.status(500).send('Server error during registration');

        }

    });


    // ==========================
    // LOGIN
    // ==========================

    router.get('/login', (req, res) => {
        res.render('login', { error: null });
    });

    router.post('/login', (req, res) => {

        const { email, password } = req.body;

        db.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (err, results) => {

                if (err) throw err;

                if (results.length === 0) {
                    return res.render('login', {
                        error: 'Invalid email or password.'
                    });
                }

                const user = results[0];

                const isMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!isMatch) {
                    return res.render('login', {
                        error: 'Invalid email or password.'
                    });
                }

                // Save user into session
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


    // ==========================
    // LOGOUT
    // ==========================

    router.get('/logout', (req, res) => {

        req.session.destroy((err) => {

            if (err) throw err;

            res.redirect('/login');

        });

    });

    return router;

};
