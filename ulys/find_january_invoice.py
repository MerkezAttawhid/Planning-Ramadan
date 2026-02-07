import csv
from datetime import datetime

start = datetime(2026, 1, 1)
end   = datetime(2026, 1, 1)

rows_janvier = []

with open("transactions_test.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter=";")

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
            rows_janvier.append(row)

print("Total lignes CSV :", reader.line_num - 1)
print("Lignes JANVIER :", len(rows_janvier))
