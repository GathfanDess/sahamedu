Chart.defaults.color = '#8b9bb4';
Chart.defaults.font.family = "'Outfit', sans-serif";

let globalRange = '1d';
let globalInterval = '15m';

// Kita TINGGALKAN GoAPI yang memblokir Vercel. 
// Sekarang Web Anda secara penuh menggunakan mesin raksasa YAHOO FINANCE (Asli, Gratis, Anti-Limit, Tanpa API Key).

const fallbackMarketData = [
    { code: 'BBCA', name: 'Bank Central Asia Tbk', price: 10250, change: 1.2, history: generateRandomData(10000, 10500) },
    { code: 'GOTO', name: 'GoTo Gojek Tokopedia', price: 68, change: -5.5, history: generateRandomData(65, 75) },
    { code: 'TLKM', name: 'Telkom Indonesia', price: 3850, change: 0.8, history: generateRandomData(3700, 3900) },
    { code: 'ASII', name: 'Astra International', price: 5200, change: 2.1, history: generateRandomData(5000, 5300) },
    { code: 'ANTM', name: 'Aneka Tambang Tbk', price: 1650, change: -1.5, history: generateRandomData(1600, 1750) },
    { code: 'BRIS', name: 'Bank Syariah Indonesia', price: 2100, change: 3.4, history: generateRandomData(2000, 2200) },
    { code: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', price: 7100, change: 1.5, history: generateRandomData(7000, 7200) },
    { code: 'BBNI', name: 'Bank Negara Indonesia Tbk', price: 5350, change: 0.5, history: generateRandomData(5200, 5400) },
    { code: 'UNVR', name: 'Unilever Indonesia Tbk', price: 2800, change: -1.2, history: generateRandomData(2700, 2900) },
    { code: 'ICBP', name: 'Indofood CBP Sukses Makmur', price: 11200, change: 0.8, history: generateRandomData(11000, 11400) },
    { code: 'PTBA', name: 'Bukit Asam Tbk', price: 2950, change: 2.5, history: generateRandomData(2850, 3050) },
    { code: 'AMRT', name: 'Sumber Alfaria Trijaya Tbk', price: 2850, change: 1.1, history: generateRandomData(2800, 2900) },
    { code: 'ADRO', name: 'Adaro Energy Indonesia Tbk', price: 2700, change: 1.5, history: generateRandomData(2600, 2800) },
    { code: 'PGAS', name: 'Perusahaan Gas Negara Tbk', price: 1550, change: -0.8, history: generateRandomData(1500, 1600) },
    { code: 'KLBF', name: 'Kalbe Farma Tbk', price: 1450, change: 0.5, history: generateRandomData(1400, 1500) },
    { code: 'MDKA', name: 'Merdeka Copper Gold Tbk', price: 2350, change: -1.2, history: generateRandomData(2300, 2450) },
    { code: 'INDF', name: 'Indofood Sukses Makmur Tbk', price: 6300, change: 0.4, history: generateRandomData(6200, 6400) },
    { code: 'BBTN', name: 'Bank Tabungan Negara Tbk', price: 1400, change: 1.8, history: generateRandomData(1350, 1450) },
    { code: 'SMGR', name: 'Semen Indonesia Tbk', price: 6000, change: -0.5, history: generateRandomData(5900, 6100) },
    { code: 'ITMG', name: 'Indo Tambangraya Megah Tbk', price: 26500, change: 2.1, history: generateRandomData(26000, 27000) }
];

let marketData = [];
let activeStock = null;
let mainChartInstance = null;
let miniChartInstance = null;

// Fungsi pembuat data palsu (Hanya terpakai jika terjadi internet down)
function generateRandomData(min, max, count = 30) {
    let data = [];
    let current = (min + max) / 2;
    for (let i = 0; i < count; i++) {
        let change = (Math.random() - 0.5) * ((max - min) / 10);
        current += change;
        data.push(current);
    }
    return data;
}

// === ENGINE BARU: YAHOO FINANCE ===
async function fetchRealMarketData() {
    console.log("Mengambil data asli dari Pusat Yahoo Finance...");

    // Daftar Kode Emiten BEI (harus ditambah akhiran .JK untuk standar Yahoo Finance Internasional)
    const symbols = [
        { code: 'BBCA', ticker: 'BBCA.JK', name: 'Bank Central Asia Tbk' },
        { code: 'GOTO', ticker: 'GOTO.JK', name: 'GoTo Gojek Tokopedia' },
        { code: 'TLKM', ticker: 'TLKM.JK', name: 'Telkom Indonesia' },
        { code: 'ASII', ticker: 'ASII.JK', name: 'Astra International' },
        { code: 'ANTM', ticker: 'ANTM.JK', name: 'Aneka Tambang Tbk' },
        { code: 'BRIS', ticker: 'BRIS.JK', name: 'Bank Syariah Indonesia' },
        { code: 'BMRI', ticker: 'BMRI.JK', name: 'Bank Mandiri (Persero) Tbk' },
        { code: 'BBNI', ticker: 'BBNI.JK', name: 'Bank Negara Indonesia Tbk' },
        { code: 'UNVR', ticker: 'UNVR.JK', name: 'Unilever Indonesia Tbk' },
        { code: 'ICBP', ticker: 'ICBP.JK', name: 'Indofood CBP Sukses Makmur' },
        { code: 'PTBA', ticker: 'PTBA.JK', name: 'Bukit Asam Tbk' },
        { code: 'AMRT', ticker: 'AMRT.JK', name: 'Sumber Alfaria Trijaya Tbk' },
        { code: 'ADRO', ticker: 'ADRO.JK', name: 'Adaro Energy Indonesia Tbk' },
        { code: 'PGAS', ticker: 'PGAS.JK', name: 'Perusahaan Gas Negara Tbk' },
        { code: 'KLBF', ticker: 'KLBF.JK', name: 'Kalbe Farma Tbk' },
        { code: 'MDKA', ticker: 'MDKA.JK', name: 'Merdeka Copper Gold Tbk' },
        { code: 'INDF', ticker: 'INDF.JK', name: 'Indofood Sukses Makmur Tbk' },
        { code: 'BBTN', ticker: 'BBTN.JK', name: 'Bank Tabungan Negara Tbk' },
        { code: 'SMGR', ticker: 'SMGR.JK', name: 'Semen Indonesia Tbk' },
        { code: 'ITMG', ticker: 'ITMG.JK', name: 'Indo Tambangraya Megah Tbk' }
    ];

    try {
        // Melakukan tarik data paralel bersamaan ke 6 server Yahoo lewat proxy Vercel
        const promises = symbols.map(async (s) => {
            const response = await fetch(`/api/yf/${s.ticker}?range=${globalRange}&interval=${globalInterval}`);
            if (!response.ok) throw new Error("YF API Blocked/Not Found");

            const data = await response.json();
            const result = data.chart.result[0];

            // Harga Penutupan Terakhir
            const currentPrice = result.meta.regularMarketPrice;
            // Harga Penutupan Kemarin
            const prevClose = result.meta.chartPreviousClose;

            // Matematika Persentase Kenaikan (%)
            let change = 0;
            if (prevClose) {
                change = (((currentPrice - prevClose) / prevClose) * 100).toFixed(2);
            }

            // Mengambil barisan data grafik sebulan terakhir (membuang hari libur/nilai null)
            const history = result.indicators.quote[0].close
                .filter(price => price !== null)
                .map(price => parseFloat(price));

            return {
                code: s.code,
                name: s.name,
                price: parseInt(currentPrice),
                change: parseFloat(change),
                history: history
            };
        });

        // Tunggu semua saham masuk dompet
        marketData = await Promise.all(promises);
        console.log("Sukses Memuat Data Asli dari Yahoo Finance!");

        // Tarik Data IHSG (Harga dan Kenaikan)
        try {
            const ihsgResponse = await fetch(`/api/yf/%5EJKSE`);
            if (ihsgResponse.ok) {
                const ihsgData = await ihsgResponse.json();
                const ihsgResult = ihsgData.chart.result[0];
                const ihsgCurrent = ihsgResult.meta.regularMarketPrice;
                const ihsgPrev = ihsgResult.meta.chartPreviousClose;
                if (ihsgPrev) {
                    let ihsgChange = (((ihsgCurrent - ihsgPrev) / ihsgPrev) * 100).toFixed(2);
                    const ihsgValueEl = document.getElementById('ihsgValue');
                    if (ihsgValueEl) {
                        let sign = ihsgChange >= 0 ? '+' : '';
                        ihsgValueEl.innerText = `${sign}${ihsgChange}%`;
                        ihsgValueEl.className = ihsgChange >= 0 ? "stat-value text-bullish" : "stat-value text-bearish";
                    }
                }
            }
        } catch (err) {
            console.warn("Gagal merender IHSG hari ini", err);
        }

    } catch (error) {
        console.warn("Server gagal tembus ke Yahoo, pakai Simulasi", error);
        marketData = fallbackMarketData;
    }

    activeStock = marketData[0];
}

function initMiniChart() {
    if (!activeStock || !activeStock.history) return;
    const ctx = document.getElementById('miniChart').getContext('2d');
    const isBullish = activeStock.change >= 0;
    const color = isBullish ? '#10b981' : '#ef4444';

    let gradient = ctx.createLinearGradient(0, 0, 0, 130);
    gradient.addColorStop(0, isBullish ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    if (miniChartInstance) {
        miniChartInstance.destroy();
    }

    miniChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: activeStock.history.length }, (_, i) => {
                // Simulasi data masuk per 15 menit, mulai dari bursa buka jam 09:00 WIB
                let totalMinutes = (9 * 60) + (i * 15);

                // Simulasi jam istirahat BEI (12:00 - 13:30 WIB)
                // Jika waktu sudah menyentuh jam 12:00, otomatis loncat 90 menit ke jam 13:30
                if (totalMinutes >= 12 * 60) {
                    totalMinutes += 90;
                }

                let hours = Math.floor(totalMinutes / 60);
                let minutes = totalMinutes % 60;

                // Kunci batas maksimal grafik di jam tutup bursa (16:00 WIB)
                if (hours > 16 || (hours === 16 && minutes > 0)) {
                    hours = 16;
                    minutes = 0;
                }

                // Format menjadi HH:MM (contoh: 09:15, 13:30)
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }),
            datasets: [{
                data: activeStock.history,
                borderColor: color,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                backgroundColor: gradient,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

function initMainChart() {
    if (!activeStock || !activeStock.history) return;
    const ctx = document.getElementById('mainChart').getContext('2d');
    const isBullish = activeStock.change >= 0;
    const color = isBullish ? '#10b981' : '#ef4444';

    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, isBullish ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    if (mainChartInstance) {
        mainChartInstance.destroy();
    }

    mainChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: activeStock.history.length }, (_, i) => {
                if (globalRange === '1d') {
                    // Tampilan Jam untuk 1 Hari
                    let totalMinutes = (9 * 60) + (i * 15);
                    if (totalMinutes >= 12 * 60) totalMinutes += 90;
                    let hours = Math.floor(totalMinutes / 60);
                    let minutes = totalMinutes % 60;
                    if (hours > 16 || (hours === 16 && minutes > 0)) { hours = 16; minutes = 0; }
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                } else if (globalRange === '1mo') {
                    // Tampilan Hari untuk 1 Bulan
                    return `H-${activeStock.history.length - i}`;
                } else {
                    // Tampilan Minggu untuk 1 Tahun
                    return `M-${activeStock.history.length - i}`;
                }
            }),
            datasets: [{
                label: activeStock.code,
                data: activeStock.history,
                borderColor: color,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: gradient,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: color,
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: color,
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: { label: (ctx) => 'Rp ' + Math.round(ctx.raw).toLocaleString('id-ID') }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4, 4] } }
            }
        }
    });
}

