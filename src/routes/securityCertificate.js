const securityCertificateController = require('../controllers/securityCertificate');

const authorize = require('../middlewares/authorize');
module.exports = (app) => {
    app.route('/cert/:certId/security-certificate')
        .get(authorize, securityCertificateController.get)
        .post(authorize, securityCertificateController.add)
    app.route('/cert/:certId/security-certificate/:scId')
        .get(authorize, securityCertificateController.getOne)
        .put(authorize, securityCertificateController.update)
        .delete(authorize, securityCertificateController.delete)
}