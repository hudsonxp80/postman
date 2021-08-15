const responses = require("./responses");

module.exports = (Model) => ({
  create: async (req, res, next) => {
    model = Model.build(req.body);
    req.model = await model.save();
    next();
  },
  get: async (req, res, next) => {
    req.model = await Model.findOne({
      where: { id: req.params.id },
    });
    next();
  },
  update: async (req, res, next) => {
    req.model = await Model.findOne({
      where: { id: req.body.id || req.params.id },
    });
    if (!req.model instanceof Model) responses.notFound(res);

    const keys = Object.keys(req.body);
    keys.forEach((key) => {
      req.model[key] = req.body[key];
    });
    await req.model.save({ fields: keys });
    next();
  },
  delete: async (req, res, next) => {
    if (res.error != undefined) return res;
    if (res.model == undefined)
      res.model = await Model.findOne({
        where: { id: req.params.id },
      });
    if (res.model instanceof Model) {
      destroyed = await res.model.destroy();
      if (destroyed) next();
      else responses.fail(res)(new Error("DB EXCEPTION"));
    } else responses.noContent(res);
  },
  getAll: async (req, res, next) => {
    const where = req.query;
    const pageIndex = where.pageIndex == undefined ? 0 : where.pageIndex;
    const pageSize = where.pageSize == undefined ? 0 : where.pageSize;

    delete where["pageSize"];
    delete where["pageIndex"];
    req.models = await Model.findAndCountAll({
      where,
      offset: pageSize * pageIndex,
      limit: pageSize * 1,
    });
    next();
  },
});
