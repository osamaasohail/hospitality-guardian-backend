const certsController = require('../controllers/certs');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/cert')
        .get(authorize, certsController.get)
        .post(authorize, certsController.add)
    app.route('/cert/:id')
        .put(authorize, certsController.update)
        .delete(authorize, certsController.delete)
}