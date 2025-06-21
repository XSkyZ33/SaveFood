const mealsContainer = document.getElementById('meals-container');
const popup = document.getElementById('popup');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');

let selectedMealId = null;

// Buscar pratos da API
async function fetchMeals() {
    try {
        const response = await fetch('http://localhost:3000/pratos'); // Atualiza esta rota se necessário
        const pratos = await response.json();

        mealsContainer.innerHTML = '';

        pratos.forEach(prato => {
            const card = document.createElement('div');
            card.className = 'meal-card bg-white rounded-lg overflow-hidden shadow-md border';

            card.innerHTML = `
        <div class="relative h-40">
          <img src="${prato.imagem}" class="w-full h-full object-cover" alt="${prato.tipo_prato}">
          <div class="absolute top-2 left-2 bg-${getColor(prato.tipo_prato)}-500 text-white px-2 py-1 rounded text-xs font-bold">${prato.tipo_prato}</div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg">${prato.nome}</h3>
                <p class="text-sm text-gray-600 line-clamp-4 transition-all duration-300" id="desc-${prato._id}">${prato.descricao}</p>
                <button class="text-xs text-blue-600 mt-1 hover:underline" data-id="${prato._id}" id="readmore-${prato._id}">Ler mais ▼</button>
            <div class="flex justify-end mt-4">
            <button data-id="${prato._id}" class="buy-btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm">Comprar</button>
          </div>
        </div>
        `;
            mealsContainer.appendChild(card);
        });

        // Add toggle for "Read more"
        document.querySelectorAll('[id^="readmore-"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const desc = document.getElementById(`desc-${id}`);

                if (desc.classList.contains('line-clamp-4')) {
                    desc.classList.remove('line-clamp-4');
                    btn.textContent = 'Ler menos ▲';
                } else {
                    desc.classList.add('line-clamp-4');
                    btn.textContent = 'Ler mais ▼';
                }
            });
        });


        // Eventos do botão Comprar
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Você precisa estar logado para marcar uma refeição.');
                    window.location.href = 'login.html';
                    return;
                }

                selectedMealId = btn.getAttribute('data-id');
                popup.classList.remove('hidden');
            });
        });

    } catch (err) {
        console.error('Erro ao carregar pratos:', err);
    }
}

// Determinar cor com base no tipo
function getColor(tipo) {
    switch (tipo.toLowerCase()) {
        case 'carne': return 'red';
        case 'peixe': return 'blue';
        case 'vegetariano': return 'green';
        case 'dieta': return 'yellow';
        default: return 'gray';
    }
}

// Popup: cancelar
cancelBtn.addEventListener('click', () => {
    popup.classList.add('hidden');
    selectedMealId = null;
});

// Formulário do popup
const form = document.getElementById('marcacaoForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedMealId) return alert('Erro: prato não selecionado.');

    const token = localStorage.getItem('token');
    if (!token) return alert('Você precisa estar logado.');

    const data_marcacao = document.getElementById('data_marcacao').value;
    const horario = document.getElementById('horario').value;

    if (!data_marcacao || !horario) {
        return alert('Preencha todos os campos.');
    }

    try {
        const response = await fetch('http://localhost:3000/marcacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                data_marcacao,
                horario,
                prato: selectedMealId
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Erro ao marcar refeição');
        }

        alert('Refeição marcada com sucesso!');
        popup.classList.add('hidden');
        selectedMealId = null;
        form.reset();
    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
});


// Iniciar
fetchMeals();
