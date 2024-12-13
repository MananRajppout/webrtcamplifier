const isLogin = (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error.message);
    }
};

const isLogout = (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/dashboard');
        } else {
            next();
        }
    } catch (error) {
        console.error(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
};