function updateDashboardUI() {
    if (!activeStock) return;
    document.getElementById('currentStockName').innerText = `${activeStock.code} - ${activeStock.name}`;
    document.getElementById('currentPrice').innerText = 'Rp ' + activeStock.price.toLocaleString('id-ID');

    const changeBadge = document.getElementById('priceChange');
    changeBadge.innerText = (activeStock.change > 0 ? '+' : '') + activeStock.change + '%';

    if (activeStock.change >= 0) {
        changeBadge.classList.remove('bearish');
        changeBadge.classList.add('bullish');
    } else {
        changeBadge.classList.remove('bullish');
        changeBadge.classList.add('bearish');
    }

    // UPDATE HERO CARD JUGA
    const heroCode = document.getElementById('heroStockCode');
    const heroName = document.getElementById('heroStockName');
    const heroPrice = document.getElementById('heroPrice');

    if (heroCode && heroName && heroPrice) {
        heroCode.innerText = activeStock.code;
        heroName.innerText = activeStock.name;

        let icon = activeStock.change >= 0 ? '<i class="fa-solid fa-arrow-trend-up"></i>' : '<i class="fa-solid fa-arrow-trend-down"></i>';
        heroPrice.innerHTML = `Rp ${activeStock.price.toLocaleString('id-ID')} ${icon}`;

        if (activeStock.change >= 0) {
            heroPrice.className = "stock-price text-bullish";
        } else {
            heroPrice.className = "stock-price text-bearish";
        }
    }
}

