// Gera o site estatico em dist/ a partir de modules.json.
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const readTemplate = (name) => fs.readFileSync(path.join(__dirname, name), 'utf8');

const render = (template, tokens) =>
  Object.entries(tokens).reduce(
    (html, [token, value]) => html.replaceAll(`:${token}`, value),
    template,
  );

const loadModules = () => {
  const entries = JSON.parse(fs.readFileSync(path.join(rootDir, 'modules.json'), 'utf8'));
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('modules.json: esperado um array com ao menos um modulo');
  }
  return entries.map((entry, index) => {
    const { modulePath, repo } = entry;
    if (typeof modulePath !== 'string' || modulePath === '') {
      throw new Error(`modules.json[${index}]: modulePath ausente`);
    }
    if (typeof repo !== 'string' || !repo.startsWith('https://')) {
      throw new Error(`modules.json[${index}] (${modulePath}): repo precisa ser uma URL https://`);
    }
    return { modulePath, repo: repo.replace(/\/+$/, '') };
  });
};

const writeFile = (filePath, contents) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
};

const modules = loadModules();
const moduleTemplate = readTemplate('module.tmpl.html');

for (const { modulePath, repo } of modules) {
  writeFile(
    path.join(distDir, modulePath, 'index.html'),
    render(moduleTemplate, { modulePath, repoURL: repo }),
  );
}

const modulesList = modules
  .map(({ modulePath, repo }) => {
    const label = repo.replace(/^https:\/\//, '');
    return `    <li><a href="/${modulePath}/">go.alvadorn.org/${modulePath}</a> &rarr; <a href="${repo}">${label}</a></li>`;
  })
  .join('\n');

writeFile(
  path.join(distDir, 'index.html'),
  render(readTemplate('index.tmpl.html'), { modulesList }),
);

fs.copyFileSync(path.join(rootDir, 'CNAME'), path.join(distDir, 'CNAME'));

console.log(`site gerado em ${distDir} (${modules.length} modulo(s))`);
