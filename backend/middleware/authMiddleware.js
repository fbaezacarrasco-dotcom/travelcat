const { getUserByToken } = require('../data/memoryStore');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
        return res.status(401).json({ error: 'No autorizado: token faltante.' });
    }

    const user = getUserByToken(token);

    if (!user) {
        return res.status(401).json({ error: 'No autorizado: token inválido.' });
    }

    req.user = user;
    req.authToken = token;
    next();
};
