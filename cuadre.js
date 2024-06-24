document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf;

    const calculateTotal = (ids) => ids.reduce((total, id) => total + parseFloat(document.getElementById(id)?.value || 0), 0);

    window.updateTotals = function() {
        updateSistemaTotals();
        updateControlAdministrativo();
        updateEncargado();
        updateDiferencia();
        updateGastos();
        updateCuadroDatos();
    }

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

    function updateControlAdministrativo() {
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
            if (diferenciaEfectivoElem) diferenciaEfectivoElem.value = (efectivoSistema - efectivoEncargado).toFixed(2);
            if (diferenciaTarjetaElem) diferenciaTarjetaElem.value = (tarjetaSistema - tarjetaEncargado).toFixed(2);
            if (diferenciaMotoristaElem) diferenciaMotoristaElem.value = (motoristaSistema - motoristaEncargado).toFixed(2);
            if (totalDiferenciaElem) totalDiferenciaElem.value = ((efectivoSistema - efectivoEncargado) + (tarjetaSistema - tarjetaEncargado) + (motoristaSistema - motoristaEncargado)).toFixed(2);
        }
    }

    function updateGastos() {
        const totalGastos = Array.from(document.querySelectorAll("#gastos-tbody tr input[type='number']:not(#total-gastos)"))
            .reduce((total, input) => total + parseFloat(input.value || 0), 0);
        document.getElementById('total-gastos').value = totalGastos.toFixed(2);
    }

    function updateCuadroDatos() {
        const fechaHoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-hoy').value = fechaHoy;

        const totalVentaEfectivo = calculateTotal(['encargado-caja1-venta-efectivo', 'encargado-caja2-venta-efectivo', 'encargado-caja3-venta-efectivo']);
        const totalMotoristaAdmin = calculateTotal(['caja1-motorista-admin', 'caja2-motorista-admin', 'caja3-motorista-admin']);
        const totalGastos = parseFloat(document.getElementById('total-gastos').value || 0);
        const totalEncargado = parseFloat(document.getElementById('total-encargado').value || 0);
        const totalSistema = parseFloat(document.getElementById('total-sistema').value || 0);

        const ventaEfectivoCuadroElem = document.getElementById('venta-efectivo-cuadro');
        const ventaTarjetaCuadroElem = document.getElementById('venta-tarjeta-cuadro');
        const motoristaCuadroElem = document.getElementById('motorista-cuadro');
        const totalCuadroElem = document.getElementById('total-cuadro');
        const ventaEfectivoAdminElem = document.getElementById('venta-efectivo-admin');
        const motoristaCuadroAdminElem = document.getElementById('motorista-cuadro-admin');
        const gastosCuadroElem = document.getElementById('gastos-cuadro');
        const sobranteCuadroElem = document.getElementById('sobrante-cuadro');
        const totalDepositarCuadroElem = document.getElementById('total-depositar-cuadro');

        if (ventaEfectivoCuadroElem) ventaEfectivoCuadroElem.value = totalVentaEfectivo.toFixed(2);
        if (ventaTarjetaCuadroElem) ventaTarjetaCuadroElem.value = document.getElementById('total-venta-tarjeta')?.value || 0;
        if (motoristaCuadroElem) motoristaCuadroElem.value = document.getElementById('total-motorista')?.value || 0;
        if (totalCuadroElem) totalCuadroElem.value = document.getElementById('total-sistema')?.value || 0;

        const sobrante = (totalEncargado - totalSistema).toFixed(2);
        if (ventaEfectivoAdminElem) ventaEfectivoAdminElem.value = totalVentaEfectivo.toFixed(2);
        if (motoristaCuadroAdminElem) motoristaCuadroAdminElem.value = totalMotoristaAdmin.toFixed(2);
        if (gastosCuadroElem) gastosCuadroElem.value = (-totalGastos).toFixed(2);
        if (sobranteCuadroElem) sobranteCuadroElem.value = sobrante;

        const totalADepositar = (parseFloat(ventaEfectivoAdminElem.value) + parseFloat(motoristaCuadroAdminElem.value) + parseFloat(gastosCuadroElem.value) + parseFloat(sobranteCuadroElem.value)).toFixed(2);
        if (totalDepositarCuadroElem) totalDepositarCuadroElem.value = totalADepositar;
    }

    document.querySelectorAll("input[type='number'], input[type='checkbox']").forEach(element => {
        if (element) {
            element.addEventListener("input", updateTotals);
            element.addEventListener("change", updateTotals);
        }
    });

    const downloadPdfBtn = document.getElementById("download-cuadro-pdf");
    const downloadImgBtn = document.getElementById("download-cuadro-img");
    const downloadPagePdfBtn = document.getElementById("download-pdf");

    const generateFileName = () => {
        const sucursal = document.getElementById('nombre-sucursal').value || 'sucursal';
        const fechaHoy = document.getElementById('fecha-hoy').value;
        return `cuadre-${sucursal}-${fechaHoy}`;
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            const downloadButtons = document.getElementById('download-buttons');
            downloadButtons.style.display = 'none';
            html2canvas(document.querySelector("#cuadro-datos"), { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // Adjusted for A4 size
                pdf.save(`${generateFileName()}.pdf`);
                downloadButtons.style.display = 'block';
            });
        });
    }

    if (downloadImgBtn) {
        downloadImgBtn.addEventListener("click", () => {
            const downloadButtons = document.getElementById('download-buttons');
            downloadButtons.style.display = 'none';
            html2canvas(document.querySelector("#cuadro-datos"), { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `${generateFileName()}.png`;
                link.click();
                downloadButtons.style.display = 'block';
            });
        });
    }

    if (downloadPagePdfBtn) {
        downloadPagePdfBtn.addEventListener("click", () => {
            html2canvas(document.querySelector("#content"), { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // Adjusted for A4 size
                pdf.save(`cuadre-pagina-completa-${generateFileName()}.pdf`);
            });
        });
    }

    updateTotals();
});

function addGasto() {
    const tableBody = document.getElementById("gastos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" oninput="updateTotals()"></td>
        <td><input type="text" oninput="updateTotals()"></td>
        <td><input type="number" step="0.01" oninput="updateTotals()"></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}
