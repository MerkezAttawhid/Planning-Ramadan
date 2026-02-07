import os
import requests
from dotenv import load_dotenv

# 🔐 Charger le .env
load_dotenv()

API_KEY = os.getenv("ULYS_API_KEY")
X_INITIATOR = os.getenv("ULYS_X_INITIATOR")

if not API_KEY or not X_INITIATOR:
    raise RuntimeError("❌ Problème .env : clé ou x-initiator manquant")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "x-initiator": X_INITIATOR,
}

# 🔹 ID de facture À MODIFIER selon le test
INVOICE_ID = "LL00932864"

print("=== RÉCUPÉRATION TRANSACTIONS CSV ===")

url = f"https://ulys-api-partner.vinci-autoroutes.com/api/transactions/gettransactionsbilledcsv/{INVOICE_ID}"

response = requests.get(url, headers=headers)

print("Status :", response.status_code)
print("Content-Type :", response.headers.get("Content-Type"))

if response.status_code == 200:
    with open("transactions_test.csv", "wb") as f:
        f.write(response.content)
    print("✅ transactions_test.csv généré")
else:
    print("❌ Erreur :")
    print(response.text)
