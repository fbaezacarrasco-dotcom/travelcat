const {
    listProviders,
    createProvider,
    updateProvider,
    deleteProvider
} = require('../data/memoryStore');

const sanitizeRut = (value = '') => value.replace(/[^0-9kK]/g, '').toUpperCase();

const isValidRut = (value = '') => {
    const rut = sanitizeRut(value);

    if (!/^[0-9]+[0-9K]$/.test(rut)) {
        return false;
    }

    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i -= 1) {
        sum += Number(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expected = 11 - (sum % 11);
    const dvCalculated = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);

    return dvCalculated === dv;
};

exports.obtenerProveedores = (req, res) => {
    const providers = listProviders();
    return res.status(200).json(providers);
};

exports.crearProveedor = (req, res) => {
    const { razonSocial, empresa, rut, contacto } = req.body;

    if (!razonSocial || !empresa || !rut || !contacto) {
        return res.status(400).json({ error: 'Razón social, empresa, RUT y contacto son obligatorios.' });
    }

    if (!isValidRut(rut)) {
        return res.status(400).json({ error: 'El RUT ingresado no es válido.' });
    }

    const payload = {
        ...req.body,
        rut: sanitizeRut(rut)
    };

    const newProvider = createProvider(payload);
    return res.status(201).json(newProvider);
};

exports.actualizarProveedor = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    if (req.body.rut && !isValidRut(req.body.rut)) {
        return res.status(400).json({ error: 'El RUT ingresado no es válido.' });
    }

    const payload = req.body.rut ? { ...req.body, rut: sanitizeRut(req.body.rut) } : req.body;

    const updatedProvider = updateProvider(id, payload);

    if (!updatedProvider) {
        return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    return res.status(200).json(updatedProvider);
};

exports.eliminarProveedor = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const wasDeleted = deleteProvider(id);

    if (!wasDeleted) {
        return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    return res.status(204).send();
};
