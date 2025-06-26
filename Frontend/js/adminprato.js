const API_URL = "http://localhost";
const API_PORTA = 3000;

import { checkAdminAccess } from '../js/authUtils.js';

document.addEventListener("DOMContentLoaded", async () => {
    await checkAdminAccess(); // Redireciona se não for admin

    const token = localStorage.getItem("token");

    async function carregarTiposDePrato() {
        const tiposFixos = ['Dieta', 'Carne', 'Peixe', 'Vegetariano', 'Outro'];

        const select = document.getElementById("tipoPrato");
        const filtroSelect = document.getElementById("filtroTipo");

        const optionsHTML = ['<option value="">Selecione o tipo</option>'];
        tiposFixos.forEach((tipo) => {
            optionsHTML.push(`<option value="${tipo}">${tipo}</option>`);
        });

        select.innerHTML = optionsHTML.join('');
        filtroSelect.innerHTML = optionsHTML.join('');
    }


    async function carregarPratos(nomeFiltro = "", tipoFiltro = "") {
        try {
            let url = `${API_URL}:${API_PORTA}/pratos`;
            const params = new URLSearchParams();
            if (tipoFiltro) params.append("tipo", tipoFiltro);
            url += "?" + params.toString();

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
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
                            : "Sem imagem"}
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
                        </td>`;
                    tbody.appendChild(linha);
                });
        } catch (error) {
            console.error("Erro ao carregar pratos:", error);
        }
    }

    window.aplicarFiltros = function () {
        const nome = document.getElementById("filtroNome").value;
        const tipo = document.getElementById("filtroTipo").value;
        carregarPratos(nome, tipo);
    };

    window.limparFiltros = function () {
        document.getElementById("filtroNome").value = "";
        document.getElementById("filtroTipo").value = "";
        carregarPratos();
    };

    window.editarPrato = async function (id) {
        try {
            const res = await fetch(`${API_URL}:${API_PORTA}/pratos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const prato = await res.json();

            // Preenche o formulário
            document.getElementById("nomePrato").value = prato.nome;
            document.getElementById("descricaoPrato").value = prato.descricao;
            document.getElementById("tipoPrato").value = prato.tipo_prato;

            // Guardar o id no form ou no dataset para referência
            document.getElementById("formCriarPrato").dataset.editingId = prato._id;

            // Abrir o modal
            document.getElementById("modalCriarPrato").classList.remove("hidden");

        } catch (err) {
            console.error("Erro ao carregar prato para edição:", err);
            alert("Erro ao carregar prato.");
        }
    };


    window.removerPrato = function (id) {
        if (!confirm("Tem a certeza que deseja remover este prato?")) return;

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
    };

    document.getElementById("btnAbrirModalPrato").addEventListener("click", () => {
        document.getElementById("modalCriarPrato").classList.remove("hidden");
    });


    window.fecharModalCriarPrato = function () {
        document.getElementById("modalCriarPrato").classList.add("hidden");
    };

    document.getElementById("formCriarPrato").addEventListener("submit", async function (e) {
        e.preventDefault();

        const nome = document.getElementById("nomePrato").value.trim();
        const descricao = document.getElementById("descricaoPrato").value.trim();
        const tipo_prato = document.getElementById("tipoPrato").value.trim();
        const imagemFile = document.getElementById("imagemPrato").files[0];

        const editingId = this.dataset.editingId;
        const method = editingId ? "PATCH" : "POST";
        const url = editingId
            ? `${API_URL}:${API_PORTA}/pratos/${editingId}`
            : `${API_URL}:${API_PORTA}/pratos`;

        const formData = new FormData();
        if (nome) formData.append("nome", nome);
        if (descricao) formData.append("descricao", descricao);
        if (tipo_prato) formData.append("tipo_prato", tipo_prato);
        if (imagemFile) formData.append("image", imagemFile); // <-- corresponde ao .single('image')


        try {
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Erro ao salvar prato");

            alert(editingId ? "Prato atualizado com sucesso!" : "Prato criado com sucesso!");
            document.getElementById("modalCriarPrato").classList.add("hidden");
            this.reset();
            delete this.dataset.editingId;
            carregarPratos();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar prato.");
        }
    });



    // Inicializar
    carregarTiposDePrato();
    carregarPratos();
});
