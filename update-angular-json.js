const fs = require('fs');
const json = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
json.projects['exam-creator'].architect.build.options.allowedCommonJsDependencies = ['html2pdf.js'];
fs.writeFileSync('angular.json', JSON.stringify(json, null, 2));
