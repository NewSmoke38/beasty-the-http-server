# beasty 

beasty is a minimalist custom raw TCP HTTP server made from scratch. No frameworks, just sockets!!!
Built with a focus on security, performance, and a unique retro terminal UI.

It allows users to login, interact with 3 live endpoints, and retrieve real metadata about their requests — all with a strict 4-request limit per week per user. 

ALSO: This whole concept of beasty-the-http-server to come live on a website and actually give responses which are not hardcoded and the whole flow of how it will connect and work w frontend & backend is mine. never saw anything like this before and ai could never serve this whole recipie, it just assisted me with writinf lenthgy code, the logic and integration has taken time and my braincells. each line of code in the file main.js (heart of beasty, the main file) is carefully written, read and understood by me, thats why i have those comments cause debugging was an ACTUAL thing in this project.

## Why i built it?

I came across CodeCrafters a year ago maybe and had made my mind to make something cool from it and show it to the world. 

When i got time now to make something from it, I saw a problem that if i make a HTTP server from scratch then it will only work locally on my machine and that had me thinking on how to SHOWCASE this beast. 

So i started building it while tinkering on how to deploy it on the internet. and this seemed interesting to me. so wrote some ideas that how it would connwct to a backend and a frontend and security features like only some GET requests in the starting. then wrote some backend for it to verify users and it went on to become bigger and bigger w time...  

Fastforward 9 days i've made it. 




### How was beasty made from scratch!!!

actually the basics were pretty easy and i passed all the stages in CodeCrafters with flying colors. the real battle started when i had to customize it for my own custom requests + responses. 

i was clear in my mind that i will only allow a few requests to be made by any user to avoid abuse. so i made 3 requests, hardcoded ones which all users will make. getting these to work was a real hassle cause the responses were to be made personalized for every user! I first tinkered about what these requests should be, then after a lot of ideas i thought why not give the user thier own userInfo? easy right? no. cause then you gotta apply a number of things to take the userInfo 

### UI/UX

## Tech Stack


### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/beasty-the-http-server.git
cd beasty-the-http-server
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=4000
MONGODB_URI=mongodb://localhost:27017/beasty
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user

### Request Endpoints
- `GET /` - Basic greeting
- `GET /beasty` - User metadata without IP
- `GET /beasty?withIP=true` - User metadata with IP

## Security Features

### Rate Limiting
- 4 requests per 3 minutes per IP
- Configurable limits in `config.js`
- Automatic request tracking

### IP Access Control
- Whitelist for trusted IPs
- Blacklist for blocked IPs
- Bypass rate limiting for whitelist
- Block all access for blacklist

### Request Throttling
- Minimum 1 second between requests
- Per-IP tracking
- 429 response for rapid requests

## Development

### Project Structure
```
beasty-the-http-server/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── routes/
└── beasty/
    └── config.js
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ by chxshi
- Inspired by retro terminal interfaces
- Thanks to all contributors

---

> "Security is not a feature, it's a process." 