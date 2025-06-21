async function fetchCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Usuário não autenticado");
    return;
  }

  const res = await fetch('http://localhost:3000/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    alert("Erro ao carregar dados do usuário");
    return;
  }

  const user = await res.json();
  return user;
}

async function fetchPratoById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/pratos/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return null;
  return res.json();
}

function calcularPreferencias(marcacoes, pratosMap) {
  const categoriasFixas = ['Vegetariano', 'Carne', 'Dieta', 'Peixe', 'Outro'];
  const tiposCount = {};
  let totalMarcacoes = 0;

  marcacoes.forEach(m => {
    const prato = pratosMap[m.prato];
    if (!prato) return;

    totalMarcacoes++;
    const tipo = prato.tipo_prato || 'Outro';

    tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
  });

  const porcentagens = {};
  categoriasFixas.forEach(c => porcentagens[c] = 0);

  if (totalMarcacoes > 0) {
    Object.entries(tiposCount).forEach(([tipo, count]) => {
      porcentagens[tipo] = Math.round((count / totalMarcacoes) * 100);
    });
  }

  return porcentagens;
}



function renderPreferencias(prefs) {
  const container = document.getElementById('preferences-bars');
  container.innerHTML = '';

  const cores = {
    Vegetariano: 'bg-green-600',
    Carne: 'bg-red-600',
    Dieta: 'bg-purple-600',
    Peixe: 'bg-blue-600',
    Outro: 'bg-gray-600'
  };

  for (const tipo_prato in prefs) {
    const perc = prefs[tipo_prato];
    const cor = cores[tipo_prato] || cores['Outro'];

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="flex justify-between mb-1">
        <span class="text-sm font-medium text-gray-700">${tipo_prato}</span>
        <span class="text-sm font-medium text-gray-700">${perc}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="${cor} h-2.5 rounded-full" style="width: ${perc}%"></div>
      </div>
    `;
    container.appendChild(div);
  }
}

function renderRecompensas(rewards) {
  const container = document.getElementById('rewards-list');
  container.innerHTML = '';

  if (rewards.length === 0) {
    container.textContent = 'Nenhuma recompensa disponível.';
    return;
  }

  rewards.forEach(r => {
    const div = document.createElement('div');
    div.classList.add('p-2', 'bg-gray-100', 'rounded', 'shadow-sm');
    div.textContent = `${r.descricao} - Objetivo: ${r.objetivo}`;
    container.appendChild(div);
  });
}

function renderMealHistory(marcacoes, pratosMap) {
  const tbody = document.getElementById('meal-history-body');
  tbody.innerHTML = '';

  // Ordenar as marcações pela data, mais antiga primeiro
  marcacoes.sort((a, b) => new Date(a.data_marcacao) - new Date(b.data_marcacao));

  marcacoes.forEach(m => {
    const prato = pratosMap[m.prato];
    if (!prato) return;

    const row = document.createElement('tr');
    row.classList.add('bg-white', 'divide-y', 'divide-gray-200');

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">${new Date(m.data_marcacao).toLocaleDateString()}</td>
      <td class="px-6 py-4 whitespace-nowrap">${m.horario}</td>
      <td class="px-6 py-4 whitespace-nowrap flex items-center">
        <img src="${prato.imagem || 'https://via.placeholder.com/40'}" class="h-10 w-10 rounded-full mr-4" alt="${prato.nome}">
        <span class="text-sm font-medium text-gray-900">${prato.nome}</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">${prato.tipo_prato}</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="capitalize">${m.estado}</span>
      </td>
      <td class="px-6 py-4 text-sm font-medium">
        <button class="text-blue-600 hover:text-blue-900">Detalhes</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}


async function main() {
  const user = await fetchCurrentUser();
  if (!user) return;

  const avatarImg = document.getElementById('user-avatar');
  avatarImg.src = user.avatar || 'https://www.gravatar.com/avatar/?d=mp&f=y'; // gravatar bonequinho cinzento padrão


  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('points-rewards').textContent = user.pontos_recompensas;

  renderRecompensas(user.recompensas);

  const pratosMap = {};
  for (const m of user.marcacoes) {
    if (!pratosMap[m.prato]) {
      const prato = await fetchPratoById(m.prato);
      pratosMap[m.prato] = prato;
    }
  }

  const preferencias = calcularPreferencias(user.marcacoes, pratosMap);
  renderPreferencias(preferencias);

  renderMealHistory(user.marcacoes, pratosMap);
}

window.addEventListener('DOMContentLoaded', main);
