let { Model, snakeCaseMappers } = require('objection');

class Message extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'messages';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'messageBody',
        'subject'
      ],
      properties: {
        id: {type: 'integer'},
        userId: {type: 'integer'},
        departmentId: {type: 'integer'}
      }
    }
  }

  static get relationMappings() {
    let User = require('./User');
    let Department = require('./Department');
    let MessageLike = require('./MessageLike');
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'messages.user_id',
          to: 'users.id'
        }
      },
      department: {
        relation: Model.HasOneRelation,
        modelClass: Department,
        join: {
          from: 'messages.department_id',
          to: 'departments.id'
        }
      },
      children: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'messages.id',
          to: 'messages.parent_message_id'
        }
      },
      parent: {
        relation: Model.HasOneRelation,
        modelClass: Message,
        join: {
          from: 'messages.parent_message_id',
          to: 'messages.id'
        }
      },
      likes: {
        relation: Model.HasManyRelation,
        modelClass: MessageLike,
        join: {
          from: 'messages.id',
          to: 'message_likes.message_id'
        }
      }
    }
  }
}

module.exports = Message;
