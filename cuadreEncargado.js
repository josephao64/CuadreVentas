document.addEventListener("DOMContentLoaded", async () => {
    const { jsPDF } = window.jspdf; // Importar jsPDF
    const db = firebase.firestore(); // Inicializar Firestore

    let idCuadre = 1; // Inicializar ID de cuadre
    const idCuadreField = document.getElementById('id-cuadre'); // Elemento del ID de cuadre
    const idCuadreFinalField = document.getElementById('id-cuadre-final'); // Elemento del ID de cuadre final
    const confirmarCuadreBtn = document.getElementById('confirmar-cuadre-btn'); // Botón para confirmar el cuadre

    // Obtener sucursal desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const sucursal = urlParams.get('sucursal');
    if (!sucursal) {
        alert("Debe iniciar sesión para acceder a esta página.");
        window.location.href = "index.html"; // Redirigir a la página de inicio de sesión
        return;
    }

    document.getElementById('sucursal').value = sucursal;
    document.getElementById('nombre-sucursal-final').textContent = `${sucursal} - ${new Date().toISOString().split('T')[0]}`;

    // Obtener el último ID de cuadre de Firestore
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

    await fetchLatestIdCuadre(); // Llamar a la función para obtener el último ID de cuadre

    // Establecer la fecha al día de hoy
    const setDateToToday = () => {
        const date = new Date();
        const today = date.toISOString().split('T')[0];
        document.getElementById('fecha-cuadre').value = today;
        document.getElementById('fecha-cuadre-final').value = today;
    };

    // Restablecer el formulario
    const resetForm = async () => {
        document.getElementById('sucursal').value = sucursal || "";
        document.getElementById('caja-chica-inicial').value = "";
        document.querySelectorAll("input[type='number']").forEach(input => input.value = "");
        await fetchLatestIdCuadre();
        setDateToToday();
        unlockAllFields();
    };

    setDateToToday(); // Establecer la fecha al día de hoy
    if (idCuadreField) idCuadreField.textContent = idCuadre;
    if (idCuadreFinalField) idCuadreFinalField.textContent = idCuadre;

    // Función para actualizar todos los totales
    window.updateTotals = function() {
        updateCajaTotals();
        updateGastos();
        updateDeposito();
        updateCuadroDatos();
    };

    // Función para actualizar los totales de la caja
    function updateCajaTotals() {
        for (let i = 1; i <= 3; i++) {
            const totalEfectivo = calculateTotal([
                { id: `caja${i}-100`, multiplier: 100 },
                { id: `caja${i}-50`, multiplier: 50 },
                { id: `caja${i}-20`, multiplier: 20 },
                { id: `caja${i}-10`, multiplier: 10 },
                { id: `caja${i}-5`, multiplier: 5 },
                { id: `caja${i}-1`, multiplier: 1 }
            ]) - parseFloat(document.getElementById(`caja${i}-apertura`)?.value || 0);
            const totalEfectivoElem = document.getElementById(`caja${i}-total-efectivo`);
            const totalVentaCajeroElem = document.getElementById(`caja${i}-total-venta-cajero`);
            if (totalEfectivoElem) totalEfectivoElem.value = totalEfectivo.toFixed(2);
            if (totalVentaCajeroElem) totalVentaCajeroElem.value = (totalEfectivo +
                parseFloat(document.getElementById(`caja${i}-tarjeta-admin`)?.value || 0) +
                parseFloat(document.getElementById(`caja${i}-motorista-admin`)?.value || 0)).toFixed(2);
        }

        const total100 = calculateTotal([{ id: 'caja1-100', multiplier: 100 }, { id: 'caja2-100', multiplier: 100 }, { id: 'caja3-100', multiplier: 100 }]);
        const total50 = calculateTotal([{ id: 'caja1-50', multiplier: 50 }, { id: 'caja2-50', multiplier: 50 }, { id: 'caja3-50', multiplier: 50 }]);
        const total20 = calculateTotal([{ id: 'caja1-20', multiplier: 20 }, { id: 'caja2-20', multiplier: 20 }, { id: 'caja3-20', multiplier: 20 }]);
        const total10 = calculateTotal([{ id: 'caja1-10', multiplier: 10 }, { id: 'caja2-10', multiplier: 10 }, { id: 'caja3-10', multiplier: 10 }]);
        const total5 = calculateTotal([{ id: 'caja1-5', multiplier: 5 }, { id: 'caja2-5', multiplier: 5 }, { id: 'caja3-5', multiplier: 5 }]);
        const total1 = calculateTotal([{ id: 'caja1-1', multiplier: 1 }, { id: 'caja2-1', multiplier: 1 }, { id: 'caja3-1', multiplier: 1 }]);
        const totalApertura = calculateTotal([{ id: 'caja1-apertura' }, { id: 'caja2-apertura' }, { id: 'caja3-apertura' }]);
        const totalEfectivo = calculateTotal([{ id: 'caja1-total-efectivo' }, { id: 'caja2-total-efectivo' }, { id: 'caja3-total-efectivo' }]);
        const totalTarjeta = calculateTotal([{ id: 'caja1-tarjeta-admin' }, { id: 'caja2-tarjeta-admin' }, { id: 'caja3-tarjeta-admin' }]);
        const totalMotoristaAdmin = calculateTotal([{ id: 'caja1-motorista-admin' }, { id: 'caja2-motorista-admin' }, { id: 'caja3-motorista-admin' }]);
        const totalVentaCajero = calculateTotal([{ id: 'caja1-total-venta-cajero' }, { id: 'caja2-total-venta-cajero' }, { id: 'caja3-total-venta-cajero' }]);

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

    // Función para calcular el total de los campos numéricos
    function calculateTotal(fields) {
        return fields.reduce((sum, field) => {
            const value = parseFloat(document.getElementById(field.id)?.value || 0);
            return sum + (value * (field.multiplier || 1));
        }, 0);
    }

    // Función para establecer el valor de un campo
    function setValue(id, value) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.value = parseFloat(value).toFixed(2);
        }
    }

    // Función para actualizar los totales de los gastos
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
        setValue('total-gastos-final', totalGastos);
    }

    // Función para actualizar el total a depositar
    function updateDeposito() {
        const totalEfectivoElems = ['caja1-total-efectivo', 'caja2-total-efectivo', 'caja3-total-efectivo'];
        const totalMotoristaElems = ['caja1-motorista-admin', 'caja2-motorista-admin', 'caja3-motorista-admin'];
        const totalGastosElem = document.getElementById('total-gastos');
        const totalPedidosElem = document.getElementById('total-pedidos');
        const debeAyerElem = document.getElementById('debe-ayer');

        const totalEfectivo = calculateTotal(totalEfectivoElems);
        const totalMotorista = calculateTotal(totalMotoristaElems);
        const totalGastos = parseFloat(totalGastosElem?.value || 0);
        const totalPedidos = parseFloat(totalPedidosElem?.value || 0);
        const cajaChicaDiaSiguiente = calculateTotal([{ id: 'caja1-apertura' }, { id: 'caja2-apertura' }, { id: 'caja3-apertura' }]);
        const cantidadADepositar = totalEfectivo - totalGastos + (parseFloat(debeAyerElem?.value || 0));

        setValue('cantidad-depositar', cantidadADepositar);
        setValue('total-efectivo-completo', totalEfectivo);
        setValue('total-depositar-banco-final', cantidadADepositar);
    }

    // Función para actualizar los datos del cuadro final
    function updateCuadroDatos() {
        const sucursal = document.getElementById('sucursal').value;
        const fechaCuadre = document.getElementById('fecha-cuadre').value;
        const idCuadre = document.getElementById('id-cuadre').textContent;
        const cajaChicaInicial = parseFloat(document.getElementById('caja-chica-inicial').value || 0);

        setTextContent('nombre-sucursal-final', `${sucursal} - ${fechaCuadre}`);
        setTextContent('id-cuadre-final', idCuadre);
        setValue('fecha-cuadre-final', fechaCuadre);
        setValue('caja-chica-inicial-final', cajaChicaInicial);

        const totalEfectivo = calculateTotal([{ id: 'caja1-total-efectivo' }, { id: 'caja2-total-efectivo' }, { id: 'caja3-total-efectivo' }]);
        const totalMotorista = calculateTotal([{ id: 'caja1-motorista-admin' }, { id: 'caja2-motorista-admin' }, { id: 'caja3-motorista-admin' }]);
        const totalTarjeta = calculateTotal([{ id: 'caja1-tarjeta-admin' }, { id: 'caja2-tarjeta-admin' }, { id: 'caja3-tarjeta-admin' }]);
        const totalPedidos = parseFloat(document.getElementById('total-pedidos').value || 0);
        const totalVenta = totalEfectivo + totalTarjeta;
        const totalGastos = parseFloat(document.getElementById('total-gastos').value || 0);
        const cajaChicaDiaSiguiente = calculateTotal([{ id: 'caja1-apertura' }, { id: 'caja2-apertura' }, { id: 'caja3-apertura' }]);
        const debeAyer = parseFloat(document.getElementById('debe-ayer').value || 0);
        const totalADepositar = totalEfectivo - totalGastos + debeAyer;

        setValue('total-efectivo-final', totalEfectivo);
        setValue('total-motorista-final', totalMotorista);
        setValue('total-tarjeta-final', totalTarjeta);
        setValue('total-efectivo-completo', totalEfectivo);
        setValue('total-tarjeta-completo', totalTarjeta);
        setValue('total-venta-final', totalVenta);
        setValue('total-gastos-final', totalGastos);
        setValue('caja-chica-dia-siguiente', cajaChicaDiaSiguiente);
        setValue('debe-ayer', debeAyer);
        setValue('total-depositar-banco-final', totalADepositar);
    }

    // Función para establecer el contenido de texto de un elemento
    function setTextContent(id, text) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.textContent = text;
        }
    }

    // Función para verificar si todos los campos requeridos están completos
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

    // Agregar eventos para actualizar los totales al cambiar los valores de los campos
    document.querySelectorAll("input[type='number'], input[type='checkbox'], select, input[type='date']").forEach(element => {
        if (element) {
            element.addEventListener("input", updateTotals);
            element.addEventListener("change", updateTotals);
        }
    });

    // Mover al siguiente campo al presionar Enter
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

    // Generar nombre de archivo
    const generateFileName = () => {
        const sucursal = document.getElementById('nombre-sucursal-final').textContent || 'sucursal';
        const fechaHoy = new Date().toISOString().split('T')[0];
        return `cuadre-${sucursal}-${fechaHoy}`;
    };

    // Descargar imagen del cuadro de datos
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

    // Compartir imagen del cuadro de datos
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

    // Mostrar y ocultar instrucciones
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

    // Mostrar contenido de cuadre
    document.getElementById('realizar-cuadre-btn').addEventListener('click', async () => {
        await resetForm();
        document.getElementById('cuadre-content').style.display = 'block';
        document.getElementById('cuadres-realizados-content').style.display = 'none';
        const actionButtons = document.getElementById('action-buttons');
        if (actionButtons) actionButtons.style.display = 'none';
    });

    // Mostrar contenido de cuadres realizados
    document.getElementById('cuadres-realizados-btn').addEventListener('click', async () => {
        document.getElementById('cuadre-content').style.display = 'none';
        document.getElementById('cuadres-realizados-content').style.display = 'block';
        await mostrarCuadresRealizados();
    });

    // Guardar cuadre
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
        const getFieldValue = (id) => document.getElementById(id)?.value || "";

        const data = {
            idCuadre: parseInt(document.getElementById('id-cuadre').textContent),
            sucursal: getFieldValue('sucursal'),
            cajaChicaInicial: getFieldValue('caja-chica-inicial'),
            fechaCuadre: getFieldValue('fecha-cuadre'),
            caja1_100: getFieldValue('caja1-100'),
            caja1_50: getFieldValue('caja1-50'),
            caja1_20: getFieldValue('caja1-20'),
            caja1_10: getFieldValue('caja1-10'),
            caja1_5: getFieldValue('caja1-5'),
            caja1_1: getFieldValue('caja1-1'),
            caja1_apertura: getFieldValue('caja1-apertura'),
            caja1_total_efectivo: getFieldValue('caja1-total-efectivo'),
            caja1_tarjeta_admin: getFieldValue('caja1-tarjeta-admin'),
            caja1_motorista_admin: getFieldValue('caja1-motorista-admin'),
            caja1_total_venta_cajero: getFieldValue('caja1-total-venta-cajero'),
            caja2_100: getFieldValue('caja2-100'),
            caja2_50: getFieldValue('caja2-50'),
            caja2_20: getFieldValue('caja2-20'),
            caja2_10: getFieldValue('caja2-10'),
            caja2_5: getFieldValue('caja2-5'),
            caja2_1: getFieldValue('caja2-1'),
            caja2_apertura: getFieldValue('caja2-apertura'),
            caja2_total_efectivo: getFieldValue('caja2-total-efectivo'),
            caja2_tarjeta_admin: getFieldValue('caja2-tarjeta-admin'),
            caja2_motorista_admin: getFieldValue('caja2-motorista-admin'),
            caja2_total_venta_cajero: getFieldValue('caja2-total-venta-cajero'),
            caja3_100: getFieldValue('caja3-100'),
            caja3_50: getFieldValue('caja3-50'),
            caja3_20: getFieldValue('caja3-20'),
            caja3_10: getFieldValue('caja3-10'),
            caja3_5: getFieldValue('caja3-5'),
            caja3_1: getFieldValue('caja3-1'),
            caja3_apertura: getFieldValue('caja3-apertura'),
            caja3_total_efectivo: getFieldValue('caja3-total-efectivo'),
            caja3_tarjeta_admin: getFieldValue('caja3-tarjeta-admin'),
            caja3_motorista_admin: getFieldValue('caja3-motorista-admin'),
            caja3_total_venta_cajero: getFieldValue('caja3-total-venta-cajero'),
            total100: getFieldValue('total-100'),
            total50: getFieldValue('total-50'),
            total20: getFieldValue('total-20'),
            total10: getFieldValue('total-10'),
            total5: getFieldValue('total-5'),
            total1: getFieldValue('total-1'),
            totalApertura: getFieldValue('total-apertura'),
            totalEfectivo: getFieldValue('total-efectivo'),
            totalTarjeta: getFieldValue('total-tarjeta'),
            totalMotoristaAdmin: getFieldValue('total-motorista-admin'),
            totalVentaCajero: getFieldValue('total-venta-cajero'),
            totalGastos: getFieldValue('total-gastos'),
            totalDepositarBanco: getFieldValue('total-depositar-banco-final'),
            cajaChicaDiaSiguiente: getFieldValue('caja-chica-dia-siguiente'),
            cantidadDepositar: getFieldValue('cantidad-depositar'),
            totalPedidos: getFieldValue('total-pedidos'),
            debeAyer: getFieldValue('debe-ayer'),
            pedidosYa: []
        };

        // Guardar datos en Firestore
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
        mostrarCuadresRealizados();
    });

    // Mostrar datos de un cuadre específico
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
            setValue('debe-ayer', data.debeAyer);
            setValue('cantidad-depositar', data.cantidadDepositar);

            // Update cuadro-datos fields
            setValue('fecha-cuadre-final', data.fechaCuadre);
            setValue('total-efectivo-final', data.totalEfectivo);
            setValue('total-motorista-final', data.totalMotoristaAdmin);
            setValue('total-tarjeta-final', data.totalTarjeta);
            setValue('total-efectivo-completo', data.totalEfectivo);
            setValue('total-tarjeta-completo', data.totalTarjeta);
            setValue('total-venta-final', data.totalEfectivo + data.totalTarjeta);
            setValue('total-gastos-final', data.totalGastos);
            setValue('caja-chica-dia-siguiente', data.cajaChicaDiaSiguiente);
            setValue('debe-ayer', data.debeAyer);
            setValue('total-depositar-banco-final', data.totalEfectivo - data.totalGastos + data.debeAyer);

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

    // Descargar cuadro de datos
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

    // Bloquear todos los campos de entrada
    const lockAllFields = () => {
        document.querySelectorAll("input, select").forEach(element => {
            if (element.type !== "button" && element.type !== "checkbox") {
                element.setAttribute('readonly', true);
                element.setAttribute('disabled', true);
            }
        });
    };

    // Desbloquear todos los campos de entrada
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

    // Mostrar todos los cuadres realizados
    const mostrarCuadresRealizados = async () => {
        const cuadresTarjetas = document.getElementById('cuadres-tarjetas');
        cuadresTarjetas.innerHTML = '';
        const querySnapshot = await db.collection("cuadres").where("sucursal", "==", sucursal).orderBy("idCuadre", "desc").get();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'cuadre-card';
            card.innerHTML = `
                <h3>ID Cuadre: ${data.idCuadre} - ${data.sucursal}</h3>
                <p>Fecha: ${data.fechaCuadre}</p>
                <p>Total Efectivo: ${data.totalEfectivo}</p>
                <p>Total Tarjeta: ${data.totalTarjeta}</p>
                <p>Total Motorista: ${data.totalMotoristaAdmin}</p>
                <p>Total Pedidos Ya: ${data.totalPedidos}</p>
                <button onclick="mostrarCuadre('${doc.id}')">Mostrar Cuadre</button>
                <button onclick="descargarCuadro('${doc.id}')">Descargar Cuadro de Datos</button>
            `;
            cuadresTarjetas.appendChild(card);
        });
    };

    // Función para filtrar cuadres por ID
    window.filterCuadres = async () => {
        const searchId = document.getElementById('search-id').value;
        if (searchId) {
            const querySnapshot = await db.collection("cuadres").where("sucursal", "==", sucursal).where("idCuadre", "==", parseInt(searchId)).get();
            const cuadresTarjetas = document.getElementById('cuadres-tarjetas');
            cuadresTarjetas.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const card = document.createElement('div');
                card.className = 'cuadre-card';
                card.innerHTML = `
                    <h3>ID Cuadre: ${data.idCuadre} - ${data.sucursal}</h3>
                    <p>Fecha: ${data.fechaCuadre}</p>
                    <p>Total Efectivo: ${data.totalEfectivo}</p>
                    <p>Total Tarjeta: ${data.totalTarjeta}</p>
                    <p>Total Motorista: ${data.totalMotoristaAdmin}</p>
                    <p>Total Pedidos Ya: ${data.totalPedidos}</p>
                    <button onclick="mostrarCuadre('${doc.id}')">Mostrar Cuadre</button>
                    <button onclick="descargarCuadro('${doc.id}')">Descargar Cuadro de Datos</button>
                `;
                cuadresTarjetas.appendChild(card);
            });
        } else {
            await mostrarCuadresRealizados();
        }
    };

    // Inicializar mostrando los cuadres realizados
    await mostrarCuadresRealizados();
});

