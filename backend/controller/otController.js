const {
    listOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../data/memoryStore');

exports.obtenerOTs = (req, res) => {
    try {
        const orders = listOrders();
        return res.status(200).json(orders);
    } catch (error) {
        console.error('[OT] Error al listar OTs:', error);
        return res.status(500).json({ error: 'Error al obtener órdenes de trabajo.' });
    }
};

exports.crearOT = (req, res) => {
    try {
        console.log('[OT crear] Content-Type:', req.headers['content-type'] || 'desconocido');
        console.log('[OT crear] Body keys:', Object.keys(req.body || {}));
        console.log('[OT crear] Archivo presente:', !!req.file);

        const { titulo, patente, mecanico, proveedorId, descripcion } = req.body || {};

        // Validaciones básicas
        const errors = [];
        if (!titulo || String(titulo).trim() === '') errors.push('titulo es requerido');
        if (!patente || String(patente).trim() === '') errors.push('patente es requerida');
        if (!mecanico || String(mecanico).trim() === '') errors.push('mecanico es requerido');
        if (proveedorId === undefined || proveedorId === null || String(proveedorId).trim() === '') errors.push('proveedorId es requerido');

        if (titulo && String(titulo).length > 120) errors.push('titulo excede 120 caracteres');
        if (mecanico && String(mecanico).length > 60) errors.push('mecanico excede 60 caracteres');
        if (descripcion && String(descripcion).length > 400) errors.push('descripcion excede 400 caracteres');

        if (errors.length) {
            console.warn('[OT crear] Validaciones fallidas:', errors);
            return res.status(400).json({ ok: false, error: 'Validación de datos fallida', errors });
        }

        // Enriquecer datos con metadatos de archivo si llegó uno (opcional)
        const payload = { ...req.body };
        if (req.file) {
            payload.archivo = {
                field: req.file.fieldname,
                fileName: req.file.filename || null,
                originalName: req.file.originalname || null,
                mimeType: req.file.mimetype || null,
                size: req.file.size || null,
                path: req.file.path || null
            };
        }

        const order = createOrder(payload);
        return res.status(201).json(order);
    } catch (error) {
        console.error('[OT crear] Error inesperado:', error);
        return res.status(500).json({ error: 'Error al crear la orden de trabajo.' });
    }
};

exports.actualizarOT = (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Identificador inválido.' });
        }

        console.log('[OT actualizar] Content-Type:', req.headers['content-type'] || 'desconocido');
        console.log('[OT actualizar] Body keys:', Object.keys(req.body || {}));
        console.log('[OT actualizar] Archivo presente:', !!req.file);

        // Validaciones mínimas (si vienen campos)
        const { titulo, mecanico, descripcion } = req.body || {};
        const errors = [];
        if (titulo && String(titulo).length > 120) errors.push('titulo excede 120 caracteres');
        if (mecanico && String(mecanico).length > 60) errors.push('mecanico excede 60 caracteres');
        if (descripcion && String(descripcion).length > 400) errors.push('descripcion excede 400 caracteres');
        if (errors.length) {
            console.warn('[OT actualizar] Validaciones fallidas:', errors);
            return res.status(400).json({ ok: false, error: 'Validación de datos fallida', errors });
        }

        const payload = { ...req.body };
        if (req.file) {
            payload.archivo = {
                field: req.file.fieldname,
                fileName: req.file.filename || null,
                originalName: req.file.originalname || null,
                mimeType: req.file.mimetype || null,
                size: req.file.size || null,
                path: req.file.path || null
            };
        }

        const order = updateOrder(id, payload);
        if (!order) {
            return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
        }
        return res.status(200).json(order);
    } catch (error) {
        console.error('[OT actualizar] Error inesperado:', error);
        return res.status(500).json({ error: 'Error al actualizar la orden de trabajo.' });
    }
};

exports.eliminarOT = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const removed = deleteOrder(id);

    if (!removed) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    return res.status(204).send();
};

exports.descargarOT = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const order = getOrderById(id);

    if (!order) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename=ot-${order.patente}-${order.id}.json`);
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).send(JSON.stringify(order, null, 2));
};

