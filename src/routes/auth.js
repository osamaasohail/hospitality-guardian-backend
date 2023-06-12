const authController = require('../controllers/auth');
const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    
    app.route('/users')
        .get(authController.getUsers);
    app.route('/user')
        .get(authorize, authController.me);
    app.route('/update-user/:id')
        .put(authController.updateUser)
    app.route('/register')
        .post(authController.register);
    app.route('/login')
        .post(authController.login);
    app.route('/verify-email/:id')
        .get(authController.verifyEmail)
    app.route('/forgot-password')
        .post(authController.sendPasswordRequest)
    app.route('/reset-password')
        .get(authController.resetPassword)
    app.route('/change-password')
        .post(authController.changePassword)
    app.route('/clearCollection')
        .get(authController.clearCollection)
}

