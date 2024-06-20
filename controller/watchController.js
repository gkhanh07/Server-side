const Watch = require("../models/watch");
const Comment = require('../models/comment');
const Brand = require('../models/brand');
const renderIndex = async (res, watches, searchValue = '', selectedBrand = '') => {
    try {
        const brands = await Brand.find({}).exec();
        res.render('index', { watches, brands, searchValue, selectedBrand });
    } catch (err) {
        console.error('Error rendering index:', err);
        res.status(500).send('Error rendering index');
    }
};

class WatchController {

    static async create(req, res) {
        const watchesToCreate = [
            {
                watchName: 'Cartier Watch',
                image: 'https://example.com/cartier-watch.jpg',
                price: 15000,
                watchDescription: 'Luxury watch from Cartier',
                brandName: 'Cartier'
            },
            {
                watchName: 'Rolex Watch',
                image: 'https://example.com/rolex-watch.jpg',
                price: 20000,
                watchDescription: 'Luxury watch from Rolex',
                brandName: 'Rolex'
            },
            {
                watchName: 'Audemars Piguet Watch',
                image: 'https://example.com/audemars-piguet-watch.jpg',
                price: 30000,
                watchDescription: 'Luxury watch from Audemars Piguet',
                brandName: 'Audemars Piguet'
            },
            {
                watchName: 'Patek Philippe Watch',
                image: 'https://example.com/patek-philippe-watch.jpg',
                price: 25000,
                watchDescription: 'Luxury watch from Patek Philippe',
                brandName: 'Patek Philippe'
            }
        ];

        try {
            const createdWatches = await Promise.all(watchesToCreate.map(async (watchData) => {
                let brand = await Brand.findOne({ brandName: watchData.brandName });
                if (!brand) {
                    brand = await Brand.create({ brandName: watchData.brandName });
                }

                const createdWatch = await Watch.create({
                    watchName: watchData.watchName,
                    image: watchData.image,
                    price: watchData.price,
                    watchDescription: watchData.watchDescription,
                    brand: brand._id
                });

                return createdWatch;
            }));

            res.status(201).json(createdWatches); // Trả về thông tin về watches được tạo
        } catch (err) {
            console.error('Error creating watches:', err);
            res.status(500).json({ message: 'Failed to create watches' });
        }
    }

    static async getAll(req, res) {
        try {
            const watches = await Watch.find({})
                .populate('brand')
                .sort({ createdAt: -1 })
                .exec();

            await renderIndex(res, watches);
        } catch (err) {
            console.error('Error fetching watches:', err);
            res.status(500).send('Error fetching watches');
        }
    }

    static async getDetail(req, res) {
        const watchId = req.params.id;
        const userId = req.session.user ? req.session.user.id : null; // Assuming user info is in session

        try {
            const watch = await Watch.findById(watchId)
                .populate({
                    path: 'comments',
                    populate: { path: 'author', select: 'membername' }
                })
                .populate('brand');

            if (!watch) {
                res.render('watchnotfound');
            }

            // Lấy tất cả các comment của đồng hồ
            const comments = await Comment.find({ watchId: watch._id }).populate('author', 'membername');

            // Kiểm tra xem người dùng đã comment trước đó chưa
            let userHasCommented = false;
            if (userId) {
                const existingComment = await Comment.findOne({ watchId: watch._id, author: userId });
                if (existingComment) {
                    userHasCommented = true;
                }
            }

            // Render view 'detail' và truyền dữ liệu watch, comments và userHasCommented vào
            res.render('detail', { watch, comments, userHasCommented });
        } catch (err) {
            console.error('Error fetching watch detail:', err);
            res.status(500).send('Error fetching watch details');
        }
    }


    // static async getCommentsForWatch(req, res) {
    //     const watchId = req.params.id;

    //     try {
    //         const comments = await Comment.find({ watchId })
    //             .populate('author', 'membername');

    //         res.status(200).json(comments);
    //     } catch (err) {
    //         console.error('Error fetching comments for watch:', err);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // }

    static async searchByWatchName(req, res) {
        const { name, brandName } = req.query;

        try {
            const query = {};
            if (name) {
                query.watchName = new RegExp(name, 'i');
            }
            if (brandName) {
                const brand = await Brand.findOne({ brandName });
                if (brand) {
                    query.brand = brand._id;
                }
            }

            const watches = await Watch.find(query).populate('brand');

            await renderIndex(res, watches, name || '', brandName || '');
        } catch (err) {
            console.error('Error searching watches:', err);
            res.status(500).send('Error searching watches');
        }
    }


    static async addWatch(req, res) {
        const { watchName, image, price, watchDescription, Automatic, brandName } = req.body;

        try {
            let brand = await Brand.findById(brandName);

            if (!brand) {
                return res.status(404).send('Brand not found');
            }

            const newWatch = new Watch({
                watchName,
                image,
                price,
                watchDescription,
                Automatic: !!Automatic,
                brand: brand._id
            });

            await newWatch.save();


            res.redirect('/');
        } catch (err) {
            console.error('Error creating watch:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getWatchById(req, res) {
        const watchId = req.params.id;

        try {
            const watch = await Watch.findById(watchId).populate('brand');
            const brands = await Brand.find({});

            if (!watch) {
                return res.status(404).send('Watch not found');
            }

            res.render('editwatch', { watch, brands }); // Ensure 'brands' is passed correctly
        } catch (err) {
            console.error('Error fetching watch details:', err);
            res.status(500).send('Error fetching watch details');
        }
    }


    static async updateWatch(req, res) {
        const watchId = req.params.id;
        const { watchName, image, price, watchDescription, brandName } = req.body;

        try {
            let brand = await Brand.findById(brandName);

            if (!brand) {
                return res.status(404).send('Brand not found');
            }

            const updatedWatch = await Watch.findByIdAndUpdate(
                watchId,
                {
                    watchName,
                    image,
                    price,
                    watchDescription,
                    brand: brand._id
                },
                { new: true }
            ).populate('brand');

            if (!updatedWatch) {
                return res.status(404).send('Watch not found');
            }

            const brands = await Brand.find({}); // Fetch brands again to pass to the template
            res.render('editwatch', { watch: updatedWatch, brands, successMessage: 'Watch information updated successfully' });
        } catch (err) {
            console.error('Error updating watch:', err);
            res.status(500).send('Error updating watch');
        }
    }
    static async deleteWatch(req, res) {
        const watchId = req.params.id;

        try {
            const deletedWatch = await Watch.findByIdAndDelete(watchId);

            if (!deletedWatch) {
                return res.status(404).send('Watch not found');
            }

            // Redirect về trang chủ sau khi xóa thành công
            res.redirect('/'); // Điều hướng về trang chủ

        } catch (err) {
            console.error('Error deleting watch:', err);
            res.status(500).send('Error deleting watch');
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

            res.status(201).redirect('/'); // Chuyển hướng về trang chủ sau khi thêm thành công
        } catch (err) {
            console.error('Lỗi thêm thương hiệu:', err);
            res.status(500).send('Lỗi thêm thương hiệu');
        }
    }
    static async filterWatch(req, res) {
        const { brandName } = req.query;

        try {
            const watches = await Watch.find({}).populate('brand').exec();
            let filteredWatches = watches;

            if (brandName) {
                filteredWatches = watches.filter(watch => watch.brand.brandName === brandName);
            }

            const brands = await Brand.find({}).exec();

            res.render('index', { watches: filteredWatches, brands, searchValue: brandName });
        } catch (err) {
            console.error('Error filtering watches by brand:', err);
            res.status(500).send('Error filtering watches by brand');
        }
    }
}

module.exports = WatchController;
