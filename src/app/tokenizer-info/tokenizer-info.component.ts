import { Component, OnInit } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { SessionService } from 'src/app/session.service';

@Component({
  selector: 'app-tokenizer-info',
  templateUrl: './tokenizer-info.component.html',
  styleUrls: ['./tokenizer-info.component.scss']
})
export class TokenizerInfoComponent implements OnInit {

  usedTokens: number = 0;
  usedUSD: number = 0;

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionService.tokenChange$.subscribe(tokenizer => {
      this.usedTokens = tokenizer.usedTokens;
      this.usedUSD = tokenizer.usedUSD;
    });
  }
}
