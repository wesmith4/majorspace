
exports.up = function(knex) {
  return knex.schema.table('users_to_departments', (table) => {
    table.unique(['user_id', 'department_id']);
  })
};

exports.down = function(knex) {
  return knex.schema.dropUnique(['user_id', 'department_id']);
};
