const app = require("./app");
const config = require("./config");

app.listen(config.port, () => {
  console.log(`Atlas backend listening on port ${config.port}`);
});