let searchTimeout = null;

function renderStockList() {
    const listContainer = document.getElementById('stockList');
    if (!listContainer) return;
    
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (query === '') {
        displayStocksLocal(marketData, listContainer);
        return;
    }

    listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Mencari...</p>';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`/api/search?q=${query}&quotesCount=10&newsCount=0`);
            if (!res.ok) throw new Error("Search API Failed");
            const data = await res.json();
            
            const idxResults = data.quotes.filter(q => q.quoteType === 'EQUITY' && (q.exchange === 'JKT' || (q.symbol && q.symbol.endsWith('.JK'))));

            if (idxResults.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;">Emiten tidak ditemukan.</p>';
                return;
            }

            listContainer.innerHTML = '';
            
            idxResults.forEach(quote => {
                const pureCode = quote.symbol.replace('.JK', '');
                const item = document.createElement('div');
                item.className = `stock-item ${activeStock && activeStock.code === pureCode ? 'active' : ''}`;

                let shortName = quote.shortname || pureCode;
                item.innerHTML = `
                    <div class="s-info">
                        <h4>${pureCode}</h4>
                        <span style="font-size:0.75rem">${shortName.length > 20 ? shortName.substring(0, 20) + '...' : shortName}</span>
                    </div>
                    <div class="s-price">
                        <span style="font-size: 0.8rem; color: var(--text-muted)"><i class="fa-solid fa-download"></i> Tarik Data</span>
                    </div>
                `;

                item.onclick = async () => {
                   item.innerHTML = `<div style="text-align:center; width:100%; color:var(--text-muted)"><i class="fa-solid fa-spinner fa-spin"></i> Menarik Data...</div>`;
                   await fetchSingleStockData(pureCode, shortName);
                };

                listContainer.appendChild(item);
            });

        } catch (error) {
            console.error("Search API Error:", error);
            listContainer.innerHTML = '<p style="text-align:center; color:var(--bearish); padding: 20px 0;">Gagal mencari emiten.</p>';
        }
    }, 500);
}

