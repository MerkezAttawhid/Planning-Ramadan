import csv
from datetime import datetime

# 🔹 Période DÉCEMBRE 2025
start = datetime(2025, 12, 1)
end   = datetime(2025, 12, 31)

rows_decembre = []

with open("transactions_test.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter=";")

    # 🔍 Trouver la colonne Date (BOM-safe)
    date_col = None
    for col in reader.fieldnames:
        if col.replace("\ufeff", "").strip().lower() == "date":
            date_col = col
            break

    if not date_col:
        raise RuntimeError("Colonne Date introuvable")

    for row in reader:
        d = datetime.strptime(row[date_col].strip(), "%d/%m/%Y")
        if start <= d <= end:
            rows_decembre.append(row)

print("Total lignes CSV :", reader.line_num - 1)
print("🔥 Lignes DÉCEMBRE :", len(rows_decembre))

# 🔎 Preuve : afficher 5 premières lignes
for r in rows_decembre[:5]:
    print(r[date_col], r.get("NumeroBadge"), r.get("GareEntree"), r.get("GareSortie"))
