import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';

@Injectable()
export class HandlebarsService {
  constructor() {
    // Set up Handlebars helper functions
    handlebars.registerHelper('PascalCase', function (str) {
      
      // Split the string into words
  const words = str.split(/\s+/);
  
  // Capitalize the first letter of each word and join them together
  const pascalCaseStr = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  return pascalCaseStr;
    });

    handlebars.registerHelper('camelCase', function (str) {
      
  // If the string is already camelCase, return it directly
  if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
    return str;
  }
  
  // Split the string into words
  const words = str.split(/\s+/);
  
  // Convert the first word to lowercase and capitalize the first letter of subsequent words
  const camelCaseStr = words.map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  return camelCaseStr;
    });

    handlebars.registerHelper('kebab-case', function (str) {
      // str = str.replace(/\s+/g, '');
      str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return str.replace(/[\s_]+/g, '-').toLowerCase();
    });

    function kebabCase(str) {
      // str = str.replace(/\s+/g, '');
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