function displayStocksLocal(dataArray, listContainer) {
    listContainer.innerHTML = '';
    if (dataArray.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;">Emiten tidak ditemukan.</p>';
        return;
    }

    dataArray.forEach(stock => {
        const isBullish = stock.change >= 0;
        const colorClass = isBullish ? 'text-bullish' : 'text-bearish';
        const sign = isBullish ? '+' : '';

        const item = document.createElement('div');
        item.className = `stock-item ${activeStock && stock.code === activeStock.code ? 'active' : ''}`;

        let shortName = stock.name.split(' ')[0];
        if (stock.name.split(' ').length > 1) {
            shortName += ' ' + stock.name.split(' ')[1];
        }

        item.innerHTML = `
            <div class="s-info">
                <h4>${stock.code}</h4>
                <span>${shortName}</span>
            </div>
            <div class="s-price">
                <div>Rp ${stock.price.toLocaleString('id-ID')}</div>
                <span class="${colorClass}">${sign}${stock.change}%</span>
            </div>
        `;

        item.onclick = async () => {
            activeStock = stock;
            displayStocksLocal(dataArray, listContainer); 
            updateDashboardUI();
            initMiniChart();
            initMainChart();
        };

        listContainer.appendChild(item);
    });
}

async function fetchSingleStockData(code, name) {
    try {
        const ticker = `${code}.JK`;
        const response = await fetch(`/api/yf/${ticker}?range=${globalRange}&interval=${globalInterval}`);
        if (!response.ok) throw new Error("YF API Blocked");

        const data = await response.json();
        if (!data.chart.result || data.chart.result.length === 0) throw new Error("No data");
        const result = data.chart.result[0];

        const currentPrice = result.meta.regularMarketPrice;
        const prevClose = result.meta.chartPreviousClose;
        let change = 0;
        if (prevClose) change = (((currentPrice - prevClose) / prevClose) * 100).toFixed(2);

        const history = result.indicators.quote[0].close
            .filter(price => price !== null)
            .map(price => parseFloat(price));

        const stockObj = {
            code: code,
            name: name,
            price: parseInt(currentPrice),
            change: parseFloat(change),
            history: history
        };

        const existingIndex = marketData.findIndex(s => s.code === code);
        if (existingIndex !== -1) {
            marketData[existingIndex] = stockObj;
        } else {
            marketData.unshift(stockObj);
        }

        activeStock = stockObj;
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        renderStockList();
        
        updateDashboardUI();
        initMiniChart();
        initMainChart();
        fetchStockNews(name || code);
        
    } catch (e) {
        console.warn("Gagal menarik data simulasi:", e);
        const listContainer = document.getElementById('stockList');
        if (listContainer) {
            listContainer.innerHTML = '<p style="text-align:center; color:var(--bearish); padding: 20px 0;">Gagal menarik data saham ini.</p>';
            setTimeout(() => renderStockList(), 2000);
        }
    }
}

