const Watch = require("../models/watch");

const Comment = require('../models/comment');
const Brand = require('../models/brand');
class BrandController {

    static async getAllBrands(req, res) {
        try {
            const brands = await Brand.find({}).exec();
            res.render('manageBrand', { brands });
        } catch (err) {
            console.error('Error fetching brands:', err);
            res.status(500).send('Error fetching brands');
        }
    }
    static async addBrand(req, res) {
        const { brandName } = req.body;

        try {
            // Kiểm tra xem tên thương hiệu đã tồn tại trong database chưa
            const existingBrand = await Brand.findOne({ brandName });

            if (existingBrand) {
                return res.status(400).send('Tên thương hiệu đã tồn tại');
            }

            // Tạo thương hiệu mới
            const newBrand = await Brand.create({ brandName });

            res.status(201).redirect('/managebrand'); // Chuyển hướng về trang chủ sau khi thêm thành công
        } catch (err) {
            console.error('Lỗi thêm thương hiệu:', err);
            res.status(500).send('Lỗi thêm thương hiệu');
        }
    }

    static async deleteBrand(req, res) {
        const brandId = req.params.id;

        try {
            const deletedBrand = await Brand.findByIdAndDelete(brandId);

            if (!deletedBrand) {
                return res.status(404).send('Brand not found');
            }

            res.redirect('/managebrand');
        } catch (err) {
            console.error('Error deleting brand:', err);
            res.status(500).send('Error deleting brand');
        }
    }
    static async searchBrand(req, res) {
        const { query } = req.query;
        try {
            const regex = new RegExp(query, 'i'); // Case-insensitive search
            const brands = await Brand.find({ brandName: regex }).exec();
            res.render('manageBrand', { brands, searchQuery: query });
        } catch (err) {
            console.error('Error searching brands:', err);
            res.status(500).send('Error searching brands');
        }
    }
}
module.exports = BrandController;