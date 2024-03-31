import express from 'express';
import mysql2 from 'mysql2';
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

const db = mysql2.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

db.connect(function (err) {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to database!");
    }
});

setInterval(() => {
    db.query('SELECT 1', (err, result) => {
        if (err) {
            console.error('Error keeping connection alive:', err);
        } else {
            console.log('Connection kept alive');
        }
    });
}, 60000); // Execute every minute


app.post('/register', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username or password missing" });
    }

    const sql = "INSERT INTO users (username, pwd_hash, doj) VALUES (?, ?, ?)";
    const { username, password } = req.body;

    const doj = moment().format('YYYY-MM-DD');

    bcrypt.hash(password.toString(), salt, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ error: "Error hashing password" });
        }

        db.query(sql, [username, hash, doj], (err, result) => {
            if (err) {
                console.error("Error inserting into database:", err);
                return res.status(500).json({ error: "Error inserting into database" });
            }

            return res.json({ Status: "Success" });
        });
    });
});


app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [req.body.username], (err, data) => {
        if (err) return res.json({ Error: "Login error" });
        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].pwd_hash, (err, response) => {
                if (err) return res.json({ Error: "Password compare error" });
                if (response) {
                    const username = data[0].username;
                    const token = jwt.sign({ username }, jwtsecret, { expiresIn: '1d' });
                    res.cookie("token", token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none'
                    });
                    return res.json({ Status: "Success" });

                } else {
                    return res.json({ Error: "Password not matched" });
                }
            })
        } else {
            return res.json({ Error: "User not found" });
        }
    })
})

app.post('/addChessGame', (req, res) => {
    const { username, game_date, winner } = req.body;

    if (!username || !game_date || !winner) {
        return res.status(400).json({ error: "Username, game date, or winner missing" });
    }

    const sql = "INSERT INTO chess_games (username, game_date, winner) VALUES (?, ?, ?)";
    db.query(sql, [username, game_date, winner], (err, result) => {
        if (err) {
            console.error("Error inserting into chess_games table:", err);
            return res.status(500).json({ error: "Error inserting data" });
        } else {
            const gameId = result.insertId;
            res.status(200).json({ gameId });
        }
    });
});

app.post('/addGameData', (req, res) => {
    const { gameId, gameData } = req.body;

    if (!gameId || !gameData) {
        return res.status(400).json({ error: "Game ID or game data missing" });
    }

    const sql = "INSERT INTO game_data (game_id, game) VALUES (?, ?)";
    db.query(sql, [gameId, gameData], (err, result) => {
        if (err) {
            console.error("Error inserting into game_data table:", err);
            return res.status(500).json({ error: "Error inserting data" });
        } else {
            res.status(200).json({ Status: "Success" });
        }
    });
});


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "You are not authenticated" })
    } else {
        jwt.verify(token, jwtsecret, (err, decoded) => {
            if (err) {
                return res.json({ Error: "Invalid token" })
            } else {
                req.username = decoded.username;
                next();
            }
        })
    }
}

app.post('/getAllGames', async (req, res) => {
    const { username } = req.body;
    const sql = "SELECT game_data.game, chess_games.game_date, chess_games.winner FROM chess_games JOIN game_data ON chess_games.game_id = game_data.game_id JOIN users ON users.username = chess_games.username WHERE users.username = ? ORDER BY chess_games.game_date DESC";

    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Error fetching games:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        return res.json({ games: result });
    });
});

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", username: req.username });
})

app.get('/logout', (req, res) => {
    res.clearCookie("token", {
        secure: true,
        sameSite: 'none',
        httpOnly: true
    });
    return res.json({ Status: "Success", message: "Logged out" });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
