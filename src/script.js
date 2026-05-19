// Coordenadas Centrais do Projeto
const LAT_CENTRO = -20.2320;
const LON_CENTRO = -42.1660;

// 1. Inicialização do Mapa
const mapa = L.map('mapa', {
    zoomControl: true, 
    scrollWheelZoom: true
}).setView([LAT_CENTRO, LON_CENTRO], 15.495);

mapa.zoomControl.setPosition('bottomright');

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
}).addTo(mapa);

const camadaCaminhos = L.layerGroup().addTo(mapa);
let dadosGeojsonOriginal = null;
let volumesPrevisaoTempo = []; 

// 2. Classificação de Alerta Dinâmico
function obterCorRisco(risco) {
    if (risco < 0.2) return "#2ecc71"; // Baixo
    if (risco < 0.4) return "#f1c40f"; // Atenção
    if (risco < 0.65) return "#e67e22"; // Alerta
    return "#e74c3c";                  // Crítico
}

// 3. Processador de Cálculos de Hidrologia / Re-renderização
function atualizarMapa(chuvaMm) {
    camadaCaminhos.clearLayers(); 

    if (!dadosGeojsonOriginal || !dadosGeojsonOriginal.features) return;

    const valorChuva = Number(chuvaMm);

    dadosGeojsonOriginal.features.forEach((feature) => {
        try {
            if (!feature || !feature.properties) return;
            const props = feature.properties;

            // Suporta chaves vindas de bancos de dados shapefiles/PostGIS em caixa alta ou baixa
            const flwMaxRaw = props.flw_max !== undefined ? props.flw_max : props.FLW_MAX;
            const slpMeanRaw = props.slp_mean !== undefined ? props.slp_mean : props.SLP_MEAN;

            const flwMax = parseFloat(flwMaxRaw);
            const slpMean = parseFloat(slpMeanRaw);
            
            if (isNaN(flwMax) || isNaN(slpMean)) return;
            
            // Fórmula hidrológica de suscetibilidade a alagamento estrutural
            const fatorTerreno = (flwMax * 1.5) / (slpMean + 0.5);
            const riscoAtual = valorChuva * fatorTerreno;
            const riscoNormalizado = Math.min(Math.max(riscoAtual / 5000.0, 0.0), 1.0);

            // Filtro de corte: exibe apenas riscos perceptíveis no mapa
            if (riscoNormalizado > 0.2) {
                const cor = obterCorRisco(riscoNormalizado);
                const raio = 10 + (riscoNormalizado * 20);

                if (!feature.geometry) return;
                
                let lat, lon;

                // Captura a assinatura geométrica espacial correta do GeoJSON
                if (feature.geometry.type === "Point") {
                    lon = feature.geometry.coordinates[0];
                    lat = feature.geometry.coordinates[1];
                } else {
                    const centroide = turf.centroid(feature);
                    if (!centroide || !centroide.geometry) return;
                    lon = centroide.geometry.coordinates[0];
                    lat = centroide.geometry.coordinates[1];
                }

                if (isNaN(lat) || isNaN(lon)) return;

                const raioEmMetros = 10 + (riscoNormalizado * 120);

                const circulo = L.circle([lat, lon], {
                    radius: raioEmMetros,   // Agora o Leaflet interpreta como metros no mundo real
                    color: cor,
                    fillColor: cor,
                    fillOpacity: 0.4,       // Um pouco mais transparente para não cobrir as ruas ao sobrepor
                    weight: 1.5
                });

                circulo.bindTooltip(
                    `<b>Volume Precipitação:</b> ${valorChuva.toFixed(1)} mm<br>` +
                    `<b>Índice de Risco:</b> ${riscoNormalizado.toFixed(2)}<br>` +
                    `<b>Média Declividade:</b> ${slpMean.toFixed(2)}<br>` +
                    `<b>Raio de Impacto:</b> ${raioEmMetros.toFixed(0)}m`
                );

                circulo.addTo(camadaCaminhos);
            }
        } catch (error) {
            console.warn("Inconsistência em elemento geográfico:", error);
        }
    });
}

