// Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', askBullet);
    formulario.addEventListener('submit', agregarGasto);
}

// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        // Spread operator
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante(){
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0 );
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

class UI {
    insertarPresupuesto( bullet ){
        const { presupuesto, restante } = bullet;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(message, type){
        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert');

        if(type === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = message;

        // Insertar en el HTML
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // Quitar alerta
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);

    }

    listaGasto(gastos){
        
        this.limpiarHTML();
        // Iterando sobre los gastos
        for(let i = 0; i < gastos.length; i++){
            const { cantidad, nombre, id } = gastos[i];
            // Creando un LI
            const nuevoGasto = document.createElement('LI');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.setAttribute('data-id', id); //forma outdated
            //nuevoGasto.dataset.id = id; //nueva forma.
            nuevoGasto.textContent = nombre;

            // Agregar HTML del gasto
            const span = document.createElement('SPAN');
            span.classList.add('badge', 'badge-primary', 'badge-pill');
            span.textContent = `$ ${cantidad}`;
            nuevoGasto.appendChild(span);

            // Botón para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML= 'Borrar &times;';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            // Agregar el HTML
            gastoListado.appendChild(nuevoGasto);
        }
    }

    limpiarHTML(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj){
        const { presupuesto, restante } = presupuestoObj;
        const porcentaje = (restante * 100) / presupuesto;
        const restanteDiv = document.querySelector('.restante');

        // Comprobar 25%
        if( porcentaje < 25 ) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        // Comprobar 50%
        } else if ( porcentaje < 50 ) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning', 'aler');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Si el total es 0 o menor
        if(restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
            return;
        }

        formulario.querySelector('button[type="submit"]').disabled = false;
    }
}

// Instancias
const ui = new UI();
let presupuesto;

// Funciones
function askBullet() {
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');

    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
}

// Añadir gastos
function agregarGasto(e){
    e.preventDefault();

    // Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    
    if(nombre === '' || cantidad === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if ( cantidad <= 0 || isNaN(cantidad) ){
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }

    // Agregar gastos válidos
    /*
        OBJECT LITERAL
        const gasto = {
            nombre: nombre,
            cantidad: cantidad,
            id: Date.now()
        }
    */
    const gasto = { nombre, cantidad, id: Date.now() };
    presupuesto.nuevoGasto(gasto);

    ui.imprimirAlerta('Correcto');

    // Imprimir los gastos
    const { gastos, restante } = presupuesto;
    ui.listaGasto(gastos);
    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    // Resetear formulario
    formulario.reset();
}

function eliminarGasto(id) {
    // Elimina del objeto presupuesto
    presupuesto.eliminarGasto(id);

    // Elimina gastos del HTML
    const { gastos, restante } = presupuesto;
    ui.listaGasto(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}