import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textHighlight',
})
export class TextHighlightPipe implements PipeTransform {
  transform(input: string, search?: string): string | null {
    if (!input || !search) {
      return input;
    }
    const index = input.toLowerCase().indexOf(search.toLowerCase());
    if (index >= 0) {
      return [
        input.slice(0, index),
        `<span class="highlighted">${input.slice(index, index + search.length)}</span>`,
        input.slice(index + search.length)
      ].join('');
    }
    return input;
  }
}
