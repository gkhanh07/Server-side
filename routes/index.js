var express = require('express');
var router = express.Router();
const MemberController = require('../controller/memberController')
const WatchController = require('../controller/watchController')
const Brand = require('../models/brand');
const commentController = require('../controller/commentController');
const BrandController = require('../controller/brandController')
/* GET home page. */

router.route("/search").get(WatchController.searchByWatchName)
router.route("/create").get(WatchController.create)
router.route("/filter").get(WatchController.filterWatch)
router.route("/profile").get(MemberController.getProfile)
router.route("/fake").get(commentController.createDummyComment)
router.route("/profile/update").post(MemberController.updateProfile)
router.route("/comments").get(commentController.showComment)
router.get('/add-watch', async (req, res) => {
    try {
        const brands = await Brand.find(); // Fetch all brands from database
        res.render('addwatch', { brands });
    } catch (err) {
        console.error('Error fetching brands:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.route("/add-watch/create").post(WatchController.addWatch)
router.route('/logout').get(MemberController.logout)
router.get('/add-brand', function (req, res) {
    res.render('addbrand');
})

router.route('/managebrand').get(BrandController.getAllBrands)

router.route('/brands/search').get(BrandController.searchBrand)

router.route('/delete-brand/:id').post(BrandController.deleteBrand)
router.route('/manageuser').get(MemberController.getAllUsers)
router.route('/users/add').post(MemberController.addUser)



router.route('/add-brand').post(BrandController.addBrand)
router.route("/").get(WatchController.getAll)

module.exports = router;
