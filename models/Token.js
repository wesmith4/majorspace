let { Model, snakeCaseMappers } = require('objection');

class Token extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'verification_tokens';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: {type: 'integer'},
        userId: {type: 'integer'},
        token: {type: 'string'}
      }
    }
  }
}

module.exports = Token;
