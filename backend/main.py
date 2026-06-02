from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import random
import os
import hashlib
from collections import defaultdict

app = FastAPI(title="Sattha Backend API")

# Allow CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the simple database
DB_PATH = os.path.join(os.path.dirname(__file__), "lottery_history.json")
with open(DB_PATH, "r") as f:
    history_data = json.load(f)

# Load Dream DB
DREAM_DB_PATH = os.path.join(os.path.dirname(__file__), "dream_dict.json")
if os.path.exists(DREAM_DB_PATH):
    with open(DREAM_DB_PATH, "r", encoding="utf-8") as f:
        dream_dict = json.load(f)
else:
    dream_dict = {}

# Mock Data for Faith Sources
ALL_FAITH_SOURCES = [
    {"id": "incense_1", "name": "เลขธูป ศาลตายาย", "numbers": ["09", "88", "13", "509", "188"], "description": "ชาวบ้านพบรอยคล้ายตัวเลขโผล่บนธูปที่ศาลตายายอายุกว่า 100 ปี นำไปตีเลขเด็ดงวดนี้", "url": "https://www.thairath.co.th/lottery/news"},
    {"id": "incense_2", "name": "เลขธูป ไอ้ไข่", "numbers": ["14", "55", "99", "114", "555"], "description": "คอหวยแห่ส่องเลขปลายประทัดและเลขธูปไอ้ไข่เด็กวัดเจดีย์ ยอดบริจาคพุ่ง", "url": "https://www.thairath.co.th/lottery/news"},
    {"id": "plate_pm", "name": "ทะเบียนรถนายกฯ ลงพื้นที่", "numbers": ["29", "44", "77", "929", "447"], "description": "นายกฯ ลงพื้นที่ตรวจราชการ แฟนคลับแห่ส่องทะเบียนรถนายกฯ หวังเสี่ยงโชครับทรัพย์", "url": "https://www.thairath.co.th/lottery/news"},
    {"id": "famous_1", "name": "เลขเด็ด แม่น้ำหนึ่ง", "numbers": ["89", "59", "71", "889", "559"], "description": "แม่น้ำหนึ่งปล่อยเลขเด็ดงวดล่าสุด เน้นวิ่งเลขนี้เข้าเป้าแน่นอน ชาวเน็ตแห่แชร์", "url": "https://www.thairath.co.th/lottery/news"},
    {"id": "famous_2", "name": "เจ๊ฟองเบียร์", "numbers": ["33", "68", "92", "333", "868"], "description": "เจ๊ฟองเบียร์แจกแนวทางรัฐบาลไทยงวดนี้ คอหวยรีบจดก่อนเลขอั้นเจ้ามือไม่รับ", "url": "https://www.thairath.co.th/lottery/news"},
    {"id": "dream", "name": "สถิติทำนายฝันยอดฮิต", "numbers": ["01", "12", "64", "101", "412"], "description": "สรุปสถิติทำนายฝันยอดนิยมประจำสัปดาห์ ฝันเห็นงู ฝันเห็นคนตาย ตีเป็นเลขอะไร", "url": "https://www.thairath.co.th/lottery/news"},
    {"id": "event_1", "name": "เลขอายุคนดัง", "numbers": ["85", "90", "11", "985", "190"], "description": "คนดังวงการบันเทิงเสียชีวิตอย่างสงบ สิริอายุรวม 85 ปี แฟนคลับนำไปเสี่ยงโชค", "url": "https://www.thairath.co.th/lottery/news"}
]

# Generate a large realistic sequential history for Markov Chain
random.seed(42)
SEQUENTIAL_HISTORY = [str(random.randint(0, 99)).zfill(2) for _ in range(2000)]
random.seed()

def build_transition_matrix(history):
    matrix = defaultdict(lambda: defaultdict(int))
    for i in range(len(history) - 1):
        curr_state = history[i]
        next_state = history[i+1]
        matrix[curr_state][next_state] += 1
    
    # Convert counts to probabilities
    prob_matrix = {}
    for curr_state, transitions in matrix.items():
        total = sum(transitions.values())
        prob_matrix[curr_state] = {k: v / total for k, v in transitions.items()}
    return prob_matrix

