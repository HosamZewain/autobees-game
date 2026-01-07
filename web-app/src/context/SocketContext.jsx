import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [onlinePlayers, setOnlinePlayers] = useState(0);
    const [roundResults, setRoundResults] = useState(null);

    useEffect(() => {
        if (token) {
            const newSocket = io('http://localhost:3000', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
            });

            newSocket.on('rooms_list', (roomsList) => {
                setRooms(roomsList);
            });

            newSocket.on('room_updated', (room) => {
                setCurrentRoom(room);
                if (room.status === 'playing') {
                    setRoundResults(null);
                }
            });

            newSocket.on('round_results', (results) => {
                setRoundResults(results);
            });

            newSocket.on('online_players', (count) => {
                setOnlinePlayers(count);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            setSocket(null);
            setCurrentRoom(null);
        }
    }, [token]);

    const createRoom = (roomName) => {
        if (socket) socket.emit('create_room', roomName);
    };

    const joinRoom = (roomId) => {
        if (socket) socket.emit('join_room', roomId);
    };

    const leaveRoom = () => {
        if (socket && currentRoom) {
            socket.emit('leave_room', currentRoom.id);
            setCurrentRoom(null);
            setRoundResults(null);
        }
    };

    const startGame = () => {
        if (socket && currentRoom) {
            console.log("Starting game for room:", currentRoom.id);
            socket.emit('start_game', { roomId: currentRoom.id });
        }
    };

    const submitAnswers = (answers) => {
        if (socket && currentRoom) {
            socket.emit('submit_answers', { roomId: currentRoom.id, answers });
        }
    };

    const nextRound = () => {
        if (socket && currentRoom) {
            socket.emit('next_round', { roomId: currentRoom.id });
        }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            rooms,
            currentRoom,
            onlinePlayers,
            roundResults,
            createRoom,
            joinRoom,
            leaveRoom,
            startGame,
            submitAnswers,
            nextRound
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
