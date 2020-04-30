let { Model, snakeCaseMappers } = require('objection');

class MessageLike extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'message_likes';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: {type: 'integer'},
        userId: {type: 'integer'},
        messageId: {type: 'integer'},
      }
    }
  }

  static get relationMappings() {
    let User = require('./User');
    let Message = require('./Message');
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'message_likes.user_id',
          to: 'users.id'
        }
      },
      message: {
        relation: Model.HasOneRelation,
        modelClass: Message,
        join: {
          from: 'message_likes.message_id',
          to: 'messages.id'
        }
      }
    }
  }
}

module.exports = MessageLike;
