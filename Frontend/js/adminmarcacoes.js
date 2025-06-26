// Função para formatar datas para dd/mm/yyyy
function formatDate(dateString) {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function fetchUserById(id, token) {
    console.log(`fetchUserById: Buscando usuário com id = ${id}`);
    const res = await fetch(`http://localhost:3000/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Erro ao buscar usuário ${id}: ${res.status} ${errorText}`);
        throw new Error(`Erro ao buscar usuário ${id}`);
    }
    const data = await res.json();
    console.log('fetchUserById: usuário encontrado:', data);
    return data;
}

async function fetchPratoById(id, token) {
    console.log(`fetchPratoById: Buscando prato com id = ${id}`);
    const res = await fetch(`http://localhost:3000/pratos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Erro ao buscar prato ${id}: ${res.status} ${errorText}`);
        throw new Error(`Erro ao buscar prato ${id}`);
    }
    const data = await res.json();
    console.log('fetchPratoById: prato encontrado:', data);
    return data;
}

async function loadMarcacoesCompletas() {
    try {
        const token = localStorage.getItem('token');
        console.log('Token JWT obtido:', token);

        if (!token) {
            alert('Token não encontrado. Faça login novamente.');
            return;
        }

        // Buscar marcações
        const resMarcacoes = await fetch('http://localhost:3000/marcacoes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resMarcacoes.ok) {
            const errorText = await resMarcacoes.text();
            console.error('Erro ao obter marcações:', resMarcacoes.status, errorText);
            throw new Error('Erro ao obter marcações');
        }

        const marcacoes = await resMarcacoes.json();
        console.log('Marcações recebidas:', marcacoes);

        const tbody = document.getElementById('marcacoesBody');
        if (!tbody) {
            console.error('Elemento tbody com id "marcacoesBody" não encontrado no DOM!');
            return;
        }
        tbody.innerHTML = '';

        // Para cada marcação, buscar user e prato
        for (const marcacao of marcacoes) {
            console.log('Processando marcação:', marcacao);

            // Verificar e extrair userId e pratoId
            let userId = marcacao.userId;
            if (typeof userId === 'object' && userId !== null) {
                userId = userId._id || userId.id || null;
            }
            let pratoId = marcacao.prato;
            if (typeof pratoId === 'object' && pratoId !== null) {
                pratoId = pratoId._id || pratoId.id || null;
            }
            console.log(`IDs extraídos - userId: ${userId}, pratoId: ${pratoId}`);

            // Buscar dados do user (com tratamento de erros)
            let user = {};
            try {
                if (userId) {
                    const fetched = await fetchUserById(userId, token);
                    // Se o objeto tem um campo user, extraia:
                    user = fetched.user || fetched;
                } else {
                    console.warn('userId inválido ou ausente na marcação:', marcacao);
                }
            } catch (e) {
                console.error('Erro ao buscar usuário:', e);
            }


            // Buscar dados do prato (com tratamento de erros)
            let prato = {};
            try {
                if (pratoId) {
                    prato = await fetchPratoById(pratoId, token);
                } else {
                    console.warn('pratoId inválido ou ausente na marcação:', marcacao);
                }
            } catch (e) {
                console.error('Erro ao buscar prato:', e);
            }

            console.log('User atual para preencher tabela:', user);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-4">${user.name}</td>
                <td class="p-4">${user.email || '-'}</td>
                <td class="p-4">${marcacao.data_pedido ? formatDate(marcacao.data_pedido) : '-'}</td>
                <td class="p-4">${marcacao.data_marcacao ? formatDate(marcacao.data_marcacao) : '-'}</td>
                <td class="p-4">${marcacao.horario || '-'}</td>
                 <td class="p-4 flex items-center space-x-2">
                    ${prato.imagem ? `<img src="${prato.imagem}" alt="${prato.nome}" class="w-12 h-12 rounded object-cover" />` : ''}
                    <span>${prato.nome || '-'}</span>
                </td>
                <td class="p-4">${marcacao.estado || '-'}</td>
                <td class="p-4 text-right space-x-2">
                <button data-id="${marcacao._id}" class="btnDelete text-red-500 hover:underline">
                    <i class="fas fa-trash-alt mr-1"></i>Remover
                </button>
                </td>
            `;
            tbody.appendChild(tr);
        }

        // Eventos dos botões remover
        document.querySelectorAll('.btnDelete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover esta marcação?')) {
                    try {
                        const res = await fetch(`http://localhost:3000/marcacoes/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (!res.ok) {
                            const errorData = await res.json();
                            alert('Erro ao remover: ' + (errorData.message || res.statusText));
                            return;
                        }

                        alert('Marcação removida com sucesso!');
                        loadMarcacoesCompletas(); // recarregar a lista
                    } catch (err) {
                        alert('Erro ao remover marcação');
                        console.error(err);
                    }
                }
            });
        });

    } catch (err) {
        alert('Erro ao carregar marcações completas');
        console.error(err);
    }
}

