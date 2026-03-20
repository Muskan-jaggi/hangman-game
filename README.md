# 🎮 Hangman Game

A modern, full-stack Hangman game with real-time player statistics, animated SVG graphics, and persistent data storage using Supabase.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![Supabase](https://img.shields.io/badge/Supabase-Database-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

### 🎯 Core Gameplay
- **Interactive Hangman** — Step-by-step SVG animations for each wrong guess
- **On-screen Keyboard** — Click letters or use your physical keyboard
- **Real-time Feedback** — Smooth animations for correct/incorrect guesses
- **50+ Words** — Curated word list with varying difficulty

### 📊 Player Statistics
- **Persistent Profiles** — Login with your name to track progress
- **Live Stats Dashboard** — Games played, won, current streak, and best streak
- **Automatic Tracking** — Stats update instantly after each game
- **Leaderboard Ready** — Database structure supports future leaderboard features

### 🎨 Visual Design
- **Animated Background** — Twinkling stars, shooting stars, and aurora effects
- **Glassmorphism UI** — Modern frosted-glass card design
- **Smooth Transitions** — CSS animations for all interactions
- **Responsive Layout** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Flask (Python) |
| **Database** | Supabase (PostgreSQL) |
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Graphics** | SVG, Canvas API |
| **Deployment** | Ready for Heroku, Vercel, or Railway |

---

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- A Supabase account ([sign up free](https://supabase.com))
- Git (optional)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/hangman-game.git
cd hangman-game
```

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Set Up Supabase

#### Create the Database Table
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Open **SQL Editor**
3. Paste and run the following SQL:

```sql
create table players (
  id              bigint generated always as identity primary key,
  name            text unique not null,
  games_played    int  not null default 0,
  games_won       int  not null default 0,
  current_streak  int  not null default 0,
  max_streak      int  not null default 0,
  created_at      timestamptz default now()
);
```

#### Get Your API Credentials
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 4️⃣ Configure Environment Variables
Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
```

### 5️⃣ Run the Application
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🎮 How to Play

1. **Enter Your Name** — Login screen fetches your stats or creates a new profile
2. **View Your Stats** — See games played, won, current streak, and best streak
3. **Guess Letters** — Click on-screen keyboard or use your physical keyboard
4. **Win or Lose** — Complete the word before 6 wrong guesses
5. **Track Progress** — Stats update automatically after each game

---

## 📁 Project Structure

```
Hangman_Game/
├── app.py                 # Flask backend with Supabase integration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── schema.sql            # Database schema for Supabase
├── static/
│   ├── style.css         # All styles (login, game, animations)
│   └── script.js         # Frontend logic (canvas, game, stats)
├── templates/
│   └── index.html        # Single-page app structure
└── README.md             # This file
```

---

## 🎨 Features Breakdown

### SVG Hangman Animation
Each wrong guess reveals one body part with a smooth draw-on animation:
1. Head
2. Body
3. Left arm
4. Right arm
5. Left leg
6. Right leg

### Background Effects
- **160 Twinkling Stars** — Canvas-based particles with random fade
- **Shooting Stars** — Randomly spawned meteors with gradient trails
- **Aurora Bands** — 3 animated gradient layers with drift effect
- **Floating Orbs** — 4 blurred color spheres with rotation

### Database Schema
```sql
players (
  id              → Auto-increment primary key
  name            → Unique player identifier (case-insensitive)
  games_played    → Total games count
  games_won       → Total wins
  current_streak  → Consecutive wins (resets on loss)
  max_streak      → All-time best streak
  created_at      → Account creation timestamp
)
```

---

## 🚀 Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
git push heroku main
```

### Deploy to Vercel
```bash
# Install Vercel CLI, then:
vercel
# Add environment variables in Vercel dashboard
```

### Deploy to Railway
1. Connect your GitHub repo
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

---

## 🔧 Configuration

### Change Word List
Edit `word_list` in `app.py`:
```python
word_list = [
    "your", "custom", "words", "here"
]
```

### Adjust Difficulty
Change `MAX_WRONG` in `app.py` (default: 6):
```python
MAX_WRONG = 8  # Allow 8 wrong guesses instead of 6
```

### Customize Colors
Edit CSS variables in `static/style.css`:
```css
/* Example: Change primary blue to purple */
background: linear-gradient(120deg, #7b2fff, #4a0fa8);
```

---

## 🐛 Troubleshooting

### "Invalid URL" Error
- Check `.env` file has real Supabase credentials (not placeholders)
- Ensure no extra spaces or quotes around values

### Stats Not Updating
- Verify the `players` table exists in Supabase
- Check browser console for API errors
- Confirm Supabase API key has read/write permissions

### Canvas Not Rendering
- Ensure JavaScript is enabled in browser
- Check browser console for errors
- Try a different browser (Chrome/Firefox recommended)

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve main HTML page |
| `POST` | `/login` | Fetch or create player profile |
| `GET` | `/start` | Initialize new game |
| `POST` | `/guess` | Submit letter guess |
| `POST` | `/save-result` | Update player stats after game |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Flask** — Lightweight Python web framework
- **Supabase** — Open-source Firebase alternative
- **Canvas API** — For animated star field background
- **SVG** — Scalable vector graphics for hangman drawing

---

## 📧 Contact

**Your Name**  
📧 Email: your.email@example.com  
🔗 GitHub: [@yourusername](https://github.com/yourusername)  
🌐 Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 🎯 Future Enhancements

- [ ] Global leaderboard
- [ ] Multiplayer mode
- [ ] Custom word categories (animals, countries, tech, etc.)
- [ ] Difficulty levels (easy/medium/hard)
- [ ] Sound effects and background music
- [ ] Dark/light theme toggle
- [ ] Social sharing (share your streak on Twitter)
- [ ] Achievement badges system

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ and Python

</div>
