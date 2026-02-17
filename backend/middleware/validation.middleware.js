const Joi = require('joi');

const validateUpload = (req, res, next) => {
    const schema = Joi.object({
        mainHeadings: Joi.string().required(),
        testPointFilters: Joi.string().allow(''),
        componentFilters: Joi.string().allow(''),
        regexMode: Joi.string().valid('true', 'false').default('false')
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: error.details[0].message
            }
        });
    }

    req.validatedBody = value;

    next();
};

module.exports = {
    validateUpload
};
