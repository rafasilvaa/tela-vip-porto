'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Filme {
  id: number;
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
  const [addErro, setAddErro] = useState('');

  useEffect(() => {
    const fetchFilmes = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
  
      if (!token || !userId) {
        setError('Usuário não autenticado.');
        setLoading(false);
        // Redirecionar para o login ou realizar outras ações
        window.location.href = '/login'; // ou qualquer URL da sua página de login
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:3000/api/filmes/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Erro ao buscar filmes');
        }
  
        const data = await response.json();
        setFilmes(data);
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
    setAddErro('');

    if (buscaResultado) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setAddErro('Usuário não autenticado.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/filmes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: userId,
            nome: buscaResultado.nome,
            plot: buscaResultado.plot,
            urlimagem: buscaResultado.url_img,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar filme.');
        }

        const newFilm: Filme = {
          id: Date.now(),
          id_usuario: userId,
          nome: buscaResultado.nome,
          plot: buscaResultado.plot,
          urlimagem: buscaResultado.url_img,
        };

        setFilmes((prev) => [newFilm, ...prev]);
        setBuscaResultado(null);
        setBuscaNome('');
      } catch (error) {
        setAddErro((error as Error).message);
      }
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat overlay-image opa">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-3xl">
        {/* Box para buscar filme no IMDB */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md w-full">
          <h3 className="text-xl font-semibold mb-4">Buscar Filme no IMDB</h3>
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
        </div>

        {/* Título */}
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-700">Lista de Filmes</h2>
        </div>

        {/* Lista de filmes */}
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
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">{filme.nome}</h3>
                <p className="text-gray-600">{filme.plot}</p>
              </div>
            </li>
          ))}
        </ul>
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
              {addErro && <p className="text-red-500 mt-2">{addErro}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
