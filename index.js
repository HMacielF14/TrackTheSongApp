const express = require('express');
const dotenv = require('dotenv');
const supabaseClient = require('@supabase/supabase-js');

dotenv.config();

// Starting Express
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Starting Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// Starting OpenAI Connection
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

// Track recent words to prevent repeats
let recentWordLst = [];

// Resquests a random from OpenAI|ChatGPT
async function getOpenAIWord() {
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{
            role: "user",
            content: `Give me a random word that could appear in a song. The word cannot be in ${recentWordLst}. Return one lowercase word only.`
        }],
    });

    const word = completion.choices[0].message.content.trim();
    recentWordLst.push(word); // Add word to the word array.
    if (recentWordLst.length > 10) recentWordLst.shift();
    return word;

}

app.get('/getRankings', async (req, res) => {
    console.log('Getting Ranking . . .');

    const { data, error } = await supabase
        .from('rankings')
        .select()
        .order('score', { ascending: false })
        .limit(5);

    if (error) {
        console.log(`Error: ${error}`);
        res.status(400).send(error);
        return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

app.get('/getword', async (req, res) => {
    console.log('Getting Word . . .');
    const word = await getOpenAIWord();

    res.setHeader('Content-Type', 'application/json');
    res.send({ word });
});

app.post('/addRanking', async (req, res) => {
    console.log('Adding Ranking Entry');
    console.log(req.body);

    const { playerName, score } = req.body;

    const { data, error } = await supabase
        .from('rankings')
        .insert({ playerName, score })
        .select();

    if (error) {
        console.error('Supabase Insert Error:', error.message);
        res.status(500).json({ message: 'Database insert failed', details: error.message });
        return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.json(data);
});

app.listen(port, () => {
    console.log(`Application is running on http://localhost:${port}`);
});