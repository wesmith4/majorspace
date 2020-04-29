
exports.up = function(knex) {
  return knex.schema.createTable('verification_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('users.id');
    table.text('token').notNullable();
    table.unique('user_id');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('verification_tokens');
};
