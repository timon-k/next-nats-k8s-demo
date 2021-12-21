const tsj = require("ts-json-schema-generator");
const fs = require("fs");

const config = {
    path: "modules/backEnd/config.ts",
    tsconfig: "tsconfig.json",
    type: "*",
};

const output_path = "modules/backEnd/config.schema.json";

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
});
