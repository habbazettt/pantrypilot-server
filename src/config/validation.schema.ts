import * as Joi from 'joi';

export const validationSchema = Joi.object({
    // Application
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default('api'),

    // Database
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().default(5432),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),

    // Redis
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),

    // Rate Limiting
    THROTTLE_TTL: Joi.number().default(60),
    THROTTLE_LIMIT: Joi.number().default(10),

    // LLM
    LLM_PROVIDER: Joi.string().valid('gemini', 'stub').default('gemini'),
    GEMINI_API_KEY: Joi.string().when('LLM_PROVIDER', {
        is: 'gemini',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    GEMINI_MODEL: Joi.string().default('gemini-1.5-flash'),
});
