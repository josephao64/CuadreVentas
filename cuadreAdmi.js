document.addEventListener("DOMContentLoaded", async () => {
    const { jsPDF } = window.jspdf;
    const db = firebase.firestore();

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
        const querySnapshot = await db.collection("cuadres").get();
        const cuadresTarjetas = document.getElementById('cuadres-tarjetas');
        cuadresTarjetas.innerHTML = '';

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'cuadre-card';
            card.innerHTML = `
                <h3>ID Cuadre: ${data.idCuadre} - ${data.sucursal}</h3>
                <p>Fecha: ${data.fechaCuadre}</p>
                <button onclick="mostrarCuadre('${doc.id}')">Mostrar Cuadre</button>
                <button onclick="realizarCuadre('${doc.id}')">Realizar Cuadre</button>
            `;
            cuadresTarjetas.appendChild(card);
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

            // Limpiar campos del sistema
            document.getElementById('caja1-venta-efectivo').value = '';
            document.getElementById('caja1-venta-tarjeta').value = '';
            document.getElementById('caja1-motorista').value = '';
            document.getElementById('caja1-pedidos-ya').value = '';
            document.getElementById('caja1-venta-total').value = '';
            
            document.getElementById('caja2-venta-efectivo').value = '';
            document.getElementById('caja2-venta-tarjeta').value = '';
            document.getElementById('caja2-motorista').value = '';
            document.getElementById('caja2-pedidos-ya').value = '';
            document.getElementById('caja2-venta-total').value = '';

            document.getElementById('caja3-venta-efectivo').value = '';
            document.getElementById('caja3-venta-tarjeta').value = '';
            document.getElementById('caja3-motorista').value = '';
            document.getElementById('caja3-pedidos-ya').value = '';
            document.getElementById('caja3-venta-total').value = '';

            document.getElementById('total-venta-efectivo').value = '';
            document.getElementById('total-venta-tarjeta').value = '';
            document.getElementById('total-motorista').value = '';
            document.getElementById('total-pedidos-ya').value = '';
            document.getElementById('total-sistema').value = '';

            // Cargar datos de caja ingresados por el encargado
            document.getElementById('caja1-100').value = data.caja1_100 || 0;
            document.getElementById('caja1-50').value = data.caja1_50 || 0;
            document.getElementById('caja1-20').value = data.caja1_20 || 0;
            document.getElementById('caja1-10').value = data.caja1_10 || 0;
            document.getElementById('caja1-5').value = data.caja1_5 || 0;
            document.getElementById('caja1-1').value = data.caja1_1 || 0;
            document.getElementById('caja1-apertura').value = data.caja1_apertura || 0;
            document.getElementById('caja1-tarjeta-admin').value = data.caja1_tarjeta_admin || 0;
            document.getElementById('caja1-motorista-admin').value = data.caja1_motorista_admin || 0;
            document.getElementById('caja1-total-efectivo').value = data.caja1_total_efectivo || 0;
            document.getElementById('caja1-total-venta-cajero').value = data.caja1_total_venta_cajero || 0;

            document.getElementById('caja2-100').value = data.caja2_100 || 0;
            document.getElementById('caja2-50').value = data.caja2_50 || 0;
            document.getElementById('caja2-20').value = data.caja2_20 || 0;
            document.getElementById('caja2-10').value = data.caja2_10 || 0;
            document.getElementById('caja2-5').value = data.caja2_5 || 0;
            document.getElementById('caja2-1').value = data.caja2_1 || 0;
            document.getElementById('caja2-apertura').value = data.caja2_apertura || 0;
            document.getElementById('caja2-tarjeta-admin').value = data.caja2_tarjeta_admin || 0;
            document.getElementById('caja2-motorista-admin').value = data.caja2_motorista_admin || 0;
            document.getElementById('caja2-total-efectivo').value = data.caja2_total_efectivo || 0;
            document.getElementById('caja2-total-venta-cajero').value = data.caja2_total_venta_cajero || 0;

            document.getElementById('caja3-100').value = data.caja3_100 || 0;
            document.getElementById('caja3-50').value = data.caja3_50 || 0;
            document.getElementById('caja3-20').value = data.caja3_20 || 0;
            document.getElementById('caja3-10').value = data.caja3_10 || 0;
            document.getElementById('caja3-5').value = data.caja3_5 || 0;
            document.getElementById('caja3-1').value = data.caja3_1 || 0;
            document.getElementById('caja3-apertura').value = data.caja3_apertura || 0;
            document.getElementById('caja3-tarjeta-admin').value = data.caja3_tarjeta_admin || 0;
            document.getElementById('caja3-motorista-admin').value = data.caja3_motorista_admin || 0;
            document.getElementById('caja3-total-efectivo').value = data.caja3_total_efectivo || 0;
            document.getElementById('caja3-total-venta-cajero').value = data.caja3_total_venta_cajero || 0;

            document.getElementById('cuadres-realizados-content').style.display = 'none';
            document.getElementById('cuadre-content').style.display = 'block';

            updateTotals();
        } else {
            alert("No se encontró el cuadre");
        }
    };

    document.getElementById('cuadres-realizados-btn').addEventListener('click', async () => {
        await fetchCuadres();
        document.getElementById('cuadres-realizados-content').style.display = 'block';
        document.getElementById('cuadre-content').style.display = 'none';
    });

    document.getElementById('nuevo-cuadre-btn').addEventListener('click', () => {
        document.getElementById('cuadres-realizados-content').style.display = 'none';
        document.getElementById('cuadre-content').style.display = 'block';
        document.getElementById('cuadre-form').reset();
    });

    function updateSistemaTotals() {
        for (let i = 1; i <= 3; i++) {
            const totalVentaSistema = calculateTotal([
                `caja${i}-venta-efectivo`,
                `caja${i}-venta-tarjeta`,
                `caja${i}-motorista`,
                `caja${i}-pedidos-ya`
            ]);
            const ventaTotal = document.getElementById(`caja${i}-venta-total`);
            if (ventaTotal) {
                ventaTotal.value = totalVentaSistema.toFixed(2);
            }
        }
        const totalVentaEfectivo = calculateTotal(['caja1-venta-efectivo', 'caja2-venta-efectivo', 'caja3-venta-efectivo']);
        const totalVentaTarjeta = calculateTotal(['caja1-venta-tarjeta', 'caja2-venta-tarjeta', 'caja3-venta-tarjeta']);
        const totalMotorista = calculateTotal(['caja1-motorista', 'caja2-motorista', 'caja3-motorista']);
        const totalPedidosYa = calculateTotal(['caja1-pedidos-ya', 'caja2-pedidos-ya', 'caja3-pedidos-ya']);
        const totalVentaEfectivoElem = document.getElementById('total-venta-efectivo');
        const totalVentaTarjetaElem = document.getElementById('total-venta-tarjeta');
        const totalMotoristaElem = document.getElementById('total-motorista');
        const totalPedidosYaElem = document.getElementById('total-pedidos-ya');
        const totalSistemaElem = document.getElementById('total-sistema');
        if (totalVentaEfectivoElem) totalVentaEfectivoElem.value = totalVentaEfectivo.toFixed(2);
        if (totalVentaTarjetaElem) totalVentaTarjetaElem.value = totalVentaTarjeta.toFixed(2);
        if (totalMotoristaElem) totalMotoristaElem.value = totalMotorista.toFixed(2);
        if (totalPedidosYaElem) totalPedidosYaElem.value = totalPedidosYa.toFixed(2);
        if (totalSistemaElem) totalSistemaElem.value = (totalVentaEfectivo + totalVentaTarjeta + totalMotorista + totalPedidosYa).toFixed(2);
    }

    function updateCajaTotals() {
        for (let i = 1; i <= 3; i++) {
            const totalEfectivo = calculateTotal([
                `caja${i}-100`, `caja${i}-50`, `caja${i}-20`, `caja${i}-10`, `caja${i}-5`, `caja${i}-1`
            ]) - parseFloat(document.getElementById(`caja${i}-apertura`)?.value || 0);
            const totalEfectivoElem = document.getElementById(`caja${i}-total-efectivo`);
            const totalVentaCajeroElem = document.getElementById(`caja${i}-total-venta-cajero`);
            if (totalEfectivoElem) totalEfectivoElem.value = totalEfectivo.toFixed(2);
            if (totalVentaCajeroElem) totalVentaCajeroElem.value = (totalEfectivo +
                parseFloat(document.getElementById(`caja${i}-tarjeta-admin`)?.value || 0) +
                parseFloat(document.getElementById(`caja${i}-motorista-admin`)?.value || 0)).toFixed(2);
        }
    }

    function updateEncargado() {
        for (let i = 1; i <= 3; i++) {
            const efectivoElem = document.getElementById(`encargado-caja${i}-venta-efectivo`);
            const tarjetaElem = document.getElementById(`encargado-caja${i}-venta-tarjeta`);
            const motoristaElem = document.getElementById(`encargado-caja${i}-motorista`);
            const totalElem = document.getElementById(`encargado-caja${i}-total`);
            if (efectivoElem) efectivoElem.value = document.getElementById(`caja${i}-total-efectivo`)?.value || 0;
            if (tarjetaElem) tarjetaElem.value = document.getElementById(`caja${i}-tarjeta-admin`)?.value || 0;
            if (motoristaElem) motoristaElem.value = document.getElementById(`caja${i}-motorista-admin`)?.value || 0;
            if (totalElem) totalElem.value = (parseFloat(efectivoElem?.value || 0) +
                parseFloat(tarjetaElem?.value || 0) +
                parseFloat(motoristaElem?.value || 0)).toFixed(2);
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
            const diferenciaEfectivoElem = document.getElementById(`diferencia-caja${i}-efectivo`);
            const diferenciaTarjetaElem = document.getElementById(`diferencia-caja${i}-tarjeta`);
            const diferenciaMotoristaElem = document.getElementById(`diferencia-caja${i}-motorista`);
            const totalDiferenciaElem = document.getElementById(`diferencia-caja${i}-total`);
            if (diferenciaEfectivoElem) diferenciaEfectivoElem.value = (efectivoEncargado - efectivoSistema).toFixed(2);
            if (diferenciaTarjetaElem) diferenciaTarjetaElem.value = (tarjetaEncargado - tarjetaSistema).toFixed(2);
            if (diferenciaMotoristaElem) diferenciaMotoristaElem.value = (motoristaEncargado - motoristaSistema).toFixed(2);
            if (totalDiferenciaElem) totalDiferenciaElem.value = ((efectivoEncargado - efectivoSistema) + (tarjetaEncargado - tarjetaSistema) + (motoristaEncargado - motoristaSistema)).toFixed(2);
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

        if (ventaEfectivoCuadroElem) ventaEfectivoCuadroElem.value = totalVentaEfectivo.toFixed(2);
        if (ventaTarjetaCuadroElem) ventaTarjetaCuadroElem.value = totalVentaTarjeta.toFixed(2);
        if (motoristaCuadroElem) motoristaCuadroElem.value = totalMotoristaAdmin.toFixed(2);
        if (totalCuadroElem) totalCuadroElem.value = (totalVentaEfectivo + totalMotoristaAdmin + totalVentaTarjeta).toFixed(2);

        const sobrante = (totalEncargado - totalSistema).toFixed(2);
        if (ventaEfectivoAdminElem) ventaEfectivoAdminElem.value = (totalVentaEfectivo + totalMotoristaAdmin).toFixed(2);
        if (ventaTarjetaAdminElem) ventaTarjetaAdminElem.value = totalVentaTarjeta.toFixed(2);
        if (totalEfectivoAdminElem) totalEfectivoAdminElem.value = (totalVentaEfectivo + totalMotoristaAdmin).toFixed(2);
        if (motoristaCuadroAdminElem) motoristaCuadroAdminElem.value = totalMotoristaAdmin.toFixed(2);
        if (gastosCuadroElem) gastosCuadroElem.value = (-totalGastos).toFixed(2);
        if (sobranteCuadroElem) sobranteCuadroElem.value = sobrante;

        const totalADepositar = (parseFloat(totalEfectivoAdminElem.value) + parseFloat(ventaTarjetaAdminElem.value) + parseFloat(motoristaCuadroAdminElem.value) + parseFloat(gastosCuadroElem.value) + parseFloat(sobranteCuadroElem.value)).toFixed(2);
        if (totalDepositarCuadroElem) totalDepositarCuadroElem.value = totalADepositar;

        const diferenciaEfectivoCuadroElem = document.getElementById('diferencia-efectivo-cuadro');
        const diferenciaTarjetaCuadroElem = document.getElementById('diferencia-tarjeta-cuadro');
        const diferenciaTotalCuadroElem = document.getElementById('diferencia-total-cuadro');

        if (diferenciaEfectivoCuadroElem) diferenciaEfectivoCuadroElem.value = (totalVentaEfectivo - parseFloat(document.getElementById('total-venta-efectivo').value)).toFixed(2);
        if (diferenciaTarjetaCuadroElem) diferenciaTarjetaCuadroElem.value = (totalVentaTarjeta - parseFloat(document.getElementById('total-venta-tarjeta').value)).toFixed(2);
        if (diferenciaTotalCuadroElem) diferenciaTotalCuadroElem.value = (parseFloat(diferenciaEfectivoCuadroElem.value) + parseFloat(diferenciaTarjetaCuadroElem.value)).toFixed(2);
    }

    document.querySelectorAll("input[type='number'], input[type='checkbox']").forEach(element => {
        if (element) {
            element.addEventListener("input", updateTotals);
            element.addEventListener("change", updateTotals);
        }
    });

    document.getElementById('cerrar-cuadre-btn').addEventListener('click', async () => {
        const idCuadre = document.getElementById('id-cuadre').value;
        if (idCuadre) {
            await db.collection("cuadres").doc(idCuadre).update({
                cerrado: true
            });
            alert("Cuadre cerrado correctamente");
            document.getElementById('cuadre-content').style.display = 'none';
        }
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

    updateTotals();
});

function addGasto() {
    const tableBody = document.getElementById("gastos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" oninput="updateTotals()"></td>
        <td><input type="text" oninput="updateTotals()"></td>
        <td><input type="number" step="0.01" oninput="updateTotals()"></td>
        <td><input type="number" step="0.01" oninput="updateTotals()"></td>
        <td><input type="number" step="0.01" readonly></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}

function addTicket() {
    const tableBody = document.getElementById("pedidos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" name="no-ticket" oninput="updateTotals()"></td>
        <td><input type="number" name="valor-ticket" step="0.01" oninput="updateTotals()"></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}
