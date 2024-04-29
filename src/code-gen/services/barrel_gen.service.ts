import { Injectable } from '@nestjs/common';

import * as handleBars from 'handlebars';

@Injectable()
export class BarrelGenService {
  getExports(entities: Set<string>, folderName: string) {
    // Register the custom Handlebars helper
    handleBars.registerHelper('toLowerCase', function (str) {
      return str.toLowerCase();
    });

    const barrelHandler = handleBars.compile(
      `{{#each entities}}
      export * from './{{toLowerCase this}}.{{../folderName}}';
      {{/each}}
      `,
    );

    return barrelHandler({ entities: entities, folderName: folderName });
  }
}
