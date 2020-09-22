import {
  Input,
  Directive,
  ViewContainerRef,
  TemplateRef,
  DoCheck,
  IterableDiffers,
  IterableDiffer,
  OnInit,
  Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[lazyFor]',
})
export class LazyForDirective implements DoCheck, OnInit {
  @Input('lazyForWithHeight') itemHeight: number; // Optional
  @Input('lazyForWithTagName') itemTagName: string; // Optional

  private templateElem: HTMLElement;
  private containerElem: HTMLElement;
  private placeholderElem: HTMLElement;
  private list = [];
  private initialized = false;
  private firstUpdate = true;
  private differ: IterableDiffer<any>;
  private lastChangeTriggeredByScroll = false;
  private fixedHeaderHeight: number;

  private lastListStartI: number;
  private lastListEndI: number;

  @Input()
  set lazyForOf(list: Array<any>) {
    if (list) {
      this.list = list.filter((item) => item != null);
      this.differ = this.iterableDiffers.find(list).create();
      if (this.initialized) {
        this.update(true);
        this.updatePlaceholderHeight();
      }
    }
  }

  constructor(
    private vcr: ViewContainerRef,
    private tpl: TemplateRef<any>,
    private iterableDiffers: IterableDiffers,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.templateElem = this.vcr.element.nativeElement;

    if (this.containerElem === undefined) {
      this.containerElem = this.templateElem.parentElement;
    }

    // Adding an event listener will trigger ngDoCheck whenever the event fires so we don't actually need to call
    // update here.
    this.containerElem.addEventListener('scroll', (e) => {
      this.lastChangeTriggeredByScroll = true;
    });

    this.initialized = true;
  }

  ngDoCheck() {
    if (this.differ && Array.isArray(this.list)) {
      if (this.lastChangeTriggeredByScroll) {
        this.update();
        this.lastChangeTriggeredByScroll = false;
      } else {
        const changes = this.differ.diff(this.list);
        if (changes !== null) {
          this.update();
        }
      }
    }
  }

  private update(reRender = false) {
    if (this.list.length === 0) {
      this.vcr.clear();
      if (!this.firstUpdate) {
        this.placeholderElem.style.height = '0';
      }
      return;
    }

    if (this.firstUpdate) {
      this.onFirstUpdate();
    }

    const listHeight =
      this.containerElem.clientHeight < this.itemHeight
        ? this.itemHeight
        : this.containerElem.clientHeight;
    const scrollTop = this.containerElem.scrollTop;

    // The height of anything inside the container but above the lazyFor content;
    this.fixedHeaderHeight =
      this.placeholderElem.getBoundingClientRect().top -
      this.placeholderElem.scrollTop -
      (this.containerElem.getBoundingClientRect().top -
        this.containerElem.scrollTop);

    // This needs to run after the scrollTop is retrieved.
    let listStartI = Math.floor(
      (scrollTop - this.fixedHeaderHeight) / this.itemHeight
    );
    listStartI = this.limitToRange(listStartI, 0, this.list.length);
    let listEndI = Math.ceil(
      (scrollTop - this.fixedHeaderHeight + listHeight) / this.itemHeight
    );
    listEndI = this.limitToRange(listEndI, -1, this.list.length - 1);

    // Recreate the visible list as no previous items are not reusable
    if (
      this.lastListStartI == null ||
      reRender ||
      listStartI > this.lastListEndI ||
      listEndI < this.lastListStartI
    ) {
      this.vcr.clear();
      for (let i = listStartI; i <= listEndI; i++) {
        this.createItem(i);
      }
    } else if (
      this.lastListStartI !== listStartI ||
      this.lastListEndI !== listEndI
    ) {
      // Recycle old created item;
      let diffStart = Math.abs(listStartI - this.lastListStartI);
      if (listStartI < this.lastListStartI) {
        while (diffStart > 0) {
          this.createItem(listStartI + diffStart - 1, 0);
          diffStart--;
        }
      } else if (listStartI > this.lastListStartI) {
        while (diffStart > 0) {
          this.removeItem(0);
          diffStart--;
        }
      }

      let diffEnd = Math.abs(listEndI - this.lastListEndI);
      if (listEndI < this.lastListEndI) {
        while (diffEnd > 0) {
          this.removeItem();
          diffEnd--;
        }
      } else if (listEndI > this.lastListEndI) {
        while (diffEnd > 0) {
          this.createItem(listEndI - diffEnd + 1);
          diffEnd--;
        }
      }
    }

    this.lastListStartI = listStartI;
    this.lastListEndI = listEndI;
  }

  createItem(itemIndex: number, appendIndex?: number) {
    const node = this.vcr.createEmbeddedView(
      this.tpl,
      {
        $implicit: this.list[itemIndex],
        index: itemIndex,
      },
      appendIndex
    ).rootNodes[0];
    const style = node.style;
    style['top'] = `${this.itemHeight * itemIndex + this.fixedHeaderHeight}px`;
    style['position'] = 'absolute';
    return node;
  }

  removeItem(i?: number) {
    this.vcr.remove(i);
  }

  private onFirstUpdate() {
    if (this.itemHeight == null || this.itemTagName == null) {
      const sample = this.createItem(0);
      if (this.itemHeight == null) {
        this.itemHeight = sample.offsetHeight;
      }
      if (this.itemTagName == null) {
        this.itemTagName = sample.tagName;
      }
      this.vcr.clear();
    }

    this.templateElem.parentElement.style.position = 'relative';
    this.templateElem.parentElement.style.overflow = 'auto';

    this.createPlaceholder();

    if (this.itemTagName.toLowerCase() === 'li') {
      this.placeholderElem.style.listStyleType = 'none';
    }

    this.firstUpdate = false;
  }

  createPlaceholder() {
    this.placeholderElem = this.document.createElement(this.itemTagName);
    this.updatePlaceholderHeight();
    this.templateElem.parentElement.insertBefore(
      this.placeholderElem,
      this.templateElem
    );
  }

  updatePlaceholderHeight() {
    if (this.placeholderElem) {
      this.placeholderElem.style.minHeight = `${
        this.list.length * this.itemHeight
      }px`;
    }
  }
  private limitToRange(num, min, max) {
    return Math.max(Math.min(num, max), min);
  }
}
