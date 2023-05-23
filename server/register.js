//

const path = require("node:path");
const fs = require("node:fs");

//

module.exports = ({ strapi }) => {
  if (strapi.plugin("documentation")) {
    const specPath = path.join(
      __dirname,
      "../documentation/1.0.0/passwordless.yaml"
    );
    const spec = fs.readFileSync(specPath, "utf8");

    strapi
      .plugin("documentation")
      .service("override")
      .registerOverride(spec, {
        pluginOrigin: "passwordless",
        excludeFromGeneration: ["passwordless"],
      });
  }
};
