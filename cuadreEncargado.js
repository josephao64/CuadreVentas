document.addEventListener("DOMContentLoaded", async () => {
    const { jsPDF } = window.jspdf;
    const db = firebase.firestore();

    let idCuadre = 1;
    const idCuadreField = document.getElementById('id-cuadre');
    const idCuadreFinalField = document.getElementById('id-cuadre-final');
    const confirmarCuadreBtn = document.getElementById('confirmar-cuadre-btn');

    // Obtener sucursal desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const sucursal = urlParams.get('sucursal');
    if (!sucursal) {
        alert("Debe iniciar sesión para acceder a esta página.");
        window.location.href = "index.html"; // Redirigir a la página de inicio de sesión
        return;
    }

    document.getElementById('sucursal').value = sucursal;
    document.getElementById('sucursal-final').value = sucursal;
    document.getElementById('nombre-sucursal-final').textContent = sucursal;

    const fetchLatestIdCuadre = async () => {
        const snapshot = await db.collection("cuadres").orderBy("idCuadre", "desc").limit(1).get();
        if (!snapshot.empty) {
            const lastDoc = snapshot.docs[0];
            idCuadre = lastDoc.data().idCuadre + 1;
        } else {
            idCuadre = 1;
        }
        if (idCuadreField) idCuadreField.textContent = idCuadre;
        if (idCuadreFinalField) idCuadreFinalField.textContent = idCuadre;
    };

    await fetchLatestIdCuadre();

    const setDateToYesterday = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const yesterday = date.toISOString().split('T')[0];
        document.getElementById('fecha-cuadre').value = yesterday;
        document.getElementById('fecha-hoy').value = yesterday;
    };

    const resetForm = async () => {
        document.getElementById('sucursal').value = sucursal || "";
        document.getElementById('caja-chica-inicial').value = "";
        document.getElementById('fecha-cuadre').value = "";
        document.querySelectorAll("input[type='number']").forEach(input => input.value = "");
        await fetchLatestIdCuadre();
        setDateToYesterday();
        unlockAllFields();
    };

    setDateToYesterday();
    if (idCuadreField) idCuadreField.textContent = idCuadre;
    if (idCuadreFinalField) idCuadreFinalField.textContent = idCuadre;

    window.updateTotals = function() {
        updateCajaTotals();
        updateGastos();
        updatePedidos();
        updateDeposito();
        updateCuadroDatos();
    };

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

        setValue('total-100', total100);
        setValue('total-50', total50);
        setValue('total-20', total20);
        setValue('total-10', total10);
        setValue('total-5', total5);
        setValue('total-1', total1);
        setValue('total-apertura', totalApertura);
        setValue('total-efectivo', totalEfectivo);
        setValue('total-tarjeta', totalTarjeta);
        setValue('total-motorista-admin', totalMotoristaAdmin);
        setValue('total-venta-cajero', totalVentaCajero);
    }

    function calculateTotal(ids) {
        return ids.reduce((sum, id) => sum + parseFloat(document.getElementById(id)?.value || 0), 0);
    }

    function setValue(id, value) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.value = parseFloat(value).toFixed(2);
        }
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

        const totalGastos = filasGastos.reduce((sum, row) => {
            const rowTotal = parseFloat(row.querySelector("input[data-type='total']")?.value || 0);
            return sum + rowTotal;
        }, 0);
        setValue('total-gastos', totalGastos);
    }

    function updatePedidos() {
        const filasPedidos = Array.from(document.querySelectorAll("#pedidos-tbody tr"));
        filasPedidos.forEach(row => {
            const total = parseFloat(row.querySelector("input[data-type='total-pedido']")?.value || 0);
            const totalElem = row.querySelector("input[data-type='total-pedido']");
            if (totalElem) totalElem.value = total.toFixed(2);
        });

        const totalPedidos = filasPedidos.reduce((sum, row) => {
            const rowTotal = parseFloat(row.querySelector("input[data-type='total-pedido']")?.value || 0);
            return sum + rowTotal;
        }, 0);
        setValue('total-pedidos', totalPedidos);
        setValue('total-pedidos-final', totalPedidos);
    }

    function updateDeposito() {
        const totalEfectivoElems = ['caja1-total-efectivo', 'caja2-total-efectivo', 'caja3-total-efectivo'];
        const totalGastosElem = document.getElementById('total-gastos');
        const totalPedidosElem = document.getElementById('total-pedidos');
        const cajaChicaDiaSiguienteElem = document.getElementById('caja-chica-dia-siguiente');
        const cantidadDepositarElem = document.getElementById('cantidad-depositar');

        const totalEfectivo = calculateTotal(totalEfectivoElems);
        const totalGastos = parseFloat(totalGastosElem?.value || 0);
        const totalPedidos = parseFloat(totalPedidosElem?.value || 0);
        const cantidadADepositar = totalEfectivo - totalGastos - totalPedidos;
        setValue('cantidad-depositar', cantidadADepositar);

        const totalTarjeta = calculateTotal(['caja1-tarjeta-admin', 'caja2-tarjeta-admin', 'caja3-tarjeta-admin']);
        const totalMotorista = calculateTotal(['caja1-motorista-admin', 'caja2-motorista-admin', 'caja3-motorista-admin']);
        const totalDepositarBanco = (totalEfectivo + totalTarjeta + totalMotorista) - totalGastos - totalPedidos - parseFloat(cajaChicaDiaSiguienteElem?.value || 0);
        setValue('total-depositar-banco-final', totalDepositarBanco);
    }

    function updateCuadroDatos() {
        const sucursal = document.getElementById('sucursal').value;
        const fechaCuadre = document.getElementById('fecha-cuadre').value;
        const idCuadre = document.getElementById('id-cuadre').textContent;
        const cajaChicaInicial = parseFloat(document.getElementById('caja-chica-inicial').value || 0);

        setTextContent('nombre-sucursal-final', sucursal);
        setTextContent('id-cuadre-final', idCuadre);
        setValue('sucursal-final', sucursal);
        setValue('fecha-hoy', fechaCuadre);
        setValue('caja-chica-inicial-final', cajaChicaInicial);

        const totalEfectivo = calculateTotal(['caja1-total-efectivo', 'caja2-total-efectivo', 'caja3-total-efectivo']);
        const totalTarjeta = calculateTotal(['caja1-tarjeta-admin', 'caja2-tarjeta-admin', 'caja3-tarjeta-admin']);
        const totalDepositarBanco = parseFloat(document.getElementById('total-depositar-banco-final').value || 0);
        const totalPedidos = parseFloat(document.getElementById('total-pedidos-final').value || 0);
        const cajaChicaDiaSiguiente = parseFloat(document.getElementById('caja-chica-dia-siguiente').value || 0);

        setValue('total-efectivo-final', totalEfectivo);
        setValue('total-banco-final', totalTarjeta);
        setValue('total-depositar-banco-final', totalDepositarBanco);
        setValue('total-pedidos-final', totalPedidos);
        setValue('caja-chica-dia-siguiente-final', cajaChicaDiaSiguiente);
    }

    function setTextContent(id, text) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.textContent = text;
        }
    }

    const checkEmptyFields = () => {
        const requiredFields = document.querySelectorAll("#cuadre-content input[required], #cuadre-content select[required]");
        let allFieldsFilled = true;
        requiredFields.forEach(field => {
            if (!field.value) {
                allFieldsFilled = false;
                field.style.borderColor = "red";
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                field.style.borderColor = "";
            }
        });
        return allFieldsFilled;
    };

    document.querySelectorAll("input[type='number'], input[type='checkbox'], select, input[type='date']").forEach(element => {
        if (element) {
            element.addEventListener("input", updateTotals);
            element.addEventListener("change", updateTotals);
        }
    });

    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                const form = input.form;
                const index = Array.prototype.indexOf.call(form, input);
                form.elements[index + 1].focus();
            }
        });
    });

    const downloadImgBtn = document.getElementById("guardar-cuadro-datos");
    const compartirImgBtn = document.getElementById("compartir-cuadro-datos");

    const generateFileName = () => {
        const sucursal = document.getElementById('nombre-sucursal-final').textContent || 'sucursal';
        const fechaHoy = document.getElementById('fecha-hoy').value;
        return `cuadre-${sucursal}-${fechaHoy}`;
    };

    if (downloadImgBtn) {
        downloadImgBtn.addEventListener("click", () => {
            if (!checkEmptyFields()) {
                alert("Por favor, complete todos los campos antes de descargar.");
                return;
            }
            const downloadButtons = document.getElementById('download-buttons');
            if (downloadButtons) downloadButtons.style.display = 'none';
            html2canvas(document.querySelector("#cuadro-datos"), { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `${generateFileName()}.png`;
                link.click();
                if (downloadButtons) downloadButtons.style.display = 'block';
            });
        });
    }

    if (compartirImgBtn) {
        compartirImgBtn.addEventListener("click", () => {
            if (!checkEmptyFields()) {
                alert("Por favor, complete todos los campos antes de compartir.");
                return;
            }
            const downloadButtons = document.getElementById('download-buttons');
            if (downloadButtons) downloadButtons.style.display = 'none';
            html2canvas(document.querySelector("#cuadro-datos"), { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `${generateFileName()}.png`;
                link.click();
                // Aquí se puede agregar código adicional para compartir la imagen
                if (downloadButtons) downloadButtons.style.display = 'block';
            });
        });
    }

    const instruccionesInfoBtn = document.getElementById('instrucciones-info-btn');
    const instruccionesCajaBtn = document.getElementById('instrucciones-caja-btn');
    const instruccionesGastosBtn = document.getElementById('instrucciones-gastos-btn');
    const instruccionesPedidosBtn = document.getElementById('instrucciones-pedidos-btn');
    const instruccionesInfoTarjeta = document.getElementById('instrucciones-tarjeta-info');
    const instruccionesCajaTarjeta = document.getElementById('instrucciones-tarjeta-caja');
    const instruccionesGastosTarjeta = document.getElementById('instrucciones-tarjeta-gastos');
    const instruccionesPedidosTarjeta = document.getElementById('instrucciones-tarjeta-pedidos');
    const cerrarInstruccionesInfo = document.getElementById('cerrar-instrucciones-info');
    const cerrarInstruccionesCaja = document.getElementById('cerrar-instrucciones-caja');
    const cerrarInstruccionesGastos = document.getElementById('cerrar-instrucciones-gastos');
    const cerrarInstruccionesPedidos = document.getElementById('cerrar-instrucciones-pedidos');

    instruccionesInfoBtn.addEventListener('click', () => {
        instruccionesInfoTarjeta.style.display = 'block';
    });

    instruccionesCajaBtn.addEventListener('click', () => {
        instruccionesCajaTarjeta.style.display = 'block';
    });

    instruccionesGastosBtn.addEventListener('click', () => {
        instruccionesGastosTarjeta.style.display = 'block';
    });

    instruccionesPedidosBtn.addEventListener('click', () => {
        instruccionesPedidosTarjeta.style.display = 'block';
    });

    cerrarInstruccionesInfo.addEventListener('click', () => {
        instruccionesInfoTarjeta.style.display = 'none';
    });

    cerrarInstruccionesCaja.addEventListener('click', () => {
        instruccionesCajaTarjeta.style.display = 'none';
    });

    cerrarInstruccionesGastos.addEventListener('click', () => {
        instruccionesGastosTarjeta.style.display = 'none';
    });

    cerrarInstruccionesPedidos.addEventListener('click', () => {
        instruccionesPedidosTarjeta.style.display = 'none';
    });

    document.getElementById('realizar-cuadre-btn').addEventListener('click', async () => {
        await resetForm();
        document.getElementById('cuadre-content').style.display = 'block';
        document.getElementById('cuadres-realizados-content').style.display = 'none';
        const actionButtons = document.getElementById('action-buttons');
        if (actionButtons) actionButtons.style.display = 'none';
    });

    document.getElementById('cuadres-realizados-btn').addEventListener('click', async () => {
        document.getElementById('cuadre-content').style.display = 'none';
        document.getElementById('cuadres-realizados-content').style.display = 'block';
        const cuadresTarjetas = document.getElementById('cuadres-tarjetas');
        cuadresTarjetas.innerHTML = '';
        const querySnapshot = await db.collection("cuadres").where("sucursal", "==", sucursal).get();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'cuadre-card';
            card.innerHTML = `
                <h3>ID Cuadre: ${data.idCuadre} - ${data.sucursal}</h3>
                <p>Fecha: ${data.fechaCuadre}</p>
                <p>Total Efectivo: ${data.totalEfectivo}</p>
                <p>Total Banco: ${data.totalTarjeta}</p>
                <p>Total Motorista: ${data.totalMotoristaAdmin}</p>
                <p>Total Pedidos Ya: ${data.totalPedidos}</p>
                <button onclick="mostrarCuadre('${doc.id}')">Mostrar Cuadre</button>
                <button onclick="eliminarCuadre('${doc.id}')">Eliminar Cuadre</button>
                <button onclick="descargarCuadro('${doc.id}')">Descargar Cuadro de Datos</button>
            `;
            cuadresTarjetas.appendChild(card);
        });
    });

    document.getElementById('guardar-cuadre').addEventListener('click', () => {
        if (!checkEmptyFields()) {
            alert("Por favor, complete todos los campos antes de guardar.");
            return;
        }
        document.getElementById('confirmar-cuadre').style.display = 'block';
    });

    document.getElementById('cerrar-confirmar-cuadre-btn').addEventListener('click', () => {
        document.getElementById('confirmar-cuadre').style.display = 'none';
        confirmarCuadreBtn.style.display = 'inline-block';
    });

    confirmarCuadreBtn.addEventListener('click', async () => {
        const data = {
            idCuadre: parseInt(document.getElementById('id-cuadre').textContent),
            sucursal: document.getElementById('sucursal').value,
            cajaChicaInicial: document.getElementById('caja-chica-inicial').value,
            fechaCuadre: document.getElementById('fecha-cuadre').value,
            caja1_100: document.getElementById('caja1-100').value,
            caja1_50: document.getElementById('caja1-50').value,
            caja1_20: document.getElementById('caja1-20').value,
            caja1_10: document.getElementById('caja1-10').value,
            caja1_5: document.getElementById('caja1-5').value,
            caja1_1: document.getElementById('caja1-1').value,
            caja1_apertura: document.getElementById('caja1-apertura').value,
            caja1_total_efectivo: document.getElementById('caja1-total-efectivo').value,
            caja1_tarjeta_admin: document.getElementById('caja1-tarjeta-admin').value,
            caja1_motorista_admin: document.getElementById('caja1-motorista-admin').value,
            caja1_total_venta_cajero: document.getElementById('caja1-total-venta-cajero').value,
            caja2_100: document.getElementById('caja2-100').value,
            caja2_50: document.getElementById('caja2-50').value,
            caja2_20: document.getElementById('caja2-20').value,
            caja2_10: document.getElementById('caja2-10').value,
            caja2_5: document.getElementById('caja2-5').value,
            caja2_1: document.getElementById('caja2-1').value,
            caja2_apertura: document.getElementById('caja2-apertura').value,
            caja2_total_efectivo: document.getElementById('caja2-total-efectivo').value,
            caja2_tarjeta_admin: document.getElementById('caja2-tarjeta-admin').value,
            caja2_motorista_admin: document.getElementById('caja2-motorista-admin').value,
            caja2_total_venta_cajero: document.getElementById('caja2-total-venta-cajero').value,
            caja3_100: document.getElementById('caja3-100').value,
            caja3_50: document.getElementById('caja3-50').value,
            caja3_20: document.getElementById('caja3-20').value,
            caja3_10: document.getElementById('caja3-10').value,
            caja3_5: document.getElementById('caja3-5').value,
            caja3_1: document.getElementById('caja3-1').value,
            caja3_apertura: document.getElementById('caja3-apertura').value,
            caja3_total_efectivo: document.getElementById('caja3-total-efectivo').value,
            caja3_tarjeta_admin: document.getElementById('caja3-tarjeta-admin').value,
            caja3_motorista_admin: document.getElementById('caja3-motorista-admin').value,
            caja3_total_venta_cajero: document.getElementById('caja3-total-venta-cajero').value,
            total100: document.getElementById('total-100').value,
            total50: document.getElementById('total-50').value,
            total20: document.getElementById('total-20').value,
            total10: document.getElementById('total-10').value,
            total5: document.getElementById('total-5').value,
            total1: document.getElementById('total-1').value,
            totalApertura: document.getElementById('total-apertura').value,
            totalEfectivo: document.getElementById('total-efectivo').value,
            totalTarjeta: document.getElementById('total-tarjeta').value,
            totalMotoristaAdmin: document.getElementById('total-motorista-admin').value,
            totalVentaCajero: document.getElementById('total-venta-cajero').value,
            totalGastos: document.getElementById('total-gastos').value,
            totalDepositarBanco: document.getElementById('total-depositar-banco-final').value,
            cajaChicaDiaSiguiente: document.getElementById('caja-chica-dia-siguiente').value,
            cantidadDepositar: document.getElementById('cantidad-depositar').value,
            totalPedidos: document.getElementById('total-pedidos').value,
            pedidosYa: []
        };

        const filasPedidos = document.querySelectorAll("#pedidos-tbody tr");
        filasPedidos.forEach(row => {
            const ticket = row.querySelector("input[data-type='ticket']")?.value || "";
            const totalPedido = parseFloat(row.querySelector("input[data-type='total-pedido']")?.value || 0);
            if (ticket && totalPedido) {
                data.pedidosYa.push({ ticket, totalPedido });
            }
        });

        await db.collection("cuadres").add(data);
        alert('Cuadre guardado con éxito');
        document.getElementById('confirmar-cuadre').style.display = 'none';
        document.getElementById('guardar-compartir-buttons').style.display = 'block';
        updateCuadroDatos();
    });

    document.getElementById('cerrar-guardar-compartir').addEventListener('click', () => {
        document.getElementById('guardar-compartir-buttons').style.display = 'none';
        document.getElementById('cuadre-content').style.display = 'none';
        document.getElementById('cuadres-realizados-content').style.display = 'block';
    });

    window.mostrarCuadre = async (id) => {
        const docRef = db.collection("cuadres").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            setTextContent('id-cuadre', data.idCuadre);
            setValue('sucursal', data.sucursal);
            setValue('caja-chica-inicial', data.cajaChicaInicial);
            setValue('fecha-cuadre', data.fechaCuadre);
            setValue('caja1-100', data.caja1_100);
            setValue('caja1-50', data.caja1_50);
            setValue('caja1-20', data.caja1_20);
            setValue('caja1-10', data.caja1_10);
            setValue('caja1-5', data.caja1_5);
            setValue('caja1-1', data.caja1_1);
            setValue('caja1-apertura', data.caja1_apertura);
            setValue('caja1-total-efectivo', data.caja1_total_efectivo);
            setValue('caja1-tarjeta-admin', data.caja1_tarjeta_admin);
            setValue('caja1-motorista-admin', data.caja1_motorista_admin);
            setValue('caja1-total-venta-cajero', data.caja1_total_venta_cajero);
            setValue('caja2-100', data.caja2_100);
            setValue('caja2-50', data.caja2_50);
            setValue('caja2-20', data.caja2_20);
            setValue('caja2-10', data.caja2_10);
            setValue('caja2-5', data.caja2_5);
            setValue('caja2-1', data.caja2_1);
            setValue('caja2-apertura', data.caja2_apertura);
            setValue('caja2-total-efectivo', data.caja2_total_efectivo);
            setValue('caja2-tarjeta-admin', data.caja2_tarjeta_admin);
            setValue('caja2-motorista-admin', data.caja2_motorista_admin);
            setValue('caja2-total-venta-cajero', data.caja2_total_venta_cajero);
            setValue('caja3-100', data.caja3_100);
            setValue('caja3-50', data.caja3_50);
            setValue('caja3-20', data.caja3_20);
            setValue('caja3-10', data.caja3_10);
            setValue('caja3-5', data.caja3_5);
            setValue('caja3-1', data.caja3_1);
            setValue('caja3-apertura', data.caja3_apertura);
            setValue('caja3-total-efectivo', data.caja3_total_efectivo);
            setValue('caja3-tarjeta-admin', data.caja3_tarjeta_admin);
            setValue('caja3-motorista-admin', data.caja3_motorista_admin);
            setValue('caja3-total-venta-cajero', data.caja3_total_venta_cajero);
            setValue('total-100', data.total100);
            setValue('total-50', data.total50);
            setValue('total-20', data.total20);
            setValue('total-10', data.total10);
            setValue('total-5', data.total5);
            setValue('total-1', data.total1);
            setValue('total-apertura', data.totalApertura);
            setValue('total-efectivo', data.totalEfectivo);
            setValue('total-tarjeta', data.totalTarjeta);
            setValue('total-motorista-admin', data.totalMotoristaAdmin);
            setValue('total-venta-cajero', data.totalVentaCajero);
            setValue('total-gastos', data.totalGastos);
            setValue('total-depositar-banco-final', data.totalDepositarBanco);
            setValue('total-pedidos', data.totalPedidos);
            setValue('caja-chica-dia-siguiente', data.cajaChicaDiaSiguiente);
            setValue('cantidad-depositar', data.cantidadDepositar);

            // Update cuadro-datos fields
            setValue('sucursal-final', data.sucursal);
            setValue('fecha-hoy', data.fechaCuadre);
            setValue('caja-chica-inicial-final', data.cajaChicaInicial);
            setValue('total-efectivo-final', data.totalEfectivo);
            setValue('total-banco-final', data.totalTarjeta);
            setValue('total-depositar-banco-final', data.totalDepositarBanco);
            setValue('total-pedidos-final', data.totalPedidos);
            setValue('caja-chica-dia-siguiente-final', data.cajaChicaDiaSiguiente);
            setValue('cantidad-depositar', data.cantidadDepositar);

            document.getElementById('cuadre-content').style.display = 'block';
            document.getElementById('cuadres-realizados-content').style.display = 'none';
            const actionButtons = document.getElementById('action-buttons');
            if (actionButtons) actionButtons.style.display = 'block';
            lockAllFields();
        } else {
            console.log("No such document!");
        }
    };

    window.cuadrarCuadre = async (id) => {
        await mostrarCuadre(id);
    };

    window.eliminarCuadre = async (id) => {
        if (confirm("¿Está seguro de que desea eliminar este cuadre?")) {
            await db.collection("cuadres").doc(id).delete();
            alert("Cuadre eliminado con éxito");
            document.getElementById('cuadres-realizados-btn').click();
        }
    };

    window.descargarCuadro = async (id) => {
        await mostrarCuadre(id);
        html2canvas(document.querySelector("#cuadro-datos"), { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `cuadre-${id}.png`;
            link.click();
        });
    };

    const lockAllFields = () => {
        document.querySelectorAll("input, select").forEach(element => {
            if (element.type !== "button" && element.type !== "checkbox") {
                element.setAttribute('readonly', true);
                element.setAttribute('disabled', true);
            }
        });
    };

    const unlockAllFields = () => {
        document.querySelectorAll("input, select").forEach(element => {
            element.removeAttribute('readonly');
            element.removeAttribute('disabled');
        });
    };

    document.getElementById('cerrar-cuadre').addEventListener('click', () => {
        document.getElementById('cuadre-content').style.display = 'none';
        document.getElementById('cuadres-realizados-content').style.display = 'block';
    });
});

function addGasto() {
    const tableBody = document.getElementById("gastos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="number" data-type="cantidad" step="0.01" oninput="updateTotals()" required></td>
        <td><input type="text" data-type="descripcion" oninput="updateTotals()" required></td>
        <td><input type="text" data-type="factura" oninput="updateTotals()" required></td>
        <td><input type="number" data-type="precio-unitario" step="0.01" oninput="updateTotals()" required></td>
        <td><input type="number" data-type="total" readonly></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}

function addPedido() {
    const tableBody = document.getElementById("pedidos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" data-type="ticket" required></td>
        <td><input type="number" data-type="total-pedido" step="0.01" required></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}
