const baseUrl = 'http://localhost:3000'; // Ajusta conforme necessário

const pointsEl = document.getElementById('points');
const recompensasContainer = document.getElementById('recompensas-container');
const premiosResgatadosTbody = document.getElementById('premios-resgatados-tbody');

let userData = null;
let allRewards = [];

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Precisas estar autenticado para ver as recompensas.');
    return;
  }

  try {
    // Obter dados do utilizador
    const userRes = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userRes.ok) throw new Error('Erro a obter dados do utilizador');
    userData = await userRes.json();

    // Obter recompensas
    const rewardsRes = await fetch(`${baseUrl}/recompensas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!rewardsRes.ok) throw new Error('Erro a obter recompensas');
    allRewards = await rewardsRes.json();

    // Atualizar pontos
    pointsEl.textContent = `${userData.pontos_recompensas} pontos`;

    // Renderizar listas
    renderPremiosResgatados(userData.recompensas || []);
    renderRecompensas(allRewards);

    // Selecionar botões de filtro dentro do DOM carregado
    const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      // Remove as classes do estado ativo
      b.classList.remove('bg-emerald-500', 'text-white');
      // Adiciona as classes do estado inativo
      b.classList.add('bg-gray-100', 'text-gray-700');
    });

    // Para o botão clicado, aplica o estado ativo
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    btn.classList.add('bg-emerald-500', 'text-white');

    const filtro = btn.getAttribute('data-filter');

    const filteredRewards = filtro === 'todas'
      ? allRewards
      : allRewards.filter(r => r.tipo_recompensa === filtro);

    renderRecompensas(filteredRewards);
  });
});

    // Opcional: ativar o botão "todas" por padrão
    const btnTodas = document.querySelector('.filter-btn[data-filter="todas"]');
    if (btnTodas) {
      btnTodas.classList.add('bg-emerald-500', 'text-white');
    }

  } catch (error) {
    console.error('Erro na carga dos dados:', error);
    alert('Erro a carregar dados.');
  }
});

function renderRecompensas(rewards) {
  recompensasContainer.innerHTML = '';

  if (rewards.length === 0) {
    recompensasContainer.innerHTML = '<p class="text-gray-500 col-span-full">Nenhuma recompensa encontrada.</p>';
    return;
  }

  rewards.forEach(r => {
    const podeResgatar = userData.pontos_recompensas >= r.objetivo;

    // Definir cor de fundo conforme tipo de recompensa
    let bgClass = '';
    switch (r.tipo_recompensa) {
      case 'codigo_desconto':
        bgClass = 'bg-emerald-100';
        break;
      case 'produto':
        bgClass = 'bg-orange-100';
        break;
      case 'voucher':
        bgClass = 'bg-blue-100';
        break;
      default:
        bgClass = 'bg-white'; // fallback neutro
    }

    const card = document.createElement('div');
    card.className = `glass-card p-6 border border-gray-300 rounded-md flex flex-col justify-between ${bgClass}`;

    // Conteúdo cartão
    card.innerHTML = `
      <div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">${r.tipo_recompensa}</h3>
        <p class="text-gray-600 mb-4">${r.descricao}</p>
      </div>
      <div class="flex items-center justify-between">
        <p class="font-bold text-blue-600">${r.objetivo} pontos</p>
        <button 
          class="resgatar-btn px-4 py-2 rounded-full font-semibold transition ${
            podeResgatar ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }" 
          data-id="${r._id}" 
          ${podeResgatar ? '' : 'disabled'}>
          Resgatar
        </button>
      </div>
    `;

    recompensasContainer.appendChild(card);
  });

  // Adicionar eventos aos botões resgatar
  document.querySelectorAll('.resgatar-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const recompensaId = btn.getAttribute('data-id');
      await resgatarRecompensa(recompensaId);
    });
  });
}
// Renderiza prémios resgatados na tabela
function renderPremiosResgatados(resgatados) {
  premiosResgatadosTbody.innerHTML = '';

  if (resgatados.length === 0) {
    premiosResgatadosTbody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-gray-500 py-4">Ainda não resgataste nenhum prémio.</td>
      </tr>
    `;
    return;
  }

  resgatados.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-gray-700">${r.descricao}</td>
      <td class="px-6 py-4 whitespace-nowrap text-gray-700">${r.tipo_recompensa}</td>
    `;
    premiosResgatadosTbody.appendChild(tr);
  });
}

// Função para resgatar recompensa (chama API)
async function resgatarRecompensa(recompensaId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Utilizador não autenticado.');
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/recompensas/resgatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recompensaId })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Erro ao resgatar recompensa.');
      return;
    }

    alert(data.message);

    // Atualizar pontos e listas locais
    userData.pontos_recompensas = data.pontosRestantes;
    pointsEl.textContent = `${userData.pontos_recompensas} pontos`;

    userData.recompensas.push(data.recompensaResgatada);
    renderPremiosResgatados(userData.recompensas);

    // Atualizar lista recompensas filtrada conforme botão ativo
    const activeBtn = document.querySelector('.filter-btn.bg-emerald-500');
    const filtro = activeBtn ? activeBtn.getAttribute('data-filter') : 'todas';

    const filteredRewards = filtro === 'todas' 
      ? allRewards 
      : allRewards.filter(r => r.tipo_recompensa === filtro);

    renderRecompensas(filteredRewards);

  } catch (error) {
    console.error('Erro ao tentar resgatar a recompensa:', error);
    alert('Erro ao tentar resgatar a recompensa.');
  }
}
