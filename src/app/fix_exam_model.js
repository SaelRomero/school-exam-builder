const fs = require('fs');
let app = fs.readFileSync('app.ts', 'utf8');

// Change from minimax to gpt-oss
app = app.replace(/model: 'minimax-m2\.5:cloud',/g, "model: 'gpt-oss:20b-cloud',");

fs.writeFileSync('app.ts', app);
