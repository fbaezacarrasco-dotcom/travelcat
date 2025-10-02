const {
    listMaintenancePrograms,
    createMaintenanceProgram,
    deleteMaintenanceProgram
} = require('../data/memoryStore');

const calculateNextControl = (program) => {
    const intervalo = Number(program.intervalo || 0);

    if (program.tipoControl === 'km') {
        const ultimo = Number(program.ultimoKm || 0);
        if (!intervalo || !ultimo) {
            return '—';
        }
        return (ultimo + intervalo) + ' km';
    }

    const base = program.fecha ? new Date(program.fecha) : null;
    if (!base || Number.isNaN(base.getTime()) || !intervalo) {
        return '—';
    }

    const next = new Date(base);
    next.setDate(base.getDate() + intervalo);
    return next.toLocaleDateString();
};

exports.listarProgramas = (req, res) => {
    return res.status(200).json(listMaintenancePrograms());
};

exports.crearPrograma = (req, res) => {
    const { patente, tarea, tipoControl, fecha, ultimoKm, intervalo } = req.body;

    if (!patente || !tarea || !tipoControl) {
        return res.status(400).json({ error: 'Patente, tarea y tipo de control son obligatorios.' });
    }

    const payload = {
        patente,
        tarea,
        tipoControl,
        fecha,
        ultimoKm,
        intervalo,
        proximoControl: calculateNextControl({ tipoControl, fecha, ultimoKm, intervalo })
    };

    const nuevo = createMaintenanceProgram(payload);
    return res.status(201).json(nuevo);
};

exports.eliminarPrograma = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const eliminado = deleteMaintenanceProgram(id);

    if (!eliminado) {
        return res.status(404).json({ error: 'Programa no encontrado.' });
    }

    return res.status(204).send();
};
