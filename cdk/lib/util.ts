import * as path from 'path'
// @ts-ignore
import {projectName} from '../../amplify/.config/project-config.json';

export const EXPORT_PATH = path.resolve(__dirname, `amplify-export-${projectName}`);
