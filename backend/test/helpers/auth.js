export const CODIGO_TEST = 'codigo-de-prueba';
export const EMPLEADO_TEST = { dni: '20999888', nombre: 'Marta Lopez', cargo: 'Panadera', codigo: CODIGO_TEST };

async function post(baseUrl, path, body) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return response.json();
}

export async function iniciarSesionEmpleado(baseUrl) {
    await post(baseUrl, '/empleados', EMPLEADO_TEST);
    const { data } = await post(baseUrl, '/empleados/login', { dni: EMPLEADO_TEST.dni, codigo: CODIGO_TEST });
    return data.token;
}
