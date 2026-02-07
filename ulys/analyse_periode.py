import csv
from datetime import datetime

# 🔹 Définition de la période JANVIER
start = datetime(2026, 1, 1)
end   = datetime(2026, 1, 31)

rows_janvier = []

with open("transactions_test.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter=";")

    # 🔍 trouver la colonne Date (BOM-safe)
    date_col = None
    for col in reader.fieldnames:
        if col.replace("\ufeff", "").strip().lower() == "date":
            date_col = col
            break

    if not date_col:
        raise RuntimeError("❌ Colonne Date introuvable")

    for row in reader:
        d = datetime.strptime(row[date_col].strip(), "%d/%m/%Y")

        if start <= d <= end:
            rows_janvier.append(row)

print("👉 Nombre total de lignes dans le CSV :", reader.line_num - 1)
print("🔥 Nombre de lignes JANVIER :", len(rows_janvier))

# 🔎 Afficher quelques lignes pour preuve
for r in rows_janvier[:5]:
    print(r[date_col], r.get("NumeroBadge"), r.get("GareEntree"), r.get("GareSortie"))
