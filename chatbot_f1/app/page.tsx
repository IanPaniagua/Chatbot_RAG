"use client";

import { useAssistant } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import Bubble from "./components/Bubble"; // Importa el componente Bubble
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"; // Importa PromptSuggestionsRow

const Home = () => {
    const [isClient, setIsClient] = useState(false);

    const { messages, input, handleInputChange, append } = useAssistant({
        api: "tu-api-url", // Replace with your actual API URL
        threadId: "tu-thread-id", // Replace if needed
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Función que maneja el clic en un prompt sugerido
    const handlePromptClick = (prompt: string) => {
        append({ role: "user", content: prompt }); // Enviar el prompt al asistente
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        append({ role: "user", content: input }); // Use append to add the user's message
    };

    if (!isClient) return null;

    return (
        <main>
            <h1>Formula One</h1>
            
            {/* Formulario para enviar texto manualmente */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Escribe algo..."
                />
                <button type="submit">Enviar</button>
            </form>

            {/* Mostrar fila de sugerencias de prompts */}
            <PromptSuggestionsRow onPromptClick={handlePromptClick} />

            {/* Mostrar animación de carga cuando los mensajes estén vacíos */}
            {messages.length === 0 ? (
                <LoadingBubble />
            ) : (
                <div>
                    {messages.map((msg, index) => (
                        <Bubble key={index} role={msg.role} content={msg.content} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default Home;