async function fetchStockNews(query) {
    const listContainer = document.getElementById('newsList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat berita terbaru...</p>';
    
    try {
        const res = await fetch(`/api/search?q=${query}&quotesCount=0&newsCount=5`);
        if (!res.ok) throw new Error("Gagal mengambil berita");
        
        const data = await res.json();
        
        if (!data.news || data.news.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;">Tidak ada berita terkini.</p>';
            return;
        }

        let html = '';
        data.news.forEach(n => {
            const date = new Date(n.providerPublishTime * 1000).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
            html += `
                <a href="${n.link}" target="_blank" style="display: block; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0;">
                    <div style="font-size: 0.75rem; color: var(--bullish); margin-bottom: 4px;">${n.publisher} &bull; ${date}</div>
                    <h4 style="margin:0 0 6px 0; font-size: 0.95rem; color: var(--text-light); line-height: 1.4;">${n.title}</h4>
                </a>
            `;
        });
        
        listContainer.innerHTML = html;
        
    } catch (e) {
        listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;">Gagal memuat berita.</p>';
    }
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(10, 14, 23, 0.85)';
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        nav.style.border = '1px solid rgba(255,255,255,0.1)';
    } else {
        nav.style.background = 'var(--glass-bg)';
        nav.style.boxShadow = 'var(--glass-shadow)';
        nav.style.border = '1px solid var(--glass-border)';
    }
});

