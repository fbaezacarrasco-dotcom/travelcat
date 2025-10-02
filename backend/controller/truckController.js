const {
    listTrucks,
    createTruck,
    updateTruck,
    deleteTruck,
    createDocumentsForTruck,
    removeDocuments
} = require('../data/memoryStore');

const buildTruckPayload = (fields) => ({
    patente: fields.patente,
    marca: fields.marca,
    modelo: fields.modelo,
    anio: fields.anio,
    km: fields.km,
    fechaEntrada: fields.fechaEntrada,
    fechaSalida: fields.fechaSalida,
    estado: fields.estado,
    notas: fields.notas,
    conductor: fields.conductor
});

const parseArrayField = (value) => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

const buildDocumentsPayload = (metas = [], files = []) =>
    metas.map((meta, index) => {
        const file = files[index] || {};
        return {
            tipo: meta.tipo,
            vence: meta.vence,
            responsable: meta.responsable,
            fileName: file.filename || null,
            originalName: file.originalname || null,
            mimeType: file.mimetype || null,
            size: file.size || null
        };
    });

exports.obtenerCamiones = (req, res) => {
    const trucks = listTrucks();
    return res.status(200).json(trucks);
};

exports.crearCamion = (req, res) => {
    const fields = req.body;
    const { patente, marca, modelo } = fields;

    if (!patente || !marca || !modelo) {
        return res.status(400).json({ error: 'Patente, marca y modelo son obligatorios.' });
    }

    const payload = buildTruckPayload(fields);
    const newTruck = createTruck(payload);

    const metas = parseArrayField(fields.documentosMeta);
    const files = req.files?.documentos || [];
    const documentos = createDocumentsForTruck(newTruck.id, newTruck.patente, buildDocumentsPayload(metas, files));

    return res.status(201).json({
        ...newTruck,
        documentos
    });
};

exports.actualizarCamion = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const updatedTruck = updateTruck(id, buildTruckPayload(req.body));

    if (!updatedTruck) {
        return res.status(404).json({ error: 'Camión no encontrado.' });
    }

    const toRemove = parseArrayField(req.body.documentosEliminar);
    if (toRemove.length) {
        removeDocuments(toRemove);
    }

    const metas = parseArrayField(req.body.documentosMeta);
    const files = req.files?.documentos || [];
    if (metas.length || files.length) {
        createDocumentsForTruck(id, updatedTruck.patente, buildDocumentsPayload(metas, files));
    }

    const refreshed = listTrucks().find((truck) => truck.id === id) || updatedTruck;

    return res.status(200).json(refreshed);
};

exports.eliminarCamion = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const wasDeleted = deleteTruck(id);

    if (!wasDeleted) {
        return res.status(404).json({ error: 'Camión no encontrado.' });
    }

    return res.status(204).send();
};

exports.obtenerDocumentosCamion = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const truck = listTrucks().find((item) => item.id === id);

    if (!truck) {
        return res.status(404).json({ error: 'Camión no encontrado.' });
    }

    return res.status(200).json(truck.documentos || []);
};