// 4. Integração Assíncrona com Open-Meteo API
function buscarPrevisaoTempo() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT_CENTRO}&longitude=${LON_CENTRO}&daily=precipitation_sum&timezone=America%2FSao_Paulo`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("A API meteorológica falhou na resposta.");
            return res.json();
        })
        .then(dados => {
            const datas = dados.daily.time; 
            const chuvas = dados.daily.precipitation_sum; 

            volumesPrevisaoTempo = chuvas; 

            // Define o cenário atual (Hoje) baseado nos dados da API
            const chuvaHoje = chuvas[0] !== undefined ? chuvas[0] : 0;
            document.getElementById('btnRealtime').textContent = `Hoje (${chuvaHoje.toFixed(1)} mm)`;
            
            if(document.getElementById('btnRealtime').classList.contains('active')) {
                atualizarMapa(chuvaHoje);
                sincronizarControles(chuvaHoje);
            }

            // Injeta as opções dinâmicas de 5 dias no Select
            const selectDias = document.getElementById('selectDias');
            selectDias.innerHTML = '<option value="" disabled selected>Próximos 5 dias...</option>';

            for (let i = 1; i <= 5; i++) {
                if (!datas[i]) break;
                
                // Evita problemas de fuso horário forçando o parse da string ISO local
                const partesData = datas[i].split('-'); 
                const dataFormatada = `${partesData[2]}/${partesData[1]}`;
                
                const mmChuva = chuvas[i] !== undefined ? chuvas[i] : 0;

                const option = document.createElement('option');
                option.value = i; 
                option.textContent = `${dataFormatada} (${mmChuva.toFixed(1)} mm)`;
                selectDias.appendChild(option);
            }
        })
        .catch(err => {
            console.error("Falha no barramento de dados climáticos:", err);
            document.getElementById('btnRealtime').textContent = "Hoje (Erro API)";
        });
}

function sincronizarControles(valor) {
    const sliderInput = document.getElementById('chuvaInput');
    const sliderValor = document.getElementById('chuvaValor');
    if(sliderInput && sliderValor) {
        sliderInput.value = valor;
        sliderValor.textContent = Math.round(valor);
    }
}

// 5. Mapeamento de Eventos da Interface de Usuário (UI)
const sliderInput = document.getElementById('chuvaInput');
const sliderValor = document.getElementById('chuvaValor');
const btnRealtime = document.getElementById('btnRealtime');
const selectDias = document.getElementById('selectDias');

if (sliderInput && sliderValor) {
    sliderInput.addEventListener('input', (evento) => {
        const volume = evento.target.value;
        sliderValor.textContent = volume;
        
        btnRealtime.classList.remove('active');
        selectDias.value = ""; 

        atualizarMapa(volume);
    });
}

if (btnRealtime) {
    btnRealtime.addEventListener('click', () => {
        btnRealtime.classList.add('active');
        selectDias.value = ""; 
        
        const chuvaHoje = volumesPrevisaoTempo[0] || 0;
        sincronizarControles(chuvaHoje);
        atualizarMapa(chuvaHoje);
    });
}

if (selectDias) {
    selectDias.addEventListener('change', (evento) => {
        btnRealtime.classList.remove('active'); 
        
        const indice = evento.target.value;
        const chuvaDia = volumesPrevisaoTempo[indice] || 0;
        
        sincronizarControles(chuvaDia);
        atualizarMapa(chuvaDia);
    });
}

// 6. Ciclo de Inicialização
fetch('/data/base_data_2.geojson')
    .then(response => {
        if (!response.ok) throw new Error("Falha ao mapear arquivo '/data/base_data_2.geojson'.");
        return response.json();
    })
    .then(dados => {
        dadosGeojsonOriginal = dados;
        buscarPrevisaoTempo();
    })
    .catch(erro => {
        console.error("Erro crítico na inicialização:", erro);
    });