// JAM BURSA BEI OTOMATIS
function updateMarketStatus() {
    const badge = document.querySelector('.badge');
    if (!badge) return;

    const options = { timeZone: 'Asia/Jakarta', hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());

    // Libur
    const dateOptions = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' };
    const dateParts = new Intl.DateTimeFormat('en-CA', dateOptions).formatToParts(new Date());
    let year = dateParts.find(p => p.type === 'year').value;
    let month = dateParts.find(p => p.type === 'month').value;
    let dateDay = dateParts.find(p => p.type === 'day').value;
    const todayStr = `${year}-${month}-${dateDay}`;

    let day = ''; let hour = 0; let minute = 0;
    parts.forEach(part => {
        if (part.type === 'weekday') day = part.value;
        if (part.type === 'hour') hour = parseInt(part.value);
        if (part.type === 'minute') minute = parseInt(part.value);
    });
    if (hour === 24) hour = 0;

    const isWeekend = day === 'Sat' || day === 'Sun';
    const currentTime = hour + (minute / 60);
    const isFriday = day === 'Fri';

    const holidays = [
        "2026-01-01", "2026-02-17", "2026-03-19", "2026-03-20",
        "2026-03-23", "2026-04-03", "2026-05-01", "2026-05-14",
        "2026-05-26", "2026-06-01", "2026-06-17", "2026-08-17", "2026-12-25"
    ];

    const isHoliday = holidays.includes(todayStr);

    let status = "Tutup";
    let color = "#8b9bb4";
    let bg = "rgba(139, 155, 180, 0.15)";
    let isPulse = false;

    if (isHoliday) {
        status = "Libur Nasional / Cuti Bersama";
    } else if (!isWeekend) {
        if (currentTime >= 9 && currentTime < 12) {
            status = "Buka (Sesi 1)";
            color = "var(--bullish)"; bg = "var(--bullish-bg)"; isPulse = true;
        } else if (isFriday && currentTime >= 14 && currentTime < 16) {
            status = "Buka (Sesi 2)";
            color = "var(--bullish)"; bg = "var(--bullish-bg)"; isPulse = true;
        } else if (!isFriday && currentTime >= 13.5 && currentTime < 16) {
            status = "Buka (Sesi 2)";
            color = "var(--bullish)"; bg = "var(--bullish-bg)"; isPulse = true;
        } else if (currentTime >= 12 && currentTime < (isFriday ? 14 : 13.5)) {
            status = "Istirahat";
            color = "var(--warning)"; bg = "rgba(245, 158, 11, 0.25)"; isPulse = true;
        }
    }

    badge.style.color = color;
    badge.style.borderColor = bg;
    let pulseStr = "";
    if (color !== "var(--bullish)") {
        pulseStr = isPulse ? `<span class="pulse-dot" style="background-color: ${color};"></span>` : `<span class="pulse-dot" style="background-color: ${color}; animation: none; box-shadow: none;"></span>`;
    } else {
        pulseStr = `<span class="pulse-dot"></span>`;
    }
    badge.innerHTML = `${pulseStr} Bursa ${status}`;
}

