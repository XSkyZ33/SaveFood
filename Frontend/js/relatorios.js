const container = document.getElementById('estatisticas-container');
let chartInstances = [];

async function fetchEstatisticas() {
    try {
        const res = await fetch('http://localhost:3000/estatisticas');
        const data = await res.json();
        renderEstatisticas(data);
    } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
    }
}

function renderEstatisticas(estatisticas) {
    container.innerHTML = '';
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];

    estatisticas.forEach((est, index) => {
        // Linha com 2 colunas: estatística + gráfico
        const row = document.createElement('div');
        row.className = 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-6';

        // Card Estatística
        const estatCard = document.createElement('div');
        estatCard.className = 'bg-white p-6 rounded-lg shadow w-full';

        estatCard.innerHTML = `
      <p class="text-gray-600 text-sm capitalize">${est.tipo_estatistica}</p>
      <p class="text-xl font-bold mb-4">${est.observacao}</p>
      <table class="w-full text-sm mb-4">
        <tbody>
          ${est.dados.map(d => {
            const valorKey = Object.keys(d).find(k => k !== 'categoria');
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
    `;

        // Card Gráfico
        const graficoCard = document.createElement('div');
        graficoCard.className = 'bg-white p-6 rounded-lg shadow w-full';

        graficoCard.innerHTML = `
      <label for="select-tipo-${index}" class="text-sm font-medium">Tipo de Gráfico:</label>
      <select id="select-tipo-${index}" class="ml-2 p-1 border rounded text-sm">
        <option value="bar">Barra</option>
        <option value="line">Linha</option>
        <option value="pie">Pizza</option>
        <option value="doughnut">Doughnut</option>
        </select>
        <div class="mt-4 h-[350px]">
        <canvas id="grafico-${index}" class="w-full h-full block"></canvas>
    </div>
    `;

        row.appendChild(estatCard);
        row.appendChild(graficoCard);
        container.appendChild(row);

        gerarGrafico(est, 'bar', `grafico-${index}`, index);

        const selectTipo = graficoCard.querySelector(`#select-tipo-${index}`);
        selectTipo.addEventListener('change', (e) => {
            chartInstances[index]?.destroy();
            gerarGrafico(est, e.target.value, `grafico-${index}`, index);
        });
    });
}

function gerarGrafico(est, tipoGrafico = 'bar', canvasId, index) {
    const labels = est.dados.map(d => d.categoria);
    const valores = est.dados.map(d => {
        const valorKey = Object.keys(d).find(k => k !== 'categoria');
        return d[valorKey];
    });

    const ctx = document.getElementById(canvasId).getContext('2d');

    const coresBackground = ['#f87171', '#34d399', '#fbbf24', '#3b82f6'];
    const coresBorder = ['#b91c1c', '#047857', '#a16207', '#2563eb'];

    if (chartInstances[index]) chartInstances[index].destroy();

    chartInstances[index] = new Chart(ctx, {
        type: tipoGrafico,
        data: {
            labels,
            datasets: [{
                label: est.observacao,
                data: valores,
                backgroundColor: coresBackground.slice(0, valores.length),
                borderColor: coresBorder.slice(0, valores.length),
                borderWidth: 1,
                fill: tipoGrafico === 'line' ? false : true,
                tension: tipoGrafico === 'line' ? 0.3 : 0,
                pointRadius: tipoGrafico === 'line' ? 5 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: `Gráfico de ${est.tipo_estatistica} - ${tipoGrafico.charAt(0).toUpperCase() + tipoGrafico.slice(1)}`
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: val => val.length > 10 ? val.slice(0, 10) + '...' : val,
                        font: { size: 11 },
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => Number.isInteger(val) ? val : val.toFixed(2),
                        font: { size: 11 },
                    }
                }
            }
        }
    });
}

fetchEstatisticas();
