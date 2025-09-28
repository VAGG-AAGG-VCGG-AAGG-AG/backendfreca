const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../uploads/perfiles');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
