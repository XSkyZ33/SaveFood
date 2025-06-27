const container = document.getElementById('estatisticas-container');
const modal = document.getElementById('estatistica-modal');
const form = document.getElementById('estatistica-form');
const token = localStorage.getItem('token');


let editingId = null;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchEstatisticas() {
  try {
    const res = await fetch('http://localhost:3000/estatisticas'); // GET sem token
    const data = await res.json();
    renderEstatisticas(data);
  } catch (err) {
    console.error("Erro ao carregar estatísticas:", err);
  }
}

let chartInstance = null;
let estatisticaAtual = null;

function renderEstatisticas(estatisticas) {
  container.innerHTML = '';

  estatisticas.forEach(est => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200 mb-4';
    card.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-600 text-sm capitalize">${est.tipo_estatistica}</p>
          <p class="text-xl font-bold">${est.observacao}</p>
        </div>
        <div>
          <button class="text-sm text-blue-500 hover:underline mr-3">Ver Gráfico</button>
          <button class="text-sm text-yellow-600 hover:underline mr-3">Editar</button>
          <button class="text-sm text-red-600 hover:underline">Eliminar</button>
        </div>
      </div>
      <div class="mt-4">
        <table class="w-full text-sm">
          <tbody>
            ${est.dados.map(d => {
              const valorKey = Object.keys(d).find(key => key !== 'categoria');
              const valor = d[valorKey];

              let unidade = '';
              if (valorKey.toLowerCase().includes('(kg)')) unidade = ' kg';
              else if (valorKey.toLowerCase().includes('(%)')) unidade = ' %';

              return `
                <tr>
                  <td class="font-medium">${d.categoria}</td>
                  <td class="text-right">${valor}${unidade}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const buttons = card.querySelectorAll('button');
    const btnVerGrafico = buttons[0];
    const btnEditar = buttons[1];
    const btnEliminar = buttons[2];

    btnVerGrafico.addEventListener('click', () => {
      estatisticaAtual = est;
      gerarGrafico(estatisticaAtual, document.getElementById('tipoGrafico').value);
      document.getElementById('grafico-container').classList.remove('hidden');
    });

    btnEditar.addEventListener('click', () => {
      editEstatistica(est._id);
    });

    btnEliminar.addEventListener('click', () => {
      deleteEstatistica(est._id);
    });

    container.appendChild(card);
  });
}

function gerarGrafico(est, tipoGrafico = 'bar') {
  const labels = ['Desperdício', 'Reaproveitado', 'Total pratos desperdicados'];

  const valoresMap = {
    'desperdício': 0,
    'reaproveitado': 0,
    'total pratos desperdicados': 0
  };

  est.dados.forEach(d => {
    const cat = d.categoria.toLowerCase();
    if (valoresMap.hasOwnProperty(cat)) {
      const chave = Object.keys(d).find(k => k !== 'categoria');
      valoresMap[cat] = d[chave];
    }
  });

  const ctx = document.getElementById('grafico-estatistica').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (tipoGrafico === 'radar') {
    const datasets = labels.map((label, index) => {
      const data = labels.map((_, i) => i === index ? valoresMap[label.toLowerCase()] : 0);
      const coresBackground = ['rgba(248,113,113,0.5)', 'rgba(52,211,153,0.5)', 'rgba(251,191,36,0.5)'];
      const coresBorder = ['rgba(185,28,28,1)', 'rgba(4,120,87,1)', 'rgba(161,98,7,1)'];

      return {
        label: label,
        data: data,
        backgroundColor: coresBackground[index],
        borderColor: coresBorder[index],
        borderWidth: 2,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
      };
    });

    chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: `Gráfico Radar - ${est.tipo_estatistica}`
          }
        },
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    const valores = labels.map(label => valoresMap[label.toLowerCase()]);
    chartInstance = new Chart(ctx, {
      type: tipoGrafico,
      data: {
        labels: labels,
        datasets: [{
          label: est.observacao,
          data: valores,
          backgroundColor: ['#f87171', '#34d399', '#fbbf24'],
          borderColor: ['#b91c1c', '#047857', '#a16207'],
          borderWidth: 1,
          fill: tipoGrafico === 'line' ? false : true,
          tension: tipoGrafico === 'line' ? 0.3 : 0,
          pointRadius: tipoGrafico === 'line' ? 5 : 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: `Gráfico de ${est.tipo_estatistica} - ${tipoGrafico.charAt(0).toUpperCase() + tipoGrafico.slice(1)}`
          }
        }
      }
    });
  }
}

function openEstatisticaModal() {
  editingId = null;
  form.reset();
  document.getElementById('modal-title').innerText = 'Nova Estatística';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEstatisticaModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tipo = document.getElementById('tipo_estatistica').value;
  const obs = document.getElementById('observacao').value;
  const dadosRaw = document.getElementById('dados').value;

  let dados;
  try {
    dados = JSON.parse(dadosRaw);
  } catch {
    alert("JSON inválido nos dados.");
    return;
  }

  const payload = { tipo_estatistica: tipo, observacao: obs, dados };

  const url = editingId
    ? `http://localhost:3000/estatisticas/${editingId}`
    : 'http://localhost:3000/estatisticas';

  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeEstatisticaModal();
    fetchEstatisticas();
  } else {
    alert("Erro ao guardar estatística.");
  }
});

async function editEstatistica(id) {
  // GET sem token
  const res = await fetch(`http://localhost:3000/estatisticas/${id}`);
  const estatistica = await res.json();

  editingId = estatistica._id;
  document.getElementById('modal-title').innerText = 'Editar Estatística';
  document.getElementById('tipo_estatistica').value = estatistica.tipo_estatistica;
  document.getElementById('observacao').value = estatistica.observacao;
  document.getElementById('dados').value = JSON.stringify(estatistica.dados, null, 2);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

async function deleteEstatistica(id) {
  if (!confirm('Tens a certeza que queres eliminar esta estatística?')) return;

  await fetch(`http://localhost:3000/estatisticas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  fetchEstatisticas();
}

document.getElementById('tipoGrafico').addEventListener('change', (e) => {
  if (estatisticaAtual) {
    gerarGrafico(estatisticaAtual, e.target.value);
  }
});

// Inicializa
fetchEstatisticas();
