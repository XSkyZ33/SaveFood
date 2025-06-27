const API_BASE = "http://localhost:3000/notificacoes";

const token = localStorage.getItem("token");
if (!token) {
    alert("Não autenticado!");
    window.location.href = "login.html";
}

// Elementos
const cardsContainer = document.getElementById("cards-container");
const adicionarBtn = document.getElementById("adicionar-btn");

// Modal Adicionar
const modalAdd = document.getElementById("modal-add");
const formAdd = document.getElementById("form-add");
const modalCloseAdd = document.getElementById("modal-close-add");
const userSelect = document.getElementById("user-select");
const mensagemInput = document.getElementById("mensagem-input");

// Modal Editar
const modalEdit = document.getElementById("modal-edit");
const formEdit = document.getElementById("form-edit");
const modalCloseEdit = document.getElementById("modal-close-edit");
const editMensagemInput = document.getElementById("edit-mensagem-input");
const editEstadoSelect = document.getElementById("edit-estado-select");

// Filtros
const filterButtons = document.querySelectorAll(".filter-btn");

let usuarios = [];
let notificacoes = [];
let filtroEstado = "all";
let editNotificacaoId = null;

// Carregar utilizadores para o select no modal adicionar
async function fetchUsuarios() {
    try {
        const res = await fetch("http://localhost:3000/users", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar utilizadores");
        const data = await res.json();
        usuarios = data.users;  // CORREÇÃO AQUI

        userSelect.innerHTML = "";
        usuarios.forEach((u) => {
            const option = document.createElement("option");
            option.value = u._id;
            option.textContent = u.name || u.username || "Sem nome";
            userSelect.appendChild(option);
        });
    } catch (error) {
        alert(error.message);
    }
}


// Buscar notificações conforme filtro
async function fetchNotificacoes(estado = "all") {
    try {
        let url = API_BASE + "/all";
        if (estado !== "all") {
            url += `?estado=${encodeURIComponent(estado)}`;
        }
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar notificações");
        notificacoes = await res.json();
        renderNotificacoes();
    } catch (error) {
        alert(error.message);
    }
}

function formatDate(isoString) {
    const d = new Date(isoString);
    if (isNaN(d)) return isoString; // fallback
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}


function renderNotificacoes() {
    cardsContainer.innerHTML = "";

    if (notificacoes.length === 0) {
        cardsContainer.innerHTML =
            '<p class="text-center text-gray-500">Nenhuma notificação encontrada.</p>';
        return;
    }

    notificacoes.forEach((not) => {
        const card = document.createElement("div");
        card.className =
            "border rounded p-4 shadow bg-white flex justify-between items-start";

        const infoDiv = document.createElement("div");

        const userName = usuarios.find((u) => u._id === not.userId)?.name || "Desconhecido";

        const dataFormatada = formatDate(not.data_envio);

        infoDiv.innerHTML = `
            <p><strong>Utilizador:</strong> ${userName}</p>
            <p><strong>Mensagem:</strong> ${not.mensagem}</p>
            <p><strong>Estado:</strong> ${not.estado}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
        `;

        // Container para os botões (flex horizontal)
        const btnContainer = document.createElement("div");
        btnContainer.className = "flex space-x-2";  // espaço horizontal entre botões

        const btnEditar = document.createElement("button");
        btnEditar.className =
            "bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => abrirModalEditar(not));

        const btnEliminar = document.createElement("button");
        btnEliminar.className = "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => apagarNotificacao(not._id));

        btnContainer.appendChild(btnEditar);
        btnContainer.appendChild(btnEliminar);

        card.appendChild(infoDiv);
        card.appendChild(btnContainer);

        cardsContainer.appendChild(card);
    });
}


async function apagarNotificacao(id) {
    if (!confirm("Tem certeza que quer apagar esta notificação?")) return;

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error("Erro ao apagar notificação");
        // Atualizar lista após apagar
        await fetchNotificacoes(filtroEstado);
    } catch (error) {
        alert(error.message);
    }
}


// Abrir modal adicionar
adicionarBtn.addEventListener("click", () => {
    editNotificacaoId = null;
    mensagemInput.value = "";
    if (usuarios.length > 0) userSelect.value = usuarios[0]._id;
    modalAdd.classList.remove("hidden");
});

// Fechar modal adicionar
modalCloseAdd.addEventListener("click", () => {
    modalAdd.classList.add("hidden");
});

// Salvar nova notificação
formAdd.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        userId: userSelect.value,
        mensagem: mensagemInput.value.trim(),
        estado: "nao lida",
    };

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Erro ao adicionar notificação");
        modalAdd.classList.add("hidden");
        await fetchNotificacoes(filtroEstado);
    } catch (error) {
        alert(error.message);
    }
});

// Abrir modal editar com dados preenchidos
function abrirModalEditar(not) {
    editNotificacaoId = not._id;
    editMensagemInput.value = not.mensagem;
    editEstadoSelect.value = not.estado;
    modalEdit.classList.remove("hidden");
}

// Fechar modal editar
modalCloseEdit.addEventListener("click", () => {
    modalEdit.classList.add("hidden");
    editNotificacaoId = null;
});

// Salvar edição
formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editNotificacaoId) {
        alert("Erro: Nenhuma notificação selecionada para edição.");
        return;
    }
    const data = {
        mensagem: editMensagemInput.value.trim(),
        estado: editEstadoSelect.value,
    };

    try {
        const res = await fetch(`${API_BASE}/${editNotificacaoId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Erro ao editar notificação");
        modalEdit.classList.add("hidden");
        editNotificacaoId = null;
        await fetchNotificacoes(filtroEstado);
    } catch (error) {
        alert(error.message);
    }
});

// Configurar filtro por botões
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Remove estilo "ativo" de todos os botões
        filterButtons.forEach((b) => {
            b.classList.remove("bg-green-500", "text-white");
            b.classList.add("bg-gray-200", "text-black");
        });

        // Aplica estilo "ativo" ao botão clicado
        btn.classList.add("bg-green-500", "text-white");
        btn.classList.remove("bg-gray-200", "text-black");

        // Atualiza o filtro e busca
        filtroEstado = btn.getAttribute("data-state");
        fetchNotificacoes(filtroEstado);
    });
});


// Inicialização
(async function init() {
    await fetchUsuarios();
    await fetchNotificacoes();
    // Define botão "Todas" como ativo por padrão
    document.querySelector('.filter-btn[data-state="all"]').classList.add("active");
    document.querySelector('.filter-btn[data-state="all"]').classList.add("bg-green-500", "text-white");
    document.querySelector('.filter-btn[data-state="all"]').classList.remove("bg-gray-200", "text-black");
})();
