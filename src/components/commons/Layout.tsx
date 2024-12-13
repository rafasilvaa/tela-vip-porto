import React, { ReactNode } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Conteúdo principal */}
      <main className="flex-grow overflow-y-auto">{children}</main>

      {/* Rodapé estilizado */}
      <footer className="w-full py-4 bg-gray-800 text-white mt-auto">
        <div className="flex justify-center space-x-4 items-center">
          {/* Texto com créditos */}
          <p className="text-sm md:text-base text-center">
            Created by{' '}
            <span className="font-semibold">Thyago Campos</span>,{' '}
            <span className="font-semibold">Leidinice Silva</span>, and{' '}
            <span className="font-semibold">Rafael Silva</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
