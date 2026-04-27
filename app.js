require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("System Status: Logic Tier Online"))
    .catch(err => console.error("Critical: Database Offline", err));

const Question = mongoose.model('Question', new mongoose.Schema({
    q_text: String,
    options: [String],
    answer: String,
    tips: String,
    tips_url: String,
    is_survey: Boolean
}));

const Response = mongoose.model('Response', new mongoose.Schema({
    score: Number,
    submittedAt: { type: Date, default: Date.now }
}));

app.get('/', (req, res) => res.render('index'));

app.get('/about', (req, res) => res.render('about'));

app.get('/quiz', async (req, res) => {
    try {
        const questions = await Question.find().sort({ _id: 1 });
        res.render('quiz', { questions });
    } catch (err) {
        res.status(500).send("File Error: Missing Data Nodes");
    }
});

app.post('/submit', async (req, res) => {
    try {
        const questions = await Question.find().sort({ _id: 1 });
        let finalScore = 0;

        questions.forEach((q, index) => {
            if (!q.is_survey) {
                const userPick = (req.body[`q${index}`] || "").toString().trim().toLowerCase();
                const correctAns = (q.answer || "").toString().trim().toLowerCase();
                if (userPick === correctAns && userPick !== "") finalScore++;
            }
        });

        await Response.create({ score: finalScore });
        res.render('results', { score: finalScore });
    } catch (err) {
        res.status(500).send("System Error: Final Report Generation Failed");
    }
});

const PORT = 3260; // 先定义一个变量，方便修改
app.listen(PORT, () => console.log(`Archive Terminal active on PORT ${PORT}`));