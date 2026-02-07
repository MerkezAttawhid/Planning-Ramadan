import os
import requests
import csv
from dotenv import load_dotenv
from io import BytesIO, TextIOWrapper

load_dotenv()

API_KEY = os.getenv("ULYS_API_KEY")
X_INITIATOR = os.getenv("ULYS_X_INITIATOR")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "x-initiator": X_INITIATOR,
}

# 1️⃣ récupérer les factures
resp = requests.get(
    "https://ulys-api-partner.vinci-autoroutes.com/api/invoices/getinvoices/",
    headers=headers
)
resp.raise_for_status()
invoices = resp.json()

all_rows = []
fieldnames = None

for inv in invoices:
    if inv.get("invoiceType") != "TLP":
        continue

    invoice_id = inv["invoiceId"]
    print(f"➡️ Téléchargement {invoice_id}")

    url = (
        "https://ulys-api-partner.vinci-autoroutes.com"
        f"/api/transactions/gettransactionsbilledcsv/{invoice_id}"
        "?invoiceType=TLP"
    )

    r = requests.get(url, headers=headers)

    if r.status_code != 200:
        print(f"   ⚠️ ignorée (HTTP {r.status_code})")
        continue

    text = TextIOWrapper(BytesIO(r.content), encoding="utf-8")
    reader = csv.DictReader(text, delimiter=";")

    if not fieldnames:
        fieldnames = reader.fieldnames

    for row in reader:
        all_rows.append(row)

print(f"\n✅ Total lignes récupérées : {len(all_rows)}")

# 2️⃣ écrire le CSV global
if all_rows:
    with open("transactions_global.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(all_rows)

    print("📄 transactions_global.csv généré")
