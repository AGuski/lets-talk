import { AfterViewInit, Directive, ElementRef, HostListener, OnChanges } from '@angular/core';

@Directive({
  selector: '[autogrow]'
})
export class AutogrowDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  @HostListener('input')
  onInput() {
    this.adjustHeight();
  }

  ngAfterViewInit() {
    this.adjustHeight();
  }

  private adjustHeight(): void {
    const textarea = this.el.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
