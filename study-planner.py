# GradeScope Study Planner (Python Version)

def clamp(value, minimum, maximum):
    return min(max(value, minimum), maximum)

print("=== GradeScope Study Planner ===\n")

current_average = float(input("Rata-rata saat ini: "))
target_average = float(input("Target rata-rata: "))
days_left = int(input("Sisa hari menuju ujian: "))
study_hours = float(input("Jam belajar per hari: "))
priority_subject = input("Mata pelajaran prioritas: ")

current_average = clamp(current_average, 0, 100)
target_average = clamp(target_average, 0, 100)
days_left = clamp(days_left, 1, 180)
study_hours = clamp(study_hours, 0.25, 8)

gap = max(target_average - current_average, 0)

daily_minutes = round(study_hours * 60)

if gap <= 0:
    pace = "Maintenance"
    pace_note = "Target sudah tercapai. Fokus menjaga konsistensi."
elif gap <= 5:
    pace = "Terkontrol"
    pace_note = "Target cukup realistis."
elif gap <= 10:
    pace = "Stabil"
    pace_note = "Perlu latihan yang konsisten."
else:
    pace = "Agresif"
    pace_note = "Target cukup menantang."

concept_minutes = round(daily_minutes * 0.4)
practice_minutes = round(daily_minutes * 0.4)
review_minutes = daily_minutes - concept_minutes - practice_minutes

print("\n=== HASIL ANALISIS ===")
print(f"Gap Nilai       : {gap:.1f}")
print(f"Ritme Belajar   : {pace}")
print(f"Keterangan      : {pace_note}")

print("\n=== DAILY PLAN ===")
print(f"Konsep {priority_subject} : {concept_minutes} menit")
print(f"Latihan Soal           : {practice_minutes} menit")
print(f"Review Cepat           : {review_minutes} menit")

print("\n=== CHECKPOINT ===")

for ratio in [0.25, 0.5, 0.75, 1]:
    day = round(days_left * ratio)

    target_score = current_average + (gap * ratio)

    if target_score > target_average:
        target_score = target_average

    print(
        f"Hari ke-{day} -> Target latihan: {target_score:.1f}"
    )

print("\n=== REKOMENDASI ===")

if gap == 0:
    print("Pertahankan performa saat ini.")
elif gap <= 5:
    print("Fokus pada konsistensi belajar harian.")
elif gap <= 10:
    print("Tambahkan latihan soal dan evaluasi mingguan.")
else:
    print("Perlu peningkatan intensitas belajar dan evaluasi rutin.")