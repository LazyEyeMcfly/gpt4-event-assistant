# GPT-4.1 Event Assistant

This is a full-stack, self-hosted GPT-4.1-powered assistant designed for real-world public deployment. Originally built for the South Main Mercado event in Rockford, IL, this assistant supports dynamic prompt engineering, secure Docker hosting, and seamless front-end integration.

## Features

- **Live Prompt Editing**: Update system prompts in real time without rebuilding or restarting the container.
- **Agentic Prompting**: Designed for persistence, planning, and tool usage — fully compatible with GPT-4.1’s advanced agent behaviors.
- **Self-Hosted via Docker**: Easily deploy and manage the assistant locally or on a Synology NAS.
- **Secure HTTPS Hosting**: Set up with Synology's reverse proxy, DDNS, and Let’s Encrypt for public HTTPS access.
- **Squarespace-Compatible Frontend**: Includes a minimal frontend chat widget that can be embedded or used standalone.

---

## Directory Structure

```
.
├── Dockerfile
├── server.js                # Express.js backend
├── prompt.txt              # Live-editable system prompt
├── /public
│   └── assistant-preview.html  # Frontend widget (Squarespace-compatible)
```

---

## System Requirements

- Node.js (v18+)
- Docker and Docker Compose
- GPT-4.1 API access (via OpenAI)
- Synology NAS (optional, for hosting)
- Registered DDNS (e.g., `yoursite.synology.me`) with HTTPS enabled via Let’s Encrypt

---

## Setup Instructions

### 1. Clone and Configure
Clone the repo to your server or NAS and install dependencies:
```bash
git clone https://github.com/yourname/gpt41-event-assistant.git
cd gpt41-event-assistant
```

Edit the `prompt.txt` file with your desired system prompt.

Update `server.js` with your OpenAI API key if not using environment variables.

---

### 2. Build the Docker Image
```bash
sudo docker build -t mercado-va .
```

---

### 3. Run the Assistant Container
```bash
sudo docker run -d -p 3000:3000 \
  --name mercado-assistant \
  -v /volume1/docker/south-main-mercado-assistant/prompt.txt:/app/prompt.txt \
  -v /volume1/web:/volume1/web \
  mercado-va
```

This mounts your `prompt.txt` for live editing and hosts the `assistant-preview.html` frontend.

---

### 4. Synology Reverse Proxy + HTTPS (Optional)
- Go to DSM > Control Panel > Application Portal > Reverse Proxy.
- Create a new rule that maps your subdomain (e.g., `southmainassistant.synology.me`) to your NAS’s local port 3000.
- Enable HTTPS using Let’s Encrypt.
- Your assistant will now be publicly available at `https://southmainassistant.synology.me`.

---

## Editing the System Prompt Live

The assistant reads from `prompt.txt` on every incoming request. To update behavior:
1. Open the mounted `prompt.txt` file.
2. Edit the prompt directly.
3. Save — no container restart is required.

---

## Sample Frontend Preview Page

Accessible via:
```
http://your-nas-ip:3000/assistant-preview.html
```

Or, if exposed:
```
https://your-subdomain.synology.me/assistant-preview.html
```

You can embed this in a Squarespace site using an `<iframe>` or link directly.

---

## Use Case Example

This assistant was used to support visitors at the South Main Mercado, a large community event in Rockford, IL. It provided real-time info on event rules, hours, pet policy, and other logistics — all using GPT-4.1 with a scoped prompt, ensuring strict relevance to the event only.

---

## Roadmap

- Add conversation logging
- Build web-based prompt editor interface
- Support multi-prompt routing by path or key
- Add support for external tools and APIs via function calling

---

## License

MIT License. See `LICENSE` file for details.

---
