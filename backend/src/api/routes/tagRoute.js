const {
    createTag,
    getAllTags,
    getTagById,
    updateTagById,
    deleteTagById,
} = require('../controllers/tagController');

module.exports = function (app) {
    // Route to create a new tag
    app.post('/api/tags/createTag', createTag);

    // Route to get all tags
    app.get('/api/tags/getAllTags/:createdById', getAllTags);

    // Route to get a specific tag by ID
    app.get('/api/tags/getTagById/:id', getTagById);

    // Route to update a tag by ID
    app.put('/api/tags/updateTagById/:id', updateTagById);

    // Route to delete a tag by ID
    app.delete('/api/tags/deleteTagById/:id', deleteTagById);
};