// Función para agregar una fila de gasto
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

// Función para agregar una fila de pedido
function addPedido() {
    const tableBody = document.getElementById("pedidos-tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="number" data-type="total-pedido" step="0.01" oninput="updateTotals()" required></td>
    `;
    tableBody.insertBefore(row, tableBody.lastElementChild.previousElementSibling);
    updateTotals();
}

// Función para manejar el checkbox de "No se usa el servicio" en Pedidos Ya
function noSeUsaPedidosYa() {
    const noSeUsaCheckbox = document.getElementById("pedidos-ya-no-se-usa");
    const totalPedidosField = document.getElementById("total-pedidos");
    if (noSeUsaCheckbox.checked) {
        totalPedidosField.value = ""; // Restablecer a vacío cuando se marca
        totalPedidosField.disabled = true; // Deshabilitar el campo
    } else {
        totalPedidosField.disabled = false; // Habilitar el campo cuando se desmarca
    }
    updateTotals();
}

// Asegúrate de que el campo total-pedidos no tenga un valor predeterminado
document.addEventListener("DOMContentLoaded", () => {
    const totalPedidosField = document.getElementById("total-pedidos");
    totalPedidosField.value = ""; // Restablecer a vacío al cargar la página
});

// Modifica la función updateTotals para no establecer ningún valor en totalPedidos
window.updateTotals = function() {
    updateCajaTotals();
    updateGastos();
    updateDeposito();
    updateCuadroDatos();
}

// Función para actualizar los totales de los pedidos sin establecer valores predeterminados
function updatePedidos() {
    const filasPedidos = Array.from(document.querySelectorAll("#pedidos-tbody tr"));
    const totalPedidos = filasPedidos.reduce((sum, row) => {
        const rowTotal = parseFloat(row.querySelector("input[data-type='total-pedido']")?.value || 0);
        return sum + rowTotal;
    }, 0);
    setValue('total-pedidos', totalPedidos);
    setValue('total-pedidos-final', totalPedidos);
}

// Función para establecer el valor de un campo
function setValue(id, value) {
    const elem = document.getElementById(id);
    if (elem) {
        elem.value = parseFloat(value).toFixed(2);
    }
}

// Restablecer el formulario al cargar
const resetForm = async () => {
    document.getElementById('sucursal').value = sucursal || "";
    document.getElementById('caja-chica-inicial').value = "";
    document.querySelectorAll("input[type='number']").forEach(input => {
        if (input.id !== 'total-pedidos') { // No cambiar el valor del campo total-pedidos
            input.value = "";
        }
    });
    await fetchLatestIdCuadre();
    setDateToToday();
    unlockAllFields();
};


// Función para manejar el checkbox de "No se usa" en las cajas
function noSeUsaHandler(filaId) {
    const fila = document.getElementById(filaId);
    const noSeUsaCheckbox = fila.querySelector("input[type='checkbox']");
    if (noSeUsaCheckbox.checked) {
        fila.querySelectorAll("input[type='number']").forEach(input => {
            input.value = "0";
        });
    } else {
        fila.querySelectorAll("input[type='number']").forEach(input => {
            input.value = "";
        });
    }
    updateTotals();
}
