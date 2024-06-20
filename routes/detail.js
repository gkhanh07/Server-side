var express = require('express');
var Detail = express.Router();
const WatchController = require('../controller/watchController')
const CommentController = require('../controller/commentController');

/* GET home page. */



Detail.route("/:id").get(WatchController.getDetail)

Detail.route("/:id/comments").post(CommentController.postComment)

Detail.route('/editwatch/:id').get(WatchController.getWatchById)

Detail.route('/editwatch/:id').post(WatchController.updateWatch)
Detail.route('/deletecomment/:id').post(CommentController.deleteComment)

Detail.route('/deletewatch/:id').post(WatchController.deleteWatch)

Detail.route('/editcomment/:id').post(CommentController.updateComment)

module.exports = Detail;
