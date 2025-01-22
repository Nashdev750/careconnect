const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Allow all origins - change this to your specific frontend URL in production
        methods: ["GET", "POST"],
        allowedHeaders: ["*"]
    }
});

// Add express cors middleware
const cors = require('cors');
app.use(cors({
    origin: '*', // Allow all origins - change this to your specific frontend URL in production
    methods: ['GET', 'POST']
}));

const PORT = process.env.PORT || 3000;

// Store active users and their information
const activeUsers = new Map(); // socket.id -> { alias, isMentor, isAvailable, currentPartner }
const waitingMentors = new Set();
const waitingMentees = new Set();

// Helper function to find match based on preferences
function findMatch(socket, preferMentor) {
    const user = activeUsers.get(socket.id);
    
    if (user.isMentor) {
        // Mentors can only be matched with mentees
        if (waitingMentees.size > 0) {
            for (const menteeId of waitingMentees) {
                const mentee = activeUsers.get(menteeId);
                if (mentee.isAvailable) {
                    return menteeId;
                }
            }
        }
    } else {
        // Mentee looking for mentor
        if (preferMentor && waitingMentors.size > 0) {
            for (const mentorId of waitingMentors) {
                const mentor = activeUsers.get(mentorId);
                
                if (mentor && mentor.isAvailable) {
                    return mentorId;
                }
            }
        }
        // Mentee looking for mentee
        else if (!preferMentor && waitingMentees.size > 0) {
            console.log(waitingMentees)
            for (const menteeId of waitingMentees) {
                if (menteeId !== socket.id) {
                    const mentee = activeUsers.get(menteeId);
                    console.log(mentee)
                    if (mentee && mentee.isAvailable) {
                        return menteeId;
                    }
                }
            }
        }
    }
    return null;
}

// Helper function to broadcast active users count
function broadcastActiveUsers() {
    io.emit('active_users_count', {
        total: activeUsers.size,
        mentors: Array.from(activeUsers.values()).filter(u => u.isMentor).length,
        mentees: Array.from(activeUsers.values()).filter(u => !u.isMentor).length
    });
}

// Add this helper function near the top with other helper functions
function handleUserLeaving(socketId) {
    const user = activeUsers.get(socketId);
    if (!user) return;

    // Handle partner notification and cleanup if in a chat
    if (user.currentPartner) {
        const partner = activeUsers.get(user.currentPartner);
        if (partner) {
            // Reset partner's state
            partner.isAvailable = true;
            partner.currentPartner = null;
            
            // Add partner back to appropriate waiting queue
            if (partner.isMentor) {
                waitingMentors.add(partner.id);
            } else {
                waitingMentees.add(partner.id);
            }
            
            // Notify partner about the disconnection
            io.to(user.currentPartner).emit('partner_left');
        }
    }

    // Clean up the leaving user
    activeUsers.delete(socketId);
    waitingMentors.delete(socketId);
    waitingMentees.delete(socketId);
    broadcastActiveUsers();
}

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Handle user joining
    socket.on('join', ({ alias, isMentor }) => {
        console.log('joined')
        activeUsers.set(socket.id, {
            alias,
            isMentor,
            isAvailable: true,
            currentPartner: null
        });

        if (isMentor) {
            waitingMentors.add(socket.id);
        } else {
            waitingMentees.add(socket.id);
        }

        broadcastActiveUsers();
        socket.emit('joined', { id: socket.id });
        console.log('joined broadcast')
        console.log(activeUsers)
    });

    // Handle match request
    socket.on('request_match', ({ preferMentor }) => {
        console.log(socket.id,"requested match")
        const user = activeUsers.get(socket.id);
        if (!user || !user.isAvailable) return;

        const matchId = findMatch(socket, preferMentor);
        if (matchId) {
            const match = activeUsers.get(matchId);
            
            // Update both users' status
            user.isAvailable = false;
            user.currentPartner = matchId;
            match.isAvailable = false;
            match.currentPartner = socket.id;

            // Remove from waiting queues
            waitingMentors.delete(socket.id);
            waitingMentors.delete(matchId);
            waitingMentees.delete(socket.id);
            waitingMentees.delete(matchId);

            // Notify both users
            socket.emit('matched', {
                partnerId: matchId,
                partnerAlias: match.alias,
                isMentor: match.isMentor
            });
            
            io.to(matchId).emit('matched', {
                partnerId: socket.id,
                partnerAlias: user.alias,
                isMentor: user.isMentor
            });
        } else {
            socket.emit('no_match');
        }
    });

    // Handle messages
    socket.on('message', ({ to, content }) => {
        const user = activeUsers.get(socket.id);
        if (!user || !user.currentPartner) return;
        
        io.to(to).emit('message', {
            from: socket.id,
            content,
            alias: user.alias
        });
    });

    // Handle user leaving chat
    socket.on('leave_chat', () => {
        console.log("left chat")
        handleUserLeaving(socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(socket.id," disconnected")
        handleUserLeaving(socket.id);
    });
});

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 