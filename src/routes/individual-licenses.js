const individualLicenseController = require('../controllers/individualLicense');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/individual-license')
        .get(authorize, individualLicenseController.get)
        .post(authorize, individualLicenseController.add)
    app.route('/individual-license/:id')
        .put(authorize, individualLicenseController.update)
        .delete(authorize, individualLicenseController.delete)
}