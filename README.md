# 🔐 KubeCrypt

**KubeCrypt** simplifies the creation of [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) for Kubernetes using `kubeseal`. Easily generate both **Opaque** and **TLS** sealed secrets through a secure, browser-based UI — all without compromising your private key.

---

## 🚀 Features

- 🔐 **Secure & Private**: Your `.pem` certificate file is **never uploaded or stored**. All encryption is handled locally in your browser.
- 🧩 **Sealed Secret Generation**: Supports both `Opaque` and `TLS` secret types.
- 🧰 **Base64 Decoder Utility** *(Optional)*: Decode base64-encoded strings quickly when working with Kubernetes secrets.
- 🐳 **Run Locally with Docker**: Use the provided Dockerfile to run KubeCrypt privately in your own environment.

---

## 🌐 Live Demo

**🔗 [Visit KubeCrypt Now](https://kubecrypt.rishabhpahwa.in)**  

<img width="637" height="833" alt="image" src="https://github.com/user-attachments/assets/12c5a015-5647-4a0c-bf06-8f00bb87281b" />



---

## 🛠️ How It Works

1. Upload your **Sealed Secrets public key** (`.pem` file).
2. Choose the secret type: **Opaque** or **TLS**.
3. Enter your secret data (key-value pairs).
4. Click **Generate Sealed Secret** — your output is ready!
5. *(Optional)* Use the built-in base64 decoder for quick lookups.

---

## 🐳 Run Locally with Docker

Prefer not to use the hosted version? No problem.

### 1. Clone the Repository

```bash
git clone https://github.com/Rishabh-Pahwa/KubeCrypt.git
cd kubecrypt
```

### 2. Build the Docker Image

```bash
docker build -t kubecrypt .
```

### 3. Run the Container

```bash
docker run -d -p 8080:80 kubecrypt
```
---
### 🔐 Security Note

KubeCrypt is designed with privacy and security in mind:
  + The .pem public key is only used in-browser for encryption.
  + No files or secret data are ever uploaded or stored on the server.
  + You retain full control over your encryption materials.
  
For maximum security, you can self-host KubeCrypt using the Docker method above.
