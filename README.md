# Ledger

Personal finance & life management — all in one place.

Track bills, subscriptions, and tasks with AI-powered financial insights.

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)

---

## Features

| | |
|:--|:--|
| **Dashboard** | Command center with live stats — unpaid bills, monthly subscription cost, pending tasks |
| **Bills** | Add, edit, delete, and mark bills as paid/unpaid. Filter by status, sort by due date or amount |
| **Subscriptions** | Track recurring charges with billing cycle normalization. See your true monthly cost |
| **Tasks** | Manage to-dos with priority levels (high / medium / low), due dates, and descriptions |
| **AI Insights** | Rule-based financial analysis — flags unused subscriptions, upcoming bills, spending patterns |
| **Safe Deletions** | Confirmation dialogs before any destructive action across all pages |
| **INR Support** | Indian Rupee support throughout the entire app |

---

## Tech Stack

| Layer | Technology |
|:--|:--|
| **Frontend** | React 19, Tailwind CSS, shadcn/ui, Phosphor Icons, Sonner, date-fns |
| **Backend** | FastAPI, Python 3.12 |
| **Database** | MongoDB (Motor async driver) |

---

## Project Structure

```
life-admin/
├── backend/
│   ├── server.py          # FastAPI app — all API endpoints
│   └── .env               # Environment variables (not committed)
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.js
        │   ├── Bills.js
        │   ├── Subscriptions.js
        │   ├── Tasks.js
        │   └── Insights.js
        ├── components/
        │   └── ui/         # shadcn/ui components
        ├── lib/
        │   └── utils.js
        ├── App.js
        └── index.css
```

---

## Local Setup

**Prerequisites:** Python 3.12+ · Node.js 18+ · MongoDB (local or Atlas)

### 1 · Clone

```bash
git clone https://github.com/YOUR_USERNAME/life-admin.git
cd life-admin
```

### 2 · Backend

```bash
cd backend
pip install fastapi uvicorn motor python-dotenv pydantic
uvicorn server:app --reload --port 8000
```

Create `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

### 3 · Frontend

```bash
cd frontend
npm install
npm start
```

Create `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 4 · Open

```
http://localhost:3000
```

---

## API Reference

<details>
<summary>Bills</summary>

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/api/bills` | Get all bills |
| `POST` | `/api/bills` | Create a bill |
| `PUT` | `/api/bills/{id}` | Update a bill |
| `DELETE` | `/api/bills/{id}` | Delete a bill |

</details>

<details>
<summary>Subscriptions</summary>

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/api/subscriptions` | Get all subscriptions |
| `POST` | `/api/subscriptions` | Create a subscription |
| `PUT` | `/api/subscriptions/{id}` | Update a subscription |
| `DELETE` | `/api/subscriptions/{id}` | Delete a subscription |

</details>

<details>
<summary>Tasks</summary>

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/{id}` | Update a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task |

</details>

<details>
<summary>Dashboard & Insights</summary>

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/api/dashboard/summary` | Get dashboard stats |
| `POST` | `/api/insights/analyze` | Run AI analysis |

</details>

---

## Deployment

### MongoDB Atlas — Database

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Copy your connection string
3. Set as `MONGO_URL` in your backend environment

### Render — Backend

1. Connect your GitHub repo at [render.com](https://render.com)
2. **Build command:** `pip install fastapi uvicorn motor python-dotenv pydantic`
3. **Start command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add environment variables: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`

### Vercel — Frontend

1. Import your GitHub repo at [vercel.com](https://vercel.com)
2. Add env variable: `REACT_APP_BACKEND_URL=https://your-render-url.onrender.com`
3. Deploy

---

## Environment Variables

| Variable | Location | Description |
|:--|:--|:--|
| `MONGO_URL` | `backend/.env` | MongoDB connection string |
| `DB_NAME` | `backend/.env` | Database name |
| `CORS_ORIGINS` | `backend/.env` | Allowed origins (`*` for all) |
| `REACT_APP_BACKEND_URL` | `frontend/.env` | Backend API base URL |

> [!WARNING]
> Never commit `.env` files to version control. They are listed in `.gitignore`.

---

## Known Limitations

> [!NOTE]
> - **No authentication** — all data is shared in a single database instance
> - **Rule-based AI** — insights are not powered by a live LLM
> - **Render cold starts** — free tier spins down after 15 min of inactivity; first request may be slow

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

---

<div align="center">

Made with ❤️ &nbsp;·&nbsp; [Report a Bug](https://github.com/YOUR_USERNAME/life-admin/issues) &nbsp;·&nbsp; [Request a Feature](https://github.com/YOUR_USERNAME/life-admin/issues)

</div>
