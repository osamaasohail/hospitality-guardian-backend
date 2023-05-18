const businessLicenseController = require('../controllers/businessLicense');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/business-license')
        .get(authorize, businessLicenseController.get)
        .post(authorize, businessLicenseController.add)
    app.route('/business-license/:id')
        .put(authorize, businessLicenseController.update)
        .delete(authorize, businessLicenseController.delete)
    app.route('/business-license/:id/gamingLicense')
        .delete(authorize, businessLicenseController.deleteGamingLicense)
        .post(authorize, businessLicenseController.addGamingLicense)
}