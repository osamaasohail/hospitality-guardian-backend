const dutyManagerController = require('../controllers/dutyManager');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/cert/:certId/duty-manager')
        .get(authorize, dutyManagerController.get)
        .post(authorize, dutyManagerController.add)
    app.route('/cert/:certId/duty-manager/:dmId')
        .get(authorize, dutyManagerController.getOne)
        .put(authorize, dutyManagerController.update)
        .delete(authorize, dutyManagerController.delete)
}