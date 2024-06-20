const Watch = require("../models/watch");
const Member = require('../models/member');
const Comment = require('../models/comment');
const Brand = require('../models/brand');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class MemberController {



    static async createUser(req, res) {
        try {
            const user = await Member.create({
                membername: "Khanh",
                password: "123",
                isAdmin: true
            });
            res.status(200).json(user);
        } catch (err) {
            console.error('Error creating user:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


    static async signUp(req, res) {
        const { membername, password, yearofBirth } = req.body;


        try {
            const existingUser = await Member.findOne({ membername });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const newUser = await Member.create({
                membername,
                password,
                yearofBirth,
                isAdmin: false
            });

            if (newUser) {
                res.redirect('/users/login?status=success');
            }
        } catch (err) {
            console.error('Error creating user:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async login(req, res) {
        const { membername, password } = req.body;

        try {
            const user = await Member.findOne({ membername });
            if (!user || user.password !== password) {
                return res.render('login', { errorMessage: "Incorrect username or password" });
            }

            req.session.user = {
                id: user.id,
                membername: user.membername,
                isAdmin: user.isAdmin,

            };

            res.redirect('/');
        } catch (e) {
            console.error('Error logging in:', e);
            return res.render('login', { errorMessage: 'Internal Server Error' });
        }
    }
    // static async signUp(req, res) {
    //     const { membername, password, yearofBirth } = req.body;


    //     try {
    //         const existingUser = await Member.findOne({ membername });
    //         if (existingUser) {
    //             return res.status(400).json({ error: 'User already exists' });
    //         }

    //         // Generate a salt to hash the password
    //         const saltRounds = 10;
    //         const hashedPassword = await bcrypt.hash(password, saltRounds);

    //         const newUser = await Member.create({
    //             membername,
    //             password: hashedPassword, // Store hashed password in the database
    //             yearofBirth,
    //             isAdmin: false
    //         });

    //         if (newUser) {
    //             res.redirect('/users/login?status=success');
    //         }
    //     } catch (err) {
    //         console.error('Error creating user:', err);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // }


    // static async login(req, res) {
    //     const { membername, password } = req.body;
    //     try {
    //         const user = await Member.findOne({ membername });
    //         if (!user || !(await bcrypt.compare(password, user.password))) {
    //             return res.render('login', { errorMessage: "Incorrect username or password" });
    //         }
    //         console.log("secret", process.env.JWT_SECRET)
    //         // Generate JWT token
    //         const token = jwt.sign({
    //             id: user.id,
    //             membername: user.membername,
    //             isAdmin: user.isAdmin
    //         }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Adjust expiry as per your requirement
    //         console.log("token", token)
    //         res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiry, secure in production

    //         res.redirect('/');
    //     } catch (e) {
    //         console.error('Error logging in:', e);
    //         return res.render('login', { errorMessage: 'Internal Server Error' });
    //     }
    // }
    static async logout(req, res) {
        res.cookie('jwt', '', { maxAge: 1 });
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }

    static async getProfile(req, res) {
        if (!req.session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.session.user.id;

        try {
            const user = await Member.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const userProfile = {
                id: user.id,
                membername: user.membername,
                email: user.email
            };

            res.render('profile', { userProfile });
        } catch (e) {
            console.error('Error retrieving user profile:', e);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async updateProfile(req, res) {
        if (!req.session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.session.user.id;
        const { membername, password } = req.body;

        try {
            const updatedUser = await Member.findByIdAndUpdate(userId, { membername, password }, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            req.session.user.membername = updatedUser.membername;
            req.session.user.password = updatedUser.password;
            res.redirect('/profile');
        } catch (e) {
            console.error('Error updating user profile:', e);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async addUser(req, res) {
        const { membername, password } = req.body;
        try {
            await Member.create({ membername, password, isAdmin: false });
            res.redirect('/manageuser');
        } catch (err) {
            console.error('Error adding user:', err);
            res.status(500).send('Internal Server Error');
        }
    }

    static async searchUser(req, res) {
        const query = req.query.query;
        try {
            const users = await Member.find({ membername: new RegExp(query, 'i') });
            res.render('manageUser', { users });
        } catch (err) {
            console.error('Error searching user:', err);
            res.status(500).send('Internal Server Error');
        }
    }
    static async deleteUser(req, res) {
        const userId = req.params.id;
        try {
            await Member.findByIdAndDelete(userId);
            res.redirect('/users');
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('Internal Server Error');
        }
    }

    static async editUser(req, res) {
        const userId = req.params.id;
        try {
            const user = await Member.findById(userId);
            res.render('editUser', { user });
        } catch (err) {
            console.error('Error editing user:', err);
            res.status(500).send('Internal Server Error');
        }
    }

    static async updateUser(req, res) {
        const userId = req.params.id;
        const { membername, password } = req.body;
        try {
            await Member.findByIdAndUpdate(userId, { membername, password });
            res.redirect('/users');
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).send('Internal Server Error');
        }
    }
    static async getAllUsers(req, res) {
        try {
            const users = await Member.find();
            res.render('manageUser', { users }); // Or res.json(users) if you want to send JSON
        } catch (err) {
            console.error('Error retrieving users:', err);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = MemberController;
