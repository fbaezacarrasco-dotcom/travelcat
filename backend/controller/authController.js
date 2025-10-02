const {
    findUserByEmail,
    createSession,
    getUserByToken,
    removeSession,
    sanitizeUser
} = require('../data/memoryStore');

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = createSession(user.id);
    const safeUser = sanitizeUser(user);

    return res.status(200).json({ token, user: safeUser });
};

exports.profile = (req, res) => {
    const { authToken } = req;

    if (!authToken) {
        return res.status(401).json({ error: 'Sesión no encontrada.' });
    }

    const user = getUserByToken(authToken);

    if (!user) {
        return res.status(401).json({ error: 'Sesión expirada.' });
    }

    return res.status(200).json({ user });
};

exports.logout = (req, res) => {
    const { authToken } = req;

    if (authToken) {
        removeSession(authToken);
    }

    return res.status(204).send();
};
