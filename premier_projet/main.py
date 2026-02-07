from flask import Flask, request, jsonify

app = Flask(__name__)

print("SERVEUR DÉMARRÉ ET PRÊT À RECEVOIR")

@app.route("/email", methods=["POST"])
def receive_email():
    print(">>> REQUÊTE REÇUE SUR /email")

    data = request.json or {}

    subject = data.get("subject", "")
    body = data.get("body", "")

    print("EMAIL REÇU")
    print("Sujet :", subject)
    print("Corps :", body)

    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
