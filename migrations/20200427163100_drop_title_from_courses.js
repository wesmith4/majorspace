
exports.up = function(knex) {
  return knex.schema.table('courses', (table) => {
    table.dropColumn('course_title');
  });
};

exports.down = function(knex) {
  return knex.schema.table('courses', (table) => {
    table.text('course_title');
  });
};
