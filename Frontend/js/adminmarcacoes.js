const token = localStorage.getItem('token');

// Função para formatar datas para dd/mm/yyyy
function formatDate(dateString) {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function fetchUserById(id, token) {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Erro ao buscar usuário ${id}`);
    const data = await res.json();
    return data.user || data;
}

async function fetchPratoById(id, token) {
    const res = await fetch(`http://localhost:3000/pratos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Erro ao buscar prato ${id}`);
    const data = await res.json();
    return data;
}

async function loadMarcacoesCompletas(filtroData = '', filtroUserId = '') {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Token não encontrado. Faça login novamente.');
            return;
        }

        let url = 'http://localhost:3000/marcacoes';
        if (filtroData) {
            url += `?data=${encodeURIComponent(filtroData)}`;
        }

        const resMarcacoes = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resMarcacoes.ok) {
            const errorText = await resMarcacoes.text();
            throw new Error('Erro ao obter marcações: ' + errorText);
        }

        let marcacoes = await resMarcacoes.json();

        // Filtrar por utilizador no frontend
        if (filtroUserId) {
            marcacoes = marcacoes.filter(m => {
                const uid = typeof m.userId === 'object' ? m.userId._id || m.userId.id : m.userId;
                return uid === filtroUserId;
            });
        }

        const tbody = document.getElementById('marcacoesBody');
        tbody.innerHTML = '';

        for (const marcacao of marcacoes) {
            let userId = marcacao.userId;
            if (typeof userId === 'object' && userId !== null) {
                userId = userId._id || userId.id || null;
            }

            let pratoId = marcacao.prato;
            if (typeof pratoId === 'object' && pratoId !== null) {
                pratoId = pratoId._id || pratoId.id || null;
            }

            let user = {};
            try {
                if (userId) user = await fetchUserById(userId, token);
            } catch (e) {
                console.error('Erro ao buscar usuário:', e);
            }

            let prato = {};
            try {
                if (pratoId) prato = await fetchPratoById(pratoId, token);
            } catch (e) {
                console.error('Erro ao buscar prato:', e);
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-4">${user.name || '-'}</td>
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
                        // Recarregar marcações aplicando filtros atuais
                        const filtroData = document.getElementById('filtroData').value;
                        const filtroUserId = document.getElementById('filtroUser').value;
                        loadMarcacoesCompletas(filtroData, filtroUserId);
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

async function populateSelects() {
    const token = localStorage.getItem('token');
    const userSelect = document.getElementById('userId');
    const pratoSelect = document.getElementById('pratoId');

    try {
        const resUsers = await fetch('http://localhost:3000/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await resUsers.json();
        const users = data.users || data;  // se existir "users" pega ele, senão pega o próprio data

        userSelect.innerHTML = users.map(u => `<option value="${u._id}">${u.name}</option>`).join('');

        const resPratos = await fetch('http://localhost:3000/pratos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pratosData = await resPratos.json();
        const pratos = pratosData.pratos || pratosData;

        pratoSelect.innerHTML = pratos.map(p => `<option value="${p._id}">${p.nome}</option>`).join('');


        pratoSelect.innerHTML = pratos.map(p => `<option value="${p._id}">${p.nome}</option>`).join('');
    } catch (err) {
        console.error('Erro ao popular selects:', err);
    }
}

async function populateUserFilter() {
    const token = localStorage.getItem('token');
    const filtroUser = document.getElementById('filtroUser');

    try {
        const res = await fetch('http://localhost:3000/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const users = data.users || data; // se data.users existir usa ele, senão usa data (caso seja array direto)

        filtroUser.innerHTML = '<option value="">Todos os Utilizadores</option>' +
            users.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
    } catch (err) {
        console.error('Erro ao carregar filtro de utilizadores:', err);
    }
}



document.getElementById('formMarcacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const userId = document.getElementById('userId').value;
    const prato = document.getElementById('pratoId').value;
    const data_marcacao = document.getElementById('data_marcacao').value;
    const horario = document.getElementById('horario').value;

    const body = { data_marcacao, horario, prato };

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
        document.getElementById('modalMarcacao').classList.add('hidden');
        loadMarcacoesCompletas();
    } catch (err) {
        alert('Erro ao criar marcação');
        console.error(err);
    }
});

// Filtros
window.addEventListener('DOMContentLoaded', () => {
    populateUserFilter();
    loadMarcacoesCompletas();

    const filtroData = document.getElementById('filtroData');
    const filtroUser = document.getElementById('filtroUser');
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    const btnResetarFiltros = document.getElementById('btnResetarFiltros');

    btnAplicarFiltros.addEventListener('click', () => {
        const data = filtroData.value;
        const userId = filtroUser.value;
        loadMarcacoesCompletas(data, userId);
    });

    btnResetarFiltros.addEventListener('click', () => {
        filtroData.value = '';
        filtroUser.value = '';
        loadMarcacoesCompletas();
    });

    document.getElementById('btnAddMarcacao').addEventListener('click', async () => {
        document.getElementById('modalMarcacao').classList.remove('hidden');
        await populateSelects();
    });

    document.getElementById('btnCancel').addEventListener('click', () => {
        document.getElementById('modalMarcacao').classList.add('hidden');
    });
});