const modal = document.getElementById('modalMarcacao');
const btnAddMarcacao = document.getElementById('btnAddMarcacao');
const btnCancel = document.getElementById('btnCancel');
const form = document.getElementById('formMarcacao');

btnAddMarcacao.addEventListener('click', async () => {
    modal.classList.remove('hidden');
    await populateSelects();
});

btnCancel.addEventListener('click', () => {
    modal.classList.add('hidden');
});

async function populateSelects() {
  const token = localStorage.getItem('token');
  const userSelect = document.getElementById('userId');
  const pratoSelect = document.getElementById('pratoId');

  if (!token) {
    alert('Token não encontrado. Faça login novamente.');
    return;
  }

  try {
    // USERS
    const resUsers = await fetch('http://localhost:3000/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const usersData = await resUsers.json();
    console.log('Resposta bruta de /users:', usersData);

    const users = Array.isArray(usersData) ? usersData : usersData.users || [];

    if (!Array.isArray(users)) {
      throw new Error('Formato inesperado dos dados de usuários');
    }

    userSelect.innerHTML = users.map(u => `<option value="${u._id}">${u.name}</option>`).join('');

    // PRATOS
    const resPratos = await fetch('http://localhost:3000/pratos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const pratosData = await resPratos.json();
    console.log('Resposta bruta de /pratos:', pratosData);

    const pratos = Array.isArray(pratosData) ? pratosData : pratosData.pratos || [];

    if (!Array.isArray(pratos)) {
      throw new Error('Formato inesperado dos dados de pratos');
    }

    pratoSelect.innerHTML = pratos.map(p => `<option value="${p._id}">${p.nome}</option>`).join('');

  } catch (err) {
    console.error('Erro ao popular selects:', err);
    userSelect.innerHTML = `<option disabled selected>Erro ao carregar usuários</option>`;
    pratoSelect.innerHTML = `<option disabled selected>Erro ao carregar pratos</option>`;
  }
}

async function populateUserFilter() {
  const token = localStorage.getItem('token');
  const filtroUser = document.getElementById('filtroUser');

  try {
    const resUsers = await fetch('http://localhost:3000/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resUsers.json();
    const users = Array.isArray(data) ? data : data.users || [];

    filtroUser.innerHTML += users.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
  } catch (err) {
    console.error('Erro ao carregar filtro de usuários:', err);
  }
}



form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const userId = document.getElementById('userId').value;
    const prato = document.getElementById('pratoId').value;
    const data_marcacao = document.getElementById('data_marcacao').value;
    const horario = document.getElementById('horario').value;

    const body = {
        data_marcacao,
        horario,
        prato
    };

    try {
        const res = await fetch(`http://localhost:3000/marcacoes/user/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            alert('Erro ao criar marcação: ' + (err.message || res.statusText));
            return;
        }

        alert('Marcação criada com sucesso!');
        modal.classList.add('hidden');
        loadMarcacoesCompletas();
    } catch (err) {
        console.error('Erro ao criar marcação:', err);
        alert('Erro ao criar marcação');
    }
});


// Carrega as marcações assim que a página termina de carregar
window.addEventListener('DOMContentLoaded', loadMarcacoesCompletas);

// Botão adicionar (exemplo, você pode implementar um modal ou redirecionar)
const btnAdd = document.getElementById('btnAdd');
if (btnAdd) {
    btnAdd.addEventListener('click', () => {
        alert('Funcionalidade de adicionar marcação ainda não implementada');
    });
} else {
    console.warn('Botão "btnAdd" não encontrado na página.');
}
