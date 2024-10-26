const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware Configuration
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// In-memory storage for hardships
const hardships = [];

/**
 * API Routes
 */

// Create a new hardship
app.post('/api/hardships', (req, res) => {
    const { text, category, userId } = req.body;

    // Validate required fields
    if (!text || !category || !userId) {
        return res.status(400).json({
            error: 'Text, category, and userId are required.'
        });
    }

    const newHardship = {
        id: hardships.length + 1, // Simple ID generation
        userId,
        text,
        category,
        comments: [],
        likes: 0,
        isLiked: false,
        createdAt: new Date(),
        lastEdited: null
    };

    hardships.push(newHardship); // Store the hardship in memory
    return res.status(201).json(newHardship);
});

// Fetch all hardships
app.get('/api/hardships', (req, res) => {
    return res.json(hardships);
});

// Add a comment to a hardship
app.post('/api/hardships/:id/comments', (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    const hardship = hardships.find(h => h.id == id);
    if (!hardship) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    if (!text) {
        return res.status(400).json({ error: 'Comment text is required.' });
    }

    hardship.comments.push({ text, createdAt: new Date() });
    return res.status(201).json(hardship.comments[hardship.comments.length - 1]);
});

// Toggle like status for a hardship
app.post('/api/hardships/:id/like', (req, res) => {
    const { id } = req.params;
    const hardship = hardships.find(h => h.id == id);

    if (!hardship) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    hardship.isLiked = !hardship.isLiked;
    hardship.likes += hardship.isLiked ? 1 : -1;
    return res.status(200).json({
        likes: hardship.likes,
        isLiked: hardship.isLiked
    });
});

// Update an existing hardship
app.put('/api/hardships/:id', (req, res) => {
    const { id } = req.params;
    const { text, category } = req.body;

    const hardship = hardships.find(h => h.id == id);
    if (!hardship) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    if (text) hardship.text = text;
    if (category) hardship.category = category;

    hardship.lastEdited = new Date();
    return res.status(200).json(hardship);
});

// Delete a hardship
app.delete('/api/hardships/:id', (req, res) => {
    const { id } = req.params;
    const index = hardships.findIndex(h => h.id == id);

    if (index === -1) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    hardships.splice(index, 1); // Remove hardship from memory
    return res.status(204).send();
});

/**
 * Serve static files - Fallback route
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

/**
 * Start server
 */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
