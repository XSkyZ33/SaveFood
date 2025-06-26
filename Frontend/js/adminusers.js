const apiBase = 'http://localhost:3000/users';
const token = localStorage.getItem('token');

if (!token) {
  alert('Não autorizado! Faça login.');
  window.location.href = '/login.html';
}

const headersAuth = {
  'Authorization': `Bearer ${token}`
};

document.addEventListener('DOMContentLoaded', () => {
  fetchUsers();

  // Usar o botão que já está no HTML, não criar outro
  const btnAdd = document.getElementById('addUserBtn');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openAddModal());
  }
});

async function fetchUsers() {
  try {
    const res = await fetch(apiBase, { headers: headersAuth });
    if (!res.ok) throw new Error('Erro ao buscar utilizadores');
    const data = await res.json();

    fillTable(data.users);
  } catch (error) {
    alert(error.message);
  }
}

function fillTable(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = ''; // limpa

  users.forEach(user => {
    const tr = document.createElement('tr');

    const createdAtFormatted = new Date(user.createdAt).toLocaleDateString('pt-PT');

    tr.innerHTML = `
      <td class="p-4 flex items-center space-x-4">
        <img src="${user.avatar || 'https://via.placeholder.com/40'}" alt="Avatar" class="w-10 h-10 rounded-full object-cover" />
        <span>${user.name}</span>
      </td>
      <td class="p-4">${user.email}</td>
      <td class="p-4 capitalize">${user.type_user}</td>
      <td class="p-4 text-center">${user.pontos_recompensas ?? 0}</td>
      <td class="p-4 text-center">${user.pontos_bom_comportamento ?? 0}</td>
      <td class="p-4">${createdAtFormatted}</td>
      <td class="p-4 text-right space-x-2">
        <button class="text-blue-600 hover:underline edit-btn" data-id="${user._id}"><i class="fas fa-edit mr-1"></i> Editar</button>
        <button class="text-red-500 hover:underline delete-btn" data-id="${user._id}"><i class="fas fa-trash-alt mr-1"></i> Remover</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Adicionar eventos dos botões depois de preencher a tabela
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.closest('button').dataset.id;
      if (confirm('Tem certeza que quer remover este utilizador?')) {
        deleteUser(id);
      }
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.closest('button').dataset.id;
      openEditModal(id);
    });
  });
}

async function deleteUser(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`, {
      method: 'DELETE',
      headers: headersAuth
    });

    if (!res.ok) throw new Error('Erro ao remover utilizador');
    alert('Utilizador removido com sucesso.');
    fetchUsers();
  } catch (error) {
    alert(error.message);
  }
}

/** Abre modal para adicionar */
function openAddModal() {
  showModal(createModalHTML(null, 'add'), 'Adicionar Utilizador', async (form) => {
    const formData = new FormData(form);
    try {
      const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao adicionar utilizador');
      }
      alert('Utilizador adicionado com sucesso!');
      closeModal();
      fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  });
}

/** Abre modal para editar */
async function openEditModal(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`, { headers: headersAuth });
    if (!res.ok) throw new Error('Erro ao carregar utilizador');
    const data = await res.json();
    const user = data.user;

    showModal(createModalHTML(user, 'edit'), 'Editar Utilizador', async (form) => {
      const formData = new FormData(form);
      try {
        const res = await fetch(`${apiBase}/${id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Erro ao atualizar utilizador');
        }
        alert('Utilizador atualizado com sucesso!');
        closeModal();
        fetchUsers();
      } catch (error) {
        alert(error.message);
      }
    });
  } catch (error) {
    alert(error.message);
  }
}

/** Cria HTML do modal, tipo = 'add' ou 'edit' */
function createModalHTML(user = {}, tipo = 'add') {
  if (tipo === 'add') {
    return `
      <form id="userForm" class="space-y-4" enctype="multipart/form-data">
        <div>
          <label class="block font-semibold">Imagem de Perfil</label>
          <input type="file" name="image" accept="image/*" required />
        </div>
        <div>
          <label class="block font-semibold">Nome</label>
          <input type="text" name="name" required value="" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label class="block font-semibold">Email</label>
          <input type="email" name="email" required value="" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label class="block font-semibold">Senha</label>
          <input type="password" name="password" required class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded hover:bg-gray-100">Cancelar</button>
          <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Adicionar</button>
        </div>
      </form>
    `;
  } else {
    // Editar - mostra todos exceto createdAt, type_user readonly
    return `
      <form id="userForm" class="space-y-4" enctype="multipart/form-data">
        <div>
          <label class="block font-semibold">Imagem de Perfil</label>
          <input type="file" name="image" accept="image/*" />
          ${user.avatar ? `<img src="${user.avatar}" alt="avatar" class="mt-2 w-20 h-20 rounded-full object-cover" />` : ''}
        </div>
        <div>
          <label class="block font-semibold">Nome</label>
          <input type="text" name="name" required value="${user.name || ''}" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label class="block font-semibold">Email</label>
          <input type="email" name="email" required value="${user.email || ''}" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label class="block font-semibold">Senha</label>
          <input type="password" name="password" placeholder="Deixe em branco para manter" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label class="block font-semibold">Tipo de Utilizador</label>
          <input type="text" name="type_user" value="${user.type_user || ''}" readonly class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
        </div>
        <div>
          <label class="block font-semibold">Pontos Recompensa</label>
          <input type="number" name="pontos_recompensas" value="${user.pontos_recompensas ?? 0}" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label class="block font-semibold">Pontos Bom Comportamento</label>
          <input type="number" name="pontos_bom_comportamento" value="${user.pontos_bom_comportamento ?? 0}" class="w-full border border-gray-300 rounded px-2 py-1" />
        </div>
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded hover:bg-gray-100">Cancelar</button>
          <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Atualizar</button>
        </div>
      </form>
    `;
  }
}


/** Modal helpers **/
function showModal(htmlContent, title, onSubmit) {
  const modal = document.createElement('div');
  modal.id = 'modalContainer';
  modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';

  modal.innerHTML = `
    <div class="bg-white rounded-lg w-96 p-6 shadow-lg max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">${title}</h2>
      ${htmlContent}
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onSubmit(form);
  });
}

function closeModal() {
  const modal = document.getElementById('modalContainer');
  if (modal) modal.remove();
}
