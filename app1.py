import pandas as pd

# -----------------------------
# Load main decision tree CSV
# -----------------------------
CSV_FILE = "stream_decision_tree_ordered_no_early_jump.csv"
questions = pd.read_csv(CSV_FILE).set_index("QuestionID").to_dict("index")

# -----------------------------
# Stream mapping
# -----------------------------
def get_stream(question_id):
    q_num = int(question_id[1:])
    if 1 <= q_num <= 10:
        return "Science"
    elif 11 <= q_num <= 20:
        return "Commerce"
    elif 21 <= q_num <= 30:
        return "Arts/Humanities"
    elif 31 <= q_num <= 40:
        return "Vocational"
    return None

# -----------------------------
# Branch quiz questions
# -----------------------------
branch_questions = {
    "Science": {
        "PCMB": [
            "Do you enjoy both Mathematics and Biology subjects?",
            "Would you like flexibility to choose between Medical and Engineering later?",
            "Are you interested in fields like Biotechnology, Bioinformatics, or Life Sciences?"
        ],
        "PCMC": [
            "Do you enjoy Mathematics and Computer Science?",
            "Would you like to pursue a career in IT, Software, or Data Science?",
            "Are you interested in coding, programming, or technology-driven fields?"
        ]
    },
    "Commerce": {
        "With Math": [
            "Do you enjoy working with numbers and statistics?",
            "Would you like to study Economics, CA, or CFA?",
            "Do you prefer solving logical and analytical problems?"
        ],
        "Without Math": [
            "Do you prefer Business/Management studies?",
            "Are you interested in Marketing, HR, or Law?",
            "Do you like practical commerce applications without too much calculation?"
        ]
    },
    "Arts/Humanities": {
        "Social Sciences": [
            "Are you interested in History and Political Science?",
            "Do you like understanding society and human behavior?",
            "Would you like a career in Civil Services or Social Work?"
        ],
        "Literature & Media": [
            "Do you enjoy reading, writing, or storytelling?",
            "Are you interested in Journalism or Mass Communication?",
            "Would you like to pursue English Literature or Psychology?"
        ],
        "Fine Arts": [
            "Do you love painting, music, or performing arts?",
            "Would you enjoy a career in creative design or theatre?",
            "Do you have a passion for artistic expression?"
        ]
    },
    "Vocational": {
        "IT & Computers": [
            "Do you enjoy working on computers and software?",
            "Would you like a career in IT or coding?",
            "Are you interested in new technologies and digital tools?"
        ],
        "Hospitality & Tourism": [
            "Do you like interacting with people and helping them?",
            "Would you enjoy working in hotels or tourism?",
            "Are you interested in travel, events, or hospitality?"
        ],
        "Design & Fashion": [
            "Do you enjoy creative designing?",
            "Would you like a career in fashion, interior, or product design?",
            "Are you passionate about creativity and aesthetics?"
        ]
    }
}

# -----------------------------
# Main Stream Quiz
# -----------------------------
def run_quiz():
    scores = {"Science": 0, "Commerce": 0, "Arts/Humanities": 0, "Vocational": 0}
    no_counts = {"Science": 0, "Commerce": 0, "Arts/Humanities": 0, "Vocational": 0}
    question_count = 0
    current_id = "Q1"

    while True:
        if current_id not in questions:
            print("\nNo clear match.")
            return None

        q = questions[current_id]["Question"]
        print(f"\n{current_id}: {q}")
        response = input("Answer (yes/no): ").strip().lower()

        if response not in ["yes", "no"]:
            print("Please answer with 'yes' or 'no'.")
            continue

        stream = get_stream(current_id)

        # Update scores
        if stream:
            if response == "yes":
                scores[stream] += 1
            else:
                no_counts[stream] += 1

        question_count += 1
        next_id = questions[current_id]["NextIfYes"] if response == "yes" else questions[current_id]["NextIfNo"]

        # Disinterest rule
        if current_id in ["Q5", "Q15", "Q25", "Q35"] and stream and no_counts[stream] >= 3:
            next_id = questions[current_id]["NextIfNo"]

        # Stream suggestion rule
        if current_id in ["Q10", "Q20", "Q30", "Q40"]:
            if stream and scores[stream] >= 8 and question_count >= 10:
                print(f"\n✅ Suggested Stream: {questions[current_id]['StreamSuggestion']}")
                return stream

        # End condition
        if current_id == "Q41" or question_count >= 40:
            print("\nNo clear match.")
            return None

        current_id = next_id

# -----------------------------
# Branch Quiz (Science with jump rule)
# -----------------------------
def run_branch_quiz(stream):
    if stream not in branch_questions:
        print("\nNo sub-branches defined for this stream.")
        return

    print(f"\n📌 Now let's find your best branch in {stream}...\n")

    # Science special rule (start with PCMB, jump to PCMC if 2 no’s)
    if stream == "Science":
        no_count = 0
        print("\n👉 Starting with PCMB...")
        for q in branch_questions["Science"]["PCMB"]:
            ans = input(f"{q} (yes/no): ").strip().lower()
            if ans == "no":
                no_count += 1
                if no_count >= 2:
                    print("\n❌ Too many 'no' answers for PCMB. Switching to PCMC...")
                    # Now ask PCMC questions
                    score_pcmc = 0
                    for q2 in branch_questions["Science"]["PCMC"]:
                        ans2 = input(f"{q2} (yes/no): ").strip().lower()
                        if ans2 == "yes":
                            score_pcmc += 1
                    print(f"\n✅ Suggested Branch: PCMC under Science (Score: {score_pcmc})")
                    return
        # If PCMB survives
        print("\n✅ Suggested Branch: PCMB under Science")
        return

    # Default (no jump rule for other streams)
    branch_scores = {branch: 0 for branch in branch_questions[stream]}
    for branch, qs in branch_questions[stream].items():
        print(f"\n👉 Evaluating for {branch}...")
        for q in qs:
            ans = input(f"{q} (yes/no): ").strip().lower()
            if ans == "yes":
                branch_scores[branch] += 1

    best_branch = max(branch_scores, key=branch_scores.get)
    if branch_scores[best_branch] == 0:
        print(f"\nNo clear branch preference in {stream}. Explore multiple options!")
    else:
        print(f"\n✅ Suggested Branch: {best_branch} under {stream}")

# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    print("🎓 Stream & Branch Suggestion Quiz 🎓")
    chosen_stream = run_quiz()
    if chosen_stream:
        run_branch_quiz(chosen_stream)
