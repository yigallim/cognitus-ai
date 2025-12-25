import { useState, useEffect } from "react";

export interface SavedConnection {
    id: string;
    type: "MySQL" | "PostgreSQL" | "Supabase";
    connectionName: string;
    user: string;
    database: string;
    details: Record<string, string>;
    createdAt: string; 
}

const STORAGE_KEY = "cognitus_db_connections";

export function useConnections() {
    // Initialize state from Local Storage
    const [connections, setConnections] = useState<SavedConnection[]>(() => {
        try {
            const item = window.localStorage.getItem(STORAGE_KEY);
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Failed to load connections:", error);
            return [];
        }
    });

    // Save to Local Storage whenever connections change
    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    }, [connections]);

    const addConnection = (conn: SavedConnection) => {
        setConnections((prev) => [conn, ...prev]);
    };

    const removeConnection = (id: string) => {
        setConnections((prev) => prev.filter((c) => c.id !== id));
    };

    const getConnectionById = (id: string) => {
        return connections.find((c) => c.id === id);
    };

    return {
        connections,
        addConnection,
        removeConnection,
        getConnectionById
    };
}