const stripeController = require('../controllers/stripe');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/session')
        .post(authorize, stripeController.session)
    app.route('/webhook')
        .post(stripeController.webhook)
}