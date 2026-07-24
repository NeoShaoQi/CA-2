// middleware/auth.js

// Checks if the user is logged in
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Checks if the user has Admin privileges
function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Access Denied: Admin privileges required.');
}

module.exports = { isAuthenticated, isAdmin };