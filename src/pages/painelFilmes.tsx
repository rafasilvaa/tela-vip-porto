'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Filme {
  id?: number;
  id_usuario: string;
  nome: string;
  plot: string;
  urlimagem: string;
}

interface FilmeIMDB {
  nome: string;
  plot: string;
  url_img: string;
}

export default function PainelFilmes() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaResultado, setBuscaResultado] = useState<FilmeIMDB | null>(null);
  const [buscaErro, setBuscaErro] = useState('');
  const [userName, setUserName] = useState<string>(''); // Armazenar nome do usuário
  const router = useRouter();

  useEffect(() => {
    const userNameFromLocalStorage = localStorage.getItem('userName'); // Pegar nome do usuário do localStorage

    if (userNameFromLocalStorage) {
      setUserName(userNameFromLocalStorage); // Atualiza o nome do usuário no estado
    }

    const fetchFilmes = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Usuário não autenticado.');
        setLoading(false);
        return;
      }

      try {
        // Requisição para obter a lista de filmes cadastrados
        const response = await fetch(`http://localhost:3000/api/filmes/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar filmes');
        }

        const data = await response.json();
        setFilmes(data); // Atualiza a lista de filmes
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilmes();
  }, []);

  const handleSearchIMDB = async () => {
    setBuscaErro('');
    setBuscaResultado(null);

    if (!buscaNome.trim()) {
      setBuscaErro('Digite o nome de um filme para buscar.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/filmesIMDB/${buscaNome.trim()}/`);
      if (!response.ok) {
        throw new Error('Filme não encontrado.');
      }

      const data: FilmeIMDB = await response.json();
      setBuscaResultado(data);
    } catch (error) {
      setBuscaErro((error as Error).message);
    }
  };

  const handleAddFilm = async () => {
    if (buscaResultado) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Usuário não autenticado.');
        return;
      }

      const newFilm: Filme = {
        id_usuario: userId,
        nome: buscaResultado.nome,
        plot: buscaResultado.plot,
        urlimagem: buscaResultado.url_img,
      };

      try {
        // Enviar o filme para o backend
        const response = await fetch('http://localhost:3000/api/filmes/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newFilm),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar filme à lista.');
        }

        // Atualiza o estado local com o filme adicionado
        const data = await response.json();
        setFilmes((prev) => [...prev, data]); // Adiciona o filme à lista

        // Limpa os campos
        setBuscaResultado(null);
        setBuscaNome('');
      } catch (error) {
        setError((error as Error).message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Limpa o localStorage
    document.cookie.split(';').forEach((c) => { // Limpa os cookies
      document.cookie = c
        .replace(/^ +/, ' ')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    router.push('/'); // Redireciona para a página de login
  };

  const handleRemoveFilm = async (id: number) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }
  
    try {
      // Enviar requisição DELETE
      const response = await fetch(`http://localhost:3000/api/filmes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro ao remover filme');
      }
  
      // Atualiza a lista de filmes, removendo o filme deletado
      setFilmes((prev) => prev.filter((filme) => filme.id !== id));
    } catch (error) {
      setError((error as Error).message);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat overlay-image opa"> {/* Alterado para centralizar o conteúdo */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-3xl my-12"> {/* Box centralizado */}
        {/* Box para buscar filme no IMDB */}
        <h3 className="text-xl font-semibold mb-4">Bem-vindo, {userName || 'Visitante'}</h3>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Digite o nome do filme"
            className="border border-gray-300 p-3 rounded-md flex-grow"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
          />
          <button
            onClick={handleSearchIMDB}
            className="bg-blue-500 text-white p-3 rounded-md shadow-md hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>
        {buscaErro && <p className="text-red-500 mt-2">{buscaErro}</p>}

        {/* Título */}
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-700">Lista de Filmes</h2>
        </div>

        {/* Exibir mensagem caso não haja filmes */}
        {filmes.length === 0 ? (
          <p className="text-center text-lg font-medium text-gray-600">Você não possui filmes adicionados na lista.</p>
        ) : (
          <ul className="space-y-4">
            {filmes.map((filme) => (
              <li key={filme.id} className="flex items-center gap-6">
<Image
  src={filme.urlimagem}
  alt={filme.nome}
  width={160} // 40 * 4 (em pixels)
  height={160} // 40 * 4 (em pixels)
  className="object-contain rounded-md flex-shrink-0"
/>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold">{filme.nome}</h3>
                  <p className="text-gray-600">{filme.plot}</p>
                </div>
                <button
  onClick={() => filme.id !== undefined && handleRemoveFilm(filme.id)}
  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
  title="Remover filme"
>
  Remover
</button>

              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal de destaque */}
      {buscaResultado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex flex-col items-center">
            <Image
  src={buscaResultado.url_img}
  alt={buscaResultado.nome}
  width={192} // 48 * 4 (em pixels)
  height={192} // 48 * 4 (em pixels)
  className="object-contain rounded-md mb-4"
/>
              <h4 className="text-lg font-semibold">{buscaResultado.nome}</h4>
              <p className="text-gray-600 text-center mb-4">{buscaResultado.plot}</p>
              <div className="flex gap-4">
                <button
                  onClick={handleAddFilm}
                  className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                >
                  Adicionar à lista
                </button>
                <button
                  onClick={() => setBuscaResultado(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
          
        </div>
        
      )}
      
    </div>
  );
}
