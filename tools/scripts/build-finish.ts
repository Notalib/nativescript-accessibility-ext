import * as ngPackage from 'ng-packagr';
import path from 'path';
import fs from 'fs-extra';
import sass from 'sass';

const rootDir = path.resolve(path.join(__dirname, '..', '..'));
const nxConfigPath = path.resolve(path.join(rootDir, 'nx.json'));
const nxConfig = JSON.parse(fs.readFileSync(nxConfigPath, 'utf-8'));
const npmScope = nxConfig.npmScope;

const cmdArgs = process.argv.slice(2);
const packageName = cmdArgs[0];
const publish = cmdArgs[1] === 'publish';

const packagePath = path.join('packages', packageName, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
const npmPackageName = packageJson.name;
console.log(`Building ${npmPackageName}...${publish ? 'and publishing.' : ''}`);

// build angular package
function buildAngular() {
  ngPackage
    .ngPackagr()
    .forProject(path.join('packages', packageName, 'angular', 'ng-package.json'))
    .withTsConfig(path.join('packages', packageName, 'angular', 'tsconfig.angular.json'))
    .build()
    .then(() => buildScss())
    .then(() => {
      console.log(`${npmPackageName} angular built successfully.`);
      finishPreparation();
    })
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
}

async function buildScss() {
  const sassDir = path.join(rootDir, 'packages', packageName, 'scss');
  const cssDir = path.join(rootDir, 'packages', packageName, 'css');
  if (!fs.existsSync(sassDir)) {
    return;
  }

  if (!fs.existsSync(cssDir)) {
    await fs.mkdir(cssDir);
  }

  for (const item of await fs.readdir(sassDir)) {
    if (item.startsWith('_')) {
      continue;
    }

    const filepath = path.join(sassDir, item);
    const stat = await fs.stat(filepath);
    if (!stat.isFile()) {
      continue;
    }

    const targetPath = path.join(cssDir, item.replace('.scss', '') + '.css');

    const result = await sass.compileAsync(filepath);
    fs.writeFileSync(targetPath, result.css);
  }
}

// copy angular ng-packagr output to dist/packages/{name}
function copyAngularDist() {
  fs.copy(path.join('packages', packageName, 'angular', 'dist'), path.join('dist', 'packages', packageName, 'angular'))
    .then(() => {
      console.log(`${npmPackageName} angular built successfully.`);
      // buildNativeSrc();
      finishPreparation();
    })
    .catch((err: Error) => console.error(err));
}

function finishPreparation() {
  fs.copy(path.join('tools', 'assets', 'publishing'), path.join('dist', 'packages', packageName))
    .then(() => console.log(`${npmPackageName} ready to publish.`))
    .catch((err: Error) => console.error(err));
}

if (fs.existsSync(path.join(rootDir, 'packages', packageName, 'angular'))) {
  // package has angular specific src, build it first
  buildAngular();
} else {
  finishPreparation();
}