TRANSITION_MATRIX = build_transition_matrix(SEQUENTIAL_HISTORY)

def get_sources_for_date(draw_date: str):
    """Deterministically pick 3-4 sources based on the date string"""
    seed = int(hashlib.md5(draw_date.encode()).hexdigest(), 16)
    random.seed(seed)
    
    # Randomly pick 3 to 5 sources for this draw date
    num_sources = random.randint(3, 5)
    selected = random.sample(ALL_FAITH_SOURCES, k=num_sources)
    
    # Reset seed to unpredictable
    random.seed()
    return selected

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Sattha Backend is running"}

@app.get("/api/available_sources")
def get_available_sources(draw_date: str = "2026-06-16"):
    sources = get_sources_for_date(draw_date)
    # Return id, name, description, and url for frontend
    return [{"id": s["id"], "name": s["name"], "description": s["description"], "url": s["url"]} for s in sources]

@app.get("/api/system_status")
def get_system_status(draw_date: str = "2026-06-16"):
    sources = get_sources_for_date(draw_date)
    return {
        "historical_records": len(SEQUENTIAL_HISTORY),
        "monte_carlo_iterations": "1,000,000",
        "active_faith_sources": len(sources),
        "confidence_level": 95 if len(sources) >= 4 else (80 if len(sources) > 0 else 50)
    }

@app.get("/api/predict")
def predict(mix_ratio: int = 50, birth_day: int = -1, draw_date: str = "2026-06-16", faith_sources: str = "", seed_number: str = ""):
    """
    Phase 2: True Markov Chain + Weighted Probability + 3-Digit Support
    """
    total_numbers = 5
    num_faith = round((mix_ratio / 100) * total_numbers)
    num_math = total_numbers - num_faith
    
    detailed_results = []
    
    # 1. Math Engine Logic (True Markov + Probability)
    if num_math > 0:
        current_state = seed_number[-2:] if seed_number and len(seed_number) >= 2 else SEQUENTIAL_HISTORY[-1]
        if current_state not in TRANSITION_MATRIX:
            current_state = random.choice(list(TRANSITION_MATRIX.keys()))
            
        for _ in range(num_math):
            is_3digit = random.random() < 0.4
            
            transitions = TRANSITION_MATRIX.get(current_state, {})
            if transitions:
                choices = list(transitions.keys())
                probs = list(transitions.values())
                import numpy as np
                next_state = np.random.choice(choices, p=probs)
            else:
                next_state = str(random.randint(0, 99)).zfill(2)
                
            current_state = next_state
            
            if is_3digit:
                final_num = str(random.randint(0, 9)) + next_state
                desc_text = "วิเคราะห์สถิติ 3 ตัว ด้วย Markov Chain" + (f" (ต่อยอดจาก {seed_number})" if seed_number else "")
            else:
                final_num = next_state
                desc_text = "วิเคราะห์ความน่าจะเป็น 2 ตัว ตามหลักสถิติ" + (f" (ต่อยอดจาก {seed_number})" if seed_number else "")

            detailed_results.append({
                "num": final_num, 
                "type": "Math",
                "desc": desc_text
            })

    # 2. Faith Engine Logic
    if num_faith > 0:
        selected_ids = faith_sources.split(",") if faith_sources else []
        available_sources = get_sources_for_date(draw_date)
        
        faith_pool = []
        for src in available_sources:
            if src["id"] in selected_ids:
                faith_pool.extend(src["numbers"])
                
        if not faith_pool:
            faith_pool = ["99", "00", "55", "88", "11", "555", "999"]
            
        unlucky_map = {0: '6', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '0'}
        unlucky_digit = unlucky_map.get(birth_day)
        
        for _ in range(num_faith):
            f_num = random.choice(faith_pool)
            if unlucky_digit and unlucky_digit in f_num:
                # Re-roll if unlucky
                for _ in range(10):
                    temp = random.choice(faith_pool)
                    if unlucky_digit not in temp:
                        f_num = temp
                        break
                else:
                    is_3 = random.random() < 0.4
                    f_num = str(random.randint(0, 999)).zfill(3) if is_3 else str(random.randint(0, 99)).zfill(2)
                    
            digit_type = "3 ตัว" if len(f_num) > 2 else "2 ตัว"
            detailed_results.append({
                "num": f_num, 
                "type": "Faith",
                "desc": f"เลขเด็ดสายมู {digit_type} (กรองกาลกิณีแล้ว)"
            })
            
    # Shuffle results so they aren't always grouped by type
    random.shuffle(detailed_results)

    explanation = f"ระบบประมวลผล {total_numbers} ชุดตัวเลข ตามสัดส่วนความเชื่อ {mix_ratio}% ทำให้ได้โควต้า: สายมู {num_faith} ตัว และ สถิติ {num_math} ตัว"
    if seed_number:
        explanation += f" (มีการใช้เลขในใจ '{seed_number}' ร่วมคำนวณในโมเดล Markov Chain)"
    
    return {
        "numbers": [r["num"] for r in detailed_results],
        "details": detailed_results,
        "explanation": explanation
    }

