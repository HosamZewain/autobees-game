import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JoinRoomRedirect = () => {
    const { roomId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!roomId) {
            navigate('/');
            return;
        }

        if (token) {
            // User is logged in, verify token then join
            // Ideally validation happens in protected routes, but here we just pass it to lobby
            navigate(`/play/multiplayer?join=${roomId}`);
        } else {
            // User is visitor, save intention and ask to register/login
            localStorage.setItem('pendingRoomId', roomId);
            // Default to register for new users (growth hack), or ask where they want to go? 
            // User request: "if he's a visitor to rigster first"
            navigate('/register?redirect=join');
        }
    }, [roomId, token, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-bold">جاري توجيهك إلى الغرفة...</p>
            </div>
        </div>
    );
};

export default JoinRoomRedirect;
