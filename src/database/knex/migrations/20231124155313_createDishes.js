exports.up = knex => knex.schema.createTable('dishes', table => {
    table.increments('id');
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.decimal('price').notNullable();
    table.text('picture').notNullable();

    table.enum('type', ['meal', 'dessert', 'drink'], { useNative: true, enumName: 'types' }).notNullable().default('meal');

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable('dishes', table => {
    
});