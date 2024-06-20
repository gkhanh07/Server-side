const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    membername: { type: String, required: true },
    password: { type: String, required: true },
    yearofBirth: { type: Number, required: true },
    isAdmin: { type: Boolean, default: false },
    refreshToken: { type: String }
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;