import { Pipe, PipeTransform,Sanitizer } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'encodeHTML'
})
export class EncodeHTMLPipe implements PipeTransform {
  constructor(private sanitizer:DomSanitizer){}
  transform(value:string): SafeHtml {
    
      return this.sanitizer.bypassSecurityTrustHtml(value);
      
  }

}
