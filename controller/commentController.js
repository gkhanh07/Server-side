const Comment = require('../models/comment');
const Watch = require('../models/watch');

class CommentController {

    static async showComment(req, res) {
        const commentId = req.params.commentId;

        try {
            const comment = await Comment.findById(commentId)
                .populate('author', 'membername');

            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            res.status(200).json(comment);
        } catch (err) {
            console.error('Error fetching comment:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getComment(req, res) {
        const watchId = req.params.watchId;

        try {
            const comments = await Comment.find({ watchId })
                .populate('author'); // Assuming 'author' is a reference to the user model

            res.status(200).json(comments);
        } catch (err) {
            console.error('Error fetching comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async createDummyComment(req, res) {
        const dummyComment = {
            rating: 5,
            content: 'great',
            author: '666d56fa66016ab272e304f6', // Replace with an actual member ID
            watchId: '66695c5f8b784f9e15059f39' // Replace with an actual watch ID
        };

        try {
            const comment = await Comment.create(dummyComment);
            console.log('Comment created:', comment);
            res.status(201).json({ message: 'Dummy comment created successfully', comment });
        } catch (err) {
            console.error('Error creating comment:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async postComment(req, res) {
        const watchId = req.params.id;
        const { rating, content } = req.body;
        const userId = req.session.user ? req.session.user.id : null; // Assuming user info is in session

        try {
            // Check if the user has already commented on this watch
            const existingComment = await Comment.findOne({ watchId, author: userId });

            if (existingComment) {

                return res.status(400).json({ error: 'Bạn đã comment cho đồng hồ này rồi' });
            }

            // Create a new comment
            const comment = new Comment({
                watchId,
                author: userId,
                rating,
                content
            });

            await comment.save();

            // Update the Watch model to include this comment
            await Watch.findByIdAndUpdate(
                watchId,
                { $push: { comments: comment._id } },
                { new: true }
            );

            // Redirect to the watch detail page
            res.redirect(`/detail/${watchId}`);
        } catch (err) {
            res.redirect('/users/login');
        }
    }
    static async deleteComment(req, res) {
        const commentId = req.params.id;

        try {
            // Find the comment by ID
            const comment = await Comment.findById(commentId);

            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            // Delete the comment
            await Comment.findByIdAndDelete(commentId);

            // Optionally, remove the comment ID from the related watch document
            await Watch.findByIdAndUpdate(comment.watchId, { $pull: { comments: commentId } });

            // Redirect back to the watch detail page
            res.redirect(`/detail/${comment.watchId}`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async updateComment(req, res) {
        const commentId = req.params.id;
        const { rating, content } = req.body;

        try {
            // Tìm comment theo ID
            let comment = await Comment.findById(commentId);

            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            // Cập nhật thông tin comment
            comment.rating = rating;
            comment.content = content;
            await comment.save();

            // Lấy lại thông tin của watch liên quan (nếu cần)
            const updatedWatch = await Watch.findById(comment.watchId).populate('comments');
            await Watch.findByIdAndUpdate(comment.watchId, { $pull: { comments: commentId } });
            res.redirect(`/detail/${comment.watchId}`);
        } catch (err) {
            console.error('Error updating comment:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = CommentController;
