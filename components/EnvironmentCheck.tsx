// FIX: Add a triple-slash directive to include Vite client types.
/// <reference types="vite/client" />

import React from 'react';

// Lista de todas as variáveis de ambiente necessárias para a aplicação funcionar.
// Devem começar com VITE_ para serem expostas pelo Vite.
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  // A VITE_GEMINI_API_KEY é opcional, a aplicação já lida com a ausência dela.
];

// Verifica quais variáveis estão faltando.
const missingEnvVars = REQUIRED_ENV_VARS.filter(
  (varName) => !import.meta.env[varName]
);

interface EnvironmentCheckProps {
  children: React.ReactNode;
}

export const EnvironmentCheck: React.FC<EnvironmentCheckProps> = ({ children }) => {
  if (missingEnvVars.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 text-white">
        <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl border border-red-700 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Erro de Configuração</h1>
          <p className="text-gray-300 mb-6">
            A aplicação não pôde ser iniciada porque uma ou mais variáveis de ambiente essenciais não foram configuradas.
          </p>
          <div className="bg-gray-900 p-4 rounded-md text-left">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Variáveis Faltando:</h2>
            <ul className="list-disc list-inside space-y-1 text-yellow-400 font-mono text-sm">
              {missingEnvVars.map((varName) => (
                <li key={varName}>{varName}</li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Por favor, configure estas variáveis de ambiente na sua plataforma de hospedagem (Vercel, Netlify, etc.) para continuar.
          </p>
        </div>
      </div>
    );
  }

  // Se todas as variáveis estiverem presentes, renderiza a aplicação.
  return <>{children}</>;
};
