import express from 'express';
import mysql2 from 'mysql2/promise';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import moment from 'moment';
import dotenv from 'dotenv';
dotenv.config();

const salt = parseInt(process.env.SALT);
const jwtsecret = process.env.JWTSECRET;
const port = process.env.PORT;
const host = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;
const origin = process.env.ORIGIN;

const app = express();
app.use(express.json());
app.use(cors({
    origin: [origin],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser());

// Create MySQL pool
const pool = mysql2.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Optional: Keep connection alive
setInterval(async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Connection kept alive');
    } catch (err) {
        console.error('Error keeping connection alive:', err);
    }
}, 60000);

app.post('/register', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username or password missing" });
    }

    const sql = "INSERT INTO users (username, pwd_hash, doj) VALUES (?, ?, ?)";
    const { username, password } = req.body;
    const doj = moment().format('YYYY-MM-DD');

    try {
        const hash = await bcrypt.hash(password.toString(), salt);
        await pool.query(sql, [username, hash, doj]);
        return res.json({ Status: "Success" });
    } catch (err) {
        console.error("Error inserting into database:", err);
        return res.status(500).json({ error: "Database insert error" });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';

    try {
        const [data] = await pool.query(sql, [username]);

        if (data.length === 0) return res.json({ Error: "User not found" });

        const isMatch = await bcrypt.compare(password.toString(), data[0].pwd_hash);
        if (!isMatch) return res.json({ Error: "Password not matched" });

        const token = jwt.sign({ username }, jwtsecret, { expiresIn: '1d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        return res.json({ Status: "Success" });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/addChessGame', async (req, res) => {
    const { username, game_date, winner, player_colour } = req.body;

    if (!username || !game_date || !winner) {
        return res.status(400).json({ error: "Username, game date, or winner missing" });
    }

    const sql = "INSERT INTO chess_games (username, game_date, winner, player_colour) VALUES (?, ?, ?, ?)";

    try {
        const [result] = await pool.query(sql, [username, game_date, winner, player_colour]);
        const gameId = result.insertId;
        res.status(200).json({ gameId });
    } catch (err) {
        console.error("Error inserting into chess_games table:", err);
        return res.status(500).json({ error: "Error inserting data" });
    }
});

app.post('/addGameData', async (req, res) => {
    const { gameId, gameData } = req.body;

    if (!gameId || !gameData) {
        return res.status(400).json({ error: "Game ID or game data missing" });
    }

    const sql = "INSERT INTO game_data (game_id, game) VALUES (?, ?)";

    try {
        await pool.query(sql, [gameId, gameData]);
        res.status(200).json({ Status: "Success" });
    } catch (err) {
        console.error("Error inserting into game_data table:", err);
        return res.status(500).json({ error: "Error inserting data" });
    }
});

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "You are not authenticated" });
    }

    jwt.verify(token, jwtsecret, (err, decoded) => {
        if (err) {
            return res.json({ Error: "Invalid token" });
        } else {
            req.username = decoded.username;
            next();
        }
    });
};

app.post('/getAllGames', async (req, res) => {
    const { username } = req.body;

    const sql = `
        SELECT game_data.game, chess_games.game_date, chess_games.winner, chess_games.player_colour
        FROM chess_games
        JOIN game_data ON chess_games.game_id = game_data.game_id
        JOIN users ON users.username = chess_games.username
        WHERE users.username = ?
        ORDER BY chess_games.game_date DESC
    `;

    try {
        const [games] = await pool.query(sql, [username]);
        return res.json({ games });
    } catch (err) {
        console.error('Error fetching games:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", username: req.username });
});

app.get('/logout', (req, res) => {
    res.clearCookie("token", {
        secure: true,
        sameSite: 'none',
        httpOnly: true
    });
    return res.json({ Status: "Success", message: "Logged out" });
});

app.post('/getDoj', async (req, res) => {
    const { username } = req.body;
    const sql = "SELECT doj FROM users WHERE username = ?";

    try {
        const [result] = await pool.query(sql, [username]);
        return res.json({ doj: result });
    } catch (err) {
        console.error('Error fetching doj:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