// Fungsi untuk mengganti rentang waktu saat tombol diklik
async function changeTimeRange(range, interval, btnId) {
    globalRange = range;
    globalInterval = interval;

    // Reset warna semua tombol
    document.getElementById('btn-1d').classList.remove('active');
    document.getElementById('btn-1mo').classList.remove('active');
    document.getElementById('btn-1y').classList.remove('active');

    // Nyalakan warna tombol yang sedang diklik
    document.getElementById(btnId).classList.add('active');

    // Tarik ulang data dari server dengan rentang waktu baru lalu render ulang grafik
    await fetchRealMarketData();
    initMiniChart();
    initMainChart();
}
// INITIALIZATION MULTI-TREADING
window.onload = async () => {
    updateMarketStatus();
    setInterval(updateMarketStatus, 60000);

    // Tarik Semua Data Di Awal (Langsung dapat Semua Real-time + Grafik)
    await fetchRealMarketData();

    if (marketData.length > 0) activeStock = marketData[0];

    renderStockList();
    updateDashboardUI();
    initMiniChart();
    initMainChart();
}

// === FUNGSI MODAL PRICING ===
function openPricingModal() {
    const modal = document.getElementById('pricingModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Kunci scroll layar belakang
}

function closePricingModal() {
    const modal = document.getElementById('pricingModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Buka kembali scroll
}

// Tutup modal jika user klik area gelap di luar kotak harga
window.addEventListener('click', function (event) {
    const pModal = document.getElementById('pricingModal');
    if (event.target === pModal) closePricingModal();

    const tModal = document.getElementById('tradeModal');
    if (event.target === tModal) closeTradeModal();
});

// === FUNGSI PAPER TRADING (PORTOFOLIO) ===
let portfolio = {
    cash: 100000000,
    holdings: {}
};

function initPortfolio() {
    const saved = localStorage.getItem('sahampedia_portfolio');
    if (saved) {
        portfolio = JSON.parse(saved);
    } else {
        localStorage.setItem('sahampedia_portfolio', JSON.stringify(portfolio));
    }
    renderPortfolio();
}

function savePortfolio() {
    localStorage.setItem('sahampedia_portfolio', JSON.stringify(portfolio));
    renderPortfolio();
}

function renderPortfolio() {
    const elCash = document.getElementById('portfolioCash');
    const elTotal = document.getElementById('portfolioTotalValue');
    const elList = document.getElementById('portfolioItemList');
    
    if(!elCash || !elTotal || !elList) return; // Hanya jalankan jika elemen ada di DOM (pasar.html)

    elCash.innerText = `Rp ${portfolio.cash.toLocaleString('id-ID')}`;

    let totalAsset = portfolio.cash;
    let hasHoldings = false;
    let listHTML = '';

    for (let code in portfolio.holdings) {
        const qtyLots = portfolio.holdings[code].lots;
        const avgPrice = portfolio.holdings[code].avgPrice;
        if (qtyLots <= 0) continue;

        hasHoldings = true;

        // Cari harga pasar terkini jika ada, kalau belum ada set ke harga avg sementara
        const stockData = marketData.find(s => s.code === code);
        const currentPrice = stockData ? stockData.price : avgPrice;
        
        const currentValue = qtyLots * 100 * currentPrice;
        const buyValue = qtyLots * 100 * avgPrice;
        const floating = currentValue - buyValue;
        const floatingPercent = (floating / buyValue) * 100;

        totalAsset += currentValue;

        const colorClass = floating >= 0 ? 'text-bullish' : 'text-bearish';
        const sign = floating >= 0 ? '+' : '';

        listHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0;">
                <div>
                    <h4 style="margin:0; font-size: 1.1rem">${code}</h4>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${qtyLots} Lot @ Rp ${avgPrice.toLocaleString()}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600;">Rp ${currentValue.toLocaleString('id-ID')}</div>
                    <div class="${colorClass}" style="font-size: 0.85rem">${sign}${floating.toLocaleString('id-ID')} (${floatingPercent.toFixed(2)}%)</div>
                </div>
            </div>
        `;
    }

    elTotal.innerText = `Rp ${totalAsset.toLocaleString('id-ID')}`;
    
    if (hasHoldings) {
        elList.innerHTML = listHTML;
    } else {
        elList.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size: 0.9rem; margin-top:20px;">Belum ada saham yang dibeli. Yuk praktik!</p>`;
    }
}

// === FUNGSI MODAL TRANSAKSI ===
let currentTradeMode = 'buy'; // 'buy' or 'sell'

function openTradeModal(mode) {
    if (!activeStock) return;
    currentTradeMode = mode;

    const modal = document.getElementById('tradeModal');
    const title = document.getElementById('tradeModalTitle');
    const btn = document.getElementById('btnExecuteTrade');
    
    title.innerHTML = `${mode === 'buy' ? 'Beli' : 'Jual'} <span class="text-gradient">${activeStock.code}</span>`;
    btn.innerHTML = `Konfirmasi ${mode === 'buy' ? 'Beli' : 'Jual'}`;
    btn.className = mode === 'buy' ? 'btn' : 'btn';
    btn.style.backgroundColor = mode === 'buy' ? 'var(--bullish)' : 'var(--bearish)';
    btn.style.color = 'white';

    document.getElementById('tradeCurrentPrice').innerText = `Rp ${activeStock.price.toLocaleString('id-ID')} / lembar`;
    document.getElementById('tradeAvailableCash').innerText = `Rp ${portfolio.cash.toLocaleString('id-ID')}`;
    document.getElementById('tradeLotInput').value = 1;

    calculateTradeTotal();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTradeModal() {
    document.getElementById('tradeModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function calculateTradeTotal() {
    const lotStr = document.getElementById('tradeLotInput').value;
    const lots = parseInt(lotStr) || 0;
    const totalValue = lots * 100 * (activeStock ? activeStock.price : 0);
    
    document.getElementById('tradeTotalValue').innerText = `Rp ${totalValue.toLocaleString('id-ID')}`;
    
    const btn = document.getElementById('btnExecuteTrade');
    if (currentTradeMode === 'buy') {
        if (totalValue > portfolio.cash) {
            document.getElementById('tradeTotalValue').style.color = 'var(--bearish)';
            btn.disabled = true;
            btn.style.opacity = '0.5';
        } else {
            document.getElementById('tradeTotalValue').style.color = 'var(--bullish)';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    } else {
        const h = portfolio.holdings[activeStock.code];
        const maxLots = h ? h.lots : 0;
        if (lots > maxLots || lots <= 0) {
            document.getElementById('tradeTotalValue').style.color = 'var(--bearish)';
            btn.disabled = true;
            btn.style.opacity = '0.5';
        } else {
            document.getElementById('tradeTotalValue').style.color = 'var(--text-muted)';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
}

document.getElementById('btnExecuteTrade')?.addEventListener('click', () => {
    const lots = parseInt(document.getElementById('tradeLotInput').value) || 0;
    if (lots <= 0) return;

    const totalValue = lots * 100 * activeStock.price;

    if (currentTradeMode === 'buy') {
        if (totalValue > portfolio.cash) return; // double check
        
        portfolio.cash -= totalValue;
        
        if (!portfolio.holdings[activeStock.code]) {
            portfolio.holdings[activeStock.code] = { lots: 0, avgPrice: 0 };
        }
        
        const h = portfolio.holdings[activeStock.code];
        const totalModalsSoFar = (h.lots * 100) * h.avgPrice;
        const newTotalModals = totalModalsSoFar + totalValue;
        
        h.lots += lots;
        h.avgPrice = newTotalModals / (h.lots * 100);
        
    } else {
        const h = portfolio.holdings[activeStock.code];
        if (!h || lots > h.lots) return; // double check
        
        portfolio.cash += totalValue;
        h.lots -= lots;
        
        if (h.lots === 0) {
            delete portfolio.holdings[activeStock.code];
        }
    }

    savePortfolio();
    closeTradeModal();
});

// Panggil inisialisasi di awal
initPortfolio();

