import json
import uuid
import re
import xmlrpc.client
from collections import defaultdict

# =====================
# CONFIG ODOO
# =====================
ODOO_URL = "https://basedetest-test-19-0128.odoo.com"
DB = "basedetest-test-19-0128"
USERNAME = "contact@adertechnologies.fr"
API_KEY = "0fddc5c3f38442cc8b12684fbf77bc3c518a8b26"   # ⚠️ clé en local uniquement

ADER_COMPANY_ID = 1  # SASU ADER TECHNOLOGIES

# =====================
# PARAMÈTRES MÉTIER
# =====================
DATE_START = "2025-10-01"
DATE_END   = "2025-12-31"

TARGET_PF_NAMES = [
    "[PF2501] CONSULTING FRANCE",
    "[PF2517] FORMATIONS - CCI CANTAL",
]

# =====================
# CONFIG FICHIERS
# =====================
INPUT_JSON = "test_osheet.json"
OUTPUT_JSON = "test_osheet_WITH_RESULTATS.json"
SOURCE_SHEET_NAME = "Rapports analytiques par Montant"

# =====================
# CONNEXION ODOO
# =====================
common = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USERNAME, API_KEY, {})
if not uid:
    raise Exception("Connexion Odoo échouée")

models = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/object")
print("✅ Connecté à Odoo, uid =", uid)

# =====================
# LECTURE JSON
# =====================
with open(INPUT_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

# =====================
# FEUILLE SOURCE
# =====================
source_sheet = next(
    s for s in data["sheets"]
    if SOURCE_SHEET_NAME in s["name"]
)

cells = source_sheet["cells"]

# =====================
# CELLS -> ROWS
# =====================
rows = defaultdict(dict)
for cell_ref, value in cells.items():
    col = cell_ref[0]
    row = int(cell_ref[1:])
    rows[row][col] = value

data_rows = [rows[r] for r in sorted(rows) if r > 1]
print("Nombre de lignes source :", len(data_rows))

# =====================
# EXTRACTION IDS PF (depuis colonne I)
# =====================
pf_ids = set()
pattern = re.compile(r"ODOO\.LIST\([^,]+,\s*(\d+),")

for row in data_rows:
    val = row.get("I")
    if isinstance(val, str):
        m = pattern.search(val)
        if m:
            pf_ids.add(int(m.group(1)))

pf_ids = sorted(pf_ids)
print("IDs PF trouvés :", len(pf_ids))

# =====================
# RÉSOLUTION PF VIA API (ADER)
# =====================
records = models.execute_kw(
    DB, uid, API_KEY,
    "account.analytic.account",
    "search_read",
    [[("id", "in", pf_ids)]],
    {
        "fields": ["display_name"],
        "context": {
            "allowed_company_ids": [ADER_COMPANY_ID],
            "company_id": ADER_COMPANY_ID
        }
    }
)

pf_map = {r["id"]: r["display_name"] for r in records}
print("PF résolus pour ADER :", len(pf_map))

# =====================
# CALCUL VENTES VIA API
# =====================
ventes_par_pf = defaultdict(float)

for pf_id, pf_name in pf_map.items():
    if pf_name not in TARGET_PF_NAMES:
        continue

    domain = [
    ("company_id", "=", ADER_COMPANY_ID),
    ("x_plan2_id", "=", pf_id),  # ✅ PF FRANCE
    ("x_studio_date_de_prod_analytique", ">=", DATE_START),
    ("x_studio_date_de_prod_analytique", "<=", DATE_END),
    ("amount", ">", 0),
]


    lines = models.execute_kw(
        DB, uid, API_KEY,
        "account.analytic.line",
        "search_read",
        [domain],
        {
            "fields": ["amount"],
            "context": {
                "allowed_company_ids": [ADER_COMPANY_ID],
                "company_id": ADER_COMPANY_ID,
            }
        }
    )

    total = sum(l["amount"] for l in lines if l.get("amount"))
    ventes_par_pf[pf_name] = total


print("\nVENTES (01/10/2025 → 31/12/2025) :")
for pf_name, total in ventes_par_pf.items():
    print(pf_name, "=>", round(total, 2))

# =====================
# CRÉATION FEUILLE RESULTATS
# =====================
def create_resultats_sheet(ventes_par_pf):
    sheet_id = str(uuid.uuid4())

    headers = ["PF", "Période", "Ventes"]

    cells = {}

    for i, h in enumerate(headers):
        col = chr(ord("A") + i)
        cells[f"{col}1"] = h

    row_idx = 2
    for pf_name, total in ventes_par_pf.items():
        cells[f"A{row_idx}"] = pf_name
        cells[f"B{row_idx}"] = f"{DATE_START} → {DATE_END}"
        cells[f"C{row_idx}"] = round(total, 2)
        row_idx += 1

    return {
        "id": sheet_id,
        "name": "resultats",
        "colNumber": len(headers),
        "rowNumber": row_idx,
        "cells": cells,
        "cols": {},
        "rows": {},
        "merges": [],
        "styles": {},
        "formats": {},
        "borders": {},
        "conditionalFormats": [],
        "figures": [],
        "tables": [],
        "isVisible": True,
    }

# =====================
# AJOUT FEUILLE + SAUVEGARDE
# =====================
data["sheets"].append(create_resultats_sheet(ventes_par_pf))

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n✅ JSON généré :", OUTPUT_JSON)
print("➡️ Feuille 'resultats' avec VENTES prête")
