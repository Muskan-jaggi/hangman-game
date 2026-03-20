from flask import Flask, render_template, request, jsonify
from supabase import create_client
import random, os
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)

# print("Supabase client initialized:")
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

word_list = [
    "journey", "mystery", "sparkle", "blanket", "freedom",
    "whisper", "thunder", "diamond", "rainbow", "courage",
    "fantasy", "silence", "adventure", "curiosity", "butterfly",
    "treasure", "sunshine", "midnight", "horizon", "firework",
    "daydream", "snowfall", "laughter", "heartbeat", "vacation",
    "mountain", "oceanic", "playground", "storybook", "universe",
    "starlight", "footprint", "carousel", "blueprint", "festival",
    "moonlight", "notebook", "backpack", "waterfall", "windmill",
    "sandcastle", "headphone", "skylight", "telescope", "wildlife",
    "sunflower", "campfire", "raindrop", "snowflake"
]

game = {"word": "", "blank_list": [], "call_count": 0, "player_name": ""}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login", methods=["POST"])
def login():
    name = request.get_json().get("name", "").strip().lower()
    if not name:
        return jsonify({"error": "Name required"}), 400

    res = sb.table("players").select("*").eq("name", name).execute()

    if res.data:
        player = res.data[0]
    else:
        # create new player
        insert = sb.table("players").insert({
            "name": name,
            "games_played": 0,
            "games_won": 0,
            "current_streak": 0,
            "max_streak": 0
        }).execute()
        player = insert.data[0]

    game["player_name"] = name
    return jsonify({
        "name":            player["name"],
        "games_played":    player["games_played"],
        "games_won":       player["games_won"],
        "current_streak":  player["current_streak"],
        "max_streak":      player["max_streak"]
    })


@app.route("/start", methods=["GET"])
def start_game():
    word = random.choice(word_list)
    game["word"]       = word
    game["blank_list"] = ["_"] * len(word)
    game["call_count"] = 0
    return jsonify({"blank_list": game["blank_list"], "call_count": 0})


@app.route("/guess", methods=["POST"])
def guess_letter():
    data  = request.get_json()
    guess = data["letter"].lower()
    found = False

    for i, ch in enumerate(game["word"]):
        if ch == guess:
            game["blank_list"][i] = guess
            found = True

    if not found:
        game["call_count"] += 1

    MAX_WRONG = 6
    status = "playing"
    if "_" not in game["blank_list"]:
        status = "win"
    elif game["call_count"] >= MAX_WRONG:
        status = "lose"

    return jsonify({
        "blank_list": game["blank_list"],
        "call_count": game["call_count"],
        "status":     status,
        "word":       game["word"] if status == "lose" else ""
    })


@app.route("/save-result", methods=["POST"])
def save_result():
    data   = request.get_json()
    won    = data.get("won", False)
    name   = game["player_name"]
    if not name:
        return jsonify({"ok": False}), 400

    res    = sb.table("players").select("*").eq("name", name).execute()
    if not res.data:
        return jsonify({"ok": False}), 404

    p = res.data[0]
    games_played   = p["games_played"] + 1
    games_won      = p["games_won"] + (1 if won else 0)
    current_streak = (p["current_streak"] + 1) if won else 0
    max_streak     = max(p["max_streak"], current_streak)

    sb.table("players").update({
        "games_played":   games_played,
        "games_won":      games_won,
        "current_streak": current_streak,
        "max_streak":     max_streak
    }).eq("name", name).execute()

    return jsonify({
        "games_played":   games_played,
        "games_won":      games_won,
        "current_streak": current_streak,
        "max_streak":     max_streak
    })


if __name__ == "__main__":
    app.run(debug=True)
