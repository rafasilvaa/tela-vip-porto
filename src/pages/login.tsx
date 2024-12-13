'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');
  const [nome, setNome] = useState(''); // Para o nome no registro
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar entre login e registro
  const router = useRouter(); // Para redirecionamento após login ou registro bem-sucedido

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Credenciais inválidas');
      }
  
      const data = await response.json();
      console.log('Login bem-sucedido:', data);
  
      if (!data.token || !data.id) {
        throw new Error('Token ou ID ausente na resposta');
      }
  
      // Armazenar o token, ID e nome do usuário no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('userName', data.nome);
  
      // Redirecionar para a página principal após login bem-sucedido
      router.push('/painelFilmes');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      
      if (err instanceof Error) {
        // Chamar a função de tratamento de erro se for uma instância de Error
        setError(handleLoginError(err));
      } else {
        // Lidar com erros inesperados
        setError('Ocorreu um erro desconhecido.');
      }
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!nome || !email || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || `Erro: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Resposta da API de registro:', data);
  
      // Redirecionar para a página de login após registro bem-sucedido
      router.push('/login');
      setIsRegistering(false);
    } catch (err) {
      console.error('Erro ao registrar usuário:', err);
  
      if (err instanceof Error) {
        // Chamar a função de tratamento de erro se for uma instância de Error
        setError(handleLoginError(err));
      } else {
        // Lidar com erros inesperados
        setError('Ocorreu um erro desconhecido.');
      }
    }
  };
  
  const handleLoginError = (error: Error) => {
    if (error.message.includes('Credenciais inválidas')) {
      return 'Email ou senha incorretos. Verifique se digitou corretamente.';
    } else if (error.message.includes('Não há usuário com este e-mail')) {
      return 'Não encontramos uma conta associada a este e-mail. Você pode criar uma conta nova.';
    } else {
      return 'Erro ao fazer login. Tente novamente mais tarde.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat overlay-image opa">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">{isRegistering ? 'Registrar' : 'Login'}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 mt-1 border rounded-md shadow-sm"
                required
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 border rounded-md shadow-sm"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              id="password"
              value={senha}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 border rounded-md shadow-sm"
              required
            />
          </div>

          {!isRegistering ? (
            <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600">
              Entrar
            </button>
          ) : (
            <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600">
              Registrar
            </button>
          )}
        </form>

        <div className="mt-4 text-center">
          {isRegistering ? (
            <p>
              Já tem uma conta?{' '}
              <button onClick={() => setIsRegistering(false)} className="text-blue-500">Entrar</button>
            </p>
          ) : (
            <p>
              Não tem uma conta?{' '}
              <button onClick={() => setIsRegistering(true)} className="text-blue-500">Registrar</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
