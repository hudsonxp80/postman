/* eslint-disable indent */
module.exports = {
    success: (res) => (data) => {
        res.status(200).json(data);
    },

    fail: (res) => (err) => {
        res.status(400).json(err).end();
    },

    forbidden: (res) => (err) => {
        res.status(403).json(err).end();
    },
    serverError: (res) => (err) => {
        res.status(500).send(err);
    },

    noContent: (res) => {
        res.status(204).send();
    },

    notFound: (res) => {
        res.status(404).end();
    },

    next: (res, next) => {
        if (!res.headersSent) next();
    },
};
