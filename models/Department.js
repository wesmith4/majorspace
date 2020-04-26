const { Model, snakeCaseMappers } = require('objection');

class Department extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'departments';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'name',
        'departmentUrl'
      ],
      properties: {
        id: {type: 'integer'},
        name: {type: 'string'},
        departmentUrl: {type: 'string'}
      }
    }
  }

  static get relationMappings() {
    let Faculty = require('./Faculty');
    let Link = require('./Link');
    let Course = require('./Course');
    return {
      faculty: {
        relation: Model.ManyToManyRelation,
        modelClass: Faculty,
        join: {
          from: 'departments.id',
          through: {
            from: 'faculty_to_departments.department_id',
            to: 'faculty_to_departments.faculty_id'
          },
          to: 'faculty.id'
        }
      },
      links: {
        relation: Model.HasManyRelation,
        modelClass: Link,
        join: {
          from: 'departments.id',
          to: 'department_links.department_id'
        }
      },
      courses: {
        relation: Model.HasManyRelation,
        modelClass: Course,
        join: {
          from: 'departments.id',
          to: 'courses.department_id'
        }
      }
    }
  }
}

module.exports = Department;
