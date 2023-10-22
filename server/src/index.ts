import express from 'express';
import bodyParser from 'body-parser';
export const app = express();
export const port = 3080;

const wwwPath = './www';
const configPath = './assets/config/config.json';
import fs from 'fs';
import path from 'path';

const fileName = path.join(process.cwd(), wwwPath, configPath);

app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), wwwPath)));

app.post('/api/config', (req, res) => {

  const read = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
  const file = JSON.parse(read);
  const body = req.body;

  const convertName = (name: string) => {
    // to camel case (ensure first character to be lower case)
    const firstChar = name.charAt(0).toLowerCase();
    name = firstChar + name.slice(1);
    return name;
  }

  for (const element of body) {
    console.log('new: ', element);
    let name = (element.name ?? element.Name) as string;
    let value = (element.value ?? element.Value);
    // global
    if (name.startsWith('global:')) {
      name = name.substring(7);
      if (!file['global']) {
        file['global'] = {};
      }
      file['global'][name] = ParseValue(value);
    }
    else {
      name = convertName(name);
      // replace value into the config
      file[name] = ParseValue(value);
    }
    
  }

  writeConfig(file, (err: any) => {
    if (err) {
      console.log(err);
      res.status(500).json(err).send();
      return;
    }

    console.log(JSON.stringify(file, null, 2));
    res.status(200).send();
  });

  console.log('writing to ' + fileName);

});

/**
 * Trying parsing value as JSON first, if fail, just return the value instead.
 *
 * @param {*} str
 * @return {*}
 */
function ParseValue(str: string): string {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function writeConfig(data: any, callback: any) {
  const jsondata = JSON.stringify(data, null, 2);
  fs.writeFile(fileName, jsondata, (err) => {
    callback(err);
  });
}

import his from './his.js';
his(app);

const index_file = path.join(process.cwd(), wwwPath, 'index.html');

app.get('/', (req, res) => {
  res.sendFile(index_file);
});

// Handle assets not found
app.get('/assets/*', (req, res) => {
  console.log(`[TRACE] handle asset not found: ${req.originalUrl}`);
  res.sendStatus(404);
});

// 404 catch
app.all('*', (req, res) => {
  console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
  res.status(200).sendFile(index_file);
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
