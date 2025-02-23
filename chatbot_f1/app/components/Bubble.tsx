import React from "react";

// Define los tipos de los mensajes (user o assistant)
interface BubbleProps {
    role: string;
    content: string;
}

const Bubble = ({ role, content }: BubbleProps) => {
    // Estilo básico para la burbuja
    const isUser = role === "user"; // Comprobamos si el rol es usuario

    return (
        <div
            style={{
                display: "inline-block",
                maxWidth: "60%",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "15px",
                backgroundColor: isUser ? "#D1E7FF" : "#F4F4F4", // Diferente color para el usuario y el asistente
                textAlign: isUser ? "right" : "left",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
        >
            <strong>{isUser ? "Tú" : "Asistente"}: </strong>{content}
        </div>
    );
};

export default Bubble;
