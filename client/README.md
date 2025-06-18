# Realtime Collaborative Whiteboard

A **real-time collaborative whiteboard** app built with **React**, **Konva**, **Socket.IO**, and **Keycloak** for authentication. This application allows multiple users to draw on a shared canvas, chat in real time, and see each other’s cursor positions. Includes features like undo/redo and export as PNG or PDF.

---

## Tech Stack

| Technology          | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| **React + Vite**    | Frontend framework and build tool                                       |
| **TypeScript**      | Type safety across frontend and backend                                 |
| **Konva + React-Konva** | Canvas drawing (Konva) integrated with React via react-konva         |
| **Socket.IO**       | Real-time communication (drawing/chat/cursor sync)                      |
| **Keycloak**        | Authentication and user management                                      |
| **Bootstrap 5**     | Responsive and modern UI styling                                        |
| **jsPDF + html-to-image** | Export canvas to image or PDF                                      |

---

## Features

- Freehand drawing with color and stroke size
- Undo and Redo support
- Real-time remote cursor visibility
- Export canvas to **PNG** or **PDF**
- Dark mode toggle
- User authentication via **Keycloak**
- Multi-user collaborative sessions (share via unique session links)

---

## Dockerized Keycloak Setup (Authentication)

We use Docker to host **Keycloak** and a **PostgreSQL** DB locally for user authentication.

### 1. `docker-compose.yml`

Place the following file in your project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15.6
    container_name: postgres_db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - keycloak_network

  keycloak:
    image: quay.io/keycloak/keycloak:23.0.7
    container_name: keycloak
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: password
      KC_HOSTNAME: localhost
      KC_HOSTNAME_STRICT: "false"
      KC_HOSTNAME_STRICT_HTTPS: "false"
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: ["start-dev"]
    ports:
      - "8180:8080"
    depends_on:
      - postgres
    networks:
      - keycloak_network

volumes:
  postgres_data:

networks:
  keycloak_network:
```

### 2. Run Keycloak and DB

```bash
docker-compose up -d
```

### 3. Access Keycloak Admin Console

- URL: http://localhost:8180/admin  
- Username: `admin`  
- Password: `admin`

---

##  Keycloak Setup

###  Create Realm

1. Open Admin Console → Click `Master` dropdown → `Create Realm`
2. Name: `realtime-board`

###  Create Client

1. Go to **Clients** → `Create Client`
2. Fill:
   - Client ID: `realtime-client`
   - Client Type: `OpenID Connect`
   - Root URL: `http://localhost:5175`
3. Set **Valid Redirect URIs**:  
   ```
   http://localhost:5175/*
   ```

###  Create Test User

1. Go to **Users** → `Add User`
   - Username: `testuser`
2. Go to **Credentials** tab → Set password:
   - Password: `*****real`
   - Temporary: `Off`

---

## Frontend Keycloak Configuration

In `src/services/KeycloakService.ts`:

```ts
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180/',
  realm: 'realtime-board',
  clientId: 'realtime-client',
});

export default keycloak;
```

---

## Project Setup & Installation

### 1. Clone and Structure

```bash
git clone <your-repo>
cd realtime-whiteboard
```

```bash
npm create vite@latest client -- --template react-ts
cd client
```

### 2. Install Frontend Dependencies

```bash
npm install
npm install bootstrap@5 konva react-konva uuid keycloak-js
npm install react-router-dom jspdf html-to-image socket.io-client react-icons
```

### 3. Backend Setup

```bash
mkdir server && cd server
npm init -y
npm install socket.io cors
npm install --save-dev typescript ts-node @types/node
npx tsc --init
```

Add `index.ts` as your WebSocket server entry point.

### 4. Run the App

#### Terminal 1 (Server):

```bash
cd server
npx ts-node index.ts
```

#### Terminal 2 (Client):

```bash
cd client
npm run dev
```

---

##  Usage Guide

###  Create Session

- Click on **"Create Session"**
- Auto-generates a unique whiteboard link:  
  ```
  http://localhost:5175/whiteboard/<sessionId>
  ```
- Share this link to collaborate.

###  Join Session

- Input existing session ID or URL to join.


---

##  UI Features

| Feature        | Description |
|----------------|-------------|
|  Drawing     | Select color, stroke size |
|  Undo/Redo   | Restore or revert changes |
|  Export      | Save whiteboard as image/PDF |
|  Chat        | Real-time communication |
|  Dark Mode   | Toggle dark/light theme |

---



##  References

- [Keycloak Docs](https://www.keycloak.org/documentation)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [React-Konva Docs](https://konvajs.org/docs/react/)
- [Socket.IO Docs](https://socket.io/docs/v4/)
