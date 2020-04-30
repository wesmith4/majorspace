
exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.timestamp('verified_at', {precision: 6}).defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('verified_at');
  });
};
