const notifications = require('../controllers/notificationsController');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/notification')
        .get(authorize, notifications.get)
}