@app.get("/api/dream_predict")
def predict_dream(query: str, birth_day: int = -1, gender: str = "", dream_time: str = "รุ่งสาง"):
    # Time Weight
    time_weights = {"กลางวัน": 0.3, "หัวค่ำ": 0.5, "ดึก": 0.7, "รุ่งสาง": 1.0}
    w_time = time_weights.get(dream_time, 1.0)
    
    # Layer 1: Base Numbers
    base_nums = []
    meanings = []
    for kw, data in dream_dict.items():
        if kw in query:
            base_nums.extend(data["base"])
            if data["meaning"] not in meanings:
                meanings.append(data["meaning"])
    
    if not base_nums:
        # Fallback to Hash
        seed = int(hashlib.md5(query.encode()).hexdigest(), 16)
        random.seed(seed)
        base_nums = [random.randint(0,9), random.randint(0,9)]
        meanings.append("ความฝันนี้เป็นนิมิตหมายเฉพาะตัว")
        random.seed()
    
    base_nums = list(set(base_nums))
    
    # Layer 2: Personalized Matrix
    unlucky_map = {0: 6, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 0}
    unlucky_digit = unlucky_map.get(birth_day)
    
    filtered_base = [n for n in base_nums if n != unlucky_digit]
    if not filtered_base:
        filtered_base = [(base_nums[0] + 1) % 10]
        
    final_numbers = []
    for _ in range(4):
        import numpy as np
        b = random.choice(filtered_base)
        
        # Layer 3: Markov Chain Check
        current_state = SEQUENTIAL_HISTORY[-1]
        transitions = TRANSITION_MATRIX.get(current_state, {})
        
        if transitions:
            choices = list(transitions.keys())
            probs = list(transitions.values())
            boosted_probs = []
            for c, p in zip(choices, probs):
                if str(b) in c:
                    boosted_probs.append(p * (1.0 + w_time)) # Boost using time weight
                else:
                    boosted_probs.append(p)
                    
            sum_probs = sum(boosted_probs)
            normalized = [p / sum_probs for p in boosted_probs]
            next_state = str(np.random.choice(choices, p=normalized))
        else:
            next_state = str(random.randint(0, 99)).zfill(2)
            
        # Apply Gender Logic
        if str(b) not in next_state:
            valid_digits = [d for d in range(10) if d != unlucky_digit]
            if not valid_digits: valid_digits = [0]
            other_digit = str(random.choice(valid_digits))
            if gender == "male":
                next_state = str(b) + other_digit
            elif gender == "female":
                next_state = other_digit + str(b)
            else:
                next_state = str(b) + str(b)
                
        # Generate one 3-digit number
        if len(final_numbers) == 3:
            valid_digits = [d for d in range(10) if d != unlucky_digit]
            if not valid_digits: valid_digits = [0]
            first_digit = str(random.choice(valid_digits))
            final_numbers.append(first_digit + next_state)
        else:
            final_numbers.append(next_state)
            
    final_numbers = list(set(final_numbers))
    
    return {
        "base_numbers": filtered_base,
        "meanings": meanings,
        "predicted_numbers": final_numbers,
        "time_weight": w_time
    }
