const mongoose = require('mongoose');

const SceneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    objectsScheme: {
        type: mongoose.Schema.Types.Mixed
    },
    links: {
        required: true,
        type: Array
    }
});

const Scene = mongoose.model('Scene', SceneSchema);
module.exports = Scene;