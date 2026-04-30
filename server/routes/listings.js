const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// GET /api/listings - Get all listings with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, price_min, price_max, accommodates, bedrooms, city, room_type } = req.query;

        console.log('Filter params received:', { page, limit, price_min, price_max, city, room_type });

        const priceMin = price_min ? parseInt(price_min) : null;
        const priceMax = price_max ? parseInt(price_max) : null;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const filter = {};
        if (priceMin) filter.pricePerNight = { $gte: priceMin };
        if (priceMax) filter.pricePerNight = { ...filter.pricePerNight, $lte: priceMax };
        if (city) filter.city = city;
        if (room_type) filter.room_type = room_type;
        
        console.log('MongoDB filter:', filter);
        const listings = await Listing.find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        
        const total = await Listing.countDocuments(filter);
        res.json({
            listings,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// GET /api/listings/:id - Get listing details by ID
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found'});
        }
        res.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ error: 'Failed to fetch listing' });
    }
});


module.exports = router;