import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

import { SOCKET_URL } from '../config';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [onlinePlayers, setOnlinePlayers] = useState(0);
    const [onlineVisitors, setOnlineVisitors] = useState(0);
    const [roundResults, setRoundResults] = useState(null);
    const [gameStarted, setGameStarted] = useState(null);

    useEffect(() => {
        const socketOptions = token ? { auth: { token } } : {};
        const newSocket = io(SOCKET_URL, socketOptions);

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
            console.log('📊 Received round_results:', results);
            setRoundResults(results);
        });

        newSocket.on('online_players', (count) => {
            setOnlinePlayers(count);
        });

        newSocket.on('online_visitors', (count) => {
            setOnlineVisitors(count);
        });

        newSocket.on('game_started', (data) => {
            console.log('Game started:', data);
            setGameStarted(data);
            setRoundResults(null);
        });

        newSocket.on('game_finished', (data) => {
            console.log('Game finished:', data);
            if (currentRoom) {
                setCurrentRoom({ ...currentRoom, status: 'finished' });
            }
        });

        newSocket.on('room_closed', (data) => {
            console.log('Room was closed by owner:', data);
            setCurrentRoom(null);
            setGameStarted(null);
            setRoundResults(null);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
            setCurrentRoom(null);
        };
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

    const closeRoom = () => {
        if (socket && currentRoom) {
            socket.emit('close_room', { roomId: currentRoom.id });
            setCurrentRoom(null);
            setGameStarted(null);
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
            console.log('Submitting answers:', { roomId: currentRoom.id, answers });
            socket.emit('submit_answers', { roomId: currentRoom.id, answers });
        } else {
            console.error('Cannot submit: socket or currentRoom is null', { socket: !!socket, currentRoom: !!currentRoom });
        }
    };

    const syncAnswers = (answers) => {
        if (socket && currentRoom && currentRoom.status === 'playing') {
            socket.emit('sync_answers', { roomId: currentRoom.id, answers });
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
            onlineVisitors,
            roundResults,
            gameStarted,
            createRoom,
            joinRoom,
            leaveRoom,
            closeRoom,
            startGame,
            submitAnswers,
            syncAnswers,
            nextRound
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
