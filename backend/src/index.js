import express from 'express'
import {supabase} from './db/index.js'; // Assuming this imports the Supabase client
import {testConnection} from './db/index.js';
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import cors from 'cors';
import questionsRoutes from './routes/questions.routes.js';
import participantRoutes from './routes/participant.routes.js';
import agentRoutes from './routes/agents.routes.js'; // The new Agent logic module
import tokenRoutes from './routes/token.routes.js';


const app = express();
// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware to log raw body for debugging agent requests (optional but useful)
app.use((req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        if (data && req.path.startsWith('/api/agent')) {
            console.log(`🟡 RAW BODY (${req.path}):`, data);
        }
        // Need to re-parse the body if you log it like this, or use body-parser middleware.
        // Assuming express.json() handles the parsing for req.body below.
    });
    next();
});

// Middleware to parse JSON
app.use(express.json());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://quiz-app-tzvw.vercel.app" ,
            "http://localhost:5174"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

// Routes
app.use('/api/auth',authRoutes);
app.use('/api/session',sessionRoutes);
app.use('/api/sessions/:sessionId/questions',questionsRoutes);
app.use('/api/participants',participantRoutes);
app.use("/api/agent", agentRoutes); // <-- Agent Logic Endpoint
app.use("/api/token",tokenRoutes);


// Simple GET endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Hello from Node.js!' });
});

// Test database connection (rest of code omitted for brevity)
app.get("/test-connection",async(req,res) => {
    // ... (existing connection check logic) ...
});


// Start the server
app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
