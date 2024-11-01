# AI Lawyer Project

## Description
The AI Lawyer project consists of two main parts: frontend and backend. The frontend is built with React, and the backend is built with Python using FastAPI.

## Project Structure
- `Ai-LAWYER-FE/`: Directory containing the frontend source code.
- `services-ai/`: Directory containing the backend source code.

## System Requirements
- Docker
- Docker Compose

## Installation and Running the Project

### Using Docker Compose
1. Clone the repository:
    ```sh
    git clone https://github.com/Captone2-legal-support/Captone2-legal-support.git
    cd Captone2-legal-support
    ```

2. Run Docker Compose:
    ```sh
    docker-compose up --build
    ```

3. Access the application:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend: [http://localhost:8000](http://localhost:8000)

## Docker Structure
### Frontend
- Dockerfile: `Ai-LAWYER-FE/Dockerfile`
- Uses Node.js 18.17.1-alpine and Nginx

### Backend
- Dockerfile: `services-ai/Dockerfile`
- Uses Python 3.12-slim and Uvicorn

