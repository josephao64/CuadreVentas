document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    if ((role === 'administracion' && password === '0') || (role === 'encargado' && password === '1')) {
        if (role === 'administracion') {
            window.location.href = 'CuadreAdmi.html';
        } else if (role === 'encargado') {
            window.location.href = 'CuadreEncargado.html';
        }
    } else {
        errorMessage.style.display = 'block';
    }
});
