module.exports = function attachSocket(io) {
    io.on("connection", (socket) => {
        socket.on("joinPoll", (pollId) => {
            if (!pollId) return;
            socket.join(`poll:${pollId}`);
            socket.emit("joinedPoll", { pollId });
        });
        socket.on("leavePoll", (pollId) => {
            socket.leave(`poll:${pollId}`);
        });
    });
};


module.exports.broadcastPollResults = function (io, pollId, results) {
    io.to(`poll:${pollId}`).emit("poll:results", { pollId, results });
};
