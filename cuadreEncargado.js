
document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf;

    // Inicializar ID de Cuadre
    let idCuadre = 1;
    document.getElementById('id-cuadre').value = idCuadre;

    const calculateTotal = (ids) => ids.reduce((total, id) => total + parseFloat(document.getElementById(id)?.value || 0), 0);

    window.updateTotals = function() {
        updateSistemaTotals();
        updateCajaTotals();
        updateGastos();
        updateDeposito();
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

        const total100 = calculateTotal(['caja1-100', 'caja2-100', 'caja3-100']);
        const total50 = calculateTotal(['caja1-50', 'caja2-50', 'caja3-50']);
        const total20 = calculateTotal(['caja1-20', 'caja2-20', 'caja3-20']);
        const total10 = calculateTotal(['caja1-10', 'caja2-10', 'caja3-10']);
        const total5 = calculateTotal(['caja1-5', 'caja2-5', 'caja3-5']);
        const total1 = calculateTotal(['caja1-1', 'caja2-1', 'caja3-1']);
        const totalApertura = calculateTotal(['caja1-apertura', 'caja2-apertura', 'caja3-apertura']);
        const totalEfectivo = calculateTotal(['caja1-total-efectivo', 'caja2-total-efectivo', 'caja3-total-efectivo']);
        const totalTarjeta = calculateTotal(['caja1-tarjeta-admin', 'caja2-tarjeta-admin', 'caja3-tarjeta-admin']);
        const totalMotoristaAdmin = calculateTotal(['caja1-motorista-admin', 'caja2-motorista-admin', 'caja3-motorista-admin']);
        const totalVentaCajero = calculateTotal(['caja1-total-venta-cajero', 'caja2-total-venta-cajero', 'caja3-total-venta-cajero']);

        document.getElementById('total-100').value = total100.toFixed(2);
        document.getElementById('total-50').value = total50.toFixed(2);
        document.getElementById('total-20').value = total20.toFixed(2);
        document.getElementById('total-10').value = total10.toFixed(2);
        document.getElementById('total-5').value = total5.toFixed(2);
        document.getElementById('total-1').value = total1.toFixed(2);
        document.getElementById('total-apertura').value = totalApertura.toFixed(2);
        document.getElementById('total-efectivo').value = totalEfectivo.toFixed(2);
        document.getElementById('total-tarjeta').value = totalTarjeta.toFixed(2);
        document.getElementById('total-motorista-admin').value = totalMotoristaAdmin.toFixed(2);
        document.getElementById('total-venta-cajero').value = totalVentaCajero.toFixed(2);
    }

    function updateGastos() {
        const filasGastos = Array.from(document.querySelectorAll("#gastos-tbody tr"));
        filasGastos.forEach(row => {
            const cantidad = parseFloat(row.querySelector("input[data-type='cantidad']")?.value || 0);
            const precioUnitario = parseFloat(row.querySelector("input[data-type='precio-unitario']")?.value || 0);
            const total = cantidad * precioUnitario;
            const totalElem = row.querySelector("input[data-type='total']");
            if (totalElem) totalElem.value = total.toFixed(2);
        });

        const totalGastos = filasGastos.reduce((total, row) => {
            const rowTotal = parseFloat(row.querySelector("input[data-type='total']")?.value || 0);
            return total + rowTotal;
        }, 0);
        document.getElementById('total-gastos').value = totalGastos.toFixed(2);
    }

    function updateDeposito() {
        const totalDepositarBanco = parseFloat(document.getElementById('total-venta-efectivo').value || 0)
            + parseFloat(document.getElementById('total-venta-tarjeta').value || 0)
            + parseFloat(document.getElementById('total-motorista').value || 0)
            - parseFloat(document.getElementById('total-gastos').value || 0)
            - parseFloat(document.getElementById('caja-chica-dia-siguiente').value || 0);
        document.getElementById('total-depositar-banco').value = totalDepositarBanco.toFixed(2);

        // Calcula la cantidad a depositar
        const totalEfectivo = calculateTotal(['caja1-total-efectivo', 'caja2-total-efectivo', 'caja3-total-efectivo']);
        const totalGastos = parseFloat(document.getElementById('total-gastos').value || 0);
        const cantidadADepositar = totalEfectivo - totalGastos;
        document.getElementById('cantidad-depositar').value = cantidadADepositar.toFixed(2);
    }

    function updateCuadroDatos() {
        const sucursal = document.getElementById('sucursal').value;
        const fechaCuadre = document.getElementById('fecha-cuadre').value;
        const idCuadre = document.getElementById('id-cuadre').value;
        const cajaChicaInicial = parseFloat(document.getElementById('caja-chica-inicial').value || 0);

        document.getElementById('nombre-sucursal-final').textContent = sucursal;
        document.getElementById('id-cuadre-final').value = idCuadre;
        document.getElementById('sucursal-final').value = sucursal;
        document.getElementById('fecha-hoy').value = fechaCuadre;
        document.getElementById('caja-chica-inicial-final').value = cajaChicaInicial;

        const totalEfectivo = calculateTotal(['caja1-total-efectivo', 'caja2-total-efectivo', 'caja3-total-efectivo']);
        const totalTarjeta = calculateTotal(['caja1-tarjeta-admin', 'caja2-tarjeta-admin', 'caja3-tarjeta-admin']);
        const totalDepositarBanco = parseFloat(document.getElementById('total-depositar-banco').value || 0);
        const cajaChicaDiaSiguiente = parseFloat(document.getElementById('caja-chica-dia-siguiente').value || 0);

        document.getElementById('total-efectivo-final').value = totalEfectivo.toFixed(2);
        document.getElementById('total-banco-final').value = totalTarjeta.toFixed(2);
        document.getElementById('total-depositar-banco-final').value = totalDepositarBanco.toFixed(2);
        document.getElementById('caja-chica-dia-siguiente-final').value = cajaChicaDiaSiguiente.toFixed(2);
    }

    document.querySelectorAll("input[type='number'], input[type='checkbox'], select, input[type='date']").forEach(element => {
        if (element) {
            element.addEventListener("input", updateTotals);
            element.addEventListener("change", updateTotals);
        }
    });

    const downloadPdfBtn = document.getElementById("download-cuadro-pdf");
    const downloadImgBtn = document.getElementById("download-cuadro-img");
    const downloadPagePdfBtn = document.getElementById("download-pdf");

    const generateFileName = () => {
        const sucursal = document.getElementById('nombre-sucursal-final').textContent || 'sucursal';
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

    const instruccionesBtn = document.getElementById('instrucciones-btn');
    const instruccionesTarjeta = document.getElementById('instrucciones-tarjeta');
    const cerrarInstrucciones = document.getElementById('cerrar-instrucciones');

    instruccionesBtn.addEventListener('click', () => {
        instruccionesTarjeta.style.display = 'block';
    });

    cerrarInstrucciones.addEventListener('click', () => {
        instruccionesTarjeta.style.display = 'none';
    });

    updateTotals();
});

function addGasto() {
    const tableBody = document.getElementById("gastos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="number" data-type="cantidad" step="0.01" oninput="updateTotals()"></td>
        <td><input type="text" oninput="updateTotals()"></td>
        <td><input type="text" oninput="updateTotals()"></td>
        <td><input type="number" data-type="precio-unitario" step="0.01" oninput="updateTotals()"></td>
        <td><input type="number" data-type="total" readonly></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}
