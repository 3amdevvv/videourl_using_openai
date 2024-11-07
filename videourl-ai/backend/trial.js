import express from 'express';
import uniqid from 'uniqid';
import fs from 'fs';
import cors from 'cors';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Configure Hugging Face API
const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/facebook/opt-1.3b";
const headers = {
    "Authorization": `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
    "Content-Type": "application/json"
};

// Test route to verify server is running
app.get('/test', (req, res) => {
    return res.json("All good here!");
});

// Function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Function to extract domain from URL
function getDomainFromUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return domain;
    } catch (_) {
        return "website";
    }
}

// Function to generate story content using Hugging Face API
async function generateStoryContent(prompt, maxRetries = 3) {
    const baseDelay = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(HUGGING_FACE_API_URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 100,  // Changed from max_length to max_new_tokens
                        temperature: 0.7,
                        top_p: 0.9,
                        do_sample: true,
                        return_full_text: false  // Only return the generated text
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed with status ${response.status}: ${errorData}`);
            }

            const data = await response.json();
            const generatedText = data[0]?.generated_text;

            if (!generatedText || typeof generatedText !== 'string' || generatedText.length < 10) {
                throw new Error('Invalid response received');
            }

            return generatedText.trim();

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw new Error(`Failed to generate content after ${maxRetries} attempts`);
            }

            const waitTime = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Waiting ${waitTime}ms before retry...`);
            await delay(waitTime);
        }
    }
}

// Function to generate a single part of the story
async function generateStoryPart(url, part, dir) {
    try {
        const domain = getDomainFromUrl(url);
        const prompt = `Write a creative story part ${part}/3 about ${domain}. The story should be engaging and concise (about 50-75 words).
                       Focus on making it interesting and suitable for social media.
                       Story part ${part}:`;

        const content = await generateStoryContent(prompt);
        const outputPath = `./stories/${dir}/story-${part}.txt`;
        
        fs.writeFileSync(outputPath, content);
        console.log(`Saved part ${part} to ${outputPath}`);
        
        return content;

    } catch (error) {
        console.error(`Error generating story part ${part}:`, error);
        throw error;
    }
}

// Route to create a story with three parts
app.get('/create-story', async (req, res) => {
    const url = req.query.url ? decodeURIComponent(req.query.url) : null;
    const dir = uniqid();
    const path = `./stories/${dir}`;

    try {
        // Validate URL
        if (!url) {
            throw new Error('URL parameter is required');
        }
        
        if (!isValidUrl(url)) {
            throw new Error('Invalid URL format. Please provide a valid URL.');
        }

        // Create directory for the stories
        fs.mkdirSync(path, { recursive: true });
        console.log('Processing URL:', url);

        // Generate stories with delay between each part
        const summary1 = await generateStoryPart(url, 1, dir);
        await delay(30 * 1000); // 30-second delay
        const summary2 = await generateStoryPart(url, 2, dir);
        await delay(30 * 1000); // 30-second delay
        const summary3 = await generateStoryPart(url, 3, dir);

        return res.json({ 
            message: 'Story created successfully', 
            directory: dir,
            url: url,
            summaries: [summary1, summary2, summary3]
        });

    } catch (error) {
        console.error("Error creating story:", error);
        
        // Clean up directory if it was created
        try {
            if (fs.existsSync(path)) {
                fs.rmSync(path, { recursive: true });
            }
        } catch (cleanupError) {
            console.error("Error cleaning up directory:", cleanupError);
        }

        return res.status(500).json({ 
            error: error.message || 'An error occurred while creating the story'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: err.message
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});