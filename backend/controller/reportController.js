const {
    listSales,
    listOrders,
    listDocuments,
    listExpenses,
    getBudgetInfo,
    getCostsByTruck,
    getMaintenanceAlerts
} = require('../data/memoryStore');

const parseDate = (value) => {
    const date = value ? new Date(value) : null;
    return Number.isNaN(date?.getTime?.()) ? null : date;
};

const diffInDays = (target) => {
    const now = new Date();
    const date = parseDate(target);

    if (!date) return null;

    const diffMs = date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const buildOtSummary = (orders) => {
    const summary = {
        total: orders.length,
        porEstado: {},
        porPrioridad: {}
    };

    orders.forEach((order) => {
        summary.porEstado[order.estado] = (summary.porEstado[order.estado] || 0) + 1;
        summary.porPrioridad[order.prioridad] = (summary.porPrioridad[order.prioridad] || 0) + 1;
    });

    return summary;
};

const buildDocumentAlerts = (documents) => {
    return documents
        .map((doc) => {
            const dias = diffInDays(doc.vence);
            let estado = 'Vigente';

            if (dias === null) {
                estado = 'Sin fecha';
            } else if (dias < 0) {
                estado = 'Vencido';
            } else if (dias <= 30) {
                estado = 'Por vencer';
            }

            return {
                ...doc,
                diasParaVencer: dias,
                estado
            };
        })
        .sort((a, b) => {
            const aDias = a.diasParaVencer ?? Number.MAX_SAFE_INTEGER;
            const bDias = b.diasParaVencer ?? Number.MAX_SAFE_INTEGER;
            return aDias - bDias;
        });
};

const buildExpensesSummary = (expenses) => {
    const monthly = new Map();
    let total = 0;

    expenses.forEach((expense) => {
        const fecha = parseDate(expense.fecha);
        const key = fecha ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}` : 'Desconocido';
        const current = monthly.get(key) || { periodo: key, total: 0, items: [] };
        current.total += expense.costo || 0;
        current.items.push(expense);
        monthly.set(key, current);
        total += expense.costo || 0;
    });

    return {
        total,
        mensual: Array.from(monthly.values()).sort((a, b) => a.periodo.localeCompare(b.periodo))
    };
};

exports.getDashboardReport = (req, res) => {
    const sales = listSales();
    const orders = listOrders();
    const documents = listDocuments();
    const expenses = listExpenses();
    const presupuesto = getBudgetInfo();
    const mantenciones = getMaintenanceAlerts();

    return res.status(200).json({
        ventas: sales,
        ot: buildOtSummary(orders),
        documentacion: buildDocumentAlerts(documents),
        gastos: {
            ...buildExpensesSummary(expenses),
            presupuesto
        },
        mantenciones
    });
};

exports.getCostPerTruck = (req, res) => {
    const data = getCostsByTruck();
    return res.status(200).json(data);
};
