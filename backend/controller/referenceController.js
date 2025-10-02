const {
    listDrivers,
    listProviders,
    listTrucks
} = require('../data/memoryStore');

exports.obtenerConductores = (req, res) => {
    const drivers = listDrivers();
    return res.status(200).json(drivers);
};

exports.obtenerResumenCatalogos = (req, res) => {
    return res.status(200).json({
        conductores: listDrivers(),
        proveedores: listProviders(),
        camiones: listTrucks()
    });
};
