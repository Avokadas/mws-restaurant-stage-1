var bs = require("browser-sync").create();

bs.init({
    // server: "./dist/main",
    baseDir: "./"
});

bs.reload("*.html");