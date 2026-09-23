document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const loginWindow = document.getElementById('window-login');
    const mainApp = document.getElementById('main-app');
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const currentUserText = document.getElementById('current-user-text');
    const btnLogout = document.getElementById('btn-logout');
    const alertMsg = document.getElementById('alert-msg');

    // Menús por Rol
    const roleMenus = {
        admin: document.getElementById('menu-admin'),
        tecnico: document.getElementById('menu-tecnico'),
        cliente: document.getElementById('menu-cliente')
    };

    // Colección de Ventanas y Botones de Navegación
    const windows = document.querySelectorAll('.window-content');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Función para mostrar alertas dinámicas
    function showAlert(message, type = 'info') {
        alertMsg.textContent = message;
        alertMsg.className = `alert alert-${type}`;
        alertMsg.classList.remove('hidden');

        setTimeout(() => {
            alertMsg.classList.add('hidden');
        }, 4000);
    }

    // Función para cambiar entre ventanas
    function switchWindow(targetWindowId) {
        windows.forEach(win => {
            if (win.id === targetWindowId) {
                win.classList.remove('hidden');
            } else {
                win.classList.add('hidden');
            }
        });

        navButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === targetWindowId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (targetWindowId === 'window-historial') {
            cargarCotizacionesBD();
        }
    }

    // ==========================================================================
    // AUTENTICACIÓN REAL CONTRA LA BASE DE DATOS (login.php)
    // ==========================================================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usuarioInput = document.getElementById('usuario').value;
        const passwordInput = document.getElementById('password').value;

        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: usuarioInput,
                    password: passwordInput
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                const user = result.user;

                // Ocultar pantalla de login y mostrar app principal
                loginWindow.classList.add('hidden');
                mainApp.classList.remove('hidden');
                userInfo.classList.remove('hidden');

                currentUserText.textContent = `Usuario: ${user.nombre} (${user.rol.toUpperCase()})`;

                // Mostrar únicamente el menú que corresponde al rol del usuario en la BD
                Object.keys(roleMenus).forEach(r => roleMenus[r].classList.add('hidden'));
                if (roleMenus[user.rol]) {
                    roleMenus[user.rol].classList.remove('hidden');
                }

                // Redireccionar a la ventana inicial del rol
                if (user.rol === 'admin') {
                    switchWindow('window-cotizaciones');
                } else if (user.rol === 'tecnico') {
                    switchWindow('window-recursos');
                } else if (user.rol === 'cliente') {
                    switchWindow('window-aprobacion-cliente');
                }

                showAlert(`Bienvenido, ${user.nombre} (${user.rol.toUpperCase()})`, 'success');
            } else {
                showAlert('Error: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            showAlert('No se pudo establecer conexión con el servidor MySQL.', 'danger');
        }
    });

    // Evento de Navegación entre Botones de Ventanas
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            if (target) {
                switchWindow(target);
            }
        });
    });

    // Evento de Cerrar Sesión
    btnLogout.addEventListener('click', () => {
        mainApp.classList.add('hidden');
        userInfo.classList.add('hidden');
        loginWindow.classList.remove('hidden');
        loginForm.reset();
        showAlert('Sesión cerrada correctamente', 'info');
    });

    // ==========================================================================
    // OPERACIONES CON MYSQL (COTIZACIONES)
    // ==========================================================================

    // Guardar nueva cotización
    const formCotizacion = document.getElementById('form-cotizacion');
    if (formCotizacion) {
        formCotizacion.addEventListener('submit', async (e) => {
            e.preventDefault();

            const serviciosSeleccionados = [];
            document.querySelectorAll('input[name="servicio"]:checked').forEach(cb => {
                serviciosSeleccionados.push(cb.value);
            });

            if (serviciosSeleccionados.length === 0) {
                showAlert('Error: Debe seleccionar al menos un servicio audiovisual.', 'danger');
                return;
            }

            const cotizacionData = {
                cliente: document.getElementById('cot-cliente').value,
                evento: document.getElementById('cot-evento').value,
                descripcion: document.getElementById('cot-desc').value,
                servicios: serviciosSeleccionados,
                monto: parseFloat(document.getElementById('cot-monto').value),
                vigencia: document.getElementById('cot-vigencia').value
            };

            try {
                const response = await fetch('guardar_cotizacion.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cotizacionData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    showAlert(result.message, 'success');
                    formCotizacion.reset();
                } else {
                    showAlert('Error: ' + result.message, 'danger');
                }
            } catch (error) {
                console.error('Error al conectar con PHP:', error);
                showAlert('Error al conectar con el servidor MySQL.', 'danger');
            }
        });
    }

    // Cargar historial desde MySQL
    async function cargarCotizacionesBD() {
        const tablaBody = document.getElementById('tabla-cotizaciones-body');
        if (!tablaBody) return;

        tablaBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando datos desde la base de datos...</td></tr>';

        try {
            const response = await fetch('obtener_cotizaciones.php');
            const cotizaciones = await response.json();

            if (cotizaciones.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay cotizaciones registradas.</td></tr>';
                return;
            }

            tablaBody.innerHTML = '';
            cotizaciones.forEach(cot => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${cot.codigo_cotizacion}</strong></td>
                    <td>${cot.cliente}</td>
                    <td>${cot.evento}</td>
                    <td>${cot.servicios}</td>
                    <td>$${parseFloat(cot.monto).toFixed(2)}</td>
                    <td>${cot.vigencia}</td>
                    <td><span class="badge badge-warning">${cot.estado}</span></td>
                `;
                tablaBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar cotizaciones:', error);
            tablaBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error al consultar la base de datos.</td></tr>';
        }
    }

    const btnCargarBD = document.getElementById('btn-cargar-bd');
    if (btnCargarBD) {
        btnCargarBD.addEventListener('click', cargarCotizacionesBD);
    }
});