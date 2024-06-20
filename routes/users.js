var express = require('express');
var User = express.Router();
const MemberController = require('../controller/memberController')
const CommentController = require('../controller/commentController');
/* GET users listing. */

User.get('/signup', function (req, res) {
    res.render('signUp');
})
User.route("/fake").get(CommentController.createDummyComment)
User.get('/login', function (req, res) {
    const status = req.query.status;
    const successMessage = status === 'success' ? 'Đăng ký thành công, vui lòng đăng nhập.' : '';
    res.render('login', { successMessage });
})

User.post('/create', MemberController.signUp);

User.post('/loginuser', MemberController.login);
User.get('/search', MemberController.searchUser);

module.exports = User;
