import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';

@Injectable()
export class HandlebarsService {
  constructor() {
    // Set up Handlebars helper functions
    handlebars.registerHelper('PascalCase', function (str) {
      return str.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
    });

    handlebars.registerHelper('camelCase', function (str) {
      const pattern = /[ _-]/;
      const words = str.split(pattern);
      const camelCaseWords = words.map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
      });
      return camelCaseWords.join('');
    });

    handlebars.registerHelper('kebab-case', function (str) {
      str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return str.replace(/[\s_]+/g, '-').toLowerCase();
    });

    function kebabCase(str) {
      const temp = str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return temp.replace(/[\s_]+/g, '-').toLowerCase();
    }

    handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });
  }

  compileTemplate(template: string, data: any): string {
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }
}
