document.addEventListener("DOMContentLoaded", async () => {
    const { jsPDF } = window.jspdf;
    const db = firebase.firestore(); // Inicializar Firestore

    const sections = document.querySelectorAll('.section-content');

    // Función para mostrar una sección específica
    const showSection = (sectionId) => {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    };

    // Función para generar un reporte
    async function generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId) {
        const querySnapshot = await db.collection("cuadres").get();
        const selectedSucursal = document.getElementById(filterId).value;
        const searchIdValue = document.getElementById(searchId).value.toLowerCase();
        const startDateValue = document.getElementById(startDateId).value;
        const endDateValue = document.getElementById(endDateId).value;
        let reportData = [];
        let totalValor = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const fechaCuadre = new Date(data.fechaCuadre);
            const startDate = new Date(startDateValue);
            const endDate = new Date(endDateValue);
            const inDateRange = (!startDateValue || fechaCuadre >= startDate) && (!endDateValue || fechaCuadre <= endDate);

            if (
                (selectedSucursal === "" || data.sucursal === selectedSucursal) &&
                (searchIdValue === "" || (data.idCuadre && data.idCuadre.toString().toLowerCase().includes(searchIdValue))) &&
                inDateRange &&
                data[type]
            ) {
                reportData.push({
                    fecha: data.fechaCuadre,
                    sucursal: data.sucursal,
                    idCuadre: data.idCuadre,
                    valor: parseFloat(data[type]) || 0
                });
                totalValor += parseFloat(data[type]) || 0;
            }
        });

        const resultadosDiv = document.getElementById(resultadosId);
        resultadosDiv.innerHTML = '';

        if (reportData.length > 0) {
            reportData.forEach(rowData => {
                const row = document.createElement('tr');
                Object.values(rowData).forEach((cellData, index) => {
                    const td = document.createElement('td');
                    if (index === 3) {
                        td.textContent = (typeof cellData === 'number') ? cellData.toLocaleString('es-GT', {
                            style: 'currency',
                            currency: 'GTQ',
                            minimumFractionDigits: 2
                        }) : cellData;
                    } else {
                        td.textContent = cellData;
                    }
                    row.appendChild(td);
                });
                resultadosDiv.appendChild(row);
            });

            if (document.getElementById(totalValorId)) {
                document.getElementById(totalValorId).textContent = totalValor.toLocaleString('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2
                });
            }
        } else {
            alert('No se encontraron datos.');
        }
    }

    // Función para generar el reporte de totales
    async function generateTotalesReport() {
        const querySnapshot = await db.collection("cuadres").get();
        let reportData = [];
        let totals = {
            totalEfectivo: 0,
            totalTarjeta: 0,
            totalMotorista: 0,
            totalPedidos: 0,
            totalGastos: 0
        };

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const totalEfectivo = parseFloat(data.totalEfectivo) || 0;
            const totalTarjeta = parseFloat(data.totalTarjeta) || 0;
            const totalMotorista = parseFloat(data.totalMotoristaAdmin) || 0;
            const totalPedidos = parseFloat(data.totalPedidos) || 0;
            const totalGastos = parseFloat(data.totalGastos) || 0;

            reportData.push({
                fecha: data.fechaCuadre,
                sucursal: data.sucursal,
                idCuadre: data.idCuadre,
                totalEfectivo: totalEfectivo,
                totalTarjeta: totalTarjeta,
                totalMotorista: totalMotorista,
                totalPedidos: totalPedidos,
                totalGastos: totalGastos
            });

            totals.totalEfectivo += totalEfectivo;
            totals.totalTarjeta += totalTarjeta;
            totals.totalMotorista += totalMotorista;
            totals.totalPedidos += totalPedidos;
            totals.totalGastos += totalGastos;
        });

        const resultadosDiv = document.getElementById('totales-resultados');
        resultadosDiv.innerHTML = '';
        if (reportData.length > 0) {
            reportData.forEach(rowData => {
                const row = document.createElement('tr');
                Object.values(rowData).forEach((cellData, index) => {
                    const td = document.createElement('td');
                    if (index >= 3 && index <= 7) {
                        td.textContent = (typeof cellData === 'number') ? cellData.toLocaleString('es-GT', {
                            style: 'currency',
                            currency: 'GTQ',
                            minimumFractionDigits: 2
                        }) : cellData;
                    } else {
                        td.textContent = cellData;
                    }
                    row.appendChild(td);
                });
                resultadosDiv.appendChild(row);
            });

            if (document.getElementById('totales-total-efectivo')) {
                document.getElementById('totales-total-efectivo').textContent = totals.totalEfectivo.toLocaleString('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2
                });
            }
            if (document.getElementById('totales-total-tarjeta')) {
                document.getElementById('totales-total-tarjeta').textContent = totals.totalTarjeta.toLocaleString('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2
                });
            }
            if (document.getElementById('totales-total-motorista')) {
                document.getElementById('totales-total-motorista').textContent = totals.totalMotorista.toLocaleString('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2
                });
            }
            if (document.getElementById('totales-total-pedidos')) {
                document.getElementById('totales-total-pedidos').textContent = totals.totalPedidos.toLocaleString('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2
                });
            }
            if (document.getElementById('totales-total-gastos')) {
                document.getElementById('totales-total-gastos').textContent = totals.totalGastos.toLocaleString('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2
                });
            }
        } else {
            alert('No se encontraron datos.');
        }
    }

    // Función para añadir los event listeners para los reportes
    function addEventListenersForReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId) {
        document.getElementById(filterId).addEventListener('change', async () => {
            await generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId);
        });
        document.getElementById(searchId).addEventListener('input', async () => {
            await generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId);
        });
        document.getElementById(startDateId).addEventListener('change', async () => {
            await generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId);
        });
        document.getElementById(endDateId).addEventListener('change', async () => {
            await generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId);
        });
    }

    // Botones para generar los diferentes reportes
    document.getElementById('ventas-efectivo-btn').addEventListener('click', async () => {
        await generateReport('totalEfectivo', 'ventas-efectivo-resultados', 'ventas-efectivo-total-valor', 'filtro-sucursal-ventas-efectivo', 'search-id-ventas-efectivo', 'start-date-ventas-efectivo', 'end-date-ventas-efectivo');
        showSection('ventas-efectivo-content');
    });

    document.getElementById('ventas-tarjeta-btn').addEventListener('click', async () => {
        await generateReport('totalTarjeta', 'ventas-tarjeta-resultados', 'ventas-tarjeta-total-valor', 'filtro-sucursal-ventas-tarjeta', 'search-id-ventas-tarjeta', 'start-date-ventas-tarjeta', 'end-date-ventas-tarjeta');
        showSection('ventas-tarjeta-content');
    });

    document.getElementById('ventas-motorista-btn').addEventListener('click', async () => {
        await generateReport('totalMotoristaAdmin', 'ventas-motorista-resultados', 'ventas-motorista-total-valor', 'filtro-sucursal-ventas-motorista', 'search-id-ventas-motorista', 'start-date-ventas-motorista', 'end-date-ventas-motorista');
        showSection('ventas-motorista-content');
    });

    document.getElementById('ventas-pedidos-ya-btn').addEventListener('click', async () => {
        await generateReport('totalPedidos', 'ventas-pedidos-ya-resultados', 'ventas-pedidos-ya-total-valor', 'filtro-sucursal-ventas-pedidos-ya', 'search-id-ventas-pedidos-ya', 'start-date-ventas-pedidos-ya', 'end-date-ventas-pedidos-ya');
        showSection('ventas-pedidos-ya-content');
    });

    document.getElementById('gastos-btn').addEventListener('click', async () => {
        await generateReport('totalGastos', 'gastos-resultados', 'gastos-total-valor', 'filtro-sucursal-gastos', 'search-id-gastos', 'start-date-gastos', 'end-date-gastos');
        showSection('gastos-content');
    });

    document.getElementById('totales-btn').addEventListener('click', async () => {
        await generateTotalesReport();
        showSection('totales-content');
    });

    // Añadir event listeners para los reportes
    addEventListenersForReport('totalEfectivo', 'ventas-efectivo-resultados', 'ventas-efectivo-total-valor', 'filtro-sucursal-ventas-efectivo', 'search-id-ventas-efectivo', 'start-date-ventas-efectivo', 'end-date-ventas-efectivo');
    addEventListenersForReport('totalTarjeta', 'ventas-tarjeta-resultados', 'ventas-tarjeta-total-valor', 'filtro-sucursal-ventas-tarjeta', 'search-id-ventas-tarjeta', 'start-date-ventas-tarjeta', 'end-date-ventas-tarjeta');
    addEventListenersForReport('totalMotoristaAdmin', 'ventas-motorista-resultados', 'ventas-motorista-total-valor', 'filtro-sucursal-ventas-motorista', 'search-id-ventas-motorista', 'start-date-ventas-motorista', 'end-date-ventas-motorista');
    addEventListenersForReport('totalPedidos', 'ventas-pedidos-ya-resultados', 'ventas-pedidos-ya-total-valor', 'filtro-sucursal-ventas-pedidos-ya', 'search-id-ventas-pedidos-ya', 'start-date-ventas-pedidos-ya', 'end-date-ventas-pedidos-ya');
    addEventListenersForReport('totalGastos', 'gastos-resultados', 'gastos-total-valor', 'filtro-sucursal-gastos', 'search-id-gastos', 'start-date-gastos', 'end-date-gastos');

    // Función para exportar tablas a PDF
    function exportTableToPDF(tableId, title) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const table = document.getElementById(tableId);

        html2canvas(table).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            doc.text(title, 20, 20);
            doc.addImage(imgData, 'PNG', 20, 30, 170, 0);
            doc.save(`${title}.pdf`);
        });
    }

    // Botones para exportar reportes a PDF
    document.getElementById('export-ventas-efectivo-pdf').addEventListener('click', () => {
        exportTableToPDF('ventas-efectivo-table', 'Ventas Efectivo');
    });

    document.getElementById('export-ventas-tarjeta-pdf').addEventListener('click', () => {
        exportTableToPDF('ventas-tarjeta-table', 'Ventas Tarjeta');
    });

    document.getElementById('export-ventas-motorista-pdf').addEventListener('click', () => {
        exportTableToPDF('ventas-motorista-table', 'Ventas Motorista');
    });

    document.getElementById('export-ventas-pedidos-ya-pdf').addEventListener('click', () => {
        exportTableToPDF('ventas-pedidos-ya-table', 'Ventas Pedidos Ya');
    });

    document.getElementById('export-gastos-pdf').addEventListener('click', () => {
        exportTableToPDF('gastos-table', 'Gastos');
    });
});
