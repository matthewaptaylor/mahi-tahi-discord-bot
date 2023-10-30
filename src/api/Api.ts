import { ShardingManager } from 'discord.js';
import express, { Express } from 'express';
import { createRequire } from 'node:module';
import util from 'node:util';

import Controller from './controllers/Controller.js';
import GuildsController from './controllers/GuildsController.js';
import RootController from './controllers/RootController.js';
import ShardsController from './controllers/ShardsController.js';
import { checkAuth } from './middleware/checkAuth.js';
import { handleError } from './middleware/handleError.js';
import Logger from '../services/Logger.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

/**
 * API tp manage clusters.
 */
export default class Api {
    private app: Express;
    public controllers: Controller[];

    constructor(shardManager: ShardingManager) {
        // Setup controllers
        let guildsController = new GuildsController(shardManager);
        let shardsController = new ShardsController(shardManager);
        let rootController = new RootController();
        this.controllers = [guildsController, shardsController, rootController];

        // Setup express
        this.app = express();
        this.app.use(express.json());
        this.setupControllers();
        this.app.use(handleError());
    }

    public async start(): Promise<void> {
        let listen = util.promisify(this.app.listen.bind(this.app));
        await listen(Config.api.port);
        Logger.info(Logs.info.apiStarted.replaceAll('{PORT}', Config.api.port));
    }

    private setupControllers(): void {
        for (let controller of this.controllers) {
            if (controller.authToken) {
                controller.router.use(checkAuth(controller.authToken));
            }
            controller.register();
            this.app.use(controller.path, controller.router);
        }
    }
}
