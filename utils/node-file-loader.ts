import fs from 'fs';
import path from 'path';
import isGlob from 'is-glob';
import Glob from 'glob';

const recursiveReadDirSync = dir =>
  fs
    .readdirSync(dir)
    .reduce(
      (files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? files.concat(recursiveReadDirSync(path.join(dir, file)))
          : files.concat(path.join(dir, file) as any),
      []
    );

const readDirSync = dir =>
  fs
    .readdirSync(dir)
    .reduce(
      (files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? files
          : files.concat(path.join(dir, file) as any),
      []
    );

const readGlobSync = (pattern, options) => Glob.sync(pattern, options);

const getSchemaFiles = (dir, recursive, globOptions) => {
  if (isGlob(dir)) {
    return readGlobSync(dir, globOptions);
  }

  if (recursive === true) {
    return recursiveReadDirSync(dir);
  }

  return readDirSync(dir);
};

const DEFAULT_EXTENSIONS = ['.ts', '.js', '.gql', '.graphql', '.graphqls'];

const fileLoader = (
  folderPath,
  {
    recursive = false,
    extensions = DEFAULT_EXTENSIONS,
    globOptions = {},
    flatten = false,
  } = {}
) => {
  const dir = folderPath;
  const schemafiles = getSchemaFiles(dir, recursive, globOptions);

  let files = schemafiles
    .map(f => ({ f, pathObj: path.parse(f) }))
    .filter(({ pathObj }) => pathObj.name.toLowerCase() !== 'index')
    .filter(({ pathObj }) => extensions.includes(pathObj.ext))
    .map(({ f, pathObj }) => {
      let returnVal;

      switch (pathObj.ext) {
        case '.ts':
        case '.js': {
          const file = require(f); // eslint-disable-line
          returnVal = file.default || file;
          break;
        }

        case '.graphqls':
        case '.gql':
        case '.graphql': {
          const file = fs.readFileSync(f, 'utf8');
          returnVal = file;
          break;
        }

        default:
        // we don't know how to handle other extensions
      }

      return returnVal;
    })
    .filter(v => !!v); // filter files that we don't know how to handle

  if (flatten) {
    files = files.flat();
  }

  return files;
};

export default fileLoader;
