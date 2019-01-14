/**
 * @fileoverview Connector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Connector } from '@hint/utils-debugging-protocol-common/dist/src/debugging-protocol-connector';
import { ILauncher } from 'hint/dist/src/lib/types';
import { CDPLauncher } from './chrome-launcher';

import * as fs from 'fs';
import * as path from 'path';
import { Crdp } from 'chrome-remote-debug-protocol';


import { Engine } from 'hint/dist/src/lib/engine';

export default class ChromeConnector extends Connector {
    public constructor(server: Engine, config?: object) {
        const launcher: ILauncher = new CDPLauncher(config || {});

        super(server, config || {}, launcher);
    }

    public onLoadEventFired(callback:Function): Function {
        var newCallback = async (err:Error)=>{
            if(!err){
                await this.takeScreenshot(this._client);
            }
            
            callback(err);
        };
        return super.onLoadEventFired(newCallback); 
    }


    private async takeScreenshot(client: Crdp.CrdpClient){
        // https://github.com/cyrus-and/chrome-remote-interface/wiki/Take-page-screenshot
        const { Page } = client; 

        //let titleJS = "document.querySelector('title').textContent";
        //let pageTitle = await Runtime.evaluate!({expression: titleJS});
        let screenshot = await Page.captureScreenshot!({format:"jpeg"});

        //console.log(`title of page: ${pageTitle.result.value}`);

        // see formatter-html/src/formatter.ts
        const name = this._href.replace(/:\/\//g, '-')
                            .replace(/:/g, '-')
                            .replace(/\./g, '-')
                            .replace(/\//g, '-')
                            .replace(/-$/, '');
        const filename = path.join(process.cwd(), 'hint-report', name, 'screenshot.png');

        await fs.writeFile(
            filename,
            Buffer.from(screenshot.data, 'base64'),
            (err)=>{
                //console.log(err);
            }
        );
    }
    
}
