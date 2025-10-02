const {
    listOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../data/memoryStore');

exports.obtenerOTs = (req, res) => {
    const orders = listOrders();
    return res.status(200).json(orders);
};

exports.crearOT = (req, res) => {
    const { titulo, patente, mecanico, proveedorId, descripcion } = req.body;

    if (!titulo || !patente || !mecanico || !proveedorId) {
        return res.status(400).json({ error: 'Título, patente, mecánico y proveedor son obligatorios.' });
    }

    const order = createOrder(req.body);
    return res.status(201).json(order);
};

exports.actualizarOT = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const order = updateOrder(id, req.body);

    if (!order) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    return res.status(200).json(order);
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
