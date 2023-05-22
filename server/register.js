//

const documentation = require("../documentation/1.0.0/passwordless.json");

//

module.exports = ({ strapi }) => {
  if (strapi.plugin("documentation")) {
    strapi
      .plugin("documentation")
      .service("override")
      .registerOverride(documentation, {
        pluginOrigin: "passwordless",
        excludeFromGeneration: ["passwordless"],
      });
  }
};
