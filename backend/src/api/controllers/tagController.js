const Tag = require('../models/tagModel');

// Create a new tag
const createTag = async (req, res) => {
    try {
        const { name, description, color, createdById } = req.body;
        const tag = new Tag({
            name,
            description,
            color,
            createdById: createdById,
        });
        await tag.save();
        res.status(201).json(tag);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all tags for the logged-in user
const getAllTags = async (req, res) => {
    try {
        // Array of specific IDs to include
        const specificIds = [
            "671f7f00ce372d6506e39dbb",
            "671f8056ce372d6506e39dbd",
            "671f807fce372d6506e39dbf",
            "671f80a4ce372d6506e39dc1",
            "671f8734ce372d6506e39e2e"
        ];

        // Fetch tags created by the user or with specific IDs
        const tags = await Tag.find({
            $or: [
                { createdById: req.params.createdById },
                { _id: { $in: specificIds } }
            ]
        });

        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get a specific tag by ID (only if it belongs to the user)
const getTagById = async (req, res) => {
    try {
        const tag = await Tag.findOne({ _id: req.params.id });
        if (!tag) return res.status(404).json({ message: 'Tag not found' });
        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a tag (only if it belongs to the user)
const updateTagById = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const tag = await Tag.findOneAndUpdate(
            { _id: req.params.id, },
            { name, description, color },
            { new: true, runValidators: true }
        );
        if (!tag) return res.status(404).json({ message: 'Tag not found' });
        res.status(200).json(tag);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a tag (only if it belongs to the user)
const deleteTagById = async (req, res) => {
    try {
        const tag = await Tag.findOneAndDelete({ _id: req.params.id });
        if (!tag) return res.status(404).json({ message: 'Tag not found' });
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTag,
    getAllTags,
    getTagById,
    updateTagById,
    deleteTagById,
};
