document.addEventListener("DOMContentLoaded", async () => {
    const { jsPDF } = window.jspdf;
    const db = firebase.firestore();

    const sections = document.querySelectorAll('.section-content');

    const showSection = (sectionId) => {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    };

    const calculateTotal = (ids) => ids.reduce((total, id) => total + parseFloat(document.getElementById(id)?.value || 0), 0);

    window.updateTotals = function () {
        updateSistemaTotals();
        updateCajaTotals();
        updateEncargado();
        updateDiferencia();
        updateGastos();
        updatePedidos();
        updateCuadroDatos();
    };

    async function fetchCuadres() {
        const querySnapshot = await db.collection("cuadres").orderBy("fechaCuadre", "desc").get();
        const cuadresTarjetas = document.getElementById('cuadres-tarjetas');
        const cuadresTarjetasAdmin = document.getElementById('cuadres-tarjetas-admin');
        cuadresTarjetas.innerHTML = '';
        cuadresTarjetasAdmin.innerHTML = '';

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'cuadre-card';
            card.innerHTML = `
                <h3>ID Cuadre: ${data.idCuadre} - ${data.sucursal}</h3>
                <p>Fecha: ${data.fechaCuadre}</p>
                <button onclick="mostrarCuadre('${doc.id}')">Mostrar Cuadre</button>
                <button onclick="eliminarCuadre('${doc.id}')">Eliminar Cuadre</button>
            `;
            cuadresTarjetas.appendChild(card);
            cuadresTarjetasAdmin.appendChild(card.cloneNode(true));
        });
    }

    window.mostrarCuadre = async (id) => {
        const docRef = db.collection("cuadres").doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            document.getElementById('id-cuadre').value = data.idCuadre || id;
            document.getElementById('nombre-sucursal').value = data.sucursal || '';
            document.getElementById('fecha-hoy').value = data.fechaCuadre || '';

            const fieldsToLoad = [
                'caja1-100', 'caja1-50', 'caja1-20', 'caja1-10', 'caja1-5', 'caja1-1', 'caja1-apertura', 'caja1-tarjeta-admin', 'caja1-motorista-admin', 'caja1-total-efectivo', 'caja1-total-venta-cajero',
                'caja2-100', 'caja2-50', 'caja2-20', 'caja2-10', 'caja2-5', 'caja2-1', 'caja2-apertura', 'caja2-tarjeta-admin', 'caja2-motorista-admin', 'caja2-total-efectivo', 'caja2-total-venta-cajero',
                'caja3-100', 'caja3-50', 'caja3-20', 'caja3-10', 'caja3-5', 'caja3-1', 'caja3-apertura', 'caja3-tarjeta-admin', 'caja3-motorista-admin', 'caja3-total-efectivo', 'caja3-total-venta-cajero'
            ];

            fieldsToLoad.forEach(fieldId => {
                document.getElementById(fieldId).value = data[fieldId.replace(/-/g, '_')] || 0;
            });

            showSection('cuadre-content');
            updateTotals();
        } else {
            alert("No se encontró el cuadre");
        }
    };

    window.eliminarCuadre = async (id) => {
        if (confirm("¿Estás seguro de que deseas eliminar este cuadre?")) {
            await db.collection("cuadres").doc(id).delete();
            alert("Cuadre eliminado correctamente");
            await fetchCuadres();
        }
    };

    document.getElementById('cuadres-realizados-btn').addEventListener('click', async () => {
        await fetchCuadres();
        showSection('cuadres-realizados-content');
    });

    document.getElementById('nuevo-cuadre-btn').addEventListener('click', () => {
        document.getElementById('cuadre-form').reset();
        showSection('cuadre-content');
    });

    document.getElementById('finalizar-cuadre-btn').addEventListener('click', async () => {
        const idCuadre = document.getElementById('id-cuadre').value;
        const data = {
            caja1_100: document.getElementById('caja1-100').value,
            caja1_50: document.getElementById('caja1-50').value,
            caja1_20: document.getElementById('caja1-20').value,
            caja1_10: document.getElementById('caja1-10').value,
            caja1_5: document.getElementById('caja1-5').value,
            caja1_1: document.getElementById('caja1-1').value,
            caja1_apertura: document.getElementById('caja1-apertura').value,
            caja1_tarjeta_admin: document.getElementById('caja1-tarjeta-admin').value,
            caja1_motorista_admin: document.getElementById('caja1-motorista-admin').value,
            caja1_total_efectivo: document.getElementById('caja1-total-efectivo').value,
            caja1_total_venta_cajero: document.getElementById('caja1-total-venta-cajero').value,
            caja2_100: document.getElementById('caja2-100').value,
            caja2_50: document.getElementById('caja2-50').value,
            caja2_20: document.getElementById('caja2-20').value,
            caja2_10: document.getElementById('caja2-10').value,
            caja2_5: document.getElementById('caja2-5').value,
            caja2_1: document.getElementById('caja2-1').value,
            caja2_apertura: document.getElementById('caja2-apertura').value,
            caja2_tarjeta_admin: document.getElementById('caja2-tarjeta-admin').value,
            caja2_motorista_admin: document.getElementById('caja2-motorista-admin').value,
            caja2_total_efectivo: document.getElementById('caja2-total-efectivo').value,
            caja2_total_venta_cajero: document.getElementById('caja2-total-venta-cajero').value,
            caja3_100: document.getElementById('caja3-100').value,
            caja3_50: document.getElementById('caja3-50').value,
            caja3_20: document.getElementById('caja3-20').value,
            caja3_10: document.getElementById('caja3-10').value,
            caja3_5: document.getElementById('caja3-5').value,
            caja3_1: document.getElementById('caja3-1').value,
            caja3_apertura: document.getElementById('caja3-apertura').value,
            caja3_tarjeta_admin: document.getElementById('caja3-tarjeta-admin').value,
            caja3_motorista_admin: document.getElementById('caja3-motorista-admin').value,
            caja3_total_efectivo: document.getElementById('caja3-total-efectivo').value,
            caja3_total_venta_cajero: document.getElementById('caja3-total-venta-cajero').value,
            totalEfectivo: document.getElementById('total-venta-efectivo').value,
            totalTarjeta: document.getElementById('total-venta-tarjeta').value,
            totalMotoristaAdmin: document.getElementById('total-motorista').value,
            totalGastos: document.getElementById('total-gastos').value,
            totalPedidos: document.getElementById('total-pedidos').value,
            cajaChicaDiaSiguiente: document.getElementById('caja-chica').value,
            debeAyer: document.getElementById('debe-ayer').value,
            totalDepositarBanco: document.getElementById('total-depositar-cuadro').value,
            fechaCuadre: document.getElementById('fecha-hoy').value,
            idCuadre: parseInt(document.getElementById('id-cuadre').value),
            sucursal: document.getElementById('nombre-sucursal').value,
            totalVentaCajero: document.getElementById('total-cuadro').value
        };
        await db.collection("cuadres").doc(idCuadre).set(data, { merge: true });
        alert("Cuadre finalizado y guardado correctamente");
        showSection('cuadres-realizados-content');
    });

    document.getElementById('cuadres-realizados-admin-btn').addEventListener('click', async () => {
        await fetchCuadres();
        showSection('cuadres-realizados-admin-content');
    });

    document.getElementById('download-cuadro-img').addEventListener('click', async () => {
        const cuadroDatos = document.getElementById('cuadro-datos');
        html2canvas(cuadroDatos).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `cuadre-${document.getElementById('nombre-sucursal').value}-${document.getElementById('fecha-hoy').value}.png`;
            link.click();
        });
    });

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

    addEventListenersForReport('totalEfectivo', 'ventas-efectivo-resultados', 'ventas-efectivo-total-valor', 'filtro-sucursal-ventas-efectivo', 'search-id-ventas-efectivo', 'start-date-ventas-efectivo', 'end-date-ventas-efectivo');
    addEventListenersForReport('totalTarjeta', 'ventas-tarjeta-resultados', 'ventas-tarjeta-total-valor', 'filtro-sucursal-ventas-tarjeta', 'search-id-ventas-tarjeta', 'start-date-ventas-tarjeta', 'end-date-ventas-tarjeta');
    addEventListenersForReport('totalMotoristaAdmin', 'ventas-motorista-resultados', 'ventas-motorista-total-valor', 'filtro-sucursal-ventas-motorista', 'search-id-ventas-motorista', 'start-date-ventas-motorista', 'end-date-ventas-motorista');
    addEventListenersForReport('totalPedidos', 'ventas-pedidos-ya-resultados', 'ventas-pedidos-ya-total-valor', 'filtro-sucursal-ventas-pedidos-ya', 'search-id-ventas-pedidos-ya', 'start-date-ventas-pedidos-ya', 'end-date-ventas-pedidos-ya');
    addEventListenersForReport('totalGastos', 'gastos-resultados', 'gastos-total-valor', 'filtro-sucursal-gastos', 'search-id-gastos', 'start-date-gastos', 'end-date-gastos');

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

    function updateSistemaTotals() {
        for (let i = 1; i <= 3; i++) {
            const totalVentaSistema = calculateTotal([
                `caja${i}-venta-efectivo`,
                `caja${i}-venta-tarjeta`,
                `caja${i}-motorista`,
                `caja${i}-pedidos-ya`
            ]);
            document.getElementById(`caja${i}-venta-total`).value = totalVentaSistema.toFixed(2);
        }

        const totalVentaEfectivo = calculateTotal(['caja1-venta-efectivo', 'caja2-venta-efectivo', 'caja3-venta-efectivo']);
        const totalVentaTarjeta = calculateTotal(['caja1-venta-tarjeta', 'caja2-venta-tarjeta', 'caja3-venta-tarjeta']);
        const totalMotorista = calculateTotal(['caja1-motorista', 'caja2-motorista', 'caja3-motorista']);
        const totalPedidosYa = calculateTotal(['caja1-pedidos-ya', 'caja2-pedidos-ya', 'caja3-pedidos-ya']);

        document.getElementById('total-venta-efectivo').value = totalVentaEfectivo.toFixed(2);
        document.getElementById('total-venta-tarjeta').value = totalVentaTarjeta.toFixed(2);
        document.getElementById('total-motorista').value = totalMotorista.toFixed(2);
        document.getElementById('total-pedidos-ya').value = totalPedidosYa.toFixed(2);
        document.getElementById('total-sistema').value = (totalVentaEfectivo + totalVentaTarjeta + totalMotorista + totalPedidosYa).toFixed(2);
    }

    function updateCajaTotals() {
        for (let i = 1; i <= 3; i++) {
            const totalEfectivo = calculateTotal([
                `caja${i}-100`, `caja${i}-50`, `caja${i}-20`, `caja${i}-10`, `caja${i}-5`, `caja${i}-1`
            ]) - parseFloat(document.getElementById(`caja${i}-apertura`)?.value || 0);
            document.getElementById(`caja${i}-total-efectivo`).value = totalEfectivo.toFixed(2);
            document.getElementById(`caja${i}-total-venta-cajero`).value = (totalEfectivo +
                parseFloat(document.getElementById(`caja${i}-tarjeta-admin`)?.value || 0) +
                parseFloat(document.getElementById(`caja${i}-motorista-admin`)?.value || 0)).toFixed(2);
        }
    }

    function updateEncargado() {
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`encargado-caja${i}-venta-efectivo`).value = document.getElementById(`caja${i}-total-efectivo`)?.value || 0;
            document.getElementById(`encargado-caja${i}-venta-tarjeta`).value = document.getElementById(`caja${i}-tarjeta-admin`)?.value || 0;
            document.getElementById(`encargado-caja${i}-motorista`).value = document.getElementById(`caja${i}-motorista-admin`)?.value || 0;
            document.getElementById(`encargado-caja${i}-total`).value = (parseFloat(document.getElementById(`encargado-caja${i}-venta-efectivo`)?.value || 0) +
                parseFloat(document.getElementById(`encargado-caja${i}-venta-tarjeta`)?.value || 0) +
                parseFloat(document.getElementById(`encargado-caja${i}-motorista`)?.value || 0)).toFixed(2);
        }

        const totalEncargadoVentaEfectivo = calculateTotal(['encargado-caja1-venta-efectivo', 'encargado-caja2-venta-efectivo', 'encargado-caja3-venta-efectivo']);
        const totalEncargadoVentaTarjeta = calculateTotal(['encargado-caja1-venta-tarjeta', 'encargado-caja2-venta-tarjeta', 'encargado-caja3-venta-tarjeta']);
        const totalEncargadoMotorista = calculateTotal(['encargado-caja1-motorista', 'encargado-caja2-motorista', 'encargado-caja3-motorista']);
        const totalEncargadoPedidosYa = calculateTotal(['encargado-caja1-pedidos-ya', 'encargado-caja2-pedidos-ya', 'encargado-caja3-pedidos-ya']);
        const totalEncargado = totalEncargadoVentaEfectivo + totalEncargadoVentaTarjeta + totalEncargadoMotorista + totalEncargadoPedidosYa;

        document.getElementById('total-encargado-venta-efectivo').value = totalEncargadoVentaEfectivo.toFixed(2);
        document.getElementById('total-encargado-venta-tarjeta').value = totalEncargadoVentaTarjeta.toFixed(2);
        document.getElementById('total-encargado-motorista').value = totalEncargadoMotorista.toFixed(2);
        document.getElementById('total-encargado-pedidos-ya').value = totalEncargadoPedidosYa.toFixed(2);
        document.getElementById('total-encargado').value = totalEncargado.toFixed(2);
    }

    function updateDiferencia() {
        for (let i = 1; i <= 3; i++) {
            const efectivoSistema = parseFloat(document.getElementById(`caja${i}-venta-efectivo`)?.value || 0);
            const efectivoEncargado = parseFloat(document.getElementById(`encargado-caja${i}-venta-efectivo`)?.value || 0);
            const tarjetaSistema = parseFloat(document.getElementById(`caja${i}-venta-tarjeta`)?.value || 0);
            const tarjetaEncargado = parseFloat(document.getElementById(`encargado-caja${i}-venta-tarjeta`)?.value || 0);
            const motoristaSistema = parseFloat(document.getElementById(`caja${i}-motorista`)?.value || 0);
            const motoristaEncargado = parseFloat(document.getElementById(`encargado-caja${i}-motorista`)?.value || 0);
            document.getElementById(`diferencia-caja${i}-efectivo`).value = (efectivoEncargado - efectivoSistema).toFixed(2);
            document.getElementById(`diferencia-caja${i}-tarjeta`).value = (tarjetaEncargado - tarjetaSistema).toFixed(2);
            document.getElementById(`diferencia-caja${i}-motorista`).value = (motoristaEncargado - motoristaSistema).toFixed(2);
            document.getElementById(`diferencia-caja${i}-total`).value = ((efectivoEncargado - efectivoSistema) + (tarjetaEncargado - tarjetaSistema) + (motoristaEncargado - motoristaSistema)).toFixed(2);
        }
    }

    function updateGastos() {
        const totalGastos = Array.from(document.querySelectorAll("#gastos-tbody tr"))
            .reduce((total, row) => {
                const inputs = row.querySelectorAll('input[type="number"]');
                const cantidad = parseFloat(inputs[0]?.value || 0);
                const valor = parseFloat(inputs[1]?.value || 0);
                const totalGasto = cantidad * valor;
                if (inputs[2]) {
                    inputs[2].value = totalGasto.toFixed(2);
                }
                return total + totalGasto;
            }, 0);
        document.getElementById('total-gastos').value = totalGastos.toFixed(2);
    }

    function updatePedidos() {
        const totalPedidos = Array.from(document.querySelectorAll("#pedidos-tbody tr"))
            .reduce((total, row) => {
                const valorTicket = row.querySelector('input[name="valor-ticket"]');
                const valorTicketValue = parseFloat(valorTicket?.value || 0);
                return total + valorTicketValue;
            }, 0);
        document.getElementById('total-pedidos').value = totalPedidos.toFixed(2);
    }

    function updateCuadroDatos() {
        const fechaHoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-hoy').value = fechaHoy;

        const totalVentaEfectivo = parseFloat(document.getElementById('total-encargado-venta-efectivo').value || 0);
        const totalVentaTarjeta = parseFloat(document.getElementById('total-encargado-venta-tarjeta').value || 0);
        const totalMotoristaAdmin = parseFloat(document.getElementById('total-encargado-motorista').value || 0);
        const totalGastos = parseFloat(document.getElementById('total-gastos').value || 0);
        const totalEncargado = parseFloat(document.getElementById('total-encargado').value || 0);
        const totalSistema = parseFloat(document.getElementById('total-sistema').value || 0);

        const ventaEfectivoCuadroElem = document.getElementById('venta-efectivo-cuadro');
        const ventaTarjetaCuadroElem = document.getElementById('venta-tarjeta-cuadro');
        const motoristaCuadroElem = document.getElementById('motorista-cuadro');
        const totalCuadroElem = document.getElementById('total-cuadro');
        const ventaEfectivoAdminElem = document.getElementById('venta-efectivo-admin');
        const ventaTarjetaAdminElem = document.getElementById('venta-tarjeta-admin');
        const totalEfectivoAdminElem = document.getElementById('total-efectivo-admin');
        const motoristaCuadroAdminElem = document.getElementById('motorista-cuadro-admin');
        const gastosCuadroElem = document.getElementById('gastos-cuadro');
        const sobranteCuadroElem = document.getElementById('sobrante-cuadro');
        const totalDepositarCuadroElem = document.getElementById('total-depositar-cuadro');

        ventaEfectivoCuadroElem.value = totalVentaEfectivo.toFixed(2);
        ventaTarjetaCuadroElem.value = totalVentaTarjeta.toFixed(2);
        motoristaCuadroElem.value = totalMotoristaAdmin.toFixed(2);
        totalCuadroElem.value = (totalVentaEfectivo + totalMotoristaAdmin + totalVentaTarjeta).toFixed(2);

        const sobrante = (totalEncargado - totalSistema).toFixed(2);
        ventaEfectivoAdminElem.value = (totalVentaEfectivo + totalMotoristaAdmin).toFixed(2);
        ventaTarjetaAdminElem.value = totalVentaTarjeta.toFixed(2);
        totalEfectivoAdminElem.value = (totalVentaEfectivo + totalMotoristaAdmin).toFixed(2);
        motoristaCuadroAdminElem.value = totalMotoristaAdmin.toFixed(2);
        gastosCuadroElem.value = (-totalGastos).toFixed(2);
        sobranteCuadroElem.value = sobrante;

        const totalADepositar = (parseFloat(totalEfectivoAdminElem.value) + parseFloat(ventaTarjetaAdminElem.value) + parseFloat(motoristaCuadroAdminElem.value) + parseFloat(gastosCuadroElem.value) + parseFloat(sobranteCuadroElem.value)).toFixed(2);
        totalDepositarCuadroElem.value = totalADepositar;

        const diferenciaEfectivoCuadroElem = document.getElementById('diferencia-efectivo-cuadro');
        const diferenciaTarjetaCuadroElem = document.getElementById('diferencia-tarjeta-cuadro');
        const diferenciaTotalCuadroElem = document.getElementById('diferencia-total-cuadro');

        diferenciaEfectivoCuadroElem.value = (totalVentaEfectivo - parseFloat(document.getElementById('total-venta-efectivo').value)).toFixed(2);
        diferenciaTarjetaCuadroElem.value = (totalVentaTarjeta - parseFloat(document.getElementById('total-venta-tarjeta').value)).toFixed(2);
        diferenciaTotalCuadroElem.value = (parseFloat(diferenciaEfectivoCuadroElem.value) + parseFloat(diferenciaTarjetaCuadroElem.value)).toFixed(2);
    }

    document.querySelectorAll("input[type='number'], input[type='checkbox']").forEach(element => {
        element.addEventListener("input", updateTotals);
        element.addEventListener("change", updateTotals);
    });

    async function generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId) {
        const querySnapshot = await db.collection("cuadres").get();
        const selectedSucursal = document.getElementById(filterId).value;
        const searchIdValue = document.getElementById(searchId).value.toLowerCase();
        const startDateValue = document.getElementById(startDateId).value;
        const endDateValue = document.getElementById(endDateId).value;
        const resultsTable = document.getElementById(resultadosId);
        const totalValor = document.getElementById(totalValorId);

        resultsTable.innerHTML = '';
        let total = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const docId = doc.id.toLowerCase();
            const fechaCuadre = data.fechaCuadre || '';
            const sucursal = data.sucursal || '';

            const isMatchingSucursal = !selectedSucursal || sucursal.toLowerCase() === selectedSucursal.toLowerCase();
            const isMatchingId = !searchIdValue || docId.includes(searchIdValue);
            const isMatchingDate = (!startDateValue || new Date(fechaCuadre) >= new Date(startDateValue)) && (!endDateValue || new Date(fechaCuadre) <= new Date(endDateValue));

            if (isMatchingSucursal && isMatchingId && isMatchingDate) {
                const row = resultsTable.insertRow();
                const cellFecha = row.insertCell(0);
                const cellSucursal = row.insertCell(1);
                const cellIdCuadre = row.insertCell(2);
                const cellValor = row.insertCell(3);

                cellFecha.textContent = fechaCuadre;
                cellSucursal.textContent = sucursal;
                cellIdCuadre.textContent = data.idCuadre;
                cellValor.textContent = data[type] || '0.00';

                total += parseFloat(data[type] || 0);
            }
        });

        totalValor.textContent = total.toFixed(2);
    }

    async function generateTotalesReport() {
        const querySnapshot = await db.collection("cuadres").get();
        const resultsTable = document.getElementById('totales-resultados');
        const totalEfectivo = document.getElementById('totales-total-efectivo');
        const totalTarjeta = document.getElementById('totales-total-tarjeta');
        const totalMotorista = document.getElementById('totales-total-motorista');
        const totalPedidos = document.getElementById('totales-total-pedidos');
        const totalGastos = document.getElementById('totales-total-gastos');

        resultsTable.innerHTML = '';
        let totalEfectivoSum = 0;
        let totalTarjetaSum = 0;
        let totalMotoristaSum = 0;
        let totalPedidosSum = 0;
        let totalGastosSum = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const row = resultsTable.insertRow();
            const cellFecha = row.insertCell(0);
            const cellSucursal = row.insertCell(1);
            const cellIdCuadre = row.insertCell(2);
            const cellTotalEfectivo = row.insertCell(3);
            const cellTotalTarjeta = row.insertCell(4);
            const cellTotalMotorista = row.insertCell(5);
            const cellTotalPedidos = row.insertCell(6);
            const cellTotalGastos = row.insertCell(7);

            cellFecha.textContent = data.fechaCuadre || '';
            cellSucursal.textContent = data.sucursal || '';
            cellIdCuadre.textContent = data.idCuadre || '';
            cellTotalEfectivo.textContent = data.totalEfectivo || '0.00';
            cellTotalTarjeta.textContent = data.totalTarjeta || '0.00';
            cellTotalMotorista.textContent = data.totalMotoristaAdmin || '0.00';
            cellTotalPedidos.textContent = data.totalPedidos || '0.00';
            cellTotalGastos.textContent = data.totalGastos || '0.00';

            totalEfectivoSum += parseFloat(data.totalEfectivo || 0);
            totalTarjetaSum += parseFloat(data.totalTarjeta || 0);
            totalMotoristaSum += parseFloat(data.totalMotoristaAdmin || 0);
            totalPedidosSum += parseFloat(data.totalPedidos || 0);
            totalGastosSum += parseFloat(data.totalGastos || 0);
        });

        totalEfectivo.textContent = totalEfectivoSum.toFixed(2);
        totalTarjeta.textContent = totalTarjetaSum.toFixed(2);
        totalMotorista.textContent = totalMotoristaSum.toFixed(2);
        totalPedidos.textContent = totalPedidosSum.toFixed(2);
        totalGastos.textContent = totalGastosSum.toFixed(2);
    }

    function addEventListenersForReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId) {
        document.getElementById(filterId).addEventListener('change', () => generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId));
        document.getElementById(searchId).addEventListener('input', () => generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId));
        document.getElementById(startDateId).addEventListener('change', () => generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId));
        document.getElementById(endDateId).addEventListener('change', () => generateReport(type, resultadosId, totalValorId, filterId, searchId, startDateId, endDateId));
    }

    window.addGasto = function () {
        const row = document.createElement('tr');
        const cells = ['<input type="text" name="descripcion" placeholder="Descripción">', '<input type="text" name="no-factura" placeholder="No. Factura">', '<input type="number" name="cantidad" step="0.01" oninput="updateTotals()">', '<input type="number" name="valor" step="0.01" oninput="updateTotals()">', '<input type="number" name="total-gasto" readonly>'];
        cells.forEach(cellHTML => {
            const cell = document.createElement('td');
            cell.innerHTML = cellHTML;
            row.appendChild(cell);
        });
        document.getElementById('gastos-tbody').insertBefore(row, document.getElementById('gastos-tbody').lastElementChild);
    };

    window.addTicket = function () {
        const row = document.createElement('tr');
        const cells = ['<input type="text" name="no-ticket" placeholder="No. Ticket">', '<input type="number" name="valor-ticket" step="0.01" oninput="updateTotals()">'];
        cells.forEach(cellHTML => {
            const cell = document.createElement('td');
            cell.innerHTML = cellHTML;
            row.appendChild(cell);
        });
        document.getElementById('pedidos-tbody').insertBefore(row, document.getElementById('pedidos-tbody').lastElementChild);
    };
});
