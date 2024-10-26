# Dashboard for Commission Payouts of Social Media Post

## Getting Started
Cloning project and git init
Clone this project into your local
Remove .git folder
Run git init in your CLI

## Environment Variables
The environment variables can be found and modified in the `.env` file.

```bash
# Node Environment
NODE_ENV = development

#MongoDB 
DATABASE_URI = mongodb+srv://<username>:<password>@sandbox.jadwj.mongodb.net/
ACCESS_TOKEN_SECRET = ""
REFRESH_TOKEN_SECRET = ""
```

Start backend:
```
cd server
npm install
npm run dev
```

Start frontend:
```
cd client/admin-fe
npm install
npm start
```
