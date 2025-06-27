const API_BASE = "http://localhost:3000/recompensas"; // ajuste se necessário

const container = document.getElementById("recompensasContainer");
const filtroSelect = document.getElementById("filterTipo");
const btnNova = document.getElementById("btnNovaRecompensa");
const modal = document.getElementById("modalRecompensa");
const form = document.getElementById("formRecompensa");
const cancelar = document.getElementById("cancelarModal");

const recompensaIdInput = document.getElementById("recompensaId");
const descInput = document.getElementById("descricao");
const objetivoInput = document.getElementById("objetivo");
const tipoInput = document.getElementById("tipo_recompensa");

const token = localStorage.getItem("token");

function abrirModal(recompensa = null) {
  modal.classList.remove("hidden");
  if (recompensa) {
    document.getElementById("modalTitulo").textContent = "Editar Recompensa";
    recompensaIdInput.value = recompensa._id;
    descInput.value = recompensa.descricao;
    objetivoInput.value = recompensa.objetivo;
    tipoInput.value = recompensa.tipo_recompensa;
  } else {
    document.getElementById("modalTitulo").textContent = "Nova Recompensa";
    form.reset();
    recompensaIdInput.value = "";
  }
}

function fecharModal() {
  modal.classList.add("hidden");
  form.reset();
}

function renderRecompensas(recompensas) {
  container.innerHTML = "";
  recompensas.forEach((rec) => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <h2 class="text-lg font-semibold">${rec.descricao}</h2>
        <p class="text-sm text-gray-500">Tipo: ${rec.tipo_recompensa}</p>
        <p class="text-sm text-gray-500">Pontos: ${rec.objetivo}</p>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button class="text-blue-600 hover:underline text-sm" data-id="${rec._id}" data-action="edit">Editar</button>
        <button class="text-red-600 hover:underline text-sm" data-id="${rec._id}" data-action="delete">Remover</button>
      </div>
    `;

    container.appendChild(card);
  });
}

async function carregarRecompensas() {
  const tipo = filtroSelect.value;
  const url = tipo ? `${API_BASE}?tipo_recompensa=${tipo}` : API_BASE;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Erro ao carregar recompensas");
    const data = await res.json();
    renderRecompensas(data);
  } catch (err) {
    console.error("Erro ao carregar recompensas", err);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = recompensaIdInput.value;
  const payload = {
    descricao: descInput.value,
    objetivo: parseInt(objetivoInput.value),
    tipo_recompensa: tipoInput.value,
  };

  try {
    const res = await fetch(id ? `${API_BASE}/${id}` : API_BASE, {
      method: id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao salvar recompensa");
    }

    fecharModal();
    carregarRecompensas();
  } catch (err) {
    alert(err.message || "Erro ao salvar recompensa.");
    console.error(err);
  }
});

container.addEventListener("click", async (e) => {
  const btn = e.target;
  if (btn.tagName !== "BUTTON") return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "edit") {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erro ao buscar recompensa");
      const data = await res.json();
      abrirModal(data);
    } catch (err) {
      alert(err.message || "Erro ao buscar recompensa.");
    }
  } else if (action === "delete") {
    if (confirm("Tem certeza que deseja remover esta recompensa?")) {
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Erro ao remover recompensa");
        carregarRecompensas();
      } catch (err) {
        alert(err.message || "Erro ao remover recompensa.");
      }
    }
  }
});

btnNova.addEventListener("click", () => abrirModal());
cancelar.addEventListener("click", fecharModal);
filtroSelect.addEventListener("change", carregarRecompensas);

// Inicial
carregarRecompensas();
