

module.exports = function extendSession(req, res, next) {
    req.session.setValue = function (value) {
        this.value = value;
    };
    next();
};
