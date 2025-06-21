// schedule.js

// Verifica se o usuário está autenticado
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Variável global para semana base (segunda-feira atual)
let dataSemanaBase = null;

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7; // segunda = 0
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(date) {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
}

function atualizarLabelSemana() {
    const segunda = dataSemanaBase;
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);
    document.getElementById('week-label').textContent = `${formatDate(segunda)} - ${formatDate(domingo)}`;
}

async function fetchMarcacoes() {
    const res = await fetch('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        alert('Erro ao carregar marcações');
        return null;
    }
    return await res.json();
}

const cores = {
    Peixe: 'bg-blue-500',
    Carne: 'bg-red-500',
    Vegetariano: 'bg-green-500',
    Dieta: 'bg-purple-500',
    Outro: 'bg-gray-500'
};

function getWeekdayIndex(date) {
    const d = date.getDay();
    return (d + 6) % 7;
}

function criarBlocoRefeicao(container, nome, inicio, fim, cor, topPx, heightPx) {
    const div = document.createElement('div');
    div.classList.add('meal-block', cor, 'absolute', 'left-1', 'right-1', 'rounded-md', 'p-2', 'text-white', 'shadow-md');
    div.style.top = `${topPx}px`;
    div.style.height = `${heightPx}px`;
    div.innerHTML = `
        <div class="font-bold">${nome}</div>
        <div class="text-xs">${inicio} - ${fim}</div>
    `;
    container.appendChild(div);
}

function horaParaPixels(horaStr) {
    const [h, m] = horaStr.split(':').map(Number);
    const totalMinutos = (h * 60 + m);
    const minutosDesde8h = totalMinutos - (8 * 60); // começa às 08:00
    const alturaPorMinuto = 512 / (14 * 60); // 512px de altura para intervalo das 08:00 às 22:00 (14h)
    return minutosDesde8h * alturaPorMinuto;
}

async function renderSchedule() {
    if (!dataSemanaBase) dataSemanaBase = getMonday(new Date());

    const data = await fetchMarcacoes();
    if (!data) return;

    const marcacoes = data.marcacoes || [];
    const pratosMap = {};

    // Carrega os dados dos pratos
    for (const m of marcacoes) {
        if (!pratosMap[m.prato]) {
            const res = await fetch(`http://localhost:3000/pratos/${m.prato}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            pratosMap[m.prato] = res.ok ? await res.json() : null;
        }
    }

    // Atualiza cabeçalho
    const header = document.getElementById('header-days');
    header.innerHTML = '<div class="border-b border-r py-2 bg-gray-200"></div>';
    const nomesDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    for (let i = 0; i < 7; i++) {
        const diaAtual = new Date(dataSemanaBase);
        diaAtual.setDate(dataSemanaBase.getDate() + i);
        header.innerHTML += `
            <div class="border-b border-r py-2 bg-gray-200">
                <div>${nomesDias[i]}</div>
                <div class="text-xs text-gray-600">${formatDate(diaAtual)}</div>
            </div>
        `;
    }

    // Limpa colunas
    const colunas = document.querySelectorAll('.col-span-7 > div.relative');
    colunas.forEach(col => col.innerHTML = '');

    marcacoes.forEach(m => {
        if (!m.data_marcacao) return;

        const dataMarc = new Date(m.data_marcacao);
        if (dataMarc < dataSemanaBase || dataMarc >= new Date(dataSemanaBase.getTime() + 7 * 86400000)) return;

        const prato = pratosMap[m.prato];
        if (!prato) return;

        const diaSemana = getWeekdayIndex(dataMarc);
        const container = colunas[diaSemana];
        if (!container) return;

        // Interpretar horário como "almoco" ou "jantar"
        let inicio = '12:00';
        let fim = '14:00';

        if (m.horario && typeof m.horario === 'string') {
            const horario = m.horario.toLowerCase();
            if (horario === 'jantar') {
                inicio = '19:00';
                fim = '21:00';
            } else if (horario !== 'almoco') {
                // Caso seja outro texto ou desconhecido
                inicio = '16:00';
                fim = '17:00';
            }
        }


        const topPx = horaParaPixels(inicio);
        const heightPx = horaParaPixels(fim) - topPx;
        const cor = cores[prato.tipo_prato] || cores['Outro'];

        criarBlocoRefeicao(container, prato.nome, inicio, fim, cor, topPx, heightPx);
    });

    atualizarLabelSemana();
}

// Botões de navegação semanal
document.getElementById('btn-prev-week').addEventListener('click', () => {
    dataSemanaBase.setDate(dataSemanaBase.getDate() - 7);
    renderSchedule();
});

document.getElementById('btn-next-week').addEventListener('click', () => {
    dataSemanaBase.setDate(dataSemanaBase.getDate() + 7);
    renderSchedule();
});

window.addEventListener('DOMContentLoaded', () => {
    dataSemanaBase = getMonday(new Date());
    renderSchedule();
});
