const API_URL = "http://localhost";
const API_PORTA = 3000;

// Carregar tipos únicos para o filtro de tipo_prato
async function carregarTiposDePrato() {
  try {
    const res = await fetch(`${API_URL}:${API_PORTA}/pratos`);
    const pratos = await res.json();

    const tiposUnicos = [...new Set(pratos.map((p) => p.tipo_prato))];
    const select = document.getElementById("tipoPrato");
    
    // Limpa e repõe opções
    select.innerHTML = '<option value="">Selecione o tipo</option>';
    tiposUnicos.forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar tipos de prato:", err);
  }
}


// Carregar pratos com ou sem filtros
async function carregarPratos(nomeFiltro = "", tipoFiltro = "") {
    const token = localStorage.getItem("token");
    try {
        let url = `${API_URL}:${API_PORTA}/pratos`;
        const params = new URLSearchParams();

        if (tipoFiltro) params.append("tipo", tipoFiltro);
        url += "?" + params.toString();

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const pratos = await res.json();

        const tbody = document.getElementById("tabela-pratos");
        tbody.innerHTML = "";

        pratos
            .filter((p) => p.nome.toLowerCase().includes(nomeFiltro.toLowerCase()))
            .forEach((p) => {
                const linha = document.createElement("tr");

                linha.innerHTML = `
          <td class="p-4">
            ${p.imagem
                        ? `<img src="${p.imagem}" alt="${p.nome}" class="w-16 h-16 object-cover rounded">`
                        : "Sem imagem"
                    }
          </td>
          <td class="p-4">${p.nome}</td>
          <td class="p-4">${p.descricao}</td>
          <td class="p-4">${p.tipo_prato}</td>
          <td class="p-4">${new Date(p.createdAt).toLocaleDateString("pt-PT")}</td>
          <td class="p-4 text-right space-x-2">
            <button class="text-blue-500 hover:underline" onclick="editarPrato('${p._id}')">
              <i class="fas fa-edit mr-1"></i>Editar
            </button>
            <button class="text-red-500 hover:underline" onclick="removerPrato('${p._id}')">
              <i class="fas fa-trash-alt mr-1"></i>Remover
            </button>
          </td>
        `;
                tbody.appendChild(linha);
            });
    } catch (error) {
        console.error("Erro ao carregar pratos:", error);
    }
}

function aplicarFiltros() {
    const nome = document.getElementById("filtroNome").value;
    const tipo = document.getElementById("filtroTipo").value;
    carregarPratos(nome, tipo);
}

function limparFiltros() {
    document.getElementById("filtroNome").value = "";
    document.getElementById("filtroTipo").value = "";
    carregarPratos();
}

function editarPrato(id) {
    // Redirecionar para página de edição ou abrir modal
    alert(`Editar prato com ID: ${id}`);
}

function removerPrato(id) {
    if (!confirm("Tem a certeza que deseja remover este prato?")) return;

    const token = localStorage.getItem("token");

    fetch(`${API_URL}:${API_PORTA}/pratos/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => res.json())
        .then((data) => {
            alert(data.message || "Prato removido.");
            carregarPratos();
        })
        .catch((err) => {
            console.error("Erro ao remover prato:", err);
            alert("Erro ao remover prato.");
        });
}

function abrirModalCriarPrato() {
    document.getElementById("modalCriarPrato").classList.remove("hidden");
    carregarTiposDePrato();
}

function fecharModalCriarPrato() {
    document.getElementById("modalCriarPrato").classList.add("hidden");
}

document.getElementById("formCriarPrato").addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const nome = document.getElementById("nomePrato").value.trim();
    const descricao = document.getElementById("descricaoPrato").value.trim();
    const tipo_prato = document.getElementById("tipoPrato").value.trim();
    const imagem = document.getElementById("imagemPrato").value.trim();

    try {
        const res = await fetch(`${API_URL}:${API_PORTA}/pratos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nome, descricao, tipo_prato, imagem }),
        });

        if (!res.ok) throw new Error("Erro ao criar prato");

        alert("Prato criado com sucesso!");
        fecharModalCriarPrato();
        carregarPratos();
        carregarTiposDePrato();
    } catch (err) {
        console.error(err);
        alert("Erro ao criar prato.");
    }
});

// Inicializar ao carregar página
document.addEventListener("DOMContentLoaded", () => {
    carregarTiposDePrato();
    carregarPratos();
